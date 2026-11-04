@echo off
cd /d "%~dp0"
if exist "Newlead-Cencosud.exe" (
    start "" "Newlead-Cencosud.exe"
) else if exist "Recorrido_Cencosud\Newlead-Cencosud.exe" (
    start "" "Recorrido_Cencosud\Newlead-Cencosud.exe"
) else (
    start "" "Recorrido_Cencosud\index.html"
)
