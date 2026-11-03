@echo off
chcp 65001 > nul
title Compilar Ejecutable Newlead Recorridos

echo =======================================================
echo    COMPILANDO APLICACION WINDOWS NEWLEAD RECORRIDOS
echo =======================================================
echo.

cd /d "%~dp0"

set CSC="C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe"
if not exist %CSC% (
    set CSC="C:\Windows\Microsoft.NET\Framework\v4.0.30319\csc.exe"
)

if not exist %CSC% (
    echo [ERROR] No se encontro el compilador de C# (csc.exe).
    pause
    exit /b 1
)

echo [1/2] Compilando Newlead-Recorridos.exe...
%CSC% /nologo /optimize /target:winexe /out:Newlead-Recorridos.exe /win32icon:recorridos.ico /reference:System.Windows.Forms.dll Program_Recorridos.cs

if errorlevel 1 (
    echo.
    echo [ERROR] Fallo la compilacion.
    pause
    exit /b 1
)

echo.
echo [2/2] Compilacion completada exitosamente!
echo Archivo generado en:
echo   - Newlead-Recorridos.exe
echo.
pause