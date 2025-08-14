# Quick Commands - Type Trainer

## 🚀 Development Commands

### **Frontend Development**
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### **Backend Development**
```bash
# Start backend server
cd server && npm start

# Start backend in development mode (with nodemon)
cd server && npm run dev

# Initialize database
cd server && npm run init-db
```

## 🧪 Testing Framework

### **Jest Testing Commands**
```bash
# Run all tests
npm test

# Run tests in watch mode (development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests in CI mode
npm run test:ci

# Run specific test categories
npm run test:utils          # Utility tests (hashUtils, dataManager)
npm run test:components     # Component tests (TypingTestEngine)
npm run test:integration    # Integration tests (hash system, category filtering)
npm run test:server         # Server tests (API endpoints)
```

### **Test Runner Script**
```bash
# Run all tests using the test runner
node tests/run-tests.js all

# Run specific test categories
node tests/run-tests.js utils
node tests/run-tests.js components
node tests/run-tests.js integration
node tests/run-tests.js server

# Run tests with coverage
node tests/run-tests.js coverage

# Show help
node tests/run-tests.js help
```

## 🗄️ Database Management

### **Database Inspection**
```bash
# Check database contents
node server/check-db.js

# Clear all typing results from database
npm run clear-stats

# Clear all data (database + localStorage)
node clear-all-data.js
```

### **Database Utilities**
```bash
# Clear localStorage only
node clear-localStorage.js

# Check localStorage contents
node check-localStorage.js
```

## 🔧 Environment Setup

### **Environment Variables**
```bash
# Create .env file (if not exists)
cp .env.example .env

# Edit environment variables
nano .env
```

### **Dependencies**
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server && npm install

# Install all dependencies (frontend + backend)
npm install && cd server && npm install
```

## 📊 Project Information

### **Project Status**
```bash
# Check current project status
cat README.md | grep -A 10 "Current Status"

# View development log
cat AI_DOCS/DEVELOPMENT_LOG.md | tail -20
```

### **File Structure**
```bash
# List all test files
find tests/ -name "*.test.*" -type f

# List all source files
find src/ -name "*.ts" -o -name "*.tsx" | head -10

# List all server files
find server/ -name "*.js" | head -10
```

## 🎯 Quick Testing

### **Run Specific Tests**
```bash
# Run only hash utility tests
npm test -- --testPathPattern=hashUtils

# Run only DataManager tests
npm test -- --testPathPattern=dataManager

# Run only TypingTestEngine tests
npm test -- --testPathPattern=TypingTestEngine

# Run only integration tests
npm test -- --testPathPattern=integration
```

### **Debug Tests**
```bash
# Run tests with verbose output
npm test -- --verbose

# Run tests with coverage and watch
npm test -- --coverage --watchAll

# Run tests and show console output
npm test -- --verbose --no-coverage
```

## 🔍 Troubleshooting

### **Common Issues**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Jest cache
npx jest --clearCache

# Reset database
cd server && node init-db.js

# Clear all test data
node clear-all-data.js
```

### **Development Reset**
```bash
# Full development reset
rm -rf node_modules package-lock.json
npm install
cd server && rm -rf node_modules package-lock.json && npm install
npx jest --clearCache
node clear-all-data.js
```

## 📝 Documentation

### **View Documentation**
```bash
# View testing documentation
cat tests/README.md

# View main README
cat README.md

# View development log
cat AI_DOCS/DEVELOPMENT_LOG.md | tail -50
```

### **Generate Documentation**
```bash
# Generate test coverage report
npm run test:coverage

# View coverage report in browser
open coverage/lcov-report/index.html
```

## 🎉 Quick Start

### **Complete Setup**
```bash
# 1. Install dependencies
npm install && cd server && npm install && cd ..

# 2. Set up environment
cp .env.example .env

# 3. Initialize database
cd server && npm run init-db && cd ..

# 4. Start development servers
npm run dev & cd server && npm start
```

### **Quick Test**
```bash
# Run all tests to verify setup
npm test

# Run integration tests
npm run test:integration

# Check coverage
npm run test:coverage
```

---

**🎯 These commands provide quick access to all development, testing, and maintenance tasks for the Type Trainer project!**
