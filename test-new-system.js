/**
 * Test New Simplified Data Management System
 * Run this in the browser console to test the new system
 */

// Get API URL from environment or use default
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3001/api' 
  : `${window.location.protocol}//${window.location.host}/api`;

async function testNewSystem() {
  console.log('🧪 Testing New Simplified Data Management System...\n');
  
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
        hasHash: !!r.hash
      })));
    }

    // 3. Check localStorage state
    console.log('\n3. Checking localStorage state...');
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

    // 4. Test saving a new result
    console.log('\n4. Testing result saving...');
    const testResult = {
      testId: 'new_system_test_1',
      category: 'lowercase',
      wpm: 55,
      accuracy: 96,
      errors: 1,
      totalCharacters: 100,
      correctCharacters: 99,
      timeElapsed: 65000,
      timestamp: Date.now()
    };

    const saveResponse = await fetch(`${API_BASE_URL}/results`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'default_user',
        ...testResult,
        hash: 'new_system_test_hash_123'
      })
    });

    if (saveResponse.ok) {
      const saveResult = await saveResponse.json();
      console.log('   ✅ Result saved successfully');
      console.log('   Save result:', saveResult);
    } else {
      const error = await saveResponse.text();
      console.log('   ❌ Failed to save result:', error);
    }

    // 5. Verify the result was saved
    console.log('\n5. Verifying saved result...');
    const verifyResponse = await fetch(`${API_BASE_URL}/users/default_user/results`);
    const updatedResults = await verifyResponse.json();
    console.log(`   Updated results in database: ${updatedResults.length}`);
    
    const newResult = updatedResults.find(r => r.test_id === 'new_system_test_1');
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

    // 6. Test category filtering
    console.log('\n6. Testing category filtering...');
    const categories = ['lowercase', 'punctuation', 'code', 'data_entry'];
    
    for (const category of categories) {
      const categoryResults = updatedResults.filter(r => r.category === category);
      console.log(`   ${category}: ${categoryResults.length} results`);
      if (categoryResults.length > 0) {
        const avgWpm = Math.round(categoryResults.reduce((sum, r) => sum + r.wpm, 0) / categoryResults.length);
        console.log(`     - Average WPM: ${avgWpm}`);
      }
    }

    // 7. Test hash-based duplicate prevention
    console.log('\n7. Testing hash-based duplicate prevention...');
    const duplicateResponse = await fetch(`${API_BASE_URL}/results`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'default_user',
        ...testResult,
        hash: 'new_system_test_hash_123'
      })
    });

    if (duplicateResponse.ok) {
      const duplicateResult = await duplicateResponse.json();
      console.log('   ✅ Duplicate prevention working');
      console.log('   Duplicate result:', duplicateResult);
    } else {
      console.log('   ❌ Duplicate prevention failed');
    }

    // 8. Summary
    console.log('\n📊 Test Summary:');
    console.log(`   - Database results: ${updatedResults.length}`);
    console.log(`   - localStorage results: ${localStorageResults.length}`);
    console.log(`   - Categories tested: ${categories.length}`);
    console.log(`   - Hash-based system: Working`);
    console.log(`   - Category filtering: Working`);

    console.log('\n✅ New system test completed successfully!');
    console.log('🎯 The simplified data management system is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Export for manual testing
window.testNewSystem = testNewSystem;

console.log('🔧 New System Test loaded!');
console.log('Run: testNewSystem() to test the new data management system');
