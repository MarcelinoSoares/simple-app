# 🚀 Simple App - Fullstack Application

A modern fullstack application with React frontend and Node.js backend, complete with CI/CD, Docker and automated testing.

## 📋 Index

- [Overview](#overview)
- [Technologies](#technologies)
- [Quick Start](#quick-start)
- [Development](#development)
- [Testing](#testing)
- [Deploy](#deploy)
- [CI/CD](#cicd)
- [Docker](#docker)
- [Structure](#structure)
- [Contributing](#contributing)

## 🎯 Overview

Simple App is a task management application with:

- ✅ **React Frontend** with Vite
- ✅ **Node.js Backend** with Express
- ✅ **MongoDB Database** with Mongoose
- ✅ **JWT Authentication**
- ✅ **Automated Testing** (Unit, Integration, E2E)
- ✅ **Complete CI/CD** with GitHub Actions
- ✅ **Containerization** with Docker
- ✅ **Code Quality** with ESLint, Prettier, SonarQube
- ✅ **Integrated Security**

## 🛠️ Technologies

### Frontend
- **React 18** - UI Library
- **Vite** - Build tool
- **Tailwind CSS** - CSS Framework
- **Vitest** - Test runner
- **Cypress** - E2E testing

### Backend
- **Node.js 18** - Runtime
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Jest** - Test runner
- **JWT** - Authentication

### DevOps
- **Docker** - Containerization
- **GitHub Actions** - CI/CD
- **ESLint** - Linting
- **Prettier** - Code formatting
- **SonarQube** - Code quality

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Git

### Quick Setup
```bash
# Clone repository
git clone <repository-url>
cd simple-app

# Automatic setup
make quick-start

# Or manually:
make setup
make docker-dev
```

### Access
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000
- **MongoDB**: localhost:27017

## 🔧 Development

### Main Commands
```bash
# View all available commands
make help

# Initial setup
make setup

# Install dependencies
make install

# Local development
make dev-backend    # Backend in dev mode
make dev-frontend   # Frontend in dev mode

# Docker development
make docker-dev     # Complete environment with Docker
```

### Development Structure
```
simple-app/
├── backend/          # Node.js API
├── frontend/         # React App
├── scripts/          # Automation scripts
├── docker-compose.yml
└── Makefile
```

## 🧪 Testing

### Run Tests
```bash
# All tests
make test

# With coverage
make test-coverage

# E2E tests
make test-e2e

# Specific tests
cd backend && npm test
cd frontend && npm test
```

### Test Coverage
- **Backend**: Jest + Supertest
- **Frontend**: Vitest + Testing Library
- **E2E**: Cypress
- **Goal**: > 80% coverage

## 🚀 Deploy

### Local Deploy
```bash
# Build and deploy
make deploy

# Or manually:
docker-compose up -d
```

### Production Deploy
Automatic deployment happens via GitHub Actions when:
- Push to `main` branch
- All tests pass
- Docker image build is successful

## 🔄 CI/CD

### Automated Pipeline
1. **Code Quality** - ESLint, Prettier, SonarQube
2. **Security** - npm audit, Snyk, Trivy
3. **Tests** - Unit, Integration, E2E
4. **Build** - Docker images
5. **Deploy** - Automatic production deployment

### Run CI Locally
```bash
make ci
```

## 🐳 Docker

### Images
- `simple-app-backend` - Node.js API
- `simple-app-frontend` - React App
- `mongo:6.0` - Database
- `redis:7-alpine` - Cache (optional)

### Docker Commands
```bash
# Build images
make docker-build

# Start services
make docker-up

# Stop services
make docker-down

# Development
make docker-dev

# View logs
make logs

# Health check
make health
```

## 📁 Project Structure

```
simple-app/
├── .github/
│   └── workflows/          # GitHub Actions
├── backend/
│   ├── src/               # Source code
│   ├── test/              # Tests
│   ├── Dockerfile         # Docker image
│   └── package.json
├── frontend/
│   ├── src/               # Source code
│   ├── test/              # Tests
│   ├── Dockerfile         # Docker image
│   └── package.json
├── scripts/               # Automation scripts
├── nginx/                 # nginx configuration
├── docker-compose.yml     # Production
├── docker-compose.dev.yml # Development
├── Makefile              # Main commands
└── README.md
```

## 🔍 Code Quality

### Tools
- **ESLint** - JavaScript/React linting
- **Prettier** - Code formatting
- **SonarQube** - Quality analysis
- **TypeScript** - Static typing (frontend)

### Commands
```bash
# Linting
make lint
make lint-fix

# Formatting
make format
make format-check

# Security
make security
```

## 📊 Monitoring

### Health Checks
- Backend: `http://localhost:3000/health`
- Frontend: `http://localhost/health`
- MongoDB: Automatic ping
- Redis: Automatic ping

### Logs
```bash
# View logs
make logs

# Specific logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

## 🔧 Maintenance

### Useful Commands
```bash
# Clear cache
make clean

# Reset database
make db-reset

# Backup
make backup

# Health check
make health
```

## 🤝 Contributing

### Development Flow
1. Fork the repository
2. Create a branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -m 'feat: add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Open a Pull Request

### Standards
- **Commits**: Conventional Commits
- **Branches**: feature/, bugfix/, hotfix/
- **Code Review**: Required
- **Tests**: 100% coverage

## 📈 Metrics

### Quality
- **Test coverage**: > 80%
- **Code duplication**: < 3%
- **Cyclomatic complexity**: < 10
- **Technical debt**: < 5%

### Performance
- **Build time**: < 10 min
- **Deploy time**: < 5 min
- **Availability**: > 99.9%

## 🆘 Troubleshooting

### Common Issues
1. **Docker not running**
   ```bash
   docker info
   sudo systemctl start docker
   ```

2. **Ports in use**
   ```bash
   lsof -i :3000
   kill -9 <PID>
   ```

3. **MongoDB not connecting**
   ```bash
   docker-compose logs mongodb
   docker-compose restart mongodb
   ```

### Useful Logs
- GitHub Actions: GitHub > Actions
- Docker: `docker-compose logs -f`
- Backend: `tail -f backend/logs/app.log`

## 📞 Support

For questions or issues:
1. Check documentation
2. Consult troubleshooting
3. Open issue on GitHub
4. Contact team

---

**Complexity:** Medium  
**T-shirt Sizing:** L  
**Estimated time:** 3-4 days  
**Coverage:** 100% functional

⭐ **Star this project if it was helpful!** 