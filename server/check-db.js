const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'typing_trainer.db');

// Check if database file exists
const fs = require('fs');
if (!fs.existsSync(dbPath)) {
  console.log('❌ Database file not found. Run "npm run init-db" first.');
  process.exit(1);
}

const db = new sqlite3.Database(dbPath);

console.log('🔍 Checking SQLite database...\n');

// Get database info
db.get('SELECT COUNT(*) as user_count FROM users', (err, userCount) => {
  if (err) {
    console.error('Error getting user count:', err);
    return;
  }
  
  db.get('SELECT COUNT(*) as result_count FROM typing_results', (err, resultCount) => {
    if (err) {
      console.error('Error getting result count:', err);
      return;
    }
    
    console.log('📊 Database Overview:');
    console.log(`  Database file: ${dbPath}`);
    console.log(`  Users: ${userCount.user_count}`);
    console.log(`  Typing results: ${resultCount.result_count}\n`);
    
    // Show users
    db.all('SELECT * FROM users ORDER BY created_at DESC', (err, users) => {
      if (err) {
        console.error('Error getting users:', err);
        return;
      }
      
      console.log('👥 Users:');
      users.forEach(user => {
        console.log(`  - ${user.name} (${user.email}) - Joined: ${new Date(user.join_date).toLocaleDateString()}`);
      });
      console.log();
      
      // Show recent results
      db.all('SELECT * FROM typing_results ORDER BY timestamp DESC LIMIT 10', (err, results) => {
        if (err) {
          console.error('Error getting results:', err);
          return;
        }
        
        console.log('🏆 Recent Typing Results:');
        if (results.length === 0) {
          console.log('  No results yet.');
        } else {
          results.forEach(result => {
            const date = new Date(result.timestamp).toLocaleDateString();
            const time = new Date(result.timestamp).toLocaleTimeString();
            console.log(`  - ${result.wpm} WPM, ${result.accuracy}% accuracy (${date} ${time})`);
          });
        }
        console.log();
        
        // Show statistics
        db.get(`
          SELECT 
            AVG(wpm) as avg_wpm,
            MAX(wpm) as best_wpm,
            AVG(accuracy) as avg_accuracy,
            COUNT(*) as total_tests
          FROM typing_results
        `, (err, stats) => {
          if (err) {
            console.error('Error getting stats:', err);
            return;
          }
          
          console.log('📈 Statistics:');
          console.log(`  Average WPM: ${stats.avg_wpm ? Math.round(stats.avg_wpm) : 'N/A'}`);
          console.log(`  Best WPM: ${stats.best_wpm || 'N/A'}`);
          console.log(`  Average Accuracy: ${stats.avg_accuracy ? Math.round(stats.avg_accuracy) + '%' : 'N/A'}`);
          console.log(`  Total Tests: ${stats.total_tests || 0}`);
          
          db.close((err) => {
            if (err) {
              console.error('Error closing database:', err);
            } else {
              console.log('\n✅ Database check complete!');
            }
          });
        });
      });
    });
  });
});
