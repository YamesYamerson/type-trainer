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
  generateResultHash, 
  generateHashForResult, 
  areResultsDuplicate, 
  resultExists, 
  removeDuplicates,
  generateTestSessionId,
  areResultsFromSameSession
} from '../../src/utils/hashUtils';
import type { TypingResult } from '../../src/types';

describe('Hash Utils', () => {
  const mockResult: Omit<TypingResult, 'hash'> = {
    wpm: 50,
    accuracy: 95,
    errors: 2,
    totalCharacters: 100,
    correctCharacters: 95,
    timeElapsed: 120000,
    testId: 'test-123',
    category: 'lowercase',
    timestamp: Date.now()
  };

  describe('generateResultHash', () => {
    it('should generate unique hashes for identical results', () => {
      const result: Omit<TypingResult, 'hash'> = {
        testId: 'test-123',
        category: 'lowercase',
        wpm: 50,
        accuracy: 95,
        errors: 2,
        totalCharacters: 100,
        correctCharacters: 95,
        timeElapsed: 120000,
        timestamp: Date.now()
      };
      
      const hash1 = generateResultHash(result);
      const hash2 = generateResultHash(result);
      
      expect(hash1).toBeDefined();
      expect(hash2).toBeDefined();
      expect(hash1).not.toBe(hash2); // Should be different due to random component
    });

    it('should generate different hashes for different results', () => {
      const result1: Omit<TypingResult, 'hash'> = {
        testId: 'test-123',
        category: 'lowercase',
        wpm: 50,
        accuracy: 95,
        errors: 2,
        totalCharacters: 100,
        correctCharacters: 95,
        timeElapsed: 120000,
        timestamp: Date.now()
      };
      
      const result2: Omit<TypingResult, 'hash'> = {
        ...result1,
        wpm: 60
      };
      
      const hash1 = generateResultHash(result1);
      const hash2 = generateResultHash(result2);
      
      expect(hash1).not.toBe(hash2);
    });

    it('should generate different hashes for same results with different timestamps', () => {
      const result1 = { ...mockResult, timestamp: Date.now() };
      const result2 = { ...mockResult, timestamp: Date.now() + 1000 };
      
      const hash1 = generateResultHash(result1);
      const hash2 = generateResultHash(result2);
      
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('generateHashForResult', () => {
    it('should generate consistent hashes for identical parameters', () => {
      const timestamp = Date.now();
      const hash1 = generateHashForResult(
        'test-123', timestamp, 50, 95, 2, 100, 95, 120000
      );
      const hash2 = generateHashForResult(
        'test-123', timestamp, 50, 95, 2, 100, 95, 120000
      );
      
      expect(hash1).toBeDefined();
      expect(hash2).toBeDefined();
      expect(hash1).toBe(hash2); // Should be the same due to deterministic hashing
    });

    it('should generate different hashes for different parameters', () => {
      const timestamp = Date.now();
      const hash1 = generateHashForResult(
        'test-123', timestamp, 50, 95, 2, 100, 95, 120000
      );
      const hash2 = generateHashForResult(
        'test-123', timestamp, 60, 95, 2, 100, 95, 120000
      );
      
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('areResultsDuplicate', () => {
    it('should identify duplicate results by hash', () => {
      const result1: TypingResult = { ...mockResult, hash: 'abc123' };
      const result2: TypingResult = { ...mockResult, hash: 'abc123' };
      const result3: TypingResult = { ...mockResult, hash: 'def456' };
      
      expect(areResultsDuplicate(result1, result2)).toBe(true);
      expect(areResultsDuplicate(result1, result3)).toBe(false);
    });
  });

  describe('resultExists', () => {
    it('should check if result exists in array by hash', () => {
      const existingResults: TypingResult[] = [
        { ...mockResult, hash: 'abc123' },
        { ...mockResult, hash: 'def456' }
      ];
      
      const newResult1: TypingResult = { ...mockResult, hash: 'abc123' };
      const newResult2: TypingResult = { ...mockResult, hash: 'xyz789' };
      
      expect(resultExists(existingResults, newResult1)).toBe(true);
      expect(resultExists(existingResults, newResult2)).toBe(false);
    });
  });

  describe('removeDuplicates', () => {
    it('should remove duplicate results based on hash', () => {
      const results: TypingResult[] = [
        { ...mockResult, hash: 'abc123' },
        { ...mockResult, hash: 'def456' },
        { ...mockResult, hash: 'abc123' }, // Duplicate
        { ...mockResult, hash: 'xyz789' }
      ];
      
      const uniqueResults = removeDuplicates(results);
      
      expect(uniqueResults).toHaveLength(3);
      expect(uniqueResults.map(r => r.hash)).toEqual(['abc123', 'def456', 'xyz789']);
    });
  });

  describe('generateTestSessionId', () => {
    it('should generate unique session IDs', () => {
      const sessionId1 = generateTestSessionId();
      const sessionId2 = generateTestSessionId();
      
      expect(sessionId1).toBeDefined();
      expect(sessionId2).toBeDefined();
      expect(sessionId1).not.toBe(sessionId2);
      expect(sessionId1).toMatch(/^session_\d+_[a-z0-9]+$/);
      expect(sessionId2).toMatch(/^session_\d+_[a-z0-9]+$/);
    });
  });

  describe('areResultsFromSameSession', () => {
    it('should identify results from same session within time window', () => {
      const timestamp = Date.now();
      const result1: TypingResult = { ...mockResult, timestamp, hash: 'abc123' };
      const result2: TypingResult = { ...mockResult, timestamp: timestamp + 100000, hash: 'def456' }; // Within 5 min
      const result3: TypingResult = { ...mockResult, timestamp: timestamp + 400000, hash: 'xyz789' }; // Outside 5 min
      
      expect(areResultsFromSameSession(result1, result2)).toBe(true);
      expect(areResultsFromSameSession(result1, result3)).toBe(false);
    });

    it('should require same testId for session identification', () => {
      const timestamp = Date.now();
      const result1: TypingResult = { ...mockResult, testId: 'test-123', timestamp, hash: 'abc123' };
      const result2: TypingResult = { ...mockResult, testId: 'test-456', timestamp: timestamp + 100000, hash: 'def456' };
      
      expect(areResultsFromSameSession(result1, result2)).toBe(false);
    });
  });

  describe('Hash uniqueness stress test', () => {
    it('should generate unique hashes for many similar results', () => {
      const hashes = new Set<string>();
      const timestamp = Date.now();
      
      // Generate 100 hashes for very similar results
      for (let i = 0; i < 100; i++) {
        const result = {
          ...mockResult,
          timestamp: timestamp + i, // Slight timestamp difference
          wpm: 50 + (i % 5), // Slight WPM variation
          errors: i % 3 // Slight error variation
        };
        
        const hash = generateResultHash(result);
        hashes.add(hash);
      }
      
      // All hashes should be unique
      expect(hashes.size).toBe(100);
    });
  });
});
