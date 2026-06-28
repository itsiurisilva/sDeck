@echo off
cd /d "%~dp0"
title sDeck - Start Server
color 0b

echo ========================================================
echo   🌟 sDECK PANEL AND ALERTS - SERVER LAUNCHER
echo ========================================================
echo.

:: 1. Check if Node.js is installed
where node >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js is not installed!
    echo To run this server, you must install Node.js.
    echo.
    echo 1. Opening the Node.js download page...
    start "" "https://nodejs.org/"
    echo 2. Download and install the LTS version.
    echo 3. Once installed, run this file INICIAR.bat again.
    echo.
    pause
    exit
)
:: 2. Create .env file from template if missing
if not exist ".env" (
    echo [INFO] Creating .env file from template...
    copy .env.example .env >nul
)

:: 3. Check if node_modules exists, install if missing
if not exist "node_modules\" (
    echo [INFO] node_modules folder not found.
    echo Installing all required server dependencies...
    call npm install
)

:: Verify if npm install succeeded
if not exist "node_modules\" (
    echo [ERROR] An error occurred while installing dependencies.
    echo Please ensure you are connected to the Internet.
    pause
    exit
)

:: 4. Start the server
echo Starting the local sDeck server...
echo You can stop the server at any time by closing this window.
echo.
start "" "http://localhost:3000"
node server.js
if errorlevel 1 (
    echo [INFO] Server stopped or port is already in use.
    pause
)
