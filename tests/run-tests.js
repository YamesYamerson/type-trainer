#!/usr/bin/env node

/**
 * Test runner script for Type Trainer
 * Consolidates all testing functionality from the old test files
 */

const { execSync } = require('child_process');
const path = require('path');

// Test categories
const TEST_CATEGORIES = {
  'all': 'Run all tests',
  'utils': 'Run utility tests (hashUtils, dataManager)',
  'components': 'Run component tests (TypingTestEngine)',
  'integration': 'Run integration tests (hash system, category filtering)',
  'server': 'Run server tests (API endpoints)',
  'coverage': 'Run tests with coverage report'
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(message) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`  ${message}`, 'bright');
  log(`${'='.repeat(60)}`, 'cyan');
}

function logSection(message) {
  log(`\n${'-'.repeat(40)}`, 'yellow');
  log(`  ${message}`, 'yellow');
  log(`${'-'.repeat(40)}`, 'yellow');
}

function runCommand(command, description) {
  logSection(description);
  try {
    const output = execSync(command, { 
      stdio: 'inherit', 
      cwd: process.cwd(),
      encoding: 'utf8'
    });
    log(`✅ ${description} completed successfully`, 'green');
    return true;
  } catch (error) {
    log(`❌ ${description} failed`, 'red');
    log(`Error: ${error.message}`, 'red');
    return false;
  }
}

function showHelp() {
  logHeader('Type Trainer Test Runner');
  log('\nAvailable test categories:', 'bright');
  
  Object.entries(TEST_CATEGORIES).forEach(([category, description]) => {
    log(`  ${category.padEnd(12)} - ${description}`, 'cyan');
  });
  
  log('\nUsage:', 'bright');
  log('  node tests/run-tests.js [category]', 'yellow');
  log('  npm run test:[category]', 'yellow');
  
  log('\nExamples:', 'bright');
  log('  node tests/run-tests.js all', 'yellow');
  log('  node tests/run-tests.js utils', 'yellow');
  log('  node tests/run-tests.js integration', 'yellow');
  log('  npm run test:coverage', 'yellow');
}

function runTests(category) {
  logHeader(`Running ${category} tests`);
  
  switch (category) {
    case 'all':
      return runCommand('npm run test', 'All tests');
      
    case 'utils':
      return runCommand('npm run test:utils', 'Utility tests');
      
    case 'components':
      return runCommand('npm run test:components', 'Component tests');
      
    case 'integration':
      return runCommand('npm run test:integration', 'Integration tests');
      
    case 'server':
      return runCommand('npm run test:server', 'Server tests');
      
    case 'coverage':
      return runCommand('npm run test:coverage', 'Tests with coverage');
      
    default:
      log(`❌ Unknown test category: ${category}`, 'red');
      showHelp();
      return false;
  }
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  const category = args[0] || 'all';
  
  if (category === 'help' || category === '--help' || category === '-h') {
    showHelp();
    return;
  }
  
  if (!TEST_CATEGORIES[category]) {
    log(`❌ Unknown test category: ${category}`, 'red');
    showHelp();
    process.exit(1);
  }
  
  const success = runTests(category);
  
  if (success) {
    logHeader('All tests completed successfully! 🎉');
    process.exit(0);
  } else {
    logHeader('Some tests failed! ❌');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { runTests, showHelp };
