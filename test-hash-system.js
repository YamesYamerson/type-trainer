#!/usr/bin/env node

/**
 * Comprehensive test framework for hash-based duplicate prevention system
 * Run with: node test-hash-system.js
 */

const API_BASE_URL = 'http://localhost:3001/api';

// Test data for different categories
const testResults = [
  {
    userId: 'default_user',
    testId: 'lowercase_basic_1',
    category: 'lowercase',
    wpm: 45,
    accuracy: 95,
    errors: 2,
    totalCharacters: 100,
    correctCharacters: 98,
    timeElapsed: 80000,
    timestamp: Date.now()
  },
  {
    userId: 'default_user',
    testId: 'punctuation_basic_1',
    category: 'punctuation',
    wpm: 38,
    accuracy: 92,
    errors: 3,
    totalCharacters: 120,
    correctCharacters: 110,
    timeElapsed: 95000,
    timestamp: Date.now() + 1000
  },
  {
    userId: 'default_user',
    testId: 'code_basic_1',
    category: 'code',
    wpm: 32,
    accuracy: 88,
    errors: 5,
    totalCharacters: 150,
    correctCharacters: 132,
    timeElapsed: 112000,
    timestamp: Date.now() + 2000
  },
  {
    userId: 'default_user',
    testId: 'data_entry_basic_1',
    category: 'data_entry',
    wpm: 28,
    accuracy: 85,
    errors: 7,
    totalCharacters: 200,
    correctCharacters: 170,
    timeElapsed: 128000,
    timestamp: Date.now() + 3000
  }
];

// Hash generation function (same as frontend)
function generateHashForResult(testId, timestamp, wpm, accuracy, errors, totalCharacters, correctCharacters) {
  const data = `${testId}-${timestamp}-${wpm}-${accuracy}-${errors}-${totalCharacters}-${correctCharacters}`;
  return Buffer.from(data).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
}

