# ─────────────────────────────────────────────────────────────
# Lost & Found AI — backend image for Hugging Face Spaces (Docker SDK).
# Django + DRF API with the AI matching engine (Sentence Transformers +
# CLIP + EasyOCR). Models are pre-downloaded at build time so the Space
# responds fast on first request. Serves on port 7860 (HF default).
#
# Build context = this directory (backend_drf/).
# ─────────────────────────────────────────────────────────────
FROM python:3.12-slim

# System libraries EasyOCR / OpenCV / Pillow need at runtime.
RUN apt-get update && apt-get install -y --no-install-recommends \
        libgl1 \
        libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# HF Spaces convention: run as a non-root user with uid 1000.
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    HF_HOME=/home/user/.cache/huggingface \
    DEBUG=False

WORKDIR /home/user/app

# Install Python deps. torch/torchvision come from the CPU-only wheel index
# (HF free tier has no GPU) — this avoids pulling ~2GB of CUDA libraries.
COPY --chown=user requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir torch torchvision \
        --index-url https://download.pytorch.org/whl/cpu \
    && pip install --no-cache-dir -r requirements.txt

# App code (build context is backend_drf/; .dockerignore keeps out db/media/env).
COPY --chown=user . .

# Pre-download the three AI models into the image cache so the first live
# matching request doesn't pay the download cost.
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')" \
    && python -c "from transformers import CLIPModel, CLIPProcessor; CLIPModel.from_pretrained('openai/clip-vit-base-patch32'); CLIPProcessor.from_pretrained('openai/clip-vit-base-patch32')" \
    && python -c "import easyocr; easyocr.Reader(['en'])"

# Collect Django admin / DRF static files for WhiteNoise to serve.
RUN python manage.py collectstatic --noinput

EXPOSE 7860

# Apply any pending migrations (idempotent — Supabase is already migrated),
# then launch gunicorn. gthread workers handle the blocking AI inference well;
# a long timeout covers the first-request model load from disk.
CMD ["sh", "-c", "python manage.py migrate --noinput && gunicorn main.wsgi:application --bind 0.0.0.0:7860 --workers 2 --threads 4 --worker-class gthread --timeout 300"]
