@echo off
chcp 65001 > nul
title Compilar Ejecutable Newlead Mapfre

echo =======================================================
echo    COMPILANDO EJECUTABLE STANDALONE NEWLEAD MAPFRE
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

echo [1/2] Compilando recursos en Newlead-Mapfre.exe...
%CSC% /nologo /optimize /target:winexe /out:Newlead-Mapfre.exe /win32icon:app.ico /reference:System.Windows.Forms.dll /resource:index.html,index.html /resource:styles.css,styles.css /resource:app.js,app.js /resource:logo_newlead.png,logo_newlead.png /resource:vendor\xlsx.full.min.js,xlsx.full.min.js /resource:vendor\jszip.min.js,jszip.min.js Program.cs

if errorlevel 1 (
    echo.
    echo [ERROR] Fallo la compilacion.
    pause
    exit /b 1
)

echo.
echo [2/2] Compilacion completada exitosamente!
echo Archivo generado en: Newlead-Mapfre.exe
echo.
pause
