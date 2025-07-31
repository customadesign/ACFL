#!/bin/bash

echo "Starting Frontend"
echo "================"

# Kill any existing process on port 4000
echo "Killing existing process on port 4000..."
lsof -ti:4000 | xargs kill -9 2>/dev/null || true

# Wait a moment for port to be freed
sleep 1

# Navigate to frontend directory
cd "$(dirname "$0")/frontend"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

# Start the frontend
echo "Starting frontend on http://localhost:4000"
npm run dev