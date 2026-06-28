#!/bin/bash

# Navigate to the script's directory
cd "$(dirname "$0")"

echo "========================================================"
echo "  🌟 sDECK PANEL AND ALERTS - SERVER LAUNCHER"
echo "========================================================"
echo ""

# 1. Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed!"
    echo "To run this server, you must install Node.js."
    echo "Please download and install Node.js from https://nodejs.org/"
    exit 1
fi

# 2. Copy .env.example to .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "[INFO] Creating .env file from template..."
    cp .env.example .env
fi

# 3. Check if node_modules exists, install if missing
if [ ! -d "node_modules" ]; then
    echo "[INFO] node_modules folder not found."
    echo "Installing all required server dependencies..."
    npm install
fi

# Verify if npm install succeeded
if [ ! -d "node_modules" ]; then
    echo "[ERROR] An error occurred while installing dependencies."
    echo "Please ensure you are connected to the Internet."
    exit 1
fi

# 4. Start the server
echo "Starting the local sDeck server..."
echo "You can stop the server at any time by pressing Ctrl+C."
echo ""

# Open browser depending on OS
if [[ "$OSTYPE" == "darwin"* ]]; then
    open "http://localhost:3000"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open "http://localhost:3000" 2>/dev/null || echo "Please open http://localhost:3000 in your browser."
fi

npm start