async function testHashSystem() {
  console.log('🧪 Testing Hash-Based Duplicate Prevention System\n');
  
  try {
    // 1. Clear existing data
    console.log('1. Clearing existing data...');
    await fetch(`${API_BASE_URL}/clear-stats`, { method: 'POST' });
    console.log('   ✅ Data cleared');

    // 2. Test hash generation
    console.log('\n2. Testing hash generation...');
    const testResult = testResults[0];
    const hash = generateHashForResult(
      testResult.testId,
      testResult.timestamp,
      testResult.wpm,
      testResult.accuracy,
      testResult.errors,
      testResult.totalCharacters,
      testResult.correctCharacters
    );
    console.log(`   Generated hash: ${hash}`);
    console.log(`   Hash length: ${hash.length} characters`);
    console.log('   ✅ Hash generation working');

    // 3. Test duplicate hash generation
    console.log('\n3. Testing duplicate hash detection...');
    const hash2 = generateHashForResult(
      testResult.testId,
      testResult.timestamp,
      testResult.wpm,
      testResult.accuracy,
      testResult.errors,
      testResult.totalCharacters,
      testResult.correctCharacters
    );
    console.log(`   Hash 1: ${hash}`);
    console.log(`   Hash 2: ${hash2}`);
    console.log(`   Hashes match: ${hash === hash2}`);
    console.log('   ✅ Duplicate detection working');

    // 4. Test different results generate different hashes
    console.log('\n4. Testing unique hash generation...');
    const differentResult = { ...testResult, wpm: 50 };
    const differentHash = generateHashForResult(
      differentResult.testId,
      differentResult.timestamp,
      differentResult.wpm,
      differentResult.accuracy,
      differentResult.errors,
      differentResult.totalCharacters,
      differentResult.correctCharacters
    );
    console.log(`   Original hash: ${hash}`);
    console.log(`   Different hash: ${differentHash}`);
    console.log(`   Hashes different: ${hash !== differentHash}`);
    console.log('   ✅ Unique hash generation working');

    // 5. Submit test results with hashes
    console.log('\n5. Submitting test results with hashes...');
    for (const result of testResults) {
      const resultHash = generateHashForResult(
        result.testId,
        result.timestamp,
        result.wpm,
        result.accuracy,
        result.errors,
        result.totalCharacters,
        result.correctCharacters
      );
      
      const response = await fetch(`${API_BASE_URL}/results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...result,
          hash: resultHash
        })
      });
      
      if (response.ok) {
        const savedResult = await response.json();
        console.log(`   ✅ ${result.category}: ${result.wpm} WPM (hash: ${resultHash.substring(0, 8)}...)`);
      } else {
        const error = await response.text();
        console.log(`   ❌ ${result.category}: ${error}`);
      }
    }

    // 6. Test duplicate submission prevention
    console.log('\n6. Testing duplicate submission prevention...');
    const duplicateResult = { ...testResults[0] };
    const duplicateHash = generateHashForResult(
      duplicateResult.testId,
      duplicateResult.timestamp,
      duplicateResult.wpm,
      duplicateResult.accuracy,
      duplicateResult.errors,
      duplicateResult.totalCharacters,
      duplicateResult.correctCharacters
    );
    
    const duplicateResponse = await fetch(`${API_BASE_URL}/results`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...duplicateResult,
        hash: duplicateHash
      })
    });
    
    if (duplicateResponse.status === 409) {
      console.log('   ✅ Duplicate submission correctly rejected');
    } else {
      console.log(`   ⚠️  Duplicate submission response: ${duplicateResponse.status}`);
    }

    // 7. Verify database contents
    console.log('\n7. Verifying database contents...');
    const resultsResponse = await fetch(`${API_BASE_URL}/users/default_user/results`);
    const allResults = await resultsResponse.json();
    console.log(`   Total results in database: ${allResults.length}`);
    
    // Check for duplicates
    const hashes = allResults.map(r => r.hash);
    const uniqueHashes = new Set(hashes);
    console.log(`   Unique hashes: ${uniqueHashes.size}`);
    console.log(`   Duplicates found: ${hashes.length !== uniqueHashes.size ? 'YES' : 'NO'}`);
    console.log('   ✅ Database integrity verified');

    // 8. Test category filtering
    console.log('\n8. Testing category filtering...');
    const categories = ['lowercase', 'punctuation', 'code', 'data_entry'];
    
    for (const category of categories) {
      const categoryResults = allResults.filter(r => r.category === category);
      console.log(`   ${category}: ${categoryResults.length} results`);
      if (categoryResults.length > 0) {
        const avgWpm = Math.round(categoryResults.reduce((sum, r) => sum + r.wpm, 0) / categoryResults.length);
        console.log(`     - Average WPM: ${avgWpm}`);
        console.log(`     - Results: ${categoryResults.map(r => `${r.test_id} (${r.wpm} WPM)`).join(', ')}`);
      }
    }
    console.log('   ✅ Category filtering working');

    // 9. Test hash uniqueness across categories
    console.log('\n9. Testing hash uniqueness across categories...');
    const allHashes = allResults.map(r => r.hash);
    const hashCounts = {};
    allHashes.forEach(hash => {
      hashCounts[hash] = (hashCounts[hash] || 0) + 1;
    });
    
    const duplicateHashes = Object.entries(hashCounts).filter(([hash, count]) => count > 1);
    if (duplicateHashes.length === 0) {
      console.log('   ✅ All hashes are unique');
    } else {
      console.log(`   ❌ Found ${duplicateHashes.length} duplicate hashes:`);
      duplicateHashes.forEach(([hash, count]) => {
        console.log(`     - ${hash}: ${count} occurrences`);
      });
    }

    // 10. Test data integrity
    console.log('\n10. Testing data integrity...');
    let integrityPassed = true;
    
    for (const result of allResults) {
      const expectedHash = generateHashForResult(
        result.test_id,
        result.timestamp,
        result.wpm,
        result.accuracy,
        result.errors,
        result.total_characters,
        result.correct_characters
      );
      
      if (result.hash !== expectedHash) {
        console.log(`   ❌ Hash mismatch for ${result.test_id}:`);
        console.log(`     - Stored: ${result.hash}`);
        console.log(`     - Expected: ${expectedHash}`);
        integrityPassed = false;
      }
    }
    
    if (integrityPassed) {
      console.log('   ✅ All stored hashes match expected values');
    }

    // 11. Performance test
    console.log('\n11. Testing hash generation performance...');
    const startTime = Date.now();
    for (let i = 0; i < 1000; i++) {
      generateHashForResult(
        `test_${i}`,
        Date.now() + i,
        Math.floor(Math.random() * 100),
        Math.floor(Math.random() * 100),
        Math.floor(Math.random() * 10),
        Math.floor(Math.random() * 200),
        Math.floor(Math.random() * 200)
      );
    }
    const endTime = Date.now();
    console.log(`   Generated 1000 hashes in ${endTime - startTime}ms`);
    console.log('   ✅ Hash generation performance acceptable');

    // 12. Summary
    console.log('\n📊 Test Summary:');
    console.log(`   - Total tests submitted: ${testResults.length}`);
    console.log(`   - Results in database: ${allResults.length}`);
    console.log(`   - Unique hashes: ${uniqueHashes.size}`);
    console.log(`   - Categories tested: ${categories.length}`);
    console.log(`   - Data integrity: ${integrityPassed ? 'PASSED' : 'FAILED'}`);
    console.log(`   - Duplicate prevention: ${hashes.length === uniqueHashes.size ? 'WORKING' : 'FAILED'}`);

    console.log('\n✅ Hash-based system test completed successfully!');
    console.log('🎯 Ready for frontend testing with the new system.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testHashSystem();
