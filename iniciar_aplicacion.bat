@echo off
chcp 65001 > nul
title Procesador de Recorridos e Incidencias

echo ==========================================================
echo    PROCESADOR DE RECORRIDOS Y HOMOLOGADOR DE INCIDENCIAS
echo ==========================================================
echo.

cd /d "%~dp0"

:: Configurar ruta preferente de Python
if exist "%LOCALAPPDATA%\Python\bin\python.exe" (
    set "PATH=%LOCALAPPDATA%\Python\bin;%PATH%"
)

echo [1/3] Verificando instalacion de Python...
python --version
if errorlevel 1 (
    echo.
    echo [ERROR] No se encontro Python en el sistema.
    echo Por favor instale Python 3.9 o superior y agreguelo al PATH.
    echo.
    pause
    exit /b 1
)

echo.
echo [2/3] Verificando dependencias...
python -c "import streamlit, pandas, openpyxl" >nul 2>&1
if errorlevel 1 (
    echo Instalando librerias necesarias: streamlit, pandas, openpyxl...
    python -m pip install streamlit pandas openpyxl
    if errorlevel 1 (
        echo [ERROR] Fallo la instalacion de dependencias.
        pause
        exit /b 1
    )
)
echo Dependencias verificadas correctamente.

echo.
echo [3/3] Iniciando aplicacion web local...
echo La aplicacion abrira su navegador en unos segundos...
echo (Para detener la aplicacion, cierre esta ventana)
echo.

:: Abrir navegador tras breve espera en segundo plano
start "" powershell -WindowStyle Hidden -Command "Start-Sleep -Seconds 3; Start-Process 'http://localhost:8501'"

:: Iniciar Streamlit en modo local
python -m streamlit run app.py --server.port 8501 --server.headless true --browser.serverAddress localhost

if errorlevel 1 (
    echo.
    echo [AVISO] La aplicacion se ha detenido.
    pause
)
