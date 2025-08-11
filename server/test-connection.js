const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fetch = require('node-fetch');

// Smart port detection utility
const detectBackendPort = async () => {
  const basePorts = [3001, 3002, 3003, 3004, 3005];
  
  for (const port of basePorts) {
    try {
      const response = await fetch(`http://localhost:${port}/api/db-info`, {
        method: 'GET',
        signal: AbortSignal.timeout(1000) // 1 second timeout
      });
      if (response.ok) {
        return port;
      }
    } catch (error) {
      // Port not available or server not responding, try next
      continue;
    }
  }
  
  throw new Error('Could not detect backend server on any common port');
};

let BASE_URL;

async function testConnection() {
  try {
    // Detect backend port first
    const detectedPort = await detectBackendPort();
    BASE_URL = `http://localhost:${detectedPort}/api`;
    console.log(`🔍 Backend detected on port ${detectedPort}`);
    console.log('🔍 Testing database connection and API endpoints...\n');
  } catch (error) {
    console.error('❌ Could not detect backend server:', error.message);
    console.log('💡 Make sure the server is running first');
    process.exit(1);
  }

  try {
    // Test database info
    console.log('1. Testing database info...');
    const dbInfo = await fetch(`${BASE_URL}/db-info`);
    if (dbInfo.ok) {
      const info = await dbInfo.json();
      console.log('✅ Database info:', info);
    } else {
      console.log('❌ Failed to get database info');
    }

    // Test users endpoint
    console.log('\n2. Testing users endpoint...');
    const users = await fetch(`${BASE_URL}/users`);
    if (users.ok) {
      const userList = await users.json();
      console.log('✅ Users:', userList);
    } else {
      console.log('❌ Failed to get users');
    }

    // Test submitting a result
    console.log('\n3. Testing result submission...');
    const testResult = {
      userId: 'default_user',
      testId: 'test-123',
      wpm: 45,
      accuracy: 95,
      errors: 2,
      totalCharacters: 100,
      correctCharacters: 98,
      timeElapsed: 120000,
      timestamp: Date.now()
    };

    const submitResult = await fetch(`${BASE_URL}/results`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testResult)
    });

    if (submitResult.ok) {
      const result = await submitResult.json();
      console.log('✅ Result submitted:', result);
    } else {
      console.log('❌ Failed to submit result');
    }

    // Test getting results
    console.log('\n4. Testing results retrieval...');
    const results = await fetch(`${BASE_URL}/users/default_user/results`);
    if (results.ok) {
      const resultList = await results.json();
      console.log('✅ Results:', resultList);
    } else {
      console.log('❌ Failed to get results');
    }

    // Test getting stats
    console.log('\n5. Testing stats retrieval...');
    const stats = await fetch(`${BASE_URL}/users/default_user/stats`);
    if (stats.ok) {
      const userStats = await stats.json();
      console.log('✅ Stats:', userStats);
    } else {
      console.log('❌ Failed to get stats');
    }

  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
  }
}

// Run the test
testConnection();
