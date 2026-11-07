"""Contract/lifecycle tests with a synthetic engine, NOT Demucs quality tests."""
import io
import json
from pathlib import Path
import tempfile
import threading
import time
import unittest
import wave

from fastapi.testclient import TestClient
from app import create_app, MAX_BYTES, DemucsEngine

TOKEN = 'test-only-key-not-for-deployment-123456'
AUTH = {'Authorization': 'Bearer ' + TOKEN}

class SyntheticEngine:
    ready = True
    error = None
    def prepare(self):
        pass
    def separate(self, job):
        if (job.directory / 'upload').read_bytes() == b'fail':
            raise ValueError('Arquivo de teste inválido.')
        if (job.directory / 'upload').read_bytes() == b'wait':
            while not job.cancelled.wait(.01):
                pass
            raise InterruptedError()
        for name in ['instrumental', 'vocals']:
            with wave.open(str(job.directory / (name + '.wav')), 'wb') as output:
                output.setnchannels(2)
                output.setsampwidth(2)
                output.setframerate(44100)
                output.writeframes(b'\0' * 400)

class ServiceTests(unittest.TestCase):
    def setUp(self):
        self.folder = tempfile.TemporaryDirectory()
        self.engine = SyntheticEngine()
        self.client = TestClient(create_app(self.engine, TOKEN, self.folder.name))
        self.client.__enter__()
    def tearDown(self):
        self.client.__exit__(None, None, None)
        self.folder.cleanup()
    def upload(self, data=b'test audio'):
        response = self.client.post('/jobs', content=data, headers=AUTH)
        self.assertEqual(response.status_code, 202, response.text)
        return response.json()['id']
    def done(self, job):
        for _ in range(100):
            data = self.client.get('/jobs/' + job, headers=AUTH).json()
            if data['state'] in ('ready', 'failed'):
                return data
            time.sleep(.01)
        self.fail('Worker did not finish')
    def test_auth_and_cors(self):
        r=self.client.get('/health',headers={'Origin':'https://salomonrafa.github.io'})
        self.assertEqual(r.status_code, 401)
        self.assertEqual(r.headers['access-control-allow-origin'],'https://salomonrafa.github.io')
        self.assertTrue(self.client.get('/health', headers=AUTH).json()['ready'])
        headers={'Origin': 'https://salomonrafa.github.io', 'Access-Control-Request-Method':'POST', 'Access-Control-Request-Headers':'authorization,content-type'}
        r=self.client.options('/jobs',headers=headers)
        self.assertEqual(r.headers['access-control-allow-origin'], headers['Origin'])
        r=self.client.options('/jobs',headers={**headers,'Origin':'https://other.invalid'})
        self.assertEqual(r.status_code,400)
    def test_two_results_and_delete(self):
        job=self.upload()
        self.assertEqual(self.done(job)['state'], 'ready')
        for stem in ['vocals','instrumental']:
            r=self.client.get(f'/jobs/{job}/{stem}',headers=AUTH)
            self.assertEqual(r.status_code,200)
            with wave.open(io.BytesIO(r.content)) as audio:
                self.assertEqual(audio.getnchannels(),2)
        self.assertEqual(self.client.get(f'/jobs/{job}/upload',headers=AUTH).status_code,404)
        self.client.delete('/jobs/'+job,headers=AUTH)
        self.assertEqual(self.client.get('/jobs/'+job,headers=AUTH).status_code,404)
        self.assertEqual(list(Path(self.folder.name).iterdir()),[])
    def test_empty_oversize_failure_and_unready(self):
        self.assertEqual(self.client.post('/jobs',content=b'',headers=AUTH).status_code,400)
        self.assertEqual(self.client.post('/jobs',content=b'x',headers={**AUTH,'Content-Length':str(MAX_BYTES+1)}).status_code,413)
        job=self.upload(b'fail')
        self.assertEqual(self.done(job)['state'],'failed')
        self.engine.ready=False
        self.assertEqual(self.client.post('/jobs',content=b'x',headers=AUTH).status_code,503)
    def test_cancellation_and_bounded_queue(self):
        a=self.upload(b'wait')
        b=self.upload(b'wait')
        self.assertEqual(self.client.post('/jobs',content=b'x',headers=AUTH).status_code,429)
        self.client.delete('/jobs/'+b,headers=AUTH)
        self.client.delete('/jobs/'+a,headers=AUTH)
        for _ in range(100):
            if not list(Path(self.folder.name).iterdir()):break
            time.sleep(.01)
        self.assertEqual(list(Path(self.folder.name).iterdir()),[])
    def test_expired_results_are_removed(self):
        from unittest.mock import patch
        job=self.upload()
        self.done(job)
        with patch('app.time.time', return_value=time.time()+4000):
            self.assertEqual(self.client.get('/jobs/'+job,headers=AUTH).status_code,404)
        self.assertFalse((Path(self.folder.name)/job).exists())
    def test_real_probe_rejects_non_audio(self):
        from app import Job
        folder=Path(self.folder.name)/'probe'
        folder.mkdir()
        (folder/'upload').write_bytes(b'invalid')
        with self.assertRaises(Exception):
            DemucsEngine().separate(Job('probe',folder))
    def test_secret_is_required(self):
        with self.assertRaises(RuntimeError):create_app(self.engine, 'short')

if __name__ == '__main__':
    unittest.main()
