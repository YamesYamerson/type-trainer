const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create database file in the server directory
const dbPath = path.join(__dirname, 'typing_trainer.db');
const db = new sqlite3.Database(dbPath);

console.log('Initializing SQLite database...');

// Create tables
db.serialize(() => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      join_date INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating users table:', err);
    } else {
      console.log('✅ Users table created successfully');
    }
  });

  // Typing results table
  db.run(`
    CREATE TABLE IF NOT EXISTS typing_results (
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
    )
  `, (err) => {
    if (err) {
      console.error('Error creating typing_results table:', err);
    } else {
      console.log('✅ Typing results table created successfully');
    }
  });

  // Insert default user if not exists
  db.run(`
    INSERT OR IGNORE INTO users (id, name, email, join_date)
    VALUES ('default_user', 'Typing Trainer User', 'user@typingtrainer.com', ${Date.now()})
  `, (err) => {
    if (err) {
      console.error('Error inserting default user:', err);
    } else {
      console.log('✅ Default user created successfully');
    }
  });
});

// Close database connection
db.close((err) => {
  if (err) {
    console.error('Error closing database:', err);
  } else {
    console.log('✅ Database initialization complete!');
    console.log(`Database file: ${dbPath}`);
  }
});
