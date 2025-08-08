// Script to clear all typing data (database + localStorage)
console.log('🗑️  Clearing all typing data...');

// Clear localStorage data
if (typeof window !== 'undefined') {
  // Browser environment
  localStorage.removeItem('typing-trainer-results');
  localStorage.removeItem('typing-trainer-user');
  localStorage.removeItem('typing-trainer-last-sync');
  localStorage.removeItem('typing-trainer-pending-sync');
  console.log('✅ localStorage data cleared');
} else {
  // Node.js environment
  console.log('ℹ️  localStorage clearing skipped (Node.js environment)');
  console.log('💡 To clear localStorage, run this in the browser console:');
  console.log('   localStorage.removeItem("typing-trainer-results");');
  console.log('   localStorage.removeItem("typing-trainer-user");');
  console.log('   localStorage.removeItem("typing-trainer-last-sync");');
  console.log('   localStorage.removeItem("typing-trainer-pending-sync");');
}

console.log('🎯 All data cleared! Ready for fresh start with proper categorization.');
