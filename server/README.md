# Typing Trainer - SQLite Database

This directory contains the backend server with SQLite database for the Typing Trainer application.

## Database Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Initialize Database
```bash
npm run init-db
```
This creates the SQLite database file (`typing_trainer.db`) with the necessary tables.

### 3. Check Database
```bash
node check-db.js
```
This displays the current database contents, including users, results, and statistics.

## Database Structure

### Tables

#### `users`
- `id` (TEXT, PRIMARY KEY) - User identifier
- `name` (TEXT) - User's display name
- `email` (TEXT, UNIQUE) - User's email address
- `join_date` (INTEGER) - Timestamp when user joined
- `created_at` (DATETIME) - Record creation timestamp

#### `typing_results`
- `id` (INTEGER, PRIMARY KEY, AUTOINCREMENT) - Result identifier
- `user_id` (TEXT) - Foreign key to users table
- `test_id` (TEXT) - Test identifier
- `wpm` (INTEGER) - Words per minute
- `accuracy` (INTEGER) - Accuracy percentage
- `errors` (INTEGER) - Number of errors
- `total_characters` (INTEGER) - Total characters in test
- `correct_characters` (INTEGER) - Correctly typed characters
- `time_elapsed` (INTEGER) - Time taken in milliseconds
- `timestamp` (INTEGER) - Test completion timestamp
- `created_at` (DATETIME) - Record creation timestamp

## API Endpoints

### Users
- `GET /api/users` - List all users
- `GET /api/users/:id` - Get user details
- `GET /api/users/:id/results` - Get user's typing results
- `GET /api/users/:id/stats` - Get user's statistics

### Results
- `POST /api/results` - Submit typing result
- `GET /api/results` - Get all results (admin)

### Database Info
- `GET /api/db-info` - Database information

## Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server runs on `http://localhost:3001` by default.

## Database Commands

### Check Database Contents
```bash
node check-db.js
```

### Direct SQLite Access
```bash
sqlite3 typing_trainer.db
```

Common SQLite commands:
```sql
-- Show tables
.tables

-- Show table structure
.schema users
.schema typing_results

-- Query examples
SELECT * FROM users;
SELECT * FROM typing_results ORDER BY timestamp DESC LIMIT 10;
SELECT AVG(wpm) as avg_wpm FROM typing_results;
```

## Integration with Frontend

To connect the frontend to this database:

1. Update the frontend to use the API endpoints instead of localStorage
2. Modify the `useTypingResults` hook to make HTTP requests
3. Update the `useUser` hook to work with the backend

## File Locations

- Database file: `typing_trainer.db`
- Server logs: Check console output
- Database backup: Copy `typing_trainer.db` file
