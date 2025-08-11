/**
 * Jest setup file for Type Trainer tests
 */

require('@testing-library/jest-dom');

// Set up environment variables for tests
process.env.NODE_ENV = 'test';
process.env.VITE_API_BASE_URL = 'http://localhost:3002/api';
process.env.VITE_APP_NAME = 'Type Trainer';
process.env.VITE_APP_VERSION = '1.0.0';

// Polyfill TextEncoder and TextDecoder for Node.js environment
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// Mock fetch
global.fetch = jest.fn();

// Ensure window object is available
if (typeof window === 'undefined') {
  global.window = {} as any;
}

// Mock window.btoa for hash generation (must be before any imports)
global.btoa = (str: string) => Buffer.from(str).toString('base64');
window.btoa = (str: string) => Buffer.from(str).toString('base64');

// Mock window.atob for hash decoding
global.atob = (str: string) => Buffer.from(str, 'base64').toString();
window.atob = (str: string) => Buffer.from(str, 'base64').toString();

// Mock localStorage for tests
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  let shouldThrowError = false;
  let errorMessage = '';

  const mock = {
    getItem(key: string): string | null {
      if (shouldThrowError) {
        throw new Error(errorMessage);
      }
      return store[key] || null;
    },
    setItem(key: string, value: string): void {
      if (shouldThrowError) {
        throw new Error(errorMessage);
      }
      store[key] = value;
    },
    removeItem(key: string): void {
      if (shouldThrowError) {
        throw new Error(errorMessage);
      }
      delete store[key];
    },
    clear(): void {
      if (shouldThrowError) {
        throw new Error(errorMessage);
      }
      store = {};
    },
    get length(): number {
      return Object.keys(store).length;
    },
    key(index: number): string | null {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
    // Helper method to reset the store for tests
    _reset(): void {
      store = {};
      shouldThrowError = false;
      errorMessage = '';
    },
    // Helper method to simulate errors
    _simulateError(message: string): void {
      shouldThrowError = true;
      errorMessage = message;
    },
    // Helper method to clear error simulation
    _clearError(): void {
      shouldThrowError = false;
      errorMessage = '';
    },
    // Helper method to simulate quota exceeded with retry logic
    _simulateQuotaExceeded(): any {
      let callCount = 0;
      const originalSetItem = mock.setItem;
      
      mock.setItem = (key: string, value: string) => {
        callCount++;
        if (callCount === 1) {
          // First call fails with quota exceeded
          const error = new Error('QuotaExceededError');
          (error as any).name = 'QuotaExceededError';
          throw error;
        } else {
          // Retry call succeeds
          store[key] = value;
        }
      };
      
      return originalSetItem;
    }
  };

  return mock;
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
  configurable: true,
});

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
  configurable: true,
});

// Also ensure the mock is available as a direct property
(window as any).localStorage = localStorageMock;
(global as any).localStorage = localStorageMock;

// Mock environment config to avoid import.meta issues
jest.mock('../src/config/environment', () => ({
  config: {
    apiBaseUrl: 'http://localhost:3002/api',
    appName: 'Type Trainer',
    appVersion: '1.0.0',
    isDevelopment: true,
    isProduction: false
  }
}));



// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true
});

// Mock window if not available
if (typeof window === 'undefined') {
  global.window = {
    location: {
      hostname: 'localhost',
      protocol: 'http:',
      host: 'localhost:5173',
    },
    btoa: (str: string) => Buffer.from(str).toString('base64'),
    atob: (str: string) => Buffer.from(str, 'base64').toString(),
  } as any;
}

// Setup test utilities
(global as any).testUtils = {
  // Helper to create mock typing results
  createMockTypingResult: (overrides = {}) => ({
    testId: 'test_123',
    category: 'lowercase',
    subcategory: 'basic',
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

// Import and initialize DataManager after all mocks are set up
const { DataManager } = require('../src/utils/dataManager');
DataManager.setOnlineStatus(true);

// Reset localStorage mock before each test
beforeEach(() => {
  (localStorage as any)._reset();
  // Also reset the global fetch mock
  (global.fetch as jest.Mock).mockClear();
  // Reset the store in the mock
  (localStorage as any)._reset();
});


