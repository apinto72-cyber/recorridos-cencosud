@echo off
cd /d "%~dp0"
if exist "Newlead-Cencosud.exe" (
    start "" "Newlead-Cencosud.exe"
) else (
    start "" "index.html"
)
