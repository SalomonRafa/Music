"""Private two-stem Demucs service. Run behind HTTPS; see README.md."""
import asyncio
import contextlib
import hmac
import json
import logging
import os
from pathlib import Path
import secrets
import shutil
import subprocess
import sys
import tempfile
import threading
import time
from concurrent.futures import ThreadPoolExecutor
from contextlib import asynccontextmanager
from dataclasses import dataclass, field

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from starlette.background import BackgroundTask

MAX_BYTES = 40 * 1024 * 1024
MAX_SECONDS = 600
TTL = 3600
log = logging.getLogger('separator')

@dataclass
class Job:
    id: str
    directory: Path
    state: str = 'queued'
    finished: float | None = None
    error: str | None = None
    cancelled: threading.Event = field(default_factory=threading.Event)
    process: object = None
    readers: int = 0

class DemucsEngine:
    def __init__(self):
        self.ready = False
        self.error = None

    def prepare(self):
        try:
            if not shutil.which('ffmpeg') or not shutil.which('ffprobe'):
                raise RuntimeError('FFmpeg ausente')
            from demucs.pretrained import get_model
            model = get_model('htdemucs')  # download official weights once; cached by Torch
            del model
            self.ready = True
        except Exception:
            log.exception('Could not load Demucs')
            self.error = 'Não foi possível carregar o modelo de separação no servidor.'

    def command(self, job, args, timeout):
        with (job.directory / 'process.log').open('ab') as output:
            p = subprocess.Popen(args, stdout=output, stderr=output)
            job.process = p
            started = time.monotonic()
            try:
                while p.poll() is None:
                    if job.cancelled.wait(.2):
                        raise InterruptedError()
                    if time.monotonic() - started > timeout:
                        raise RuntimeError('Tempo de processamento excedido.')
                if p.returncode:
                    raise RuntimeError('O servidor não conseguiu processar este áudio.')
            finally:
                if p.poll() is None:
                    p.terminate()
                    try:
                        p.wait(timeout=5)
                    except subprocess.TimeoutExpired:
                        p.kill()
                        p.wait()
                job.process = None

    def separate(self, job):
        source = job.directory / 'upload'
        with source.open('rb') as uploaded:
            header = uploaded.read(4096).lstrip()
        if header.startswith((b'#EXTM3U', b'[playlist]', b'<?xml')):
            raise ValueError('Envie um arquivo de áudio, não uma playlist ou endereço.')
        result = subprocess.run(['ffprobe', '-protocol_whitelist', 'file,pipe', '-format_whitelist', 'wav,mp3,flac,mov,mp4,m4a,3gp,3g2,mj2,ogg,matroska,webm,aac,aiff', '-v', 'error', '-show_entries',
            'format=duration:stream=codec_type', '-of', 'json', str(source)],
            capture_output=True, timeout=20, check=True)
        info = json.loads(result.stdout)
        duration = float(info.get('format', {}).get('duration', 0))
        if not 0 < duration <= MAX_SECONDS or not any(s.get('codec_type') == 'audio' for s in info.get('streams', [])):
            raise ValueError('Escolha um áudio de até 10 minutos com duração identificável.')
        if job.cancelled.is_set():
            raise InterruptedError()
        self.command(job, ['ffmpeg', '-nostdin', '-v', 'error', '-y', '-protocol_whitelist', 'file,pipe', '-format_whitelist', 'wav,mp3,flac,mov,mp4,m4a,3gp,3g2,mj2,ogg,matroska,webm,aac,aiff', '-i', str(source),
            '-vn', '-t', str(MAX_SECONDS + 1), '-ac', '2', '-ar', '44100',
            str(job.directory / 'input.wav')], 120)
        self.command(job, [sys.executable, '-m', 'demucs', '--two-stems', 'vocals',
            '-n', 'htdemucs', '--device', 'cpu', '--shifts', '1', '--jobs', '1',
            '-o', str(job.directory / 'stems'), str(job.directory / 'input.wav')], 1800)
        output = job.directory / 'stems' / 'htdemucs' / 'input'
        for stem, filename in [('instrumental', 'no_vocals.wav'), ('vocals', 'vocals.wav')]:
            if not (output / filename).is_file():
                raise RuntimeError('O modelo não gerou as duas faixas esperadas.')
            shutil.move(output / filename, job.directory / (stem + '.wav'))
        source.unlink(missing_ok=True)
        (job.directory / 'input.wav').unlink(missing_ok=True)
        shutil.rmtree(job.directory / 'stems', ignore_errors=True)


