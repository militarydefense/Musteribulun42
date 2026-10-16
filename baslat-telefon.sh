#!/usr/bin/env bash
# Aynı Wi-Fi ağındaki telefonlardan erişim için başlatır (şifre zorunlu).
cd "$(dirname "$0")"
if [ ! -d .venv ]; then
  python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
fi
export APP_PUBLIC=1
echo "Telefon adresi ve QR kod: http://localhost:8000 → Ayarlar"
.venv/bin/python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
