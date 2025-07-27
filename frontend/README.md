# Simple App Frontend

React frontend for the simple task management application.

## 🚀 Technologies

- **React 18** - JavaScript library for interfaces
- **React Router DOM** - Routing
- **Axios** - HTTP client
- **Tailwind CSS** - Utility CSS framework
- **Vite** - Build tool and dev server
- **Cypress** - E2E testing

## 📦 Installation

1. **Clone the repository and navigate to the frontend:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

## 🏃‍♂️ Running the project

### Development
```bash
npm run dev
```

The development server will start at `http://localhost:5173`

### Production build
```bash
npm run build
```

### Build preview
```bash
npm run preview
```

### E2E Tests
```bash
# Run all tests in headless mode
npm run test:e2e

# Open Cypress Test Runner (graphical interface)
npm run test:e2e:open

# Direct Cypress commands
npm run cypress:run
npm run cypress:open
```

## 📁 Project structure

```
frontend/
├── src/
│   ├── App.js              # Main component
│   ├── main.jsx            # Entry point
│   ├── pages/
│   │   ├── LoginPage.js    # Login page
│   │   └── TodoPage.js     # Tasks page
│   └── styles/
│       └── index.css       # Tailwind styles
├── cypress/
│   ├── e2e/
│   │   ├── login.cy.js     # Login tests
│   │   └── tasks.cy.js     # Task tests
│   ├── support/
│   │   ├── commands.js     # Custom commands
│   │   └── e2e.js         # Global configuration
│   └── README.md          # Test documentation
├── index.html             # Main HTML
├── vite.config.js         # Vite configuration
├── tailwind.config.js     # Tailwind configuration
├── postcss.config.js      # PostCSS configuration
├── package.json
└── README.md
```

## 🎨 Styling

### Tailwind CSS
The project uses Tailwind CSS for styling. Classes are configured in `src/styles/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Configuration
- **Configuration file:** `tailwind.config.js`
- **PostCSS:** `postcss.config.js`
- **Content:** All files in `src/` and `index.html`

## 🔌 Backend Integration

### API Configuration
The frontend is configured to communicate with the backend at:
- **Development:** `http://localhost:3001`
- **Production:** Configurable via environment variable

### Used endpoints
- `POST /api/login` - Authentication
- `GET /api/tasks` - List tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

## 🧪 E2E Tests

### Prerequisites
1. **Backend running:** `http://localhost:3001`
2. **Frontend running:** `http://localhost:5173`

### Running tests
```bash
# Headless mode
npm run test:e2e

# Graphical interface
npm run test:e2e:open
```

### Tested scenarios
- **Login:** Form, valid/invalid credentials, redirection
- **Tasks:** Complete CRUD, status toggle, persistence

### Custom commands
- `cy.login(email, password)` - Automated login
- `cy.createTask(title)` - Create task
- `cy.deleteTask(title)` - Delete task
- `cy.toggleTask(title)` - Toggle status

## 🚀 Deploy

### Production build
```bash
npm run build
```

### Generated files
- `dist/` - Production optimized files
- `dist/index.html` - Main HTML
- `dist/assets/` - Optimized JavaScript and CSS

### Production server
```bash
npm run preview
```

## 🔧 Configuration

### Vite
- **Port:** 5173 (development)
- **Host:** true (externally accessible)
- **Auto-open:** true (opens browser automatically)
- **Sourcemaps:** enabled

### Tailwind CSS
- **Purge:** Removes unused CSS in production
- **JIT:** Just-in-time compilation
- **Plugins:** No additional plugins

### Cypress
- **Base URL:** `http://localhost:5173`
- **Viewport:** 1280x720
- **Timeouts:** 10 seconds
- **Videos:** Disabled
- **Screenshots:** Enabled

## 📱 Responsiveness

The application is fully responsive using Tailwind CSS:

- **Mobile:** < 768px
- **Tablet:** 768px - 1024px
- **Desktop:** > 1024px

## 🔒 Security

### Authentication
- JWT tokens stored in localStorage
- Token verification on protected routes
- Automatic logout on expired token

### Validation
- Form validation on frontend
- API error handling
- Visual feedback for user

## 🐛 Troubleshooting

### Common issues

1. **Backend not running:**
   - Check if server is at `http://localhost:3001`
   - Confirm if API routes are working

2. **CORS error:**
   - Check if backend has CORS configured
   - Confirm if origin is correct

3. **Tests failing:**
   - Check if both servers are running
   - Confirm if test credentials are correct

4. **Build failing:**
   - Check if all dependencies are installed
   - Confirm if there are no syntax errors

### Logs and debug

To see detailed logs during development:
```bash
npm run dev
```

For test debugging:
```bash
npm run cypress:open
```

## 🤝 Contributing

1. Fork the project
2. Create a branch for your feature (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is under the MIT license. See the `LICENSE` file for more details. 