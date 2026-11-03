@echo off
chcp 65001 > nul
title Detener Servidor Newlead Recorridos

cd /d "%~dp0"
echo Deteniendo procesos locales de Streamlit...

powershell -NoProfile -Command "Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like '*streamlit run*app.py*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force; Write-Host ('Proceso local ' + $_.ProcessId + ' detenido.') }"

echo.
echo Listo. Los procesos locales han sido finalizados.
timeout /t 3 > nul