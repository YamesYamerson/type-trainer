#!/usr/bin/env node

/**
 * Script to clear localStorage data
 * Run this in the browser console to clear all typing trainer data
 */

console.log('🧹 Clearing localStorage data...\n');

// Clear all typing trainer related localStorage items
const keysToClear = [
  'typing-trainer-results',
  'typing-trainer-user',
  'typing-trainer-last-sync',
  'typing-trainer-pending-sync'
];

keysToClear.forEach(key => {
  if (localStorage.getItem(key)) {
    localStorage.removeItem(key);
    console.log(`✅ Cleared: ${key}`);
  } else {
    console.log(`ℹ️  Not found: ${key}`);
  }
});

console.log('\n🎯 localStorage cleared! Refresh the page to test with fresh data.');
console.log('💡 The app should now load results from the database only.');
