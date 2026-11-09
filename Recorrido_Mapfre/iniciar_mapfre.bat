@echo off
cd /d "%~dp0"
if exist "Newlead-Mapfre.exe" (
    start "" "Newlead-Mapfre.exe"
) else (
    start "" "index.html"
)