def create_app(engine=None, token=None, root=None):
    engine = engine or DemucsEngine()
    token = token if token is not None else os.environ.get('SEPARATOR_TOKEN', '')
    if len(token) < 24:
        raise RuntimeError('Configure SEPARATOR_TOKEN com pelo menos 24 caracteres aleatórios.')
    root = Path(root or tempfile.mkdtemp(prefix='cavaco-separator-'))
    root.mkdir(parents=True, exist_ok=True)
    jobs = {}
    lock = threading.Lock()
    pool = ThreadPoolExecutor(max_workers=1)

    def remove(job):
        if job.readers == 0:
            jobs.pop(job.id, None)
            shutil.rmtree(job.directory, ignore_errors=True)

    def cleanup():
        with lock:
            for job in list(jobs.values()):
                if job.finished and time.time() - job.finished > TTL:
                    remove(job)

    def run(job):
        try:
            if job.cancelled.is_set():
                return
            job.state = 'processing'
            engine.separate(job)
            job.state = 'ready'
        except InterruptedError:
            job.state = 'cancelled'
        except Exception as exc:
            log.exception('Separation failed for job %s', job.id)
            job.state = 'failed'
            job.error = str(exc) if isinstance(exc, ValueError) else 'Não foi possível separar este arquivo. Tente outro áudio.'
            for path in job.directory.glob('*.wav'):
                path.unlink(missing_ok=True)
        finally:
            job.finished = time.time()
            if job.cancelled.is_set():
                with lock:
                    remove(job)

    @asynccontextmanager
    async def lifespan(app):
        warmup = threading.Thread(target=engine.prepare, daemon=True)
        warmup.start()
        async def reap():
            while True:
                await asyncio.sleep(30)
                cleanup()
        task = asyncio.create_task(reap())
        yield
        task.cancel()
        with contextlib.suppress(asyncio.CancelledError):
            await task
        for job in list(jobs.values()):
            job.cancelled.set()
        await asyncio.to_thread(pool.shutdown, wait=True, cancel_futures=True)
        for job in list(jobs.values()):
            shutil.rmtree(job.directory, ignore_errors=True)

    app = FastAPI(lifespan=lifespan, docs_url=None, redoc_url=None, openapi_url=None)
    origins = [s.strip() for s in os.environ.get('SEPARATOR_ORIGINS',
        'https://salomonrafa.github.io,http://localhost:3000,http://127.0.0.1:3000').split(',') if s.strip()]

    @app.middleware('http')
    async def private(request, call_next):
        if request.method != 'OPTIONS' and not hmac.compare_digest(
                request.headers.get('authorization', ''), 'Bearer ' + token):
            return JSONResponse(
                {'detail': 'Chave de acesso inválida.'}, status_code=401)
        return await call_next(request)

    @app.get('/health')
    def health():
        return {'service': 'cavaco-separator', 'version': 1, 'ready': engine.ready,
            'error': engine.error, 'maxBytes': MAX_BYTES, 'maxSeconds': MAX_SECONDS,
            'retentionSeconds': TTL, 'model': 'htdemucs'}

    @app.post('/jobs', status_code=202)
    async def upload(request: Request):
        cleanup()
        if not engine.ready:
            raise HTTPException(503, engine.error or 'Modelo carregando. Aguarde e verifique a conexão novamente.')
        try:
            length = int(request.headers.get('content-length', '0'))
        except ValueError:
            raise HTTPException(400, 'Tamanho de arquivo inválido.')
        if length > MAX_BYTES:
            raise HTTPException(413, 'O limite é 40 MB por arquivo.')
        with lock:
            if sum(j.state in ('uploading', 'queued', 'processing') for j in jobs.values()) >= 2 or len(jobs) >= 6:
                raise HTTPException(429, 'Serviço ocupado. Aguarde ou exclua um resultado anterior.')
            job_id = secrets.token_urlsafe(24)
            directory = root / job_id
            directory.mkdir()
            job = Job(job_id, directory, state='uploading')
            jobs[job.id] = job
        try:
            size = 0
            with (directory / 'upload').open('wb') as output:
                async for chunk in request.stream():
                    size += len(chunk)
                    if size > MAX_BYTES:
                        raise HTTPException(413, 'O limite é 40 MB por arquivo.')
                    output.write(chunk)
            if not size:
                raise HTTPException(400, 'O arquivo está vazio.')
            job.state = 'queued'
            pool.submit(run, job)
        except BaseException:
            with lock:
                remove(job)
            raise
        return {'id': job.id, 'state': job.state}

    def lookup(job_id):
        cleanup()
        job = jobs.get(job_id)
        if not job or job.cancelled.is_set():
            raise HTTPException(404, 'Processamento não encontrado ou já expirado.')
        return job

    @app.get('/jobs/{job_id}')
    def status(job_id: str):
        job = lookup(job_id)
        return {'id': job.id, 'state': job.state, 'error': job.error,
            'expiresAt': job.finished + TTL if job.finished else None}

    @app.get('/jobs/{job_id}/{stem}')
    def stem(job_id: str, stem: str):
        if stem not in ('instrumental', 'vocals'):
            raise HTTPException(404)
        with lock:
            job = jobs.get(job_id)
            if not job or job.cancelled.is_set():
                raise HTTPException(404)
            if job.state != 'ready':
                raise HTTPException(409, 'As faixas ainda não estão prontas.')
            if time.time() - job.finished > TTL:
                raise HTTPException(410, 'Resultado expirado.')
            job.readers += 1
        def release():
            with lock:
                job.readers -= 1
                if job.cancelled.is_set():
                    remove(job)
        return FileResponse(job.directory / (stem + '.wav'), media_type='audio/wav',
            filename=stem + '.wav', headers={'Cache-Control': 'no-store'},
            background=BackgroundTask(release))

    @app.delete('/jobs/{job_id}')
    def delete(job_id: str):
        with lock:
            job = jobs.get(job_id)
            if job:
                job.cancelled.set()
                if job.state not in ('processing', 'uploading'):
                    remove(job)
        return {'deleted': True}

    app.add_middleware(CORSMiddleware, allow_origins=origins,
        allow_methods=['GET', 'POST', 'DELETE'], allow_headers=['Authorization', 'Content-Type'],
        expose_headers=['Content-Disposition'], max_age=600)
    return app
