@echo off
chcp 65001 > nul
title Newlead Contact Center - Megú de Recorridos

:menu
cls
echo =======================================================
echo        NEWLEAD CONTACT CENTER - SISTEMA DE RECORRIDOS
echo =======================================================
echo.
echo   Seleccione el módulo de recorrido que desea iniciar:
echo.
echo   [1] Recorrido Cencosud
echo   [2] Recorrido Transbank
echo   [3] Recorrido Mapfre
echo   [4] Salir
echo.
echo =======================================================
set /p opt="Ingrese una opción (1-4): "

if "%opt%"=="1" (
    cd /d "%~dp0Recorrido_Cencosud"
    start "" "iniciar_cencosud.bat"
    exit /b 0
)
if "%opt%"=="2" (
    cd /d "%~dp0Recorrido_Transbank"
    start "" "iniciar_transbank.bat"
    exit /b 0
)
if "%opt%"=="3" (
    cd /d "%~dp0Recorrido_Mapfre"
    start "" "iniciar_mapfre.bat"
    exit /b 0
)
if "%opt%"=="4" (
    exit /b 0
)

echo.
echo Opción inválida. Intente nuevamente.
timeout /t 2 > nul
goto menu
