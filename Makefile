# Makefile for Simple App
# Usage: make <target>

.PHONY: help setup install test test-coverage lint format clean docker-build docker-up docker-down deploy ci

# Default target
help:
	@echo "🚀 Simple App - Available Commands:"
	@echo ""
	@echo "📦 Setup & Installation:"
	@echo "  setup          - Setup development environment"
	@echo "  install        - Install all dependencies"
	@echo ""
	@echo "🧪 Testing:"
	@echo "  test           - Run all tests"
	@echo "  test-coverage  - Run tests with coverage"
	@echo "  test-e2e       - Run E2E tests"
	@echo ""
	@echo "🔍 Code Quality:"
	@echo "  lint           - Run linting"
	@echo "  lint-fix       - Fix linting issues"
	@echo "  format         - Format code with Prettier"
	@echo "  format-check   - Check code formatting"
	@echo ""
	@echo "🐳 Docker:"
	@echo "  docker-build   - Build Docker images"
	@echo "  docker-up      - Start services with Docker Compose"
	@echo "  docker-down    - Stop services"
	@echo "  docker-dev     - Start development environment"
	@echo ""
	@echo "🚀 Deployment:"
	@echo "  deploy         - Deploy to production"
	@echo "  ci             - Run CI pipeline locally"
	@echo ""
	@echo "🧹 Maintenance:"
	@echo "  clean          - Clean build artifacts"
	@echo "  logs           - Show logs"
	@echo "  health         - Check service health"

# Setup
setup:
	@echo "🚀 Setting up development environment..."
	@chmod +x scripts/setup.sh
	@./scripts/setup.sh

# Installation
install:
	@echo "📦 Installing dependencies..."
	@cd backend && npm ci
	@cd frontend && npm ci

# Testing
test:
	@echo "🧪 Running tests..."
	@cd backend && npm test
	@cd frontend && npm test

test-coverage:
	@echo "📊 Running tests with coverage..."
	@cd backend && npm run test:coverage
	@cd frontend && npm run test:coverage

test-e2e:
	@echo "🧪 Running E2E tests..."
	@cd frontend && npm run test:e2e

# Code Quality
lint:
	@echo "🔍 Running linting..."
	@cd backend && npm run lint
	@cd frontend && npm run lint

lint-fix:
	@echo "🔧 Fixing linting issues..."
	@cd backend && npm run lint:fix
	@cd frontend && npm run lint:fix

format:
	@echo "✨ Formatting code..."
	@cd backend && npm run format
	@cd frontend && npm run format

format-check:
	@echo "✅ Checking code formatting..."
	@cd backend && npm run format:check
	@cd frontend && npm run format:check

# Docker
docker-build:
	@echo "🐳 Building Docker images..."
	@docker build -t simple-app-backend ./backend
	@docker build -t simple-app-frontend ./frontend

docker-up:
	@echo "🚀 Starting services..."
	@docker-compose up -d

docker-down:
	@echo "🛑 Stopping services..."
	@docker-compose down

docker-dev:
	@echo "🔧 Starting development environment..."
	@docker-compose -f docker-compose.dev.yml up -d

# Deployment
deploy:
	@echo "🚀 Deploying to production..."
	@chmod +x scripts/deploy.sh
	@./scripts/deploy.sh

ci:
	@echo "🔄 Running CI pipeline locally..."
	@chmod +x scripts/ci.sh
	@./scripts/ci.sh

# Maintenance
clean:
	@echo "🧹 Cleaning build artifacts..."
	@rm -rf backend/node_modules
	@rm -rf frontend/node_modules
	@rm -rf backend/coverage
	@rm -rf frontend/coverage
	@rm -rf backend/dist
	@rm -rf frontend/dist
	@docker system prune -f

logs:
	@echo "📋 Showing logs..."
	@docker-compose logs -f

health:
	@echo "🏥 Checking service health..."
	@curl -f http://localhost:3000/health || echo "Backend: ❌"
	@curl -f http://localhost/health || echo "Frontend: ❌"
	@docker-compose ps

# Development shortcuts
dev-backend:
	@echo "🔧 Starting backend in development mode..."
	@cd backend && npm run dev

dev-frontend:
	@echo "🎨 Starting frontend in development mode..."
	@cd frontend && npm run dev

# Security
security:
	@echo "🔒 Running security checks..."
	@cd backend && npm run security
	@cd frontend && npm run security

# Database
db-reset:
	@echo "🗄️ Resetting database..."
	@docker-compose down -v
	@docker-compose up -d mongodb
	@sleep 5
	@echo "Database reset complete"

# Backup
backup:
	@echo "💾 Creating backup..."
	@docker exec simple-app-mongodb mongodump --out /data/backup/$(date +%Y%m%d_%H%M%S)
	@echo "Backup created in MongoDB container"

# Quick start
quick-start: setup docker-dev
	@echo "🎉 Quick start complete!"
	@echo "Frontend: http://localhost:5173"
	@echo "Backend: http://localhost:3000"
	@echo "MongoDB: localhost:27017" 