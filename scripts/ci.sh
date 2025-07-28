#!/bin/bash

# CI Script for Simple App
# This script runs all CI checks locally

set -e

echo "🚀 Starting CI Pipeline..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Backend checks
echo "📦 Backend Checks..."
cd backend

print_status "Installing backend dependencies..."
npm ci

print_status "Running backend linting..."
npm run lint

print_status "Running backend formatting check..."
npm run format:check

print_status "Running backend tests with coverage..."
npm run test:coverage

print_status "Running backend security audit..."
npm run audit

cd ..

# Frontend checks
echo "🎨 Frontend Checks..."
cd frontend

print_status "Installing frontend dependencies..."
npm ci

print_status "Running frontend linting..."
npm run lint

print_status "Running frontend formatting check..."
npm run format:check

print_status "Running frontend type check..."
npm run type-check

print_status "Running frontend tests with coverage..."
npm run test:coverage

print_status "Running frontend security audit..."
npm run audit

cd ..

# Docker checks
echo "🐳 Docker Checks..."

print_status "Building backend Docker image..."
docker build -t simple-app-backend:test ./backend

print_status "Building frontend Docker image..."
docker build -t simple-app-frontend:test ./frontend

# E2E tests
echo "🧪 E2E Tests..."

print_status "Starting services for E2E tests..."
docker-compose -f docker-compose.dev.yml up -d mongodb

print_status "Waiting for MongoDB to be ready..."
sleep 10

print_status "Starting backend for E2E tests..."
cd backend
npm start &
BACKEND_PID=$!
cd ..

sleep 5

print_status "Building frontend for E2E tests..."
cd frontend
npm run build
npm run preview &
FRONTEND_PID=$!
cd ..

sleep 5

print_status "Running E2E tests..."
cd frontend
npm run test:e2e
cd ..

# Cleanup
print_status "Cleaning up..."
kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
docker-compose -f docker-compose.dev.yml down

print_status "🎉 All CI checks passed!" 