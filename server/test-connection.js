const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3001/api';

async function testConnection() {
  console.log('🔍 Testing database connection and API endpoints...\n');

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
