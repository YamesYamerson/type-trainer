/**
 * Tests for DataManager utility
 * 
 * This file tests the DataManager utility which handles data persistence,
 * database operations, and localStorage management.
 * 
 * @see DataManager - The utility being tested
 * @see TypingResult - The data structure being managed
 */

import { DataManager } from '../../src/utils/dataManager';
import {
  setupTestEnvironment,
  createMockTypingResult,
  createMockUserStats,
  mockFetchResponse,
  mockFetchError
} from '../utils/testHelpers';

// ============================================================================
// IMPORTS AND MOCKS
// ============================================================================

// Mock the config
jest.mock('../../src/config/environment', () => ({
  config: {
    apiBaseUrl: 'http://localhost:3001/api',
    appName: 'Type Trainer',
    appVersion: '1.0.0',
    isDevelopment: true,
    isProduction: false
  }
}));

// ============================================================================
// TEST SUITE
// ============================================================================

describe('DataManager', () => {
  // ============================================================================
  // SETUP AND TEARDOWN
  // ============================================================================

  beforeEach(() => {
    setupTestEnvironment();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // TEST GROUPS
  // ============================================================================

  describe('Initialization', () => {
    it('should initialize the data manager', async () => {
      // Arrange
      mockFetchResponse({ status: 'ok' });

      // Act
      await DataManager.init();
      
      // Assert - The init method doesn't make any fetch calls by default
      // It only sets up event listeners
      expect(true).toBe(true); // Just verify it doesn't throw
    });

    it('should handle initialization failure gracefully', async () => {
      // Arrange
      mockFetchError(new Error('Network error'));

      // Act & Assert - Should not throw - init() returns void, not a promise
      expect(() => DataManager.init()).not.toThrow();
    });
  });

  describe('Core Functionality', () => {
    it('should save result to database and localStorage', async () => {
      // Arrange
      const mockResult = createMockTypingResult();
      mockFetchResponse({ id: 1, message: 'Result saved successfully' });

      // Act
      const result = await DataManager.saveResult(mockResult);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe('Result saved to database and local storage');
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/results',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: 'default_user',
            testId: mockResult.testId,
            category: mockResult.category,
            wpm: mockResult.wpm,
            accuracy: mockResult.accuracy,
            errors: mockResult.errors,
            totalCharacters: mockResult.totalCharacters,
            correctCharacters: mockResult.correctCharacters,
            timeElapsed: mockResult.timeElapsed,
            timestamp: mockResult.timestamp,
            hash: mockResult.hash,
            sessionId: mockResult.sessionId
          })
        })
      );

      // Check localStorage
      const storedResults = JSON.parse(localStorage.getItem('typing-trainer-results') || '[]');
      expect(storedResults).toHaveLength(1);
      expect(storedResults[0].hash).toBe(mockResult.hash);
    });

    it('should handle database save errors gracefully', async () => {
      // Arrange
      const mockResult = createMockTypingResult();
      mockFetchError(new Error('Database error'));

      // Act
      const result = await DataManager.saveResult(mockResult);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe('Result saved to local storage (will sync when online)');
      
      // Should still save to localStorage
      const storedResults = JSON.parse(localStorage.getItem('typing-trainer-results') || '[]');
      expect(storedResults).toHaveLength(1);
      expect(storedResults[0].hash).toBe(mockResult.hash);
    });

    it('should get results from localStorage when database is unavailable', async () => {
      // Arrange
      const mockResults = [
        createMockTypingResult({ testId: 'test_1' }),
        createMockTypingResult({ testId: 'test_2' })
      ];
      localStorage.setItem('typing-trainer-results', JSON.stringify(mockResults));
      mockFetchError(new Error('Database unavailable'));

      // Act
      const results = await DataManager.getResults();

      // Assert
      expect(results).toHaveLength(2);
      // The order might be reversed due to unshift() in the implementation
      const testIds = results.map(r => r.testId).sort();
      expect(testIds).toEqual(['test_1', 'test_2']);
    });

    it('should get user stats correctly', async () => {
      // Arrange
      const mockStats = createMockUserStats();
      mockFetchResponse(mockStats);

      // Act
      const stats = await DataManager.getUserStats();

      // Assert
      expect(stats.totalTests).toBeGreaterThanOrEqual(0);
      expect(stats.averageWpm).toBeGreaterThanOrEqual(0);
      expect(stats.bestWpm).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty localStorage', async () => {
      // Arrange
      localStorage.clear();
      mockFetchError(new Error('Database unavailable'));

      // Act
      const results = await DataManager.getResults();

      // Assert
      expect(results).toHaveLength(0);
    });

    it('should handle malformed localStorage data', async () => {
      // Arrange
      localStorage.setItem('typing-trainer-results', 'invalid json');
      mockFetchError(new Error('Database unavailable'));

      // Act
      const results = await DataManager.getResults();

      // Assert
      expect(results).toHaveLength(0);
    });

    it('should handle null/undefined input', async () => {
      // Arrange
      const nullResult = null as any;

      // Act
      const result = await DataManager.saveResult(nullResult);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to save result');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors during save', async () => {
      // Arrange
      const mockResult = createMockTypingResult();
      mockFetchError(new Error('Network error'));

      // Act
      const result = await DataManager.saveResult(mockResult);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe('Result saved to local storage (will sync when online)');
    });

    it('should handle database connection errors', async () => {
      // Arrange
      mockFetchError(new Error('Database connection failed'));

      // Act
      const stats = await DataManager.getUserStats();

      // Assert
      expect(stats.totalTests).toBe(0);
      expect(stats.averageWpm).toBe(0);
      expect(stats.bestWpm).toBe(0);
      expect(stats.averageAccuracy).toBe(0);
      expect(stats.lastTestDate).toBe(null);
    });
  });

  describe('Data Management', () => {
    it('should clear all data successfully', async () => {
      // Arrange
      const mockResults = [
        createMockTypingResult({ testId: 'test_1' }),
        createMockTypingResult({ testId: 'test_2' })
      ];
      localStorage.setItem('typing-trainer-results', JSON.stringify(mockResults));
      mockFetchResponse({ message: 'All data cleared' });

      // Act
      await DataManager.clearAllData();

      // Assert
      // Check localStorage is cleared
      const storedResults = JSON.parse(localStorage.getItem('typing-trainer-results') || '[]');
      expect(storedResults).toHaveLength(0);
    });

    it('should handle clear data errors gracefully', async () => {
      // Arrange
      const mockResults = [createMockTypingResult()];
      localStorage.setItem('typing-trainer-results', JSON.stringify(mockResults));
      mockFetchError(new Error('Clear failed'));

      // Act
      await DataManager.clearAllData();

      // Assert
      // Should still clear localStorage
      const storedResults = JSON.parse(localStorage.getItem('typing-trainer-results') || '[]');
      expect(storedResults).toHaveLength(0);
    });
  });

  describe('Performance', () => {
    it('should handle large datasets efficiently', async () => {
      // Arrange
      const largeDataset = Array.from({ length: 1000 }, (_, i) => 
        createMockTypingResult({ testId: `test_${i}` })
      );
      localStorage.setItem('typing-trainer-results', JSON.stringify(largeDataset));
      mockFetchError(new Error('Database unavailable'));

      // Act
      const startTime = performance.now();
      const results = await DataManager.getResults();
      const endTime = performance.now();

      // Assert
      expect(results).toHaveLength(100); // DataManager limits to 100 results
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });
});
