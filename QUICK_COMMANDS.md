# Typing Trainer - Quick Commands Reference

## 🚀 Development Commands

### **Start Development Server**
```bash
# Start the main application
npm run dev

# Start with specific port (if 5173 is in use)
npm run dev -- --port 5174
```

### **Type Checking & Building**
```bash
# Check TypeScript types
npx tsc --noEmit

# Check for type errors without emitting files
npx tsc --noEmit --skipLibCheck

# Build for production
npm run build

# Preview production build
npm run preview
```

### **Linting & Code Quality**
```bash
# Run ESLint
npm run lint

# Format code with Prettier
npx prettier --write .

# Check for formatting issues
npx prettier --check .
```

## 🗄️ Database Commands

### **Database Location**
```bash
# Database file location
/Users/jamesmclean/Projects/type-trainer/server/typing_trainer.db
```

### **Database Operations**

#### **Initialize Database**
```bash
# Navigate to server directory
cd server

# Initialize database (creates tables and default user)
node init-db.js

# Or using npm script
npm run init-db
```

#### **Check Database Status**
```bash
# Check database contents and statistics
cd server && node check-db.js
```

#### **Clear Database Stats**
```bash
# Clear all typing results (keeps users)
cd server && node clear-stats.js
```

#### **Clear All Data**
```bash
# Clear both database and localStorage data
node clear-all-data.js
```

### **Database Inspection**

#### **Check Database Schema**
```bash
# Using SQLite command line (if installed)
sqlite3 server/typing_trainer.db ".schema"

# Check tables
sqlite3 server/typing_trainer.db ".tables"

# Check users table
sqlite3 server/typing_trainer.db "SELECT * FROM users;"

# Check typing_results table
sqlite3 server/typing_trainer.db "SELECT * FROM typing_results ORDER BY timestamp DESC LIMIT 10;"
```

#### **Check Database Statistics**
```bash
# Get total counts
sqlite3 server/typing_trainer.db "SELECT COUNT(*) as users FROM users; SELECT COUNT(*) as results FROM typing_results;"

# Get recent results with categories
sqlite3 server/typing_trainer.db "SELECT test_id, category, wpm, accuracy, timestamp FROM typing_results ORDER BY timestamp DESC LIMIT 5;"
```

## 🔧 Server Commands

### **Start Backend Server**
```bash
# Navigate to server directory
cd server

# Start Express server
node index.js

# Or using npm script
npm start

# Or using nodemon for development
npm run dev
```

### **Test Backend API**
```bash
# Test API endpoints
cd server && node test-connection.js
```

### **Check Server Status**
```bash
# Check if server is running
curl http://localhost:3001/api/db-info

# Check users endpoint
curl http://localhost:3001/api/users

# Check results endpoint
curl http://localhost:3001/api/results
```

## 🧹 Cleanup Commands

### **Clear All Data (Complete Reset)**
```bash
# 1. Clear database stats
cd server && node clear-stats.js

# 2. Clear localStorage (run in browser console)
localStorage.removeItem('typing-trainer-results');
localStorage.removeItem('typing-trainer-user');
localStorage.removeItem('typing-trainer-last-sync');
localStorage.removeItem('typing-trainer-pending-sync');

# 3. Restart development server
npm run dev
```

### **Clear Specific Data**
```bash
# Clear only typing results
cd server && node clear-stats.js

# Clear only localStorage (browser console)
localStorage.removeItem('typing-trainer-results');
```

## 🔍 Debugging Commands

### **Check Application Status**
```bash
# Check if development server is running
lsof -i :5173

# Check if backend server is running
lsof -i :3001

# Check database file exists
ls -la server/typing_trainer.db
```

### **View Logs**
```bash
# Check npm logs
npm run dev 2>&1 | tee dev.log

# Check server logs
cd server && node index.js 2>&1 | tee server.log
```

## 📊 Data Analysis Commands

