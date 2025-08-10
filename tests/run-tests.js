#!/usr/bin/env node

/**
 * Standardized Test Runner for Type Trainer
 * 
 * This script provides a comprehensive test runner that follows the standardized
 * testing practices defined in the project.
 * 
 * Usage:
 *   node tests/run-tests.js [command] [options]
 * 
 * Commands:
 *   all              - Run all tests
 *   utils            - Run utility tests only
 *   components       - Run component tests only
 *   integration      - Run integration tests only
 *   server           - Run server tests only
 *   coverage         - Run tests with coverage report
 *   watch            - Run tests in watch mode
 *   ci               - Run tests in CI mode
 *   help             - Show this help message
 * 
 * Options:
 *   --verbose        - Enable verbose output
 *   --coverage       - Generate coverage report
 *   --watch          - Run in watch mode
 *   --ci             - Run in CI mode
 */

const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  testDir: path.join(__dirname),
  coverageDir: path.join(__dirname, '..', 'coverage'),
  reportsDir: path.join(__dirname, '..', 'test-reports'),
  jestConfig: path.join(__dirname, '..', 'jest.config.cjs'),
  packageJson: path.join(__dirname, '..', 'package.json'),
  timeout: 30000, // 30 seconds
  maxWorkers: 4
};

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Log a message with timestamp
 */
function log(message, level = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
  console.log(`${prefix} ${message}`);
}

/**
 * Check if a file exists
 */
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

/**
 * Get test files for a specific category
 */
function getTestFiles(category) {
  const categoryDir = path.join(CONFIG.testDir, category);
  if (!fileExists(categoryDir)) {
    return [];
  }

  const files = fs.readdirSync(categoryDir, { recursive: true });
  return files
    .filter(file => file.endsWith('.test.ts') || file.endsWith('.test.tsx'))
    .map(file => path.join(category, file));
}

/**
 * Run Jest with specific options
 */
function runJest(options = []) {
  const jestPath = path.join(__dirname, '..', 'node_modules', '.bin', 'jest');
  const args = [
    '--config', CONFIG.jestConfig,
    '--no-cache',
    '--maxWorkers', CONFIG.maxWorkers.toString(),
    ...options
  ];

  log(`Running Jest with args: ${args.join(' ')}`, 'debug');

  return new Promise((resolve, reject) => {
    const jest = spawn(jestPath, args, {
      stdio: 'inherit',
      cwd: path.dirname(CONFIG.packageJson)
    });

    jest.on('close', (code) => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(new Error(`Jest exited with code ${code}`));
      }
    });

    jest.on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Create coverage report
 */
function createCoverageReport() {
  const coveragePath = path.join(CONFIG.coverageDir, 'lcov-report', 'index.html');
  if (fileExists(coveragePath)) {
    log(`Coverage report available at: ${coveragePath}`);
  } else {
    log('Coverage report not found', 'warn');
  }
}

/**
 * Validate test environment
 */
function validateEnvironment() {
  const requiredFiles = [
    CONFIG.jestConfig,
    CONFIG.packageJson,
    path.join(CONFIG.testDir, 'setup.ts')
  ];

  const missingFiles = requiredFiles.filter(file => !fileExists(file));
  if (missingFiles.length > 0) {
    log(`Missing required files: ${missingFiles.join(', ')}`, 'error');
    process.exit(1);
  }

  log('Test environment validated successfully');
}

// ============================================================================
// COMMANDS
// ============================================================================

/**
 * Run all tests
 */
async function runAllTests(options = []) {
  log('Running all tests...');
  await runJest(options);
  log('All tests completed');
}

/**
 * Run utility tests
 */
async function runUtilityTests(options = []) {
  log('Running utility tests...');
  const testFiles = getTestFiles('utils');
  if (testFiles.length === 0) {
    log('No utility tests found', 'warn');
    return;
  }
  
  await runJest([...testFiles, ...options]);
  log('Utility tests completed');
}

/**
 * Run component tests
 */
async function runComponentTests(options = []) {
  log('Running component tests...');
  const testFiles = getTestFiles('components');
  if (testFiles.length === 0) {
    log('No component tests found', 'warn');
    return;
  }
  
  await runJest([...testFiles, ...options]);
  log('Component tests completed');
}

/**
 * Run integration tests
 */
async function runIntegrationTests(options = []) {
  log('Running integration tests...');
  const testFiles = getTestFiles('integration');
  if (testFiles.length === 0) {
    log('No integration tests found', 'warn');
    return;
  }
  
  await runJest([...testFiles, ...options]);
  log('Integration tests completed');
}

/**
 * Run server tests
 */
async function runServerTests(options = []) {
  log('Running server tests...');
  const testFiles = getTestFiles('server');
  if (testFiles.length === 0) {
    log('No server tests found', 'warn');
    return;
  }
  
  await runJest([...testFiles, ...options]);
  log('Server tests completed');
}

/**
 * Run tests with coverage
 */
async function runTestsWithCoverage(options = []) {
  log('Running tests with coverage...');
  await runJest(['--coverage', '--coverageReporters=text,lcov,html', ...options]);
  createCoverageReport();
  log('Tests with coverage completed');
}

/**
 * Run tests in watch mode
 */
async function runTestsInWatchMode(options = []) {
  log('Running tests in watch mode...');
  await runJest(['--watch', ...options]);
}

/**
 * Run tests in CI mode
 */
async function runTestsInCIMode(options = []) {
  log('Running tests in CI mode...');
  await runJest([
    '--ci',
    '--coverage',
    '--coverageReporters=text,lcov,html',
    '--watchAll=false',
    '--maxWorkers=2',
    ...options
  ]);
  createCoverageReport();
  log('CI tests completed');
}

/**
 * Show help message
 */
function showHelp() {
  console.log(`
Standardized Test Runner for Type Trainer

Usage:
  node tests/run-tests.js [command] [options]

Commands:
  all              - Run all tests
  utils            - Run utility tests only
  components       - Run component tests only
  integration      - Run integration tests only
  server           - Run server tests only
  coverage         - Run tests with coverage report
  watch            - Run tests in watch mode
  ci               - Run tests in CI mode
  help             - Show this help message

Options:
  --verbose        - Enable verbose output
  --coverage       - Generate coverage report
  --watch          - Run in watch mode
  --ci             - Run in CI mode

Examples:
  node tests/run-tests.js all
  node tests/run-tests.js utils --coverage
  node tests/run-tests.js components --watch
  node tests/run-tests.js ci

Test Categories:
  - Utils: hashUtils, dataManager, and other utility functions
  - Components: React components and their behavior
  - Integration: End-to-end testing and module interactions
  - Server: API endpoints and server functionality

Coverage Requirements:
  - Branches: 70%
  - Functions: 70%
  - Lines: 70%
  - Statements: 70%

For more information, see tests/STANDARDS.md
`);
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';
  const options = args.slice(1);

  try {
    // Validate environment
    validateEnvironment();

    // Parse options
    const hasVerbose = options.includes('--verbose');
    const hasCoverage = options.includes('--coverage');
    const hasWatch = options.includes('--watch');
    const hasCI = options.includes('--ci');

    // Build Jest options
    const jestOptions = [];
    if (hasVerbose) jestOptions.push('--verbose');
    if (hasCoverage) jestOptions.push('--coverage');
    if (hasWatch) jestOptions.push('--watch');

    // Execute command
    switch (command) {
      case 'all':
        await runAllTests(jestOptions);
        break;
      case 'utils':
        await runUtilityTests(jestOptions);
        break;
      case 'components':
        await runComponentTests(jestOptions);
        break;
      case 'integration':
        await runIntegrationTests(jestOptions);
        break;
      case 'server':
        await runServerTests(jestOptions);
        break;
      case 'coverage':
        await runTestsWithCoverage(jestOptions);
        break;
      case 'watch':
        await runTestsInWatchMode(jestOptions);
        break;
      case 'ci':
        await runTestsInCIMode(jestOptions);
        break;
      case 'help':
      default:
        showHelp();
        break;
    }
  } catch (error) {
    log(`Test execution failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  runAllTests,
  runUtilityTests,
  runComponentTests,
  runIntegrationTests,
  runServerTests,
  runTestsWithCoverage,
  runTestsInWatchMode,
  runTestsInCIMode
};
