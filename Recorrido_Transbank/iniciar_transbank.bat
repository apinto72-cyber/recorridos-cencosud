@echo off
cd /d "%~dp0"
if exist "Newlead-Transbank.exe" (
    start "" "Newlead-Transbank.exe"
) else (
    start "" "index.html"
)