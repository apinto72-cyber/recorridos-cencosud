@echo off
chcp 65001 > nul
title Crear Acceso Directo Newlead Cencosud

cd /d "%~dp0"
echo Creando acceso directo en el Escritorio de Windows...

powershell -NoProfile -ExecutionPolicy Bypass -Command "$ws = New-Object -ComObject WScript.Shell; $d1 = [Environment]::GetFolderPath('Desktop'); $d2 = [System.IO.Path]::Combine([Environment]::GetFolderPath('UserProfile'), 'OneDrive', 'Desktop'); foreach ($dir in @($d1, $d2)) { if ([System.IO.Directory]::Exists($dir)) { $lnk = $ws.CreateShortcut((Join-Path $dir 'Newlead - Cencosud.lnk')); $lnk.TargetPath = (Join-Path (Get-Location).Path 'Newlead-Cencosud.exe'); $lnk.WorkingDirectory = (Get-Location).Path; $lnk.IconLocation = (Join-Path (Get-Location).Path 'recorridos.ico'); $lnk.Description = 'Newlead Contact Center - Recorridos Cencosud'; $lnk.Save(); Write-Host ('Acceso directo creado en: ' + $lnk.FullName); } }"

pause
