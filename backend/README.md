# Simple App Backend

Backend API for the simple task management application.

## 🚀 Technologies

- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **CORS** - Cross-Origin Resource Sharing
- **Jest** - Testing framework
- **Supertest** - API testing

## 📦 Installation

1. **Clone the repository and navigate to the backend:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment variables:**
```bash
cp env.example .env
```

4. **Configure the .env file:**
```env
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/simple-app
JWT_SECRET=your-super-secret-jwt-key
CORS_ORIGIN=http://localhost:5173
```

## 🏃‍♂️ Running the project

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📁 Project structure

```
backend/
├── src/
│   ├── app.js              # Express configuration
│   ├── server.js           # Entry point
│   ├── models/
│   │   ├── User.js         # User model
│   │   └── Task.js         # Task model
│   ├── routes/
│   │   ├── authRoutes.js   # Authentication routes
│   │   └── taskRoutes.js   # Task routes
│   └── middlewares/
│       └── authMiddleware.js # Authentication middleware
├── test/
│   ├── setup.js            # Test configuration
│   └── auth.test.js        # Authentication tests
├── package.json
└── README.md
```

## 🔌 API Endpoints

### Authentication

#### POST `/api/login`
User login (creates user if it doesn't exist)

**Request:**
```json
{
  "email": "user@example.com",
  "password": "123456"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Tasks

#### GET `/api/tasks`
List all tasks for the authenticated user

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "title": "My task",
    "description": "Task description",
    "completed": false,
    "userId": "60f7b3b3b3b3b3b3b3b3b3b3"
  }
]
```

#### POST `/api/tasks`
Create a new task

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "title": "New task",
  "description": "Task description",
  "completed": false
}
```

#### PUT `/api/tasks/:id`
Update an existing task

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "title": "Updated task",
  "completed": true
}
```

#### DELETE `/api/tasks/:id`
Remove a task

**Headers:**
```
Authorization: Bearer <token>
```

## 🧪 Tests

### Configuration
- **Jest** as testing framework
- **MongoDB Memory Server** for isolated tests
- **Supertest** for API testing

### Running tests
```bash
# All tests
npm test

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage
```

### Test structure
- `test/setup.js` - Global test configuration
- `test/auth.test.js` - Authentication tests
- In-memory database for isolation

## 🔒 Security

### Authentication
- JWT (JSON Web Tokens)
- Tokens expire in 1 hour
- Authentication middleware on protected routes

### Validation
- Input validation on endpoints
- Data sanitization
- Injection protection

### CORS
- Configured to allow frontend requests
- Origin configurable via environment variable

## 🚀 Deploy

### Production environment variables
```env
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb://your-production-db
JWT_SECRET=your-production-secret
CORS_ORIGIN=https://your-frontend-domain.com
```

### Deploy scripts
```bash
# Build for production
npm run build

# Start in production
npm start
```

## 📊 Monitoring

### Logs
- MongoDB connection logs
- Error logs with stack traces
- Request logs (can be added)

### Metrics
- API response time
- Error rate
- Memory usage

## 🤝 Contributing

1. Fork the project
2. Create a branch for your feature (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is under the MIT license. See the `LICENSE` file for more details. 