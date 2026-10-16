#!/usr/bin/env bash
cd "$(dirname "$0")"
if [ ! -d .venv ]; then
  echo "İlk kurulum yapılıyor..."
  python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
fi
echo "Program başlatılıyor: http://localhost:8000"
.venv/bin/python -m uvicorn app.main:app --host "${HOST:-127.0.0.1}" --port 8000
