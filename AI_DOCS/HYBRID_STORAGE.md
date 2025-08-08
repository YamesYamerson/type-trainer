# Hybrid Storage System

The Typing Trainer now uses a hybrid storage approach that combines localStorage for immediate feedback and SQLite database for long-term persistence.

## 🎯 Overview

### **Why Hybrid Storage?**

1. **Immediate Feedback**: localStorage provides instant access to recent results
2. **Offline Support**: App works even without internet connection
3. **Long-term Persistence**: SQLite stores all historical data
4. **Data Safety**: No data loss if localStorage is cleared
5. **Scalability**: Database can handle large amounts of data

## 🏗️ Architecture

### **Data Flow**

```
User Types → localStorage (immediate) → SQLite (persistent)
                ↓
            UI Updates (instant)
                ↓
            Sync when online
```

### **Storage Layers**

1. **localStorage** (Frontend)
   - Recent results (last 100)
   - User preferences
   - Pending sync data
   - Immediate UI updates

2. **SQLite Database** (Backend)
   - All historical results
   - User profiles
   - Statistics and analytics
   - Long-term data persistence

## 🔧 Implementation

### **Key Components**

#### `DatabaseSync` Class (`src/utils/databaseSync.ts`)
- Handles all data synchronization
- Manages online/offline detection
- Merges local and database data
- Handles pending sync operations

#### `useTypingResults` Hook (`src/hooks/useTypingResults.ts`)
- Provides unified interface for data access
- Handles async operations
- Shows sync status to users
- Fallback to localStorage when offline

#### `StatsDisplay` Component (`src/components/StatsDisplay.tsx`)
- Displays combined statistics from both sources
- Shows loading states during sync
- Handles data merging automatically

## 📊 Data Structure

### **localStorage Keys**
```javascript
const STORAGE_KEYS = {
  RESULTS: 'typing-trainer-results',        // Recent results
  USER: 'typing-trainer-user',              // User data
  LAST_SYNC: 'typing-trainer-last-sync',    // Last sync timestamp
  PENDING_SYNC: 'typing-trainer-pending-sync' // Pending sync data
};
```

### **SQLite Tables**
```sql
-- Users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  join_date INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Typing results table
CREATE TABLE typing_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  test_id TEXT NOT NULL,
  wpm INTEGER NOT NULL,
  accuracy INTEGER NOT NULL,
  errors INTEGER NOT NULL,
  total_characters INTEGER NOT NULL,
  correct_characters INTEGER NOT NULL,
  time_elapsed INTEGER NOT NULL,
  timestamp INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id)
);
```

## 🚀 Usage

### **Starting the System**

1. **Start the database server**:
   ```bash
   cd server
   npm install
   npm run init-db
   npm run dev
   ```

2. **Start the frontend**:
   ```bash
   npm run dev
   ```

### **Data Operations**

#### **Saving Results**
```typescript
// Automatically saves to localStorage and syncs to SQLite
const result = await DatabaseSync.saveTypingResult(typingResult);
```

#### **Getting Statistics**
```typescript
// Combines local and database stats
const stats = await DatabaseSync.getUserStats('default_user');
```

#### **Getting Results**
```typescript
// Merges local and database results
const results = await DatabaseSync.getUserResults('default_user', 50);
```

## 🔄 Sync Process

### **Automatic Sync**
- Results are saved to localStorage immediately
- Attempts to sync to SQLite if online
- Marks data for pending sync if offline
- Automatically syncs when back online

### **Manual Sync**
- Users can manually trigger sync with "Sync Data" button
- Shows sync status and progress
- Handles errors gracefully

### **Conflict Resolution**
- Uses timestamp-based deduplication
- Merges statistics from both sources
- Preserves all data from both systems

## 🛡️ Error Handling

### **Offline Mode**
- App continues to work with localStorage
- Data is queued for sync when online
- No data loss during offline periods

### **Sync Failures**
- Failed syncs are retried automatically
- Users are notified of sync status
- Data remains safe in localStorage

### **Database Errors**
- Graceful fallback to localStorage
- Error logging for debugging
- User-friendly error messages

## 📈 Benefits

### **Performance**
- Instant UI updates from localStorage
- Reduced server load
- Faster initial load times

### **Reliability**
- No data loss if database is unavailable
- Automatic retry mechanisms
- Robust error handling

### **User Experience**
- Seamless offline/online transitions
- Real-time feedback
- Consistent data across sessions

## 🔍 Monitoring

### **Sync Status**
- Real-time sync status display
- Manual sync button
- Error notifications

### **Database Health**
- Database info endpoint (`/api/db-info`)
- Connection status monitoring
- Performance metrics

## 🚀 Future Enhancements

1. **Real-time Sync**: WebSocket-based real-time updates
2. **Data Compression**: Compress data for faster sync
3. **Conflict Resolution**: Advanced conflict detection and resolution
4. **Analytics**: Detailed performance analytics
5. **Backup/Restore**: User data backup and restore functionality

## 🐛 Troubleshooting

### **Common Issues**

1. **Sync not working**
   - Check if server is running on port 3001
   - Verify database is initialized
   - Check browser console for errors

2. **Data not appearing**
   - Check localStorage in browser dev tools
   - Verify database connection
   - Check sync status in UI

3. **Performance issues**
   - Clear old localStorage data
   - Check database size
   - Monitor network connectivity

### **Debug Commands**
```bash
# Check database status
cd server && node check-db.js

# Test API endpoints
cd server && node test-connection.js

# View database contents
cd server && sqlite3 typing_trainer.db
```
