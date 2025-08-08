/**
 * Environment setup for Jest tests
 */

// Set up environment variables for tests
process.env.NODE_ENV = 'test';
process.env.VITE_API_BASE_URL = 'http://localhost:3001/api';
process.env.VITE_APP_NAME = 'Type Trainer';
process.env.VITE_APP_VERSION = '1.0.0';

// Mock fetch if not available
if (!global.fetch) {
  global.fetch = jest.fn();
}

// Mock localStorage if not available
if (!global.localStorage) {
  global.localStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };
}

// Mock window if not available
if (typeof window === 'undefined') {
  global.window = {
    location: {
      hostname: 'localhost',
      protocol: 'http:',
      host: 'localhost:5173',
    },
    btoa: (str) => Buffer.from(str).toString('base64'),
    atob: (str) => Buffer.from(str, 'base64').toString(),
  };
}
