/**
 * Standardized testing utilities and helpers for Type Trainer
 */

import type { TypingResult, TypingTest, UserStats } from '../../src/types';

// ============================================================================
// MOCK DATA GENERATORS
// ============================================================================

/**
 * Creates a mock typing result with default values
 */
export const createMockTypingResult = (overrides: Partial<TypingResult> = {}): TypingResult => ({
  testId: 'test_123',
  timestamp: Date.now(),
  wpm: 45,
  accuracy: 95,
  errors: 3,
  totalCharacters: 100,
  correctCharacters: 97,
  timeElapsed: 120000,
  category: 'lowercase',
  subcategory: 'random_words',
  hash: 'mock_hash_123',
  sessionId: 'session_123',
  ...overrides,
});

/**
 * Creates a mock typing test with default values
 */
export const createMockTypingTest = (overrides: Partial<TypingTest> = {}): TypingTest => ({
  id: 'test_1',
  category: 'lowercase',
  subcategory: 'random_words',
  content: 'this is a test sentence for typing practice',
  difficulty: 'beginner',
  ...overrides,
});

/**
 * Creates a mock user with default values
 */
export const createMockUser = (overrides: Partial<{ id: string; name: string; email: string; joinDate: number }> = {}) => ({
  id: 'default_user',
  name: 'Test User',
  email: 'test@example.com',
  joinDate: Date.now(),
  ...overrides,
});

/**
 * Creates mock user stats with default values
 */
export const createMockUserStats = (overrides: Partial<UserStats> = {}): UserStats => ({
  totalTests: 10,
  averageWpm: 45,
  averageAccuracy: 95,
  bestWpm: 60,
  lastTestDate: Date.now(),
  totalCharacters: 1000,
  totalErrors: 20,
  categoryStats: {
    lowercase: { tests: 5, averageWpm: 40, averageAccuracy: 90 },
    punctuation: { tests: 3, averageWpm: 50, averageAccuracy: 95 },
    code: { tests: 2, averageWpm: 35, averageAccuracy: 85 }
  },
  ...overrides,
});

// ============================================================================
// TEST UTILITIES
// ============================================================================

/**
 * Waits for a specified amount of time (useful for async operations)
 */
export const waitFor = (ms = 100): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Waits for a condition to be true
 */
export const waitForCondition = async (
  condition: () => boolean | Promise<boolean>,
  timeout = 5000,
  interval = 100
): Promise<void> => {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return;
    }
    await waitFor(interval);
  }
  
  throw new Error(`Condition not met within ${timeout}ms`);
};

/**
 * Creates a mock fetch response
 */
export const createMockFetchResponse = (
  data: any,
  status = 200,
  ok = true
): Response => ({
  ok,
  status,
  json: async () => data,
  text: async () => JSON.stringify(data),
  headers: new Headers(),
  statusText: ok ? 'OK' : 'Error',
  type: 'default',
  url: '',
  redirected: false,
  body: null,
  bodyUsed: false,
  clone: jest.fn(),
  arrayBuffer: jest.fn(),
  blob: jest.fn(),
  formData: jest.fn(),
  bytes: jest.fn(),
} as unknown as Response);

/**
 * Mocks fetch with a specific response
 */
export const mockFetchResponse = (data: any, status = 200, ok = true): void => {
  (global.fetch as jest.Mock).mockResolvedValueOnce(createMockFetchResponse(data, status, ok));
};

/**
 * Mocks fetch with an error
 */
export const mockFetchError = (error: Error): void => {
  (global.fetch as jest.Mock).mockRejectedValueOnce(error);
};

// ============================================================================
// ASSERTION HELPERS
// ============================================================================

/**
 * Asserts that a function throws an error with a specific message
 */
export const expectToThrow = (fn: () => any, errorMessage?: string): void => {
  if (errorMessage) {
    expect(fn).toThrow(errorMessage);
  } else {
    expect(fn).toThrow();
  }
};

/**
 * Asserts that a function throws an error of a specific type
 */
export const expectToThrowError = (fn: () => any, ErrorType: any): void => {
  expect(fn).toThrow(ErrorType);
};

/**
 * Asserts that an async function throws an error
 */
export const expectAsyncToThrow = async (fn: () => Promise<any>, errorMessage?: string): Promise<void> => {
  if (errorMessage) {
    await expect(fn()).rejects.toThrow(errorMessage);
  } else {
    await expect(fn()).rejects.toThrow();
  }
};

/**
 * Asserts that a value is a valid date
 */
export const expectValidDate = (date: any): void => {
  expect(date).toBeInstanceOf(Date);
  expect(date.getTime()).not.toBeNaN();
};

/**
 * Asserts that a value is a valid number within a range
 */
export const expectNumberInRange = (value: number, min: number, max: number): void => {
  expect(typeof value).toBe('number');
  expect(value).toBeGreaterThanOrEqual(min);
  expect(value).toBeLessThanOrEqual(max);
};

// ============================================================================
// TEST SETUP HELPERS
// ============================================================================

/**
 * Clears all mocks and localStorage before each test
 */
export const setupTestEnvironment = (): void => {
  jest.clearAllMocks();
  localStorage.clear();
  (global.fetch as jest.Mock).mockClear();
};

/**
 * Sets up mock environment variables
 */
export const setupMockEnvironment = (): void => {
  process.env.VITE_API_BASE_URL = 'http://localhost:3002/api';
  process.env.VITE_APP_NAME = 'Type Trainer';
  process.env.VITE_APP_VERSION = '1.0.0';
};

/**
 * Creates a mock localStorage with specific data
 */
export const setupMockLocalStorage = (data: Record<string, string> = {}): void => {
  const mockStorage = {
    getItem: jest.fn((key: string) => data[key] || null),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    length: Object.keys(data).length,
    key: jest.fn(),
  };
  
  Object.defineProperty(window, 'localStorage', {
    value: mockStorage,
    writable: true,
  });
};

// ============================================================================
// PERFORMANCE TESTING HELPERS
// ============================================================================

/**
 * Measures the execution time of a function
 */
export const measureExecutionTime = async <T>(fn: () => T | Promise<T>): Promise<{ result: T; duration: number }> => {
  const startTime = performance.now();
  const result = await fn();
  const endTime = performance.now();
  
  return {
    result,
    duration: endTime - startTime,
  };
};

/**
 * Asserts that a function executes within a specified time limit
 */
export const expectExecutionTime = async <T>(
  fn: () => T | Promise<T>,
  maxDuration: number
): Promise<T> => {
  const { result, duration } = await measureExecutionTime(fn);
  expect(duration).toBeLessThan(maxDuration);
  return result;
};

// ============================================================================
// INTEGRATION TEST HELPERS
// ============================================================================

/**
 * Creates a mock database with specific data
 */
export const createMockDatabase = (_data: Record<string, any[]> = {}) => ({
  // Mock database functions
  get: jest.fn((_query: string, _params: any[] = []) => {
    return Promise.resolve([]);
  }),
  all: jest.fn((_query: string, _params: any[] = []) => {
    return Promise.resolve([]);
  }),
  run: jest.fn((_query: string, _params: any[] = []) => {
    return Promise.resolve({ changes: 0, lastID: 0 });
  }),
  close: jest.fn(() => Promise.resolve()),
});

/**
 * Waits for all pending promises to resolve
 */
export const flushPromises = (): Promise<void> => 
  new Promise(resolve => setImmediate(resolve));

// ============================================================================
// COMPONENT TESTING HELPERS
// ============================================================================

/**
 * Creates a mock event object
 */
export const createMockEvent = (type: string, options: any = {}): Event => {
  const event = new Event(type, { bubbles: true, cancelable: true, ...options });
  Object.assign(event, options);
  return event;
};

/**
 * Creates a mock keyboard event
 */
export const createMockKeyboardEvent = (key: string, options: any = {}): KeyboardEvent => {
  return new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
    ...options,
  });
};

/**
 * Creates a mock mouse event
 */
export const createMockMouseEvent = (type: string, options: any = {}): MouseEvent => {
  return new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    ...options,
  });
};

// ============================================================================
// EXPORT ALL UTILITIES
// ============================================================================

export default {
  // Mock data generators
  createMockTypingResult,
  createMockTypingTest,
  createMockUser,
  createMockUserStats,
  
  // Test utilities
  waitFor,
  waitForCondition,
  createMockFetchResponse,
  mockFetchResponse,
  mockFetchError,
  
  // Assertion helpers
  expectToThrow,
  expectToThrowError,
  expectAsyncToThrow,
  expectValidDate,
  expectNumberInRange,
  
  // Test setup helpers
  setupTestEnvironment,
  setupMockEnvironment,
  setupMockLocalStorage,
  
  // Performance testing helpers
  measureExecutionTime,
  expectExecutionTime,
  
  // Integration test helpers
  createMockDatabase,
  flushPromises,
  
  // Component testing helpers
  createMockEvent,
  createMockKeyboardEvent,
  createMockMouseEvent,
};
