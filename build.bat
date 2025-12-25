@echo off
echo ========================================
echo Building MeshRadar Portable Version
echo ========================================

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js not found!
    echo Install Node.js 18+ and add it to PATH
    pause
    exit /b 1
)

REM Check venv
if not exist "backend\.venv\Scripts\python.exe" (
    echo Error: Virtual environment not found!
    echo Create it: cd backend ^&^& python -m venv .venv ^&^& .venv\Scripts\pip install -r requirements.txt
    pause
    exit /b 1
)

REM Run build script with venv Python
echo Using Python from backend\.venv
backend\.venv\Scripts\python.exe build_portable.py

if errorlevel 1 (
    echo.
    echo Build failed!
    pause
    exit /b 1
)

echo.
echo Done! File: dist\MeshtasticWeb.exe
pause
