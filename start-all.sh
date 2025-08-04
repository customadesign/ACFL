#!/bin/bash

echo "Starting ACT Coaching For Life"
echo "==============================="

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Kill any existing processes on these ports
echo "Killing existing processes on ports 3001, 4000..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
lsof -ti:4000 | xargs kill -9 2>/dev/null || true

# Wait a moment for ports to be freed
sleep 2

# Start backend
echo "Starting backend server on port 3001..."
cd "$SCRIPT_DIR/backend"
npm run dev > backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Wait for backend to start
echo "Waiting for backend to start..."
sleep 5

# Check if backend is running
if kill -0 $BACKEND_PID 2>/dev/null; then
    echo "✓ Backend is running"
else
    echo "✗ Backend failed to start. Check backend.log for details"
    exit 1
fi

# Start frontend
echo "Starting frontend on port 4000..."
cd "$SCRIPT_DIR/frontend"
npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

# Wait for frontend to start
echo "Waiting for frontend to start..."
sleep 5

# Check if frontend is running
if kill -0 $FRONTEND_PID 2>/dev/null; then
    echo "✓ Frontend is running"
else
    echo "✗ Frontend failed to start. Check frontend.log for details"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo ""
echo "All services started!"
echo "====================="
echo "Backend API:        http://localhost:3001"
echo "Frontend:           http://localhost:4000"
echo "Admin Dashboard:    http://localhost:4000/admin"
echo "Coaches Dashboard:  http://localhost:4000/coaches"
echo ""
echo "Logs are available in:"
echo "  - backend/backend.log"
echo "  - frontend/frontend.log"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user to stop
trap "echo 'Stopping all services...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait