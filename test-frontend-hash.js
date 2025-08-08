/**
 * Frontend Hash System Test Utility
 * Run this in the browser console to test the hash-based duplicate prevention system
 */

// Get API URL from environment or use default
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3001/api' 
  : `${window.location.protocol}//${window.location.host}/api`;

// Test the hash generation function
function testHashGeneration() {
  console.log('🧪 Testing Hash Generation...');
  
  const testData = {
    testId: 'test_123',
    timestamp: Date.now(),
    wpm: 45,
    accuracy: 95,
    errors: 2,
    totalCharacters: 100,
    correctCharacters: 98
  };
  
  // Generate hash using the same logic as the app
  const data = `${testData.testId}-${testData.timestamp}-${testData.wpm}-${testData.accuracy}-${testData.errors}-${testData.totalCharacters}-${testData.correctCharacters}`;
  const hash = btoa(data).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
  
  console.log('Test data:', testData);
  console.log('Generated hash:', hash);
  console.log('Hash length:', hash.length);
  console.log('✅ Hash generation working');
  
  return hash;
}

// Test localStorage data
function testLocalStorageData() {
  console.log('\n🧪 Testing localStorage Data...');
  
  const results = JSON.parse(localStorage.getItem('typing-trainer-results') || '[]');
  console.log('Total results in localStorage:', results.length);
  
  if (results.length > 0) {
    console.log('Sample result:', results[0]);
    console.log('Has hash field:', 'hash' in results[0]);
    
    // Check for duplicates in localStorage
    const hashes = results.map(r => r.hash);
    const uniqueHashes = new Set(hashes);
    console.log('Unique hashes:', uniqueHashes.size);
    console.log('Duplicates found:', hashes.length !== uniqueHashes.size);
    
    // Check category distribution
    const categories = {};
    results.forEach(r => {
      categories[r.category] = (categories[r.category] || 0) + 1;
    });
    console.log('Category distribution:', categories);
  }
  
  console.log('✅ localStorage analysis complete');
  return results;
}

// Test API data
async function testAPIData() {
  console.log('\n🧪 Testing API Data...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/users/default_user/results`);
    const results = await response.json();
    
    console.log('Total results from API:', results.length);
    
    if (results.length > 0) {
      console.log('Sample result:', results[0]);
      console.log('Has hash field:', 'hash' in results[0]);
      
      // Check for duplicates in API data
      const hashes = results.map(r => r.hash);
      const uniqueHashes = new Set(hashes);
      console.log('Unique hashes:', uniqueHashes.size);
      console.log('Duplicates found:', hashes.length !== uniqueHashes.size);
      
      // Check category distribution
      const categories = {};
      results.forEach(r => {
        categories[r.category] = (categories[r.category] || 0) + 1;
      });
      console.log('Category distribution:', categories);
      
      // Test category filtering
      console.log('\nCategory-specific results:');
      ['lowercase', 'punctuation', 'code', 'data_entry'].forEach(category => {
        const categoryResults = results.filter(r => r.category === category);
        if (categoryResults.length > 0) {
          const avgWpm = Math.round(categoryResults.reduce((sum, r) => sum + r.wpm, 0) / categoryResults.length);
          console.log(`  ${category}: ${categoryResults.length} results, avg WPM: ${avgWpm}`);
        } else {
          console.log(`  ${category}: No results`);
        }
      });
    }
    
    console.log('✅ API analysis complete');
    return results;
  } catch (error) {
    console.error('❌ API test failed:', error);
    return [];
  }
}

// Test hybrid data loading
async function testHybridData() {
  console.log('\n🧪 Testing Hybrid Data Loading...');
  
  try {
    // Simulate the app's data loading process
    const localResults = JSON.parse(localStorage.getItem('typing-trainer-results') || '[]');
    console.log('localStorage results:', localResults.length);
    
    const apiResponse = await fetch(`${API_BASE_URL}/users/default_user/results`);
    const apiResults = apiResponse.ok ? await apiResponse.json() : [];
    console.log('API results:', apiResults.length);
    
    // Simulate merge process
    const combined = [...apiResults];
    const seenHashes = new Set(apiResults.map(r => r.hash));
    
    localResults.forEach(localResult => {
      if (!seenHashes.has(localResult.hash)) {
        combined.push(localResult);
        seenHashes.add(localResult.hash);
      }
    });
    
    console.log('Combined results:', combined.length);
    console.log('Unique hashes after merge:', seenHashes.size);
    console.log('Duplicates after merge:', combined.length !== seenHashes.size);
    
    // Check category distribution after merge
    const categories = {};
    combined.forEach(r => {
      categories[r.category] = (categories[r.category] || 0) + 1;
    });
    console.log('Final category distribution:', categories);
    
    console.log('✅ Hybrid data test complete');
    return combined;
  } catch (error) {
    console.error('❌ Hybrid data test failed:', error);
    return [];
  }
}

// Test duplicate prevention
function testDuplicatePrevention() {
  console.log('\n🧪 Testing Duplicate Prevention...');
  
  const testResult = {
    testId: 'duplicate_test',
    timestamp: Date.now(),
    wpm: 50,
    accuracy: 90,
    errors: 3,
    totalCharacters: 100,
    correctCharacters: 97,
    category: 'lowercase'
  };
  
  // Generate hash
  const data = `${testResult.testId}-${testResult.timestamp}-${testResult.wpm}-${testResult.accuracy}-${testResult.errors}-${testResult.totalCharacters}-${testResult.correctCharacters}`;
  const hash = btoa(data).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
  testResult.hash = hash;
  
  console.log('Test result:', testResult);
  console.log('Generated hash:', hash);
  
  // Check if this would be a duplicate
  const existingResults = JSON.parse(localStorage.getItem('typing-trainer-results') || '[]');
  const isDuplicate = existingResults.some(r => r.hash === hash);
  console.log('Would be duplicate in localStorage:', isDuplicate);
  
  console.log('✅ Duplicate prevention test complete');
  return { testResult, isDuplicate };
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Frontend Hash System Tests...\n');
  
  // Test 1: Hash generation
  testHashGeneration();
  
  // Test 2: localStorage data
  testLocalStorageData();
  
  // Test 3: API data
  await testAPIData();
  
  // Test 4: Hybrid data loading
  await testHybridData();
  
  // Test 5: Duplicate prevention
  testDuplicatePrevention();
  
  console.log('\n✅ All frontend tests completed!');
  console.log('💡 Check the results above to verify the hash-based system is working correctly.');
}

// Export functions for manual testing
window.hashSystemTests = {
  testHashGeneration,
  testLocalStorageData,
  testAPIData,
  testHybridData,
  testDuplicatePrevention,
  runAllTests
};

console.log('🔧 Hash System Test Utility loaded!');
console.log('Run: window.hashSystemTests.runAllTests() to execute all tests');
console.log('Or run individual tests like: window.hashSystemTests.testHashGeneration()');
