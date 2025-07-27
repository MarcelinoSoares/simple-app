# 🚀 Simple Task Management App

A complete fullstack application for task management with JWT authentication, automated tests and CI/CD.

## 📋 Index

- [Features](#-features)
- [Technologies](#-technologies)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Running the Project](#-running-the-project)
- [Tests](#-tests)
- [CI/CD](#-cicd)
- [Code Coverage](#-code-coverage)
- [Visual Tests](#-visual-tests)
- [API Documentation](#-api-documentation)

## ✨ Features

### Backend
- ✅ **JWT Authentication** - Secure login with tokens
- ✅ **Task CRUD** - Create, read, update and delete tasks
- ✅ **Data Isolation** - Each user sees only their tasks
- ✅ **Input Validation** - Robust data validation
- ✅ **Error Handling** - Centralized error middleware
- ✅ **CORS Configured** - Cross-origin request support

### Frontend
- ✅ **Modern React Interface** - Functional components with hooks
- ✅ **Protected Routing** - Private routes with authentication
- ✅ **State Management** - Local state with localStorage
- ✅ **Responsive UI** - Adaptive design with Tailwind CSS
- ✅ **Visual Feedback** - Loading and error states

### Tests
- ✅ **Unit Tests** - 63 tests with Jest
- ✅ **Integration Tests** - API tests with Supertest
- ✅ **E2E Tests** - Complete tests with Cypress
- ✅ **Visual Tests** - Snapshots for visual regression
- ✅ **Code Coverage** - 97.14% coverage

## 🛠 Technologies

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Token authentication
- **Jest** - Testing framework
- **Supertest** - API testing
- **NYC** - Code coverage

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Routing
- **Axios** - HTTP client
- **Tailwind CSS** - CSS framework
- **Cypress** - E2E testing
- **@cypress/snapshot** - Visual testing

### DevOps
- **GitHub Actions** - CI/CD pipeline
- **MongoDB Memory Server** - Test database
- **Docker** - Containerization (MongoDB)

## 📁 Project Structure

```
simple-app/
├── backend/                    # Node.js/Express API
│   ├── src/
│   │   ├── models/            # Mongoose models
│   │   ├── routes/            # API routes
│   │   ├── middlewares/       # Custom middlewares
│   │   ├── utils/             # Utilities
│   │   ├── app.js             # Express configuration
│   │   └── server.js          # HTTP server
│   ├── test/                  # Organized tests
│   │   ├── unit/              # Unit tests
│   │   ├── integration/       # Integration tests
│   │   ├── api/               # API tests
│   │   └── setup.js           # Jest configuration
│   ├── .env                   # Environment variables
│   ├── jest.config.js         # Jest configuration
│   └── package.json
├── frontend/                   # React app
│   ├── src/
│   │   ├── pages/             # Application pages
│   │   ├── styles/            # CSS styles
│   │   ├── App.jsx            # Main component
│   │   └── main.jsx           # Entry point
│   ├── cypress/               # E2E tests
│   │   ├── e2e/               # End-to-end tests
│   │   ├── fixtures/          # Test data
│   │   └── support/           # Cypress configuration
│   ├── cypress.config.js      # Cypress configuration
│   └── package.json
├── .github/                    # GitHub Actions
│   └── workflows/
│       └── test.yml           # CI/CD pipeline
└── README.md                   # This documentation
```

## 🚀 Installation

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Git

### 1. Clone the repository
```bash
git clone <repository-url>
cd simple-app
```

### 2. Configure Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit the .env file with your settings
```

### 3. Configure Frontend
```bash
cd ../frontend
npm install
```

## ⚡ Running the Project

### Development

#### Backend
```bash
cd backend
npm run dev
# Server running at http://localhost:3000
```

#### Frontend
```bash
cd frontend
npm run dev
# App running at http://localhost:5173
```

### Production

#### Backend
```bash
cd backend
npm start
```

#### Frontend
```bash
cd frontend
npm run build
npm run preview
```

## 🧪 Tests

### Backend Tests

```bash
cd backend

# All tests
npm test

# Tests with coverage
npm run test:coverage

# Specific tests
npm test -- test/unit          # Unit only
npm test -- test/integration   # Integration only
npm test -- test/api           # API only

# Watch mode
npm run test:watch
```

### Frontend Tests

```bash
cd frontend

# E2E tests (interactive mode)
npm run cypress:open

# E2E tests (headless mode)
npm run cypress:run

# Visual tests
npm run cypress:run --spec "cypress/e2e/visual.cy.js"
```

### Current Coverage
- ✅ **97.14%** of statements
- ✅ **90%** of branches
- ✅ **85.71%** of functions
- ✅ **97.05%** of lines

## 🔄 CI/CD

The project includes a complete pipeline in GitHub Actions:

### Automated Pipeline
- ✅ **Build** - Frontend compilation
- ✅ **Backend Tests** - Jest + coverage
- ✅ **Frontend Tests** - Cypress E2E
- ✅ **Reports** - Coverage and results
- ✅ **Artifacts** - Screenshots and videos

### Triggers
- Push to `main`
- Pull Requests to `main`

### Services
- MongoDB for tests
- Node.js 18
- Dependency cache

## 📊 Code Coverage

### Available Reports
- **Text** - Console output
- **HTML** - Interactive report
- **LCOV** - CI/CD integration
- **JSON** - Structured data

### Commands
```bash
cd backend

# HTML report
npm run coverage:html

# Open report
npm run coverage:open

# LCOV report for CI
npm run coverage
```

## 🎨 Visual Tests

### Implemented Snapshots
- ✅ **Login Page** - Login screen
- ✅ **Empty Dashboard** - Dashboard without tasks
- ✅ **Dashboard with Tasks** - Dashboard with content
- ✅ **Completed Task** - Checked task state

### Configuration
- **Threshold**: 10% difference
- **Update**: Manual via configuration
- **Formats**: HTML and JSON

### Commands
```bash
cd frontend

# Run visual tests
npx cypress run --spec "cypress/e2e/visual.cy.js"

# Update snapshots
# Edit cypress.config.js: updateSnapshots: true
```

## 📚 API Documentation

### Authentication

#### POST /api/login
```http
POST /api/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Tasks

#### GET /api/tasks
```http
GET /api/tasks
Authorization: Bearer <token>
```

#### POST /api/tasks
```http
POST /api/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "New task",
  "description": "Task description",
  "completed": false
}
```

#### PUT /api/tasks/:id
```http
PUT /api/tasks/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated task",
  "completed": true
}
```

#### DELETE /api/tasks/:id
```http
DELETE /api/tasks/:id
Authorization: Bearer <token>
```

### Status Codes
- `200` - Success
- `201` - Created
- `204` - No content
- `400` - Invalid data
- `401` - Unauthorized
- `404` - Not found
- `500` - Internal error

## 🔧 Configuration

### Environment Variables (Backend)

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/todo-app
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

### Cypress Configuration (Frontend)

```javascript
// cypress.config.js
{
  baseUrl: 'http://localhost:5173',
  viewportWidth: 1280,
  viewportHeight: 720,
  video: false,
  screenshotOnRunFailure: true
}
```

## 🚀 Deploy

### Backend (Heroku/Railway)
```bash
# Configure environment variables
MONGODB_URI=your-mongodb-atlas-url
JWT_SECRET=your-production-secret
CORS_ORIGIN=https://your-frontend-domain.com

# Deploy
git push heroku main
```

### Frontend (Vercel/Netlify)
```bash
# Configure environment variables
VITE_API_URL=https://your-backend-domain.com

# Deploy
npm run build
# Upload dist/ folder
```

## 📈 Metrics

### Performance
- **Backend**: ~50ms response time
- **Frontend**: <2s load time
- **Tests**: ~7s total execution

### Quality
- **Coverage**: 97.14%
- **Tests**: 63 passing tests
- **Linting**: ESLint + Prettier
- **Type Safety**: JSDoc annotations

## 🤝 Contributing

1. Fork the project
2. Create a branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Commit Standards
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `test:` Tests
- `refactor:` Refactoring
- `chore:` Maintenance tasks

## 📄 License

This project is under the MIT license. See the [LICENSE](LICENSE) file for more details.

## 👥 Authors

- **Your Name** - *Initial development* - [YourGitHub](https://github.com/yourgithub)

## 🙏 Acknowledgments

- Jest team for the excellent testing tool
- Cypress team for E2E testing
- Tailwind CSS for the CSS framework
- MongoDB team for the database

---

⭐ **If this project helped you, consider giving it a star!** 