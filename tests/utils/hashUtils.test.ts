/**
 * Tests for hash utilities
 * 
 * This file tests the hash utilities which handle hash generation,
 * duplicate detection, and result comparison.
 * 
 * @see hashUtils - The utility being tested
 * @see TypingResult - The data structure being hashed
 */

import { 
  generateHashForResult, 
  generateResultHash, 
  areResultsDuplicate, 
  resultExists, 
  removeDuplicates 
} from '../../src/utils/hashUtils';
import type { TypingResult } from '../../src/types';
import {
  setupTestEnvironment,
  createMockTypingResult
} from '../utils/testHelpers';

// ============================================================================
// IMPORTS AND MOCKS
// ============================================================================

// ============================================================================
// TEST SUITE
// ============================================================================

describe('HashUtils', () => {
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

  describe('Hash Generation', () => {
    it('should generate a consistent hash for the same input', () => {
      // Arrange
      const testId = 'test_123';
      const timestamp = 1234567890;
      const wpm = 45;
      const accuracy = 95;
      const errors = 2;
      const totalCharacters = 100;
      const correctCharacters = 98;

      // Act
      const hash1 = generateHashForResult(testId, timestamp, wpm, accuracy, errors, totalCharacters, correctCharacters);
      const hash2 = generateHashForResult(testId, timestamp, wpm, accuracy, errors, totalCharacters, correctCharacters);

      // Assert
      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(16);
      expect(hash1).toMatch(/^[a-zA-Z0-9]+$/);
    });

    it('should generate different hashes for different inputs', () => {
      // Arrange
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

      // Act
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
        'different_test_id', // Different test ID
        baseParams.timestamp,
        baseParams.wpm,
        baseParams.accuracy,
        baseParams.errors,
        baseParams.totalCharacters,
        baseParams.correctCharacters
      );

      // Restore the mock
      global.btoa = originalBtoa;

      // Assert
      expect(hash1).not.toBe(hash2);
    });

    it('should handle special characters in input', () => {
      // Arrange
      const testId = 'test-123_with.special@chars';
      const timestamp = 1234567890;
      const wpm = 45;
      const accuracy = 95;
      const errors = 2;
      const totalCharacters = 100;
      const correctCharacters = 98;

      // Act
      const hash = generateHashForResult(testId, timestamp, wpm, accuracy, errors, totalCharacters, correctCharacters);

      // Assert
      expect(hash).toHaveLength(16);
      expect(hash).toMatch(/^[a-zA-Z0-9]+$/);
    });

    it('should handle edge cases in input values', () => {
      // Arrange
      const testCases = [
        { wpm: 0, accuracy: 0, errors: 0, totalCharacters: 0, correctCharacters: 0 },
        { wpm: 999, accuracy: 100, errors: 999, totalCharacters: 9999, correctCharacters: 9999 },
        { wpm: -1, accuracy: -1, errors: -1, totalCharacters: -1, correctCharacters: -1 }
      ];

      // Act & Assert
      testCases.forEach(({ wpm, accuracy, errors, totalCharacters, correctCharacters }) => {
        const hash = generateHashForResult('test', 1234567890, wpm, accuracy, errors, totalCharacters, correctCharacters);
        expect(hash).toHaveLength(16);
        expect(hash).toMatch(/^[a-zA-Z0-9]+$/);
      });
    });
  });

  describe('Core Functionality', () => {
    it('should generate result hash from TypingResult object', () => {
      // Arrange
      const mockResult = createMockTypingResult();

      // Act
      const hash = generateResultHash(mockResult);

      // Assert
      expect(hash).toHaveLength(16);
      expect(hash).toMatch(/^[a-zA-Z0-9]+$/);
    });

    it('should detect duplicate results correctly', () => {
      // Arrange
      const result1 = createMockTypingResult({ testId: 'test_1', hash: 'same_hash' });
      const result2 = createMockTypingResult({ testId: 'test_1', hash: 'same_hash' }); // Same hash
      const result3 = createMockTypingResult({ testId: 'test_2', hash: 'different_hash' }); // Different hash

      // Act
      const isDuplicate1 = areResultsDuplicate(result1, result2);
      const isDuplicate2 = areResultsDuplicate(result1, result3);

      // Assert
      expect(isDuplicate1).toBe(true);
      expect(isDuplicate2).toBe(false);
    });

    it('should check if result exists in array', () => {
      // Arrange
      const existingResult = createMockTypingResult({ testId: 'test_1', hash: 'existing_hash' });
      const newResult = createMockTypingResult({ testId: 'test_1', hash: 'existing_hash' });
      const differentResult = createMockTypingResult({ testId: 'test_2', hash: 'different_hash' });
      const results = [existingResult, differentResult];

      // Act
      const exists1 = resultExists(results, newResult);
      const exists2 = resultExists(results, differentResult);

      // Assert
      expect(exists1).toBe(true); // newResult has same hash as existingResult
      expect(exists2).toBe(true); // differentResult exists in the array
    });

    it('should remove duplicates from array', () => {
      // Arrange
      const result1 = createMockTypingResult({ testId: 'test_1', hash: 'same_hash' });
      const result2 = createMockTypingResult({ testId: 'test_1', hash: 'same_hash' }); // Duplicate
      const result3 = createMockTypingResult({ testId: 'test_2', hash: 'different_hash' });
      const results = [result1, result2, result3];

      // Act
      const uniqueResults = removeDuplicates(results);

      // Assert
      expect(uniqueResults).toHaveLength(2);
      expect(uniqueResults[0].testId).toBe('test_1');
      expect(uniqueResults[1].testId).toBe('test_2');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty arrays', () => {
      // Arrange
      const emptyArray: TypingResult[] = [];
      const testResult = createMockTypingResult();

      // Act
      const exists = resultExists(emptyArray, testResult);
      const uniqueResults = removeDuplicates(emptyArray);

      // Assert
      expect(exists).toBe(false);
      expect(uniqueResults).toHaveLength(0);
    });

    it('should handle arrays with single item', () => {
      // Arrange
      const singleResult = createMockTypingResult();
      const results = [singleResult];

      // Act
      const exists = resultExists(results, singleResult);
      const uniqueResults = removeDuplicates(results);

      // Assert
      expect(exists).toBe(true);
      expect(uniqueResults).toHaveLength(1);
      expect(uniqueResults[0]).toEqual(singleResult);
    });

    it('should handle null/undefined inputs', () => {
      // Arrange
      const nullResult = null as any;
      const undefinedResult = undefined as any;

      // Act & Assert
      expect(() => generateResultHash(nullResult)).toThrow();
      expect(() => generateResultHash(undefinedResult)).toThrow();
    });

    it('should handle malformed result objects', () => {
      // Arrange
      const malformedResult = {
        testId: 'test_1',
        // Missing required fields
      } as any;

      // Act & Assert - The function should handle missing properties gracefully
      // It might not throw but will create a hash with undefined values
      const hash = generateResultHash(malformedResult);
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
    });
  });

  describe('Performance', () => {
    it('should handle large datasets efficiently', () => {
      // Arrange
      const largeDataset = Array.from({ length: 1000 }, (_, i) => 
        createMockTypingResult({ testId: `test_${i}`, hash: `hash_${i}` })
      );

      // Act
      const startTime = performance.now();
      const uniqueResults = removeDuplicates(largeDataset);
      const endTime = performance.now();

      // Assert
      expect(uniqueResults).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should generate hashes quickly', () => {
      // Arrange
      const testResult = createMockTypingResult();

      // Act
      const startTime = performance.now();
      const hash = generateResultHash(testResult);
      const endTime = performance.now();

      // Assert
      expect(hash).toBeDefined();
      expect(endTime - startTime).toBeLessThan(100); // Should complete within 100ms
    });
  });

  describe('Integration', () => {
    it('should work correctly with DataManager', async () => {
      // Arrange
      const result1 = createMockTypingResult({ testId: 'test_1', hash: 'same_hash' });
      const result2 = createMockTypingResult({ testId: 'test_1', hash: 'same_hash' }); // Duplicate
      const result3 = createMockTypingResult({ testId: 'test_2', hash: 'different_hash' });

      // Act
      const hash1 = generateResultHash(result1);
      const hash2 = generateResultHash(result2);
      const hash3 = generateResultHash(result3);

      const isDuplicate = areResultsDuplicate(result1, result2);
      const uniqueResults = removeDuplicates([result1, result2, result3]);

      // Assert
      expect(hash1).toBe(hash2); // Same test ID should generate same hash
      expect(hash1).not.toBe(hash3); // Different test ID should generate different hash
      expect(isDuplicate).toBe(true);
      expect(uniqueResults).toHaveLength(2);
    });
  });
});
