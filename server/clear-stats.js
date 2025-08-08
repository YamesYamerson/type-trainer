const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create database file in the server directory
const dbPath = path.join(__dirname, 'typing_trainer.db');
const db = new sqlite3.Database(dbPath);

console.log('🗑️  Clearing typing results from database...');

// Clear all typing results
db.run('DELETE FROM typing_results', (err) => {
  if (err) {
    console.error('❌ Error clearing typing results:', err);
  } else {
    console.log('✅ All typing results cleared successfully');
    
    // Check remaining data
    db.get('SELECT COUNT(*) as count FROM typing_results', (err, row) => {
      if (err) {
        console.error('❌ Error checking remaining results:', err);
      } else {
        console.log(`📊 Remaining typing results: ${row.count}`);
      }
      
      // Check users
      db.get('SELECT COUNT(*) as count FROM users', (err, userRow) => {
        if (err) {
          console.error('❌ Error checking users:', err);
        } else {
          console.log(`👥 Users remaining: ${userRow.count}`);
        }
        
        console.log('✅ Database cleanup complete!');
        console.log('🎯 Ready for fresh test data with proper categorization');
        
        // Close database connection
        db.close((err) => {
          if (err) {
            console.error('❌ Error closing database:', err);
          } else {
            console.log('🔒 Database connection closed');
          }
        });
      });
    });
  }
});
