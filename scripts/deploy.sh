#!/bin/bash

# Deploy Script for Simple App
# This script deploys the application to production

set -e

echo "🚀 Starting Deployment..."

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

# Check environment variables
if [ -z "$DOCKER_USERNAME" ] || [ -z "$DOCKER_PASSWORD" ]; then
    print_error "Docker credentials not found. Please set DOCKER_USERNAME and DOCKER_PASSWORD environment variables."
    exit 1
fi

# Login to Docker Hub
print_status "Logging in to Docker Hub..."
echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin

# Build and push images
print_status "Building and pushing backend image..."
docker build -t "$DOCKER_USERNAME/simple-app-backend:latest" ./backend
docker push "$DOCKER_USERNAME/simple-app-backend:latest"

print_status "Building and pushing frontend image..."
docker build -t "$DOCKER_USERNAME/simple-app-frontend:latest" ./frontend
docker push "$DOCKER_USERNAME/simple-app-frontend:latest"

# Deploy to production
print_status "Deploying to production..."

# Check if running on Kubernetes
if command -v kubectl &> /dev/null; then
    print_status "Deploying to Kubernetes..."
    kubectl apply -f k8s/
    kubectl rollout status deployment/simple-app-backend
    kubectl rollout status deployment/simple-app-frontend
else
    print_status "Deploying with Docker Compose..."
    docker-compose pull
    docker-compose up -d
fi

print_status "🎉 Deployment completed successfully!" 