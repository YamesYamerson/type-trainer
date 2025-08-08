# Quick Commands for Type Trainer

## Database Management

### Clear Database Stats
```bash
npm run clear-stats
# or
node server/clear-stats.js
```

### Clear All Data (Database + localStorage)
```bash
node clear-all-data.js
```

### Check Database Contents
```bash
node server/check-db.js
```

### Initialize/Reset Database
```bash
cd server && node init-db.js
```

## Testing Framework

### Test Category Filtering (Backend)
```bash
npm run test:category
# or
node test-category-filtering.js
```

### Test Hash-Based System (Backend)
```bash
npm run test:hash
# or
node test-hash-system.js
```

### Test Frontend Hash System (Browser Console)
```javascript
// Load the test utility
// Copy and paste the content of test-frontend-hash.js into browser console

// Run all tests
window.hashSystemTests.runAllTests()

// Run individual tests
window.hashSystemTests.testHashGeneration()
window.hashSystemTests.testLocalStorageData()
window.hashSystemTests.testAPIData()
window.hashSystemTests.testHybridData()
window.hashSystemTests.testDuplicatePrevention()
```

### Test New Simplified System (Browser Console)
```javascript
// Load the test utility
// Copy and paste the content of test-new-system.js into browser console

// Test the new data management system
testNewSystem()

// Test frontend result saving
// Copy and paste the content of test-frontend-save.js into browser console
testFrontendSave()
```

### Clear localStorage (Browser Console)
```javascript
// Copy and paste the content of clear-localStorage.js into browser console
```

## Development

### Start Frontend
```bash
npm run dev
```

### Start Backend
```bash
cd server && npm start
```

### Build Frontend
```bash
npm run build
```

## Database Inspection

### Direct SQLite Access
```bash
cd server && sqlite3 typing_trainer.db
```

### Common SQL Queries
```sql
-- View all results
SELECT * FROM typing_results;

-- View results by category
SELECT category, COUNT(*) as count, AVG(wpm) as avg_wpm 
FROM typing_results 
GROUP BY category;

-- Check for duplicates
SELECT hash, COUNT(*) as count 
FROM typing_results 
GROUP BY hash 
HAVING count > 1;

-- View recent results
SELECT test_id, category, wpm, accuracy, hash, timestamp 
FROM typing_results 
ORDER BY timestamp DESC 
LIMIT 10;
```

## Troubleshooting

### Check Server Status
```bash
curl http://localhost:3001/api/health
```

### Check Database Info
```bash
curl http://localhost:3001/api/db-info
```

### Kill Background Processes
```bash
# Find processes using port 3001
lsof -ti:3001

# Kill processes
kill -9 $(lsof -ti:3001)
```

## Testing Scenarios

### 1. Fresh Start Testing
```bash
# Clear everything
node clear-all-data.js
cd server && node init-db.js
cd .. && npm run test:hash
```

### 2. Category Filtering Test
```bash
# Run backend test
npm run test:category

# Check frontend (in browser console)
window.hashSystemTests.testAPIData()
```

### 3. Duplicate Prevention Test
```bash
# Run comprehensive hash test
npm run test:hash

# Test in browser
window.hashSystemTests.testDuplicatePrevention()
```

### 4. Hybrid Storage Test
```bash
# Complete a typing test in the app
# Then check data integrity
window.hashSystemTests.testHybridData()
```
