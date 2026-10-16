@echo off
chcp 65001 >nul
cd /d %~dp0
if not exist .venv (
  echo Ilk kurulum yapiliyor...
  python -m venv .venv
  .venv\Scripts\pip install -r requirements.txt
)
echo Program baslatiliyor: http://localhost:8000
start "" http://localhost:8000
.venv\Scripts\python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
pause
