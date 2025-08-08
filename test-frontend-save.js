/**
 * Test Frontend Result Saving
 * Run this in the browser console to test if results are being saved
 */

// Get API URL from environment or use default
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3001/api' 
  : `${window.location.protocol}//${window.location.host}/api`;

async function testFrontendSave() {
  console.log('🧪 Testing Frontend Result Saving...\n');
  
  try {
    // 1. Check if server is running
    console.log('1. Checking server connection...');
    const healthResponse = await fetch(`${API_BASE_URL}/db-info`);
    if (healthResponse.ok) {
      const dbInfo = await healthResponse.json();
      console.log('   ✅ Server is running');
      console.log('   Database info:', dbInfo);
    } else {
      console.log('   ❌ Server is not responding');
      return;
    }

    // 2. Check current database state
    console.log('\n2. Checking current database state...');
    const resultsResponse = await fetch(`${API_BASE_URL}/users/default_user/results`);
    const currentResults = await resultsResponse.json();
    console.log(`   Current results in database: ${currentResults.length}`);
    
    if (currentResults.length > 0) {
      console.log('   Recent results:', currentResults.slice(0, 3).map(r => ({
        testId: r.test_id,
        category: r.category,
        wpm: r.wpm,
        timestamp: new Date(r.timestamp).toLocaleString()
      })));
    }

    // 3. Test saving a new result
    console.log('\n3. Testing result saving...');
    const testResult = {
      userId: 'default_user',
      testId: 'frontend_test_1',
      category: 'lowercase',
      wpm: 50,
      accuracy: 95,
      errors: 2,
      totalCharacters: 100,
      correctCharacters: 98,
      timeElapsed: 72000,
      timestamp: Date.now(),
      hash: 'frontend_test_hash_123'
    };

    const saveResponse = await fetch(`${API_BASE_URL}/results`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testResult)
    });

    if (saveResponse.ok) {
      const saveResult = await saveResponse.json();
      console.log('   ✅ Result saved successfully');
      console.log('   Save result:', saveResult);
    } else {
      const error = await saveResponse.text();
      console.log('   ❌ Failed to save result:', error);
    }

    // 4. Verify the result was saved
    console.log('\n4. Verifying saved result...');
    const verifyResponse = await fetch(`${API_BASE_URL}/users/default_user/results`);
    const updatedResults = await verifyResponse.json();
    console.log(`   Updated results in database: ${updatedResults.length}`);
    
    const newResult = updatedResults.find(r => r.test_id === 'frontend_test_1');
    if (newResult) {
      console.log('   ✅ New result found in database');
      console.log('   New result:', {
        testId: newResult.test_id,
        category: newResult.category,
        wpm: newResult.wpm,
        hash: newResult.hash
      });
    } else {
      console.log('   ❌ New result not found in database');
    }

    // 5. Check localStorage state
    console.log('\n5. Checking localStorage state...');
    const localStorageResults = JSON.parse(localStorage.getItem('typing-trainer-results') || '[]');
    console.log(`   Results in localStorage: ${localStorageResults.length}`);
    
    if (localStorageResults.length > 0) {
      console.log('   localStorage results:', localStorageResults.slice(0, 3).map(r => ({
        testId: r.testId,
        category: r.category,
        wpm: r.wpm,
        hasHash: !!r.hash
      })));
    }

    // 6. Test duplicate prevention
    console.log('\n6. Testing duplicate prevention...');
    const duplicateResponse = await fetch(`${API_BASE_URL}/results`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testResult)
    });

    if (duplicateResponse.ok) {
      const duplicateResult = await duplicateResponse.json();
      console.log('   ✅ Duplicate prevention working');
      console.log('   Duplicate result:', duplicateResult);
    } else {
      console.log('   ❌ Duplicate prevention failed');
    }

    console.log('\n✅ Frontend save test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Export for manual testing
window.testFrontendSave = testFrontendSave;

console.log('🔧 Frontend Save Test loaded!');
console.log('Run: testFrontendSave() to test result saving');
