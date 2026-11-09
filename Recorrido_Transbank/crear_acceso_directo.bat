@echo off
chcp 65001 > nul
title Crear Acceso Directo Newlead Transbank

cd /d "%~dp0"
echo Creando acceso directo de Transbank en el Escritorio de Windows...

powershell -NoProfile -ExecutionPolicy Bypass -Command "$ws = New-Object -ComObject WScript.Shell; $d = [Environment]::GetFolderPath('Desktop'); $lnk = $ws.CreateShortcut($d + '\Newlead - Transbank.lnk'); $lnk.TargetPath = (Join-Path (Get-Location).Path 'Newlead-Transbank.exe'); $lnk.WorkingDirectory = (Get-Location).Path; $lnk.IconLocation = (Join-Path (Get-Location).Path 'app.ico'); $lnk.Description = 'Newlead Contact Center - Extractor Transbank'; $lnk.Save(); Write-Host 'Acceso directo de Transbank creado exitosamente en el Escritorio.'"

pause