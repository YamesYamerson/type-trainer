/**
 * Jest setup file for Type Trainer tests
 */

import '@testing-library/jest-dom';

// Mock environment variables
process.env.VITE_API_BASE_URL = 'http://localhost:3001/api';
process.env.VITE_APP_NAME = 'Type Trainer';
process.env.VITE_APP_VERSION = '1.0.0';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn()
};
global.localStorage = localStorageMock as Storage;

// Mock fetch
global.fetch = jest.fn();

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock window.btoa for hash generation
global.btoa = jest.fn((str) => Buffer.from(str).toString('base64'));

// Mock window.atob for hash decoding
global.atob = jest.fn((str) => Buffer.from(str, 'base64').toString());

// Setup test utilities
global.testUtils = {
  // Helper to create mock typing results
  createMockTypingResult: (overrides = {}) => ({
    testId: 'test_123',
    category: 'lowercase',
    wpm: 45,
    accuracy: 95,
    errors: 2,
    totalCharacters: 100,
    correctCharacters: 98,
    timeElapsed: 80000,
    timestamp: Date.now(),
    hash: 'mock_hash_123',
    ...overrides,
  }),

  // Helper to create mock user
  createMockUser: (overrides = {}) => ({
    id: 'default_user',
    name: 'Test User',
    email: 'test@example.com',
    joinDate: Date.now(),
    ...overrides,
  }),

  // Helper to wait for async operations
  waitFor: (ms = 100) => new Promise(resolve => setTimeout(resolve, ms)),
};
