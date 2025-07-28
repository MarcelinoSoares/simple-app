#!/bin/bash

# Setup Script for Simple App
# This script sets up the development environment

set -e

echo "🚀 Setting up Simple App Development Environment..."

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

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

print_status "Node.js version: $(node -v)"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_warning "Docker is not installed. Some features may not work."
else
    print_status "Docker version: $(docker --version)"
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_warning "Docker Compose is not installed. Some features may not work."
else
    print_status "Docker Compose version: $(docker-compose --version)"
fi

# Install backend dependencies
print_status "Installing backend dependencies..."
cd backend
npm ci
cd ..

# Install frontend dependencies
print_status "Installing frontend dependencies..."
cd frontend
npm ci
cd ..

# Create environment files
print_status "Creating environment files..."

if [ ! -f backend/.env ]; then
    cat > backend/.env << EOF
NODE_ENV=development
MONGODB_URI=mongodb://admin:password123@localhost:27017/simpleapp_dev?authSource=admin
JWT_SECRET=dev-jwt-secret-key-change-in-production
PORT=3000
CORS_ORIGIN=http://localhost:5173
EOF
    print_status "Created backend/.env"
fi

if [ ! -f frontend/.env ]; then
    cat > frontend/.env << EOF
VITE_API_URL=http://localhost:3000
EOF
    print_status "Created frontend/.env"
fi

# Make scripts executable
print_status "Making scripts executable..."
chmod +x scripts/*.sh

# Create logs directory
print_status "Creating logs directory..."
mkdir -p backend/logs

print_status "🎉 Setup completed successfully!"
print_status "To start development:"
print_status "  Backend: cd backend && npm run dev"
print_status "  Frontend: cd frontend && npm run dev"
print_status "  Docker: docker-compose -f docker-compose.dev.yml up" 