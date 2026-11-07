FROM python:3.11-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 TORCH_HOME=/home/app/.cache/torch
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /service
COPY requirements.txt .
RUN pip install --no-cache-dir torch==2.5.1 torchaudio==2.5.1 --index-url https://download.pytorch.org/whl/cpu \
    && pip install --no-cache-dir -r requirements.txt
RUN useradd --create-home --uid 10001 app && mkdir -p /home/app/.cache/torch \
    && chown -R app:app /home/app
COPY app.py run.py ./
USER app
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=5s --start-period=300s --retries=3 CMD python -c "import os,urllib.request,json; r=urllib.request.Request('http://127.0.0.1:'+os.getenv('PORT','8000')+'/health',headers={'Authorization':'Bearer '+os.environ['SEPARATOR_TOKEN']}); assert json.load(urllib.request.urlopen(r,timeout=4))['ready']"
CMD ["python", "run.py"]
