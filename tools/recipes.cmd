@echo off
setlocal
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0recipes.ps1" %*
exit /b %ERRORLEVEL%
