#!/usr/bin/env node

/**
 * Script to check localStorage data
 * Run this in the browser console to see what's stored
 */

console.log('🔍 Checking localStorage data...\n');

// Check typing results
const results = localStorage.getItem('typing-trainer-results');
if (results) {
  try {
    const parsedResults = JSON.parse(results);
    console.log('📊 Typing Results in localStorage:', parsedResults.length, 'results');
    console.log('📊 Results details:', parsedResults.map(r => ({
      testId: r.testId,
      category: r.category,
      wpm: r.wpm,
      hasCategory: !!r.category,
      timestamp: new Date(r.timestamp).toLocaleString()
    })));
  } catch (error) {
    console.error('❌ Error parsing results:', error);
  }
} else {
  console.log('📊 No typing results in localStorage');
}

// Check user data
const user = localStorage.getItem('typing-trainer-user');
if (user) {
  try {
    const parsedUser = JSON.parse(user);
    console.log('👤 User data in localStorage:', parsedUser);
  } catch (error) {
    console.error('❌ Error parsing user data:', error);
  }
} else {
  console.log('👤 No user data in localStorage');
}

// Check other keys
const keys = ['typing-trainer-last-sync', 'typing-trainer-pending-sync'];
keys.forEach(key => {
  const value = localStorage.getItem(key);
  if (value) {
    console.log(`🔑 ${key}:`, value);
  } else {
    console.log(`🔑 ${key}: Not found`);
  }
});

console.log('\n💡 To clear localStorage, run:');
console.log('localStorage.removeItem("typing-trainer-results");');
console.log('localStorage.removeItem("typing-trainer-user");');
console.log('localStorage.removeItem("typing-trainer-last-sync");');
console.log('localStorage.removeItem("typing-trainer-pending-sync");');