### **Analyze Test Results**
```bash
# Get test results by category
sqlite3 server/typing_trainer.db "SELECT category, COUNT(*) as count, AVG(wpm) as avg_wpm, AVG(accuracy) as avg_accuracy FROM typing_results GROUP BY category;"

# Get recent test results
sqlite3 server/typing_trainer.db "SELECT test_id, category, wpm, accuracy, timestamp FROM typing_results ORDER BY timestamp DESC LIMIT 10;"

# Get user statistics
sqlite3 server/typing_trainer.db "SELECT COUNT(*) as total_tests, AVG(wpm) as avg_wpm, MAX(wpm) as best_wpm, AVG(accuracy) as avg_accuracy FROM typing_results;"
```

### **Check for Duplicates**
```bash
# Check for duplicate results
sqlite3 server/typing_trainer.db "SELECT test_id, COUNT(*) as count FROM typing_results GROUP BY test_id, timestamp HAVING COUNT(*) > 1;"
```

## 🚀 Deployment Commands

### **Build for Production**
```bash
# Build the application
npm run build

# Preview production build
npm run preview
```

### **Check Build Output**
```bash
# Check build directory
ls -la dist/

# Check build size
du -sh dist/
```

## 🔧 Maintenance Commands

### **Update Dependencies**
```bash
# Check for outdated packages
npm outdated

# Update packages
npm update

# Update specific package
npm install package-name@latest
```

### **Clean Install**
```bash
# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### **Reset Everything**
```bash
# Complete reset (use with caution)
# 1. Clear database
cd server && node clear-stats.js

# 2. Clear localStorage (browser console)
localStorage.clear();

# 3. Clean install
rm -rf node_modules package-lock.json
npm install

# 4. Restart servers
npm run dev
# In another terminal: cd server && node index.js
```

## 📝 Quick Reference

### **Most Used Commands**
```bash
# Start development
npm run dev

# Check database
cd server && node check-db.js

# Clear stats
cd server && node clear-stats.js

# Type check
npx tsc --noEmit

# Start backend server
cd server && npm start
```

### **Troubleshooting**
```bash
# If port 5173 is in use
npm run dev -- --port 5174

# If database is locked
rm server/typing_trainer.db && cd server && node init-db.js

# If TypeScript errors
npx tsc --noEmit --skipLibCheck

# If server won't start
cd server && npm install && npm start
```

### **File Locations**
- **Database**: `server/typing_trainer.db`
- **Server**: `server/index.js`
- **Client**: `src/` directory
- **Config**: `vite.config.ts`, `tsconfig.json`
- **Documentation**: `DEVELOPMENT_LOG.md`, `QUICK_COMMANDS.md`

## 🎯 Quick Start Checklist

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Start Backend Server** (in new terminal)
   ```bash
   cd server && npm start
   ```

3. **Check Database Status**
   ```bash
   cd server && node check-db.js
   ```

4. **Clear Data if Needed**
   ```bash
   cd server && node clear-stats.js
   ```

5. **Test Application**
   - Open `http://localhost:5173`
   - Complete a typing test
   - Check profile page for accurate stats

## 📞 Emergency Commands

### **Complete Reset**
```bash
# Nuclear option - reset everything
rm -rf node_modules package-lock.json
rm server/typing_trainer.db
npm install
cd server && node init-db.js
npm run dev
```

### **Fix Common Issues**
```bash
# Port already in use
lsof -ti:5173 | xargs kill -9

# Database locked
rm server/typing_trainer.db && cd server && node init-db.js

# TypeScript errors
npx tsc --noEmit --skipLibCheck

# Server issues
cd server && npm install && npm start
```

## 🔄 Development Workflow

### **Daily Development**
```bash
# 1. Start development server
npm run dev

# 2. Start backend server (new terminal)
cd server && npm start

# 3. Check for issues
npx tsc --noEmit

# 4. Test changes
# - Complete a typing test
# - Check profile page
# - Verify statistics accuracy
```

### **Before Committing**
```bash
# 1. Type check
npx tsc --noEmit

# 2. Lint code
npm run lint

# 3. Format code
npx prettier --write .

# 4. Test functionality
# - Complete tests in different modes
# - Verify statistics accuracy
# - Check for duplicates
```
