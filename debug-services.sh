#!/bin/bash

echo "Debugging ACT Coaching Services"
echo "==============================="
echo ""

# Check Node.js and npm
echo "Node.js version:"
node --version || echo "Node.js not found!"
echo ""

echo "npm version:"
npm --version || echo "npm not found!"
echo ""

# Check current directory
echo "Current directory:"
pwd
echo ""

# Check if directories exist
echo "Checking directories:"
[ -d "backend" ] && echo "✓ backend directory exists" || echo "✗ backend directory missing"
[ -d "frontend" ] && echo "✓ frontend directory exists" || echo "✗ frontend directory missing"
[ -d "admin-dashboard" ] && echo "✓ admin-dashboard directory exists" || echo "✗ admin-dashboard directory missing"
echo ""

# Check if node_modules exist
echo "Checking dependencies:"
[ -d "backend/node_modules" ] && echo "✓ backend node_modules exists" || echo "✗ backend node_modules missing"
[ -d "frontend/node_modules" ] && echo "✓ frontend node_modules exists" || echo "✗ frontend node_modules missing"
echo ""

# Check if ports are in use
echo "Checking ports:"
lsof -i :3001 >/dev/null 2>&1 && echo "⚠ Port 3001 is in use" || echo "✓ Port 3001 is free"
lsof -i :4000 >/dev/null 2>&1 && echo "⚠ Port 4000 is in use" || echo "✓ Port 4000 is free"
echo ""

# Check for .env files
echo "Checking environment files:"
[ -f "backend/.env" ] && echo "✓ backend/.env exists" || echo "⚠ backend/.env missing (using defaults)"
[ -f "frontend/.env" ] && echo "✓ frontend/.env exists" || echo "⚠ frontend/.env missing (using defaults)"
echo ""

echo "To start services individually:"
echo "1. Open two terminal windows"
echo "2. In terminal 1: cd backend && npm run dev"
echo "3. In terminal 2: cd frontend && npm run dev"
echo ""
echo "Or use: bash start-all.sh"