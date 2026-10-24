@echo off
REM ============================================================
REM  Inicia un servidor local para ver la landing.
REM  Es necesario un servidor (no file://) para que el navegador
REM  pueda cargar el archivo data/birthdays.json.
REM ============================================================
echo Iniciando servidor local en http://localhost:8080 ...
echo Abre esa direccion en tu navegador. Presiona Ctrl+C para detener.
echo.
python -m http.server 8080
pause
