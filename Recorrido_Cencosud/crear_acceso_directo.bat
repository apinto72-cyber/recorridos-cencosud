@echo off
chcp 65001 > nul
title Crear Acceso Directo Newlead Recorridos

cd /d "%~dp0"
echo Creando acceso directo en el Escritorio de Windows...

powershell -NoProfile -ExecutionPolicy Bypass -Command "$ws = New-Object -ComObject WScript.Shell; $d = [Environment]::GetFolderPath('Desktop'); $lnk = $ws.CreateShortcut($d + '\Newlead - Procesador de Recorridos.lnk'); $lnk.TargetPath = (Join-Path (Get-Location) 'Newlead-Recorridos.exe'); $lnk.WorkingDirectory = (Get-Location); $lnk.IconLocation = (Join-Path (Get-Location) 'recorridos.ico'); $lnk.Description = 'Newlead Contact Center - Procesador Operacional de Recorridos'; $lnk.Save(); Write-Host 'Acceso directo creado exitosamente en el Escritorio.'"

pause