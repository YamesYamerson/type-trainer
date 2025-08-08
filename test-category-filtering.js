#!/usr/bin/env node

/**
 * Simple test script to verify category filtering functionality
 * Run with: node test-category-filtering.js
 */

// Load environment variables
require('dotenv').config();

const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

async function testCategoryFiltering() {
  console.log('🧪 Testing Category Filtering...\n');

  try {
    // 1. Check database info
    console.log('1. Checking database info...');
    const dbInfo = await fetch(`${API_BASE_URL}/db-info`);
    const dbInfoData = await dbInfo.json();
    console.log('   Database info:', dbInfoData);

    // 2. Get all results
    console.log('\n2. Getting all results...');
    const resultsResponse = await fetch(`${API_BASE_URL}/users/default_user/results`);
    const allResults = await resultsResponse.json();
    console.log('   All results:', allResults.map(r => ({ test_id: r.test_id, category: r.category, wpm: r.wpm })));

    // 3. Test category filtering
    console.log('\n3. Testing category filtering...');
    const categories = ['lowercase', 'punctuation', 'code', 'data_entry'];
    
    for (const category of categories) {
      const filteredResults = allResults.filter(r => r.category === category);
      console.log(`   ${category}: ${filteredResults.length} results`);
      if (filteredResults.length > 0) {
        console.log(`     - ${filteredResults.map(r => `${r.test_id} (${r.wpm} WPM)`).join(', ')}`);
      }
    }

    // 4. Test statistics calculation
    console.log('\n4. Testing statistics calculation...');
    for (const category of categories) {
      const categoryResults = allResults.filter(r => r.category === category);
      if (categoryResults.length > 0) {
        const avgWpm = Math.round(categoryResults.reduce((sum, r) => sum + r.wpm, 0) / categoryResults.length);
        const avgAccuracy = Math.round(categoryResults.reduce((sum, r) => sum + r.accuracy, 0) / categoryResults.length);
        const bestWpm = Math.max(...categoryResults.map(r => r.wpm));
        console.log(`   ${category}: Avg WPM: ${avgWpm}, Avg Accuracy: ${avgAccuracy}%, Best WPM: ${bestWpm}, Tests: ${categoryResults.length}`);
      } else {
        console.log(`   ${category}: No tests completed`);
      }
    }

    // 5. Overall statistics
    console.log('\n5. Overall statistics...');
    const totalTests = allResults.length;
    const avgWpm = Math.round(allResults.reduce((sum, r) => sum + r.wpm, 0) / totalTests);
    const avgAccuracy = Math.round(allResults.reduce((sum, r) => sum + r.accuracy, 0) / totalTests);
    const bestWpm = Math.max(...allResults.map(r => r.wpm));
    console.log(`   Total tests: ${totalTests}`);
    console.log(`   Overall Avg WPM: ${avgWpm}`);
    console.log(`   Overall Avg Accuracy: ${avgAccuracy}%`);
    console.log(`   Overall Best WPM: ${bestWpm}`);

    console.log('\n✅ Category filtering test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testCategoryFiltering();
