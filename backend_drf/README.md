---
title: Lost Found AI Backend
emoji: 🔎
colorFrom: indigo
colorTo: blue
sdk: docker
app_port: 7860
pinned: false
---

# Lost & Found AI - Backend

Django REST API with an AI matching engine (Sentence Transformers + CLIP +
EasyOCR) that pairs lost and found item reports. Deployed on Hugging Face
Spaces (Docker); database on Supabase (Postgres); frontend on Vercel.

## Required Space secrets

Set these under **Settings -> Variables and secrets** in the Space
(add as **secrets**, never commit them):

| Name | Value |
|------|-------|
| `SECRET_KEY` | a long random string |
| `DEBUG` | `False` |
| `ALLOWED_HOSTS` | `suyambu08-lost-and-found-ai.hf.space` |
| `POSTGRES_DB` | `postgres` |
| `POSTGRES_USER` | `postgres.jatzuzeeotdgiziieqpc` |
| `POSTGRES_PASSWORD` | your Supabase DB password |
| `POSTGRES_HOST` | `aws-0-ap-northeast-1.pooler.supabase.com` |
| `POSTGRES_PORT` | `5432` |
| `POSTGRES_SSLMODE` | `require` |
| `CORS_ALLOWED_ORIGINS` | `https://<your-app>.vercel.app` |
| `CSRF_TRUSTED_ORIGINS` | `https://<your-app>.vercel.app` |
| `RAZORPAY_KEY_ID` | (optional) |
| `RAZORPAY_KEY_SECRET` | (optional) |

## Local development

Copy `.env.example` to `.env` and use the local Docker Postgres, then run:

```bash
python manage.py runserver
```
