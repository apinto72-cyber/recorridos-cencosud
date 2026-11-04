@echo off
chcp 65001 > nul
title Compilar Ejecutable Newlead Cencosud

cd /d "%~dp0"

set CSC="C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe"
if not exist %CSC% (
    set CSC="C:\Windows\Microsoft.NET\Framework\v4.0.30319\csc.exe"
)

echo Compilando Newlead-Cencosud.exe...
%CSC% /nologo /optimize /target:winexe /out:Newlead-Cencosud.exe /win32icon:recorridos.ico /reference:System.Windows.Forms.dll /reference:System.Drawing.dll Program_Cencosud.cs

if errorlevel 1 (
    echo [ERROR] Fallo la compilacion.
    pause
    exit /b 1
)

copy /y Newlead-Cencosud.exe "..\Newlead-Cencosud.exe" > nul
echo Compilacion exitosa: Newlead-Cencosud.exe
pause