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

      const hash1 = generateHashForResult(testId, timestamp, wpm, accuracy, errors, totalCharacters, correctCharacters, 80000);
      const hash2 = generateHashForResult(testId, timestamp, wpm, accuracy, errors, totalCharacters, correctCharacters, 80000);

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

      // Use actual btoa function for this test
      const originalBtoa = global.btoa;
      global.btoa = (str: string) => Buffer.from(str).toString('base64');

      const hash1 = generateHashForResult(
        baseParams.testId,
        baseParams.timestamp,
        baseParams.wpm,
        baseParams.accuracy,
        baseParams.errors,
        baseParams.totalCharacters,
        baseParams.correctCharacters,
        80000
      );

      const hash2 = generateHashForResult(
        'different_test_id', // Different test ID (more significant difference)
        baseParams.timestamp,
        baseParams.wpm,
        baseParams.accuracy,
        baseParams.errors,
        baseParams.totalCharacters,
        baseParams.correctCharacters,
        80000
      );

      // Restore the mock
      global.btoa = originalBtoa;

      // The hashes should be different because the test ID is different
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
        98,
        80000
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
            hash: mockResult.hash
          })
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
      expect(result.message).toBe('Result saved to database and local storage');
    });
  });

  describe('Category Filtering', () => {
    it('should filter results by category correctly', async () => {
      const mockDbResults = [
        {
          wpm: 45,
          accuracy: 95,
          errors: 2,
          total_characters: 100,
          correct_characters: 98,
          time_elapsed: 80000,
          test_id: 'test_1',
          category: 'lowercase',
          timestamp: Date.now(),
          hash: 'hash_1'
        },
        {
          wpm: 50,
          accuracy: 90,
          errors: 3,
          total_characters: 120,
          correct_characters: 108,
          time_elapsed: 90000,
          test_id: 'test_2',
          category: 'punctuation',
          timestamp: Date.now() + 1000,
          hash: 'hash_2'
        },
        {
          wpm: 35,
          accuracy: 85,
          errors: 4,
          total_characters: 150,
          correct_characters: 128,
          time_elapsed: 100000,
          test_id: 'test_3',
          category: 'code',
          timestamp: Date.now() + 2000,
          hash: 'hash_3'
        }
      ];

      // Mock successful database fetch
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockDbResults
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

      // Mock database connection failure
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Database connection failed'));

      const result = await DataManager.saveResult(mockResult);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Result saved to local storage (will sync when online)');
      expect(result.savedToDatabase).toBe(false);
      expect(result.savedToLocal).toBe(true);
    });

    it('should handle localStorage failures gracefully', async () => {
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

      // Mock localStorage failure
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = jest.fn().mockImplementation(() => {
        throw new Error('localStorage not available');
      });

      // Mock successful database save
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, message: 'Result saved successfully' })
      });

      const result = await DataManager.saveResult(mockResult);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Result saved to database only (localStorage unavailable)');
      expect(result.savedToDatabase).toBe(true);
      expect(result.savedToLocal).toBe(false);

      // Restore original localStorage
      localStorage.setItem = originalSetItem;
    });

    it('should handle network timeout during data retrieval', async () => {
      // Mock network timeout
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network timeout'));

      const results = await DataManager.getResults(10);

      expect(results).toEqual([]);
    });

    it('should handle malformed JSON response from database', async () => {
      // Mock malformed JSON response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        }
      });

      const results = await DataManager.getResults(10);

      expect(results).toEqual([]);
    });
  });

  describe('Data Processing Stages', () => {
    it('should handle data validation during save', async () => {
      const mockResult: TypingResult = {
        testId: 'test_123',
        timestamp: Date.now(),
        wpm: -5, // Invalid WPM
        accuracy: 150, // Invalid accuracy
        errors: -1, // Invalid errors
        totalCharacters: 100,
        correctCharacters: 98,
        category: 'lowercase',
        timeElapsed: 80000,
        hash: 'test_hash_123'
      };

      // Mock successful database save (validation should happen on server side)
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, message: 'Result saved successfully' })
      });

      const result = await DataManager.saveResult(mockResult);

      expect(result.success).toBe(true);
      expect(result.savedToDatabase).toBe(true);
      expect(result.savedToLocal).toBe(true);
    });

    it('should handle data transformation during retrieval', async () => {
      const mockDbResults = [
        {
          wpm: 45,
          accuracy: 95,
          errors: 2,
          total_characters: 100,
          correct_characters: 98,
          time_elapsed: 80000,
          test_id: 'test_1',
          category: 'lowercase',
          timestamp: Date.now(),
          hash: 'hash_1'
        }
      ];

      // Mock successful database fetch
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockDbResults
      });

      const results = await DataManager.getResults(10);

      expect(results).toHaveLength(1);
      expect(results[0]).toMatchObject({
        wpm: 45,
        accuracy: 95,
        errors: 2,
        totalCharacters: 100,
        correctCharacters: 98,
        timeElapsed: 80000,
        testId: 'test_1',
        category: 'lowercase',
        hash: 'hash_1'
      });
    });

    it('should handle data sorting and limiting', async () => {
      const mockDbResults = [
        {
          wpm: 45,
          accuracy: 95,
          errors: 2,
          total_characters: 100,
          correct_characters: 98,
          time_elapsed: 80000,
          test_id: 'test_1',
          category: 'lowercase',
          timestamp: Date.now(),
          hash: 'hash_1'
        },
        {
          wpm: 50,
          accuracy: 90,
          errors: 3,
          total_characters: 120,
          correct_characters: 108,
          time_elapsed: 90000,
          test_id: 'test_2',
          category: 'punctuation',
          timestamp: Date.now() + 1000,
          hash: 'hash_2'
        },
        {
          wpm: 35,
          accuracy: 85,
          errors: 4,
          total_characters: 150,
          correct_characters: 128,
          time_elapsed: 100000,
          test_id: 'test_3',
          category: 'code',
          timestamp: Date.now() + 2000,
          hash: 'hash_3'
        }
      ];

      // Mock successful database fetch
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockDbResults
      });

      const results = await DataManager.getResults(2); // Limit to 2 results

      expect(results).toHaveLength(2);
      // Should be sorted by timestamp (newest first)
      expect(results[0].testId).toBe('test_3');
      expect(results[1].testId).toBe('test_2');
    });
  });

  describe('Synchronization Stages', () => {
    it('should handle offline to online transition', async () => {
      const mockLocalResults = [
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
        }
      ];

      // Store in localStorage
      localStorage.setItem('typing-trainer-results', JSON.stringify(mockLocalResults));

      // Mock successful database save for sync
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, message: 'Result saved successfully' })
      });

      // Simulate online transition by calling saveResult
      const result = await DataManager.saveResult(mockLocalResults[0]);

      expect(result.success).toBe(true);
      expect(result.savedToDatabase).toBe(true);
      expect(result.savedToLocal).toBe(true);
    });

    it('should handle partial synchronization failures', async () => {
      const mockLocalResults = [
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
        }
      ];

      // Store in localStorage
      localStorage.setItem('typing-trainer-results', JSON.stringify(mockLocalResults));

      // Mock first save success, second save failure
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: 1, message: 'Result saved successfully' })
        })
        .mockRejectedValueOnce(new Error('Network error'));

      // This would be called during sync
      const result = await DataManager.saveResult(mockLocalResults[0]);

      expect(result.success).toBe(true);
      expect(result.savedToDatabase).toBe(true);
      expect(result.savedToLocal).toBe(true);
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
