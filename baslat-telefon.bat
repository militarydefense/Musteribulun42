@echo off
chcp 65001 >nul
cd /d %~dp0
if not exist .venv (
  echo Ilk kurulum yapiliyor...
  python -m venv .venv
  .venv\Scripts\pip install -r requirements.txt
)
echo.
echo Telefondan erisim modu: ayni Wi-Fi agindaki telefonlar baglanabilir.
echo Windows Guvenlik Duvari izin isterse "Ozel aglar" icin IZIN VERIN.
echo Telefon adresi ve QR kod: Ayarlar sekmesi.
echo.
set APP_PUBLIC=1
start "" http://localhost:8000
.venv\Scripts\python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
pause
