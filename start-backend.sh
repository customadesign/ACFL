#!/bin/bash

echo "Starting Backend Server"
echo "======================"

# Kill any existing process on port 3001
echo "Killing existing process on port 3001..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || true

# Wait a moment for port to be freed
sleep 1

# Navigate to backend directory
cd "$(dirname "$0")/backend"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
fi

# Start the backend
echo "Starting backend on http://localhost:3001"
npm run dev