/**
 * Integration tests for hash-based duplicate prevention system
 * Consolidates functionality from test-hash-system.js, test-category-filtering.js, and test-frontend-hash.js
 */

import { DataManager } from '../../src/utils/dataManager';
import { generateHashForResult, areResultsDuplicate, removeDuplicates } from '../../src/utils/hashUtils';
import type { TypingResult } from '../../src/types';

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

describe('Hash System Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    (fetch as jest.Mock).mockClear();
  });

  describe('Hash Generation and Duplicate Prevention', () => {
    it('should generate consistent hashes for the same input', () => {
      const testId = 'test_123';
      const timestamp = 1234567890;
      const wpm = 45;
      const accuracy = 95;
      const errors = 2;
      const totalCharacters = 100;
      const correctCharacters = 98;

      const hash1 = generateHashForResult(testId, timestamp, wpm, accuracy, errors, totalCharacters, correctCharacters);
      const hash2 = generateHashForResult(testId, timestamp, wpm, accuracy, errors, totalCharacters, correctCharacters);

      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(16);
      expect(hash1).toMatch(/^[a-zA-Z0-9]+$/);
    });

    it('should generate different hashes for different inputs', () => {
      const baseParams = {
        testId: 'test_123',
        timestamp: 1234567890,
        wpm: 45,
        accuracy: 95,
        errors: 2,
        totalCharacters: 100,
        correctCharacters: 98
      };

      const hash1 = generateHashForResult(
        baseParams.testId,
        baseParams.timestamp,
        baseParams.wpm,
        baseParams.accuracy,
        baseParams.errors,
        baseParams.totalCharacters,
        baseParams.correctCharacters
      );

      const hash2 = generateHashForResult(
        baseParams.testId,
        baseParams.timestamp,
        baseParams.wpm + 1, // Different WPM
        baseParams.accuracy,
        baseParams.errors,
        baseParams.totalCharacters,
        baseParams.correctCharacters
      );

      expect(hash1).not.toBe(hash2);
    });

    it('should handle special characters in input', () => {
      const hash = generateHashForResult(
        'test-123_with.special@chars',
        1234567890,
        45,
        95,
        2,
        100,
        98
      );

      expect(hash).toHaveLength(16);
      expect(hash).toMatch(/^[a-zA-Z0-9]+$/);
    });
  });

  describe('Duplicate Detection', () => {
    it('should detect duplicate results based on hash', () => {
      const result1: TypingResult = {
        testId: 'test_123',
        timestamp: 1234567890,
        wpm: 45,
        accuracy: 95,
        errors: 2,
        totalCharacters: 100,
        correctCharacters: 98,
        category: 'lowercase',
        timeElapsed: 80000,
        hash: 'same_hash_123'
      };

      const result2: TypingResult = {
        ...result1,
        timestamp: 1234567891 // Different timestamp but same hash
      };

      expect(areResultsDuplicate(result1, result2)).toBe(true);
    });

    it('should not detect duplicates for different hashes', () => {
      const result1: TypingResult = {
        testId: 'test_123',
        timestamp: 1234567890,
        wpm: 45,
        accuracy: 95,
        errors: 2,
        totalCharacters: 100,
        correctCharacters: 98,
        category: 'lowercase',
        timeElapsed: 80000,
        hash: 'hash_1'
      };

      const result2: TypingResult = {
        ...result1,
        hash: 'hash_2'
      };

      expect(areResultsDuplicate(result1, result2)).toBe(false);
    });
  });

  describe('DataManager Integration', () => {
    it('should save results with hash and prevent duplicates', async () => {
      const mockResult: TypingResult = {
        testId: 'test_123',
        timestamp: Date.now(),
        wpm: 45,
        accuracy: 95,
        errors: 2,
        totalCharacters: 100,
        correctCharacters: 98,
        category: 'lowercase',
        timeElapsed: 80000,
        hash: 'test_hash_123'
      };

      // Mock successful database save
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, message: 'Result saved successfully' })
      });

      const result = await DataManager.saveResult(mockResult);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Result saved successfully');
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/results',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mockResult)
        })
      );

      // Check localStorage
      const storedResults = JSON.parse(localStorage.getItem('typing-trainer-results') || '[]');
      expect(storedResults).toHaveLength(1);
      expect(storedResults[0].hash).toBe(mockResult.hash);
    });

    it('should handle duplicate submission gracefully', async () => {
      const mockResult: TypingResult = {
        testId: 'test_123',
        timestamp: Date.now(),
        wpm: 45,
        accuracy: 95,
        errors: 2,
        totalCharacters: 100,
        correctCharacters: 98,
        category: 'lowercase',
        timeElapsed: 80000,
        hash: 'existing_hash'
      };

      // Mock duplicate response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, message: 'Result already exists', duplicate: true })
      });

      const result = await DataManager.saveResult(mockResult);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Result already exists');
    });
  });

  describe('Category Filtering', () => {
    it('should filter results by category correctly', async () => {
      const mockResults: TypingResult[] = [
        {
          testId: 'test_1',
          timestamp: Date.now(),
          wpm: 45,
          accuracy: 95,
          errors: 2,
          totalCharacters: 100,
          correctCharacters: 98,
          category: 'lowercase',
          timeElapsed: 80000,
          hash: 'hash_1'
        },
        {
          testId: 'test_2',
          timestamp: Date.now() + 1000,
          wpm: 50,
          accuracy: 90,
          errors: 3,
          totalCharacters: 120,
          correctCharacters: 108,
          category: 'punctuation',
          timeElapsed: 90000,
          hash: 'hash_2'
        },
        {
          testId: 'test_3',
          timestamp: Date.now() + 2000,
          wpm: 35,
          accuracy: 85,
          errors: 4,
          totalCharacters: 150,
          correctCharacters: 128,
          category: 'code',
          timeElapsed: 100000,
          hash: 'hash_3'
        }
      ];

      // Mock successful database fetch
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResults
      });

      const results = await DataManager.getResults(100);

      // Test category filtering
      const lowercaseResults = results.filter(r => r.category === 'lowercase');
      const punctuationResults = results.filter(r => r.category === 'punctuation');
      const codeResults = results.filter(r => r.category === 'code');

      expect(lowercaseResults).toHaveLength(1);
      expect(punctuationResults).toHaveLength(1);
      expect(codeResults).toHaveLength(1);

      expect(lowercaseResults[0].testId).toBe('test_1');
      expect(punctuationResults[0].testId).toBe('test_2');
      expect(codeResults[0].testId).toBe('test_3');
    });

    it('should calculate category-specific statistics', async () => {
      const mockResults: TypingResult[] = [
        {
          testId: 'test_1',
          timestamp: Date.now(),
          wpm: 40,
          accuracy: 90,
          errors: 2,
          totalCharacters: 100,
          correctCharacters: 90,
          category: 'lowercase',
          timeElapsed: 80000,
          hash: 'hash_1'
        },
        {
          testId: 'test_2',
          timestamp: Date.now() + 1000,
          wpm: 50,
          accuracy: 95,
          errors: 1,
          totalCharacters: 120,
          correctCharacters: 114,
          category: 'lowercase',
          timeElapsed: 90000,
          hash: 'hash_2'
        }
      ];

      // Calculate statistics
      const categoryResults = mockResults.filter(r => r.category === 'lowercase');
      const avgWpm = Math.round(categoryResults.reduce((sum, r) => sum + r.wpm, 0) / categoryResults.length);
      const avgAccuracy = Math.round(categoryResults.reduce((sum, r) => sum + r.accuracy, 0) / categoryResults.length);
      const bestWpm = Math.max(...categoryResults.map(r => r.wpm));

      expect(avgWpm).toBe(45);
      expect(avgAccuracy).toBe(93);
      expect(bestWpm).toBe(50);
    });
  });

  describe('Duplicate Removal', () => {
    it('should remove duplicate results based on hash', () => {
      const results: TypingResult[] = [
        {
          testId: 'test_1',
          timestamp: Date.now(),
          wpm: 45,
          accuracy: 95,
          errors: 2,
          totalCharacters: 100,
          correctCharacters: 98,
          category: 'lowercase',
          timeElapsed: 80000,
          hash: 'hash_1'
        },
        {
          testId: 'test_2',
          timestamp: Date.now() + 1000,
          wpm: 50,
          accuracy: 90,
          errors: 3,
          totalCharacters: 120,
          correctCharacters: 108,
          category: 'punctuation',
          timeElapsed: 90000,
          hash: 'hash_1' // Duplicate hash
        },
        {
          testId: 'test_3',
          timestamp: Date.now() + 2000,
          wpm: 55,
          accuracy: 85,
          errors: 4,
          totalCharacters: 150,
          correctCharacters: 128,
          category: 'code',
          timeElapsed: 100000,
          hash: 'hash_2'
        }
      ];

      const uniqueResults = removeDuplicates(results);
      expect(uniqueResults).toHaveLength(2);
      expect(uniqueResults.map(r => r.hash)).toEqual(['hash_1', 'hash_2']);
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection failures gracefully', async () => {
      // Mock failed database connection
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Database connection failed'));

      const results = await DataManager.getResults(10);
      expect(results).toEqual([]);
    });

    it('should handle localStorage failures gracefully', async () => {
      // Mock localStorage failure
      const originalGetItem = localStorage.getItem;
      localStorage.getItem = jest.fn(() => null);

      const results = await DataManager.getResults(10);
      expect(results).toEqual([]);

      localStorage.getItem = originalGetItem;
    });
  });

  describe('Performance', () => {
    it('should handle large datasets efficiently', () => {
      const largeResults: TypingResult[] = Array.from({ length: 1000 }, (_, i) => ({
        testId: `test_${i}`,
        timestamp: Date.now() + i,
        wpm: 40 + (i % 20),
        accuracy: 85 + (i % 15),
        errors: i % 5,
        totalCharacters: 100 + (i % 50),
        correctCharacters: 90 + (i % 40),
        category: ['lowercase', 'punctuation', 'code', 'data_entry'][i % 4] as any,
        timeElapsed: 80000 + (i * 100),
        hash: `hash_${i}`
      }));

      const startTime = Date.now();
      const uniqueResults = removeDuplicates(largeResults);
      const endTime = Date.now();

      expect(uniqueResults).toHaveLength(1000); // All should be unique
      expect(endTime - startTime).toBeLessThan(100); // Should complete quickly
    });
  });
});
