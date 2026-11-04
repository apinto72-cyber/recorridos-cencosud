@echo off
chcp 65001 > nul
title Newlead Contact Center - Cencosud

cd /d "%~dp0"
if exist "%LOCALAPPDATA%\Python\bin\python.exe" (
    set "PATH=%LOCALAPPDATA%\Python\bin;%PATH%"
)

echo ========================================================
echo    NEWLEAD CONTACT CENTER - RECORRIDOS CENCOSUD
echo ========================================================
echo.
echo Iniciando aplicacion local en http://127.0.0.1:8501 ...

start "" powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Seconds 3; Start-Process 'http://127.0.0.1:8501'"
python -m streamlit run app.py --server.port 8501 --server.address 127.0.0.1 --server.headless true --server.enableCORS false --server.enableXsrfProtection false --browser.serverAddress 127.0.0.1

pause