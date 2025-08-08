const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database setup
const dbPath = path.join(__dirname, 'typing_trainer.db');
const db = new sqlite3.Database(dbPath);

console.log('Connected to SQLite database:', dbPath);

// Routes

// Get all users
app.get('/api/users', (req, res) => {
  db.all('SELECT * FROM users ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get user by ID
app.get('/api/users/:id', (req, res) => {
  db.get('SELECT * FROM users WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(row);
  });
});

// Get typing results for a user
app.get('/api/users/:id/results', (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit) : 50;
  db.all(
    'SELECT * FROM typing_results WHERE user_id = ? ORDER BY timestamp DESC LIMIT ?',
    [req.params.id, limit],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
});

// Get user statistics
app.get('/api/users/:id/stats', (req, res) => {
  db.get(`
    SELECT 
      COUNT(*) as total_tests,
      AVG(wpm) as average_wpm,
      MAX(wpm) as best_wpm,
      AVG(accuracy) as average_accuracy,
      MAX(timestamp) as last_test_date
    FROM typing_results 
    WHERE user_id = ?
  `, [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(row);
  });
});

// Submit typing result
app.post('/api/results', (req, res) => {
  const {
    userId,
    testId,
    wpm,
    accuracy,
    errors,
    totalCharacters,
    correctCharacters,
    timeElapsed,
    timestamp
  } = req.body;

  db.run(`
    INSERT INTO typing_results 
    (user_id, test_id, wpm, accuracy, errors, total_characters, correct_characters, time_elapsed, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [userId, testId, wpm, accuracy, errors, totalCharacters, correctCharacters, timeElapsed, timestamp], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ 
      id: this.lastID,
      message: 'Result saved successfully' 
    });
  });
});

// Get all results (for admin purposes)
app.get('/api/results', (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit) : 100;
  db.all(
    'SELECT * FROM typing_results ORDER BY timestamp DESC LIMIT ?',
    [limit],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
});

// Database info endpoint
app.get('/api/db-info', (req, res) => {
  db.get('SELECT COUNT(*) as user_count FROM users', (err, userCount) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    db.get('SELECT COUNT(*) as result_count FROM typing_results', (err, resultCount) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      res.json({
        database: 'typing_trainer.db',
        users: userCount.user_count,
        results: resultCount.result_count,
        timestamp: new Date().toISOString()
      });
    });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log('📊 Database endpoints:');
  console.log('  GET  /api/users - List all users');
  console.log('  GET  /api/users/:id - Get user details');
  console.log('  GET  /api/users/:id/results - Get user results');
  console.log('  GET  /api/users/:id/stats - Get user statistics');
  console.log('  POST /api/results - Submit typing result');
  console.log('  GET  /api/results - Get all results');
  console.log('  GET  /api/db-info - Database information');
});
