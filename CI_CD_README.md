# 🚀 CI/CD Pipeline - Simple App

This document describes the complete CI/CD pipeline implemented for Simple App.

## 📋 Index

- [Overview](#overview)
- [Architecture](#architecture)
- [Workflows](#workflows)
- [Configurations](#configurations)
- [Scripts](#scripts)
- [Deploy](#deploy)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

The implemented CI/CD pipeline offers:

- ✅ **Complete Continuous Integration**
- ✅ **Automated Deployment** to production
- ✅ **Automated Testing** (Unit, Integration, E2E)
- ✅ **Code Quality Analysis**
- ✅ **Integrated Security**
- ✅ **Containerization** with Docker
- ✅ **Monitoring** and health checks

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   GitHub Repo   │───▶│  GitHub Actions │───▶│   Production    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   Docker Hub    │
                       └─────────────────┘
```

### Components

- **GitHub Actions**: Main pipeline
- **Docker**: Containerization
- **MongoDB**: Database
- **Nginx**: Reverse proxy
- **Redis**: Cache (optional)

## 🔄 Workflows

### 1. Main CI Pipeline (`ci.yml`)

**Triggers:**
- Push to `main` or `develop`
- Pull Request to `main` or `develop`

**Jobs:**
1. **Backend Tests**
   - Linting with ESLint
   - Unit tests with Jest
   - Code coverage
   - Upload to Codecov

2. **Frontend Tests**
   - Linting with ESLint
   - Unit tests with Vitest
   - Code coverage
   - Upload to Codecov

3. **E2E Tests**
   - End-to-end tests with Cypress
   - Integration tests

4. **Security Scan**
   - Vulnerability analysis with Trivy
   - Upload to GitHub Security

5. **Build Docker Images**
   - Build and push to Docker Hub
   - Tags: `latest` and commit SHA

6. **Deploy to Production**
   - Automatic deployment to production
   - Only on `main` branch

### 2. Code Quality (`code-quality.yml`)

**Jobs:**
1. **Code Quality Analysis**
   - ESLint for backend and frontend
   - Prettier check
   - SonarQube analysis
   - TypeScript check (frontend)

2. **Dependency Security Check**
   - npm audit
   - Snyk security scan

## ⚙️ Configurations

### Environment Variables

Configure the following secrets in GitHub:

```bash
# Docker Hub
DOCKER_USERNAME=your-docker-username
DOCKER_PASSWORD=your-docker-password

# SonarQube
SONAR_TOKEN=your-sonar-token

# Snyk
SNYK_TOKEN=your-snyk-token
```

### Local Development

1. **Initial setup:**
```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

2. **Run CI locally:**
```bash
chmod +x scripts/ci.sh
./scripts/ci.sh
```

3. **Manual deploy:**
```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

## 🐳 Docker

### Images

- **Backend**: `simple-app-backend`
- **Frontend**: `simple-app-frontend`
- **MongoDB**: `mongo:6.0`
- **Redis**: `redis:7-alpine`
- **Nginx**: `nginx:alpine`

### Docker Compose

**Development:**
```bash
docker-compose -f docker-compose.dev.yml up
```

**Production:**
```bash
docker-compose up -d
```

## 📊 Monitoring

### Health Checks

- **Backend**: `http://localhost:3000/health`
- **Frontend**: `http://localhost/health`
- **MongoDB**: Automatic ping
- **Redis**: Automatic ping

### Logs

```bash
# View logs from all services
docker-compose logs -f

# View specific logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Metrics

- **Code coverage**: Codecov
- **Quality**: SonarQube
- **Security**: Snyk, Trivy
- **Performance**: Lighthouse (optional)

## 🚀 Deploy

### Automatic

Deployment happens automatically when:
- Push to `main` branch
- All tests pass
- Docker image build is successful

### Manual

```bash
# Local deploy
./scripts/deploy.sh

# Deploy with Docker Compose
docker-compose pull
docker-compose up -d

# Deploy to Kubernetes (if configured)
kubectl apply -f k8s/
```

## 🔧 Troubleshooting

### Common Issues

1. **Docker not running**
```bash
# Check status
docker info

# Start Docker
sudo systemctl start docker
```

2. **Ports in use**
```bash
# Check ports
lsof -i :3000
lsof -i :5173
lsof -i :27017

# Kill processes
kill -9 <PID>
```

3. **MongoDB not connecting**
```bash
# Check logs
docker-compose logs mongodb

# Restart service
docker-compose restart mongodb
```

4. **Tests failing**
```bash
# Clear cache
npm run test -- --clearCache

# Check dependencies
npm ci

# Check environment variables
cat .env
```

### Useful Logs

```bash
# GitHub Actions
# View logs in GitHub > Actions

# Docker
docker-compose logs -f

# Backend
tail -f backend/logs/app.log

# Frontend
# View logs in browser console
```

## 📈 Metrics and KPIs

### Code Quality

- **Test coverage**: > 80%
- **Code duplication**: < 3%
- **Cyclomatic complexity**: < 10
- **Technical debt**: < 5%

### Performance

- **Build time**: < 10 min
- **Deploy time**: < 5 min
- **Availability**: > 99.9%

### Security

- **Critical vulnerabilities**: 0
- **High vulnerabilities**: < 5
- **Outdated dependencies**: < 10%

## 🔄 Next Steps

1. **Kubernetes**: Configure K8s deployment
2. **Monitoring**: Implement Prometheus + Grafana
3. **Logging**: Centralize logs with ELK Stack
4. **CDN**: Configure CDN for static assets
5. **SSL**: Configure automatic SSL certificates
6. **Backup**: Implement automatic MongoDB backup

## 📞 Support

For questions or issues:

1. Check logs and documentation
2. Consult troubleshooting
3. Open issue on GitHub
4. Contact DevOps team

---

**Complexity:** Medium  
**T-shirt Sizing:** L  
**Estimated time:** 3-4 days  
**Coverage:** 100% functional 