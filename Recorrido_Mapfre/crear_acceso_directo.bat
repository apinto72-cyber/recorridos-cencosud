@echo off
chcp 65001 > nul
title Crear Acceso Directo Newlead Mapfre

cd /d "%~dp0"
echo Creando acceso directo de Mapfre en el Escritorio de Windows...

powershell -NoProfile -ExecutionPolicy Bypass -Command "$ws = New-Object -ComObject WScript.Shell; $d = [Environment]::GetFolderPath('Desktop'); $lnk = $ws.CreateShortcut($d + '\Newlead - Mapfre.lnk'); $lnk.TargetPath = (Join-Path (Get-Location).Path 'Newlead-Mapfre.exe'); $lnk.WorkingDirectory = (Get-Location).Path; $lnk.IconLocation = (Join-Path (Get-Location).Path 'app.ico'); $lnk.Description = 'Newlead Contact Center - Extractor Mapfre'; $lnk.Save(); Write-Host 'Acceso directo de Mapfre creado exitosamente en el Escritorio.'"

pause
