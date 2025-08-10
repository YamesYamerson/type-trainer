/**
 * Integration tests for interstitial stages of data transfer and processing
 * Tests the intermediate steps in data flow, synchronization, and error handling
 * 
 * Structure:
 * 1. Discrete stage tests (individual components)
 * 2. Stage integration tests (how stages work together)
 * 3. End-to-end tests (full data flow)
 */

import { DataManager } from '../../src/utils/dataManager';
import { generateHashForResult } from '../../src/utils/hashUtils';
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

describe('Data Transfer and Processing Stages', () => {
  beforeEach(() => {
    // Reset localStorage mock instead of clearing it
    (localStorage as any)._reset();
    // Reset all mocks to ensure clean state between tests
    jest.resetAllMocks();
    // Mock navigator.onLine to be true
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true
    });
    // Reset DataManager's online status
    DataManager.setOnlineStatus(true);
  });

  afterEach(() => {
    // Clean up all mocks and reset state
    jest.clearAllMocks();
    jest.resetAllMocks();
    // Reset localStorage mock instead of clearing it
    (localStorage as any)._reset();
    // Reset DataManager's online status
    DataManager.setOnlineStatus(true);
  });

  // ============================================================================
  // DISCRETE STAGE TESTS - Testing individual components in isolation
  // ============================================================================

  describe('Stage 1: Data Preparation', () => {
    describe('Hash Generation', () => {
      it('should generate hash when not provided', async () => {
        const mockResult = {
          testId: 'test_123',
          timestamp: Date.now(),
          wpm: 45,
          accuracy: 95,
          errors: 2,
          totalCharacters: 100,
          correctCharacters: 98,
          category: 'lowercase' as const,
          timeElapsed: 80000
        } as Omit<TypingResult, 'hash'> & { hash?: string };

        // Mock successful database save
        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: 1, message: 'Result saved successfully' })
        });

        const result = await DataManager.saveResult(mockResult as TypingResult);

        expect(result.success).toBe(true);
        expect(mockResult.hash).toBeDefined();
        expect(mockResult.hash).toHaveLength(16);
        expect(mockResult.hash).toMatch(/^[a-zA-Z0-9]+$/);
      });

      it('should preserve existing hash when provided', async () => {
        const existingHash = 'existing_hash_123';
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
          hash: existingHash
        };

        // Mock successful database save
        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: 1, message: 'Result saved successfully' })
        });

        const result = await DataManager.saveResult(mockResult);

        expect(result.success).toBe(true);
        expect(mockResult.hash).toBe(existingHash);
      });

      it('should generate consistent hashes for same input', () => {
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
      });
    });

    describe('Data Validation', () => {
      it('should validate required fields are present', async () => {
        const mockResult = {
          testId: 'test_123',
          timestamp: Date.now(),
          wpm: 45,
          accuracy: 95,
          errors: 2,
          totalCharacters: 100,
          correctCharacters: 98,
          category: 'lowercase' as const,
          timeElapsed: 80000,
          hash: 'test_hash_123'
        } as TypingResult;

        // Mock successful database save
        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: 1, message: 'Result saved successfully' })
        });

        const result = await DataManager.saveResult(mockResult);

        expect(result.success).toBe(true);
        expect(fetch).toHaveBeenCalledWith(
          'http://localhost:3001/api/results',
          expect.objectContaining({
            body: expect.stringContaining('"testId":"test_123"')
          })
        );
      });

      it('should handle missing optional fields gracefully', async () => {
        const mockResult = {
          testId: 'test_123',
          timestamp: Date.now(),
          wpm: 45,
          accuracy: 95,
          errors: 2,
          totalCharacters: 100,
          correctCharacters: 98,
          category: 'lowercase' as const,
          timeElapsed: 80000,
          hash: 'test_hash_123'
        } as TypingResult;

        // Mock successful database save
        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: 1, message: 'Result saved successfully' })
        });

        const result = await DataManager.saveResult(mockResult);

        expect(result.success).toBe(true);
        expect(result.savedToDatabase).toBe(true);
        expect(result.savedToLocal).toBe(true);
      });
    });
  });

  describe('Stage 2: Database Communication', () => {
    describe('Network Connectivity', () => {
      it('should detect online status correctly', async () => {
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
        expect(result.savedToDatabase).toBe(true);
        expect(fetch).toHaveBeenCalledTimes(1);
      });

      it('should handle offline status gracefully', async () => {
        // Mock offline status
        Object.defineProperty(navigator, 'onLine', {
          writable: true,
          value: false
        });

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

        const result = await DataManager.saveResult(mockResult);

        expect(result.success).toBe(true);
        expect(result.savedToDatabase).toBe(false);
        expect(result.savedToLocal).toBe(true);
        expect(result.message).toBe('Result saved to local storage (will sync when online)');
      });
    });

    describe('HTTP Response Handling', () => {
      it('should handle successful response (200)', async () => {
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

        // Mock successful response
        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ id: 1, message: 'Result saved successfully' })
        });

        const result = await DataManager.saveResult(mockResult);

        expect(result.success).toBe(true);
        expect(result.savedToDatabase).toBe(true);
        expect(result.message).toBe('Result saved to database and local storage');
      });

      it('should handle server error (500)', async () => {
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

        // Mock server error
        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error'
        });

        const result = await DataManager.saveResult(mockResult);

        expect(result.success).toBe(true);
        expect(result.savedToDatabase).toBe(false);
        expect(result.savedToLocal).toBe(true);
        expect(result.message).toBe('Result saved to local storage (will sync when online)');
      });

      it('should handle validation error (400)', async () => {
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

        // Mock validation error
        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 400,
          statusText: 'Bad Request',
          json: async () => ({ error: 'Invalid data format' })
        });

        const result = await DataManager.saveResult(mockResult);

        expect(result.success).toBe(true);
        expect(result.savedToDatabase).toBe(false);
        expect(result.savedToLocal).toBe(true);
        expect(result.message).toBe('Result saved to local storage (will sync when online)');
      });
    });

    describe('Network Error Handling', () => {
      it('should handle network timeout', async () => {
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

        // Mock network timeout
        (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network timeout'));

        const result = await DataManager.saveResult(mockResult);

        expect(result.success).toBe(true);
        expect(result.savedToDatabase).toBe(false);
        expect(result.savedToLocal).toBe(true);
        expect(result.message).toBe('Result saved to local storage (will sync when online)');
      });

      it('should handle connection refused', async () => {
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

        // Mock connection refused
        (fetch as jest.Mock).mockRejectedValueOnce(new Error('ECONNREFUSED'));

        const result = await DataManager.saveResult(mockResult);

        expect(result.success).toBe(true);
        expect(result.savedToDatabase).toBe(false);
        expect(result.savedToLocal).toBe(true);
        expect(result.message).toBe('Result saved to local storage (will sync when online)');
      });
    });
  });

  describe('Stage 3: Local Storage', () => {
    describe('Storage Operations', () => {
      it('should save data to localStorage successfully', async () => {
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
        expect(result.savedToLocal).toBe(true);

        // Verify data is in localStorage
        const storedResults = JSON.parse(localStorage.getItem('typing-trainer-results') || '[]');
        expect(storedResults).toHaveLength(1);
        expect(storedResults[0].hash).toBe(mockResult.hash);
      });

      it('should handle localStorage quota exceeded', async () => {
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

        // Mock localStorage quota exceeded
        (localStorage as any)._simulateError('QuotaExceededError');

        // Mock successful database save
        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: 1, message: 'Result saved successfully' })
        });

        const result = await DataManager.saveResult(mockResult);

        expect(result.success).toBe(true);
        expect(result.savedToDatabase).toBe(true);
        expect(result.savedToLocal).toBe(false); // localStorage quota exceeded, so this should be false

        // Clear error simulation
        (localStorage as any)._clearError();
      });

      it('should handle localStorage corruption', async () => {
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

        // Mock corrupted localStorage
        localStorage.setItem('typing-trainer-results', 'invalid json');

        // Mock successful database save
        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: 1, message: 'Result saved successfully' })
        });

        const result = await DataManager.saveResult(mockResult);

        expect(result.success).toBe(true);
        expect(result.savedToDatabase).toBe(true);
        expect(result.savedToLocal).toBe(true);
      });
    });

    describe('Data Retrieval', () => {
      it('should retrieve data from localStorage when database is unavailable', async () => {
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

        // Mock database failure
        (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

        const results = await DataManager.getResults(10);

        expect(results).toHaveLength(1);
        expect(results[0].hash).toBe('hash_1');
      });

      it('should handle empty localStorage gracefully', async () => {
        // Mock database failure
        (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

        const results = await DataManager.getResults(10);

        expect(results).toEqual([]);
      });
    });
  });

  describe('Stage 4: Data Transformation', () => {
    describe('Database Format Conversion', () => {
      it('should transform database format to application format', async () => {
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

      it('should handle malformed database response', async () => {
        const malformedDbResults = [
          {
            wpm: 45,
            accuracy: 95,
            errors: 2,
            // Missing required fields
            test_id: 'test_1',
            category: 'lowercase',
            timestamp: Date.now(),
            hash: 'hash_1'
          }
        ];

        // Mock successful database fetch with malformed data
        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => malformedDbResults
        });

        const results = await DataManager.getResults(10);

        expect(results).toHaveLength(1);
        expect(results[0].wpm).toBe(45);
        expect(results[0].accuracy).toBe(95);
        expect(results[0].errors).toBe(2);
        expect(results[0].totalCharacters).toBeUndefined();
        expect(results[0].correctCharacters).toBeUndefined();
        expect(results[0].timeElapsed).toBeUndefined();
      });
    });

    describe('Data Sorting and Limiting', () => {
      it('should sort results by timestamp (newest first)', async () => {
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
          }
        ];

        // Mock successful database fetch
        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockDbResults
        });

        const results = await DataManager.getResults(10);

        expect(results).toHaveLength(2);
        // Should be sorted by timestamp (newest first)
        expect(results[0].testId).toBe('test_2');
        expect(results[1].testId).toBe('test_1');
      });

      it('should limit results correctly', async () => {
        const mockDbResults = Array.from({ length: 10 }, (_, i) => ({
          wpm: 45 + i,
          accuracy: 95,
          errors: 2,
          total_characters: 100,
          correct_characters: 98,
          time_elapsed: 80000,
          test_id: `test_${i}`,
          category: 'lowercase',
          timestamp: Date.now() + i,
          hash: `hash_${i}`
        }));

        // Mock successful database fetch
        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockDbResults
        });

        const results = await DataManager.getResults(5); // Limit to 5 results

        expect(results).toHaveLength(5);
        expect(results[0].testId).toBe('test_9'); // Newest first
        expect(results[4].testId).toBe('test_5');
      });
    });
  });

  // ============================================================================
  // STAGE INTEGRATION TESTS - Testing how stages work together
  // ============================================================================

  describe('Stage Integration Tests', () => {
    describe('Data Preparation + Database Communication', () => {
      it('should handle complete save flow with hash generation', async () => {
        const mockResult = {
          testId: 'test_123',
          timestamp: Date.now(),
          wpm: 45,
          accuracy: 95,
          errors: 2,
          totalCharacters: 100,
          correctCharacters: 98,
          category: 'lowercase' as const,
          timeElapsed: 80000
        } as Omit<TypingResult, 'hash'> & { hash?: string };

        // Mock successful database save
        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: 1, message: 'Result saved successfully' })
        });

        const result = await DataManager.saveResult(mockResult as TypingResult);

        expect(result.success).toBe(true);
        expect(result.savedToDatabase).toBe(true);
        expect(result.savedToLocal).toBe(true);
        expect(mockResult.hash).toBeDefined();
        expect(fetch).toHaveBeenCalledTimes(1);
      });
    });

    describe('Database Communication + Local Storage', () => {
      it('should fallback to localStorage when database fails', async () => {
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

        // Mock database failure
        (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

        const result = await DataManager.saveResult(mockResult);

        expect(result.success).toBe(true);
        expect(result.savedToDatabase).toBe(false);
        expect(result.savedToLocal).toBe(true);
        expect(result.message).toBe('Result saved to local storage (will sync when online)');

        // Verify data is in localStorage
        const storedResults = JSON.parse(localStorage.getItem('typing-trainer-results') || '[]');
        expect(storedResults).toHaveLength(1);
        expect(storedResults[0].hash).toBe(mockResult.hash);
      });
    });

    describe('Data Transformation + Retrieval', () => {
      it('should handle complete retrieval flow with transformation', async () => {
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
    });
  });

  // ============================================================================
  // END-TO-END TESTS - Testing complete data flow
  // ============================================================================

  describe('End-to-End Tests', () => {
    it('should handle complete data flow: save -> retrieve -> transform', async () => {
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

      // Save the result
      const saveResult = await DataManager.saveResult(mockResult);
      expect(saveResult.success).toBe(true);
      expect(saveResult.savedToDatabase).toBe(true);
      expect(saveResult.savedToLocal).toBe(true);

      // Mock successful database retrieval
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [{
          wpm: 45,
          accuracy: 95,
          errors: 2,
          total_characters: 100,
          correct_characters: 98,
          time_elapsed: 80000,
          test_id: 'test_123',
          category: 'lowercase',
          timestamp: mockResult.timestamp,
          hash: 'test_hash_123'
        }]
      });

      // Retrieve the results
      const retrievedResults = await DataManager.getResults(10);
      expect(retrievedResults).toHaveLength(1);
      expect(retrievedResults[0].testId).toBe('test_123');
      expect(retrievedResults[0].hash).toBe('test_hash_123');
    });

    it('should handle error recovery in complete flow', async () => {
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

      // Mock database failure during save
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      // Save should fallback to localStorage
      const saveResult = await DataManager.saveResult(mockResult);
      expect(saveResult.success).toBe(true);
      expect(saveResult.savedToDatabase).toBe(false);
      expect(saveResult.savedToLocal).toBe(true);

      // Mock database failure during retrieval
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      // Retrieval should fallback to localStorage
      const retrievedResults = await DataManager.getResults(10);
      expect(retrievedResults).toHaveLength(1);
      expect(retrievedResults[0].hash).toBe('test_hash_123');
    });
  });

  // ============================================================================
  // EDGE CASE TESTS - Testing common edge cases and error conditions
  // ============================================================================

  describe('Edge Cases and Error Conditions', () => {
    describe('Off-by-One Errors', () => {
      it('should handle limit of 0 correctly', async () => {
        // Mock successful database fetch
        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => []
        });

        const results = await DataManager.getResults(0);
        expect(results).toEqual([]);
      });

      it('should handle limit of 1 correctly', async () => {
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
          }
        ];

        // Mock successful database fetch
        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockDbResults
        });

        const results = await DataManager.getResults(1);
        expect(results).toHaveLength(1);
        expect(results[0].testId).toBe('test_2'); // Newest first
      });

      it('should handle array bounds correctly when limiting', async () => {
        const mockDbResults = Array.from({ length: 5 }, (_, i) => ({
          wpm: 45 + i,
          accuracy: 95,
          errors: 2,
          total_characters: 100,
          correct_characters: 98,
          time_elapsed: 80000,
          test_id: `test_${i}`,
          category: 'lowercase',
          timestamp: Date.now() + i,
          hash: `hash_${i}`
        }));

        // Mock successful database fetch
        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockDbResults
        });

        const results = await DataManager.getResults(3);
        expect(results).toHaveLength(3);
        expect(results[0].testId).toBe('test_4'); // Newest first
        expect(results[2].testId).toBe('test_2');
      });
    });

    describe('Data Mismatches', () => {
      it('should handle mismatched data types gracefully', async () => {
        const malformedDbResults = [
          {
            wpm: '45', // String instead of number
            accuracy: '95', // String instead of number
            errors: '2', // String instead of number
            total_characters: '100', // String instead of number
            correct_characters: '98', // String instead of number
            time_elapsed: '80000', // String instead of number
            test_id: 'test_1',
            category: 'lowercase',
            timestamp: Date.now(),
            hash: 'hash_1'
          }
        ];

        // Mock successful database fetch with malformed data
        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => malformedDbResults
        });

        const results = await DataManager.getResults(10);
        expect(results).toHaveLength(1);
        // DataManager doesn't do type conversion, so strings remain strings
        expect(typeof results[0].wpm).toBe('string');
        expect(typeof results[0].accuracy).toBe('string');
      });

      it('should handle missing required fields with defaults', async () => {
        const incompleteDbResults = [
          {
            // Missing wpm, accuracy, errors
            test_id: 'test_1',
            category: 'lowercase',
            timestamp: Date.now(),
            hash: 'hash_1'
          }
        ];

        // Mock successful database fetch with incomplete data
        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => incompleteDbResults
        });

        const results = await DataManager.getResults(10);
        expect(results).toHaveLength(1);
        expect(results[0].testId).toBe('test_1');
        expect(results[0].wpm).toBeUndefined();
        expect(results[0].accuracy).toBeUndefined();
        expect(results[0].errors).toBeUndefined();
      });

      it('should handle null and undefined values', async () => {
        const nullDbResults = [
          {
            wpm: null,
            accuracy: undefined,
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

        // Mock successful database fetch with null/undefined data
        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => nullDbResults
        });

        const results = await DataManager.getResults(10);
        expect(results).toHaveLength(1);
        expect(results[0].wpm).toBeNull();
        expect(results[0].accuracy).toBeUndefined();
      });
    });

    describe('Memory and Performance Edge Cases', () => {
      it('should handle very large datasets efficiently', async () => {
        const largeDataset = Array.from({ length: 10000 }, (_, i) => ({
          wpm: 45 + (i % 20),
          accuracy: 95,
          errors: 2,
          total_characters: 100,
          correct_characters: 98,
          time_elapsed: 80000,
          test_id: `test_${i}`,
          category: 'lowercase',
          timestamp: Date.now() + i,
          hash: `hash_${i}`
        }));

        // Mock successful database fetch
        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => largeDataset
        });

        const startTime = Date.now();
        const results = await DataManager.getResults(1000);
        const endTime = Date.now();

        expect(results).toHaveLength(1000);
        expect(endTime - startTime).toBeLessThan(2000); // Should complete within 2 seconds
      });

      it('should handle memory constraints with large objects', async () => {
        const largeObjectDataset = Array.from({ length: 100 }, (_, i) => ({
          wpm: 45,
          accuracy: 95,
          errors: 2,
          total_characters: 100,
          correct_characters: 98,
          time_elapsed: 80000,
          test_id: `test_${i}`,
          category: 'lowercase',
          timestamp: Date.now() + i,
          hash: `hash_${i}`,
          // Add large additional data
          largeData: 'x'.repeat(10000) // 10KB per object
        }));

        // Mock successful database fetch
        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => largeObjectDataset
        });

        const results = await DataManager.getResults(50);
        expect(results).toHaveLength(50);
        // Should not crash or cause memory issues
      });

      it('should handle concurrent operations without race conditions', async () => {
        const mockResult1: TypingResult = {
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
        };

        const mockResult2: TypingResult = {
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
        };

        // Mock successful database saves
        (fetch as jest.Mock)
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ id: 1, message: 'Result saved successfully' })
          })
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ id: 2, message: 'Result saved successfully' })
          });

        // Simulate concurrent saves
        const [result1, result2] = await Promise.all([
          DataManager.saveResult(mockResult1),
          DataManager.saveResult(mockResult2)
        ]);

        expect(result1.success).toBe(true);
        expect(result2.success).toBe(true);
        expect(result1.savedToDatabase).toBe(true);
        expect(result2.savedToDatabase).toBe(true);
      });
    });

    describe('Boundary Conditions', () => {
      it('should handle maximum timestamp values', async () => {
        const maxTimestamp = Number.MAX_SAFE_INTEGER;
        const mockResult: TypingResult = {
          testId: 'test_123',
          timestamp: maxTimestamp,
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
        expect(result.savedToDatabase).toBe(true);
      });

      it('should handle minimum timestamp values', async () => {
        const minTimestamp = 0;
        const mockResult: TypingResult = {
          testId: 'test_123',
          timestamp: minTimestamp,
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
        expect(result.savedToDatabase).toBe(true);
      });

      it('should handle extreme WPM values', async () => {
        const extremeWpm = 999999;
        const mockResult: TypingResult = {
          testId: 'test_123',
          timestamp: Date.now(),
          wpm: extremeWpm,
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
        expect(result.savedToDatabase).toBe(true);
      });

      it('should handle zero values correctly', async () => {
        const mockResult: TypingResult = {
          testId: 'test_123',
          timestamp: Date.now(),
          wpm: 0,
          accuracy: 0,
          errors: 0,
          totalCharacters: 0,
          correctCharacters: 0,
          category: 'lowercase',
          timeElapsed: 0,
          hash: 'test_hash_123'
        };

        // Mock successful database save
        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: 1, message: 'Result saved successfully' })
        });

        const result = await DataManager.saveResult(mockResult);
        expect(result.success).toBe(true);
        expect(result.savedToDatabase).toBe(true);
      });
    });

    describe('String and Character Encoding Issues', () => {
      it('should handle special characters in testId', async () => {
        const mockResult: TypingResult = {
          testId: 'test_123_!@#$%^&*()_+{}|:"<>?[]\\;\',./',
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
        expect(result.savedToDatabase).toBe(true);
      });

      it('should handle unicode characters', async () => {
        const mockResult: TypingResult = {
          testId: 'test_123_🚀_🎯_🌟',
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
        expect(result.savedToDatabase).toBe(true);
      });

      it('should handle very long strings', async () => {
        const longString = 'x'.repeat(10000);
        const mockResult: TypingResult = {
          testId: longString,
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
        expect(result.savedToDatabase).toBe(true);
      });
    });

    describe('Network and Timing Issues', () => {
      it('should handle slow network responses', async () => {
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

        // Mock slow response
        (fetch as jest.Mock).mockImplementationOnce(() => 
          new Promise(resolve => 
            setTimeout(() => resolve({
              ok: true,
              json: async () => ({ id: 1, message: 'Result saved successfully' })
            }), 5000)
          )
        );

        const startTime = Date.now();
        const result = await DataManager.saveResult(mockResult);
        const endTime = Date.now();

        expect(result.success).toBe(true);
        expect(result.savedToDatabase).toBe(true);
        expect(endTime - startTime).toBeGreaterThan(4000); // Should take at least 4 seconds
      });

      it('should handle network timeouts', async () => {
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

        // Mock timeout
        (fetch as jest.Mock).mockImplementationOnce(() => 
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 100)
          )
        );

        const result = await DataManager.saveResult(mockResult);
        expect(result.success).toBe(true);
        expect(result.savedToDatabase).toBe(false);
        expect(result.savedToLocal).toBe(true);
      });

      it('should handle intermittent network failures', async () => {
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

        // Mock first failure, then success
        (fetch as jest.Mock)
          .mockRejectedValueOnce(new Error('Network error'))
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ id: 1, message: 'Result saved successfully' })
          });

        const result = await DataManager.saveResult(mockResult);
        expect(result.success).toBe(true);
        expect(result.savedToDatabase).toBe(false);
        expect(result.savedToLocal).toBe(true);
      });
    });

    describe('Data Integrity and Validation', () => {
      it('should handle duplicate hash submissions gracefully', async () => {
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
          hash: 'duplicate_hash'
        };

        // Mock duplicate hash response
        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: 1, message: 'Result already exists', duplicate: true })
        });

        const result = await DataManager.saveResult(mockResult);
        expect(result.success).toBe(true);
        expect(result.savedToDatabase).toBe(true);
        expect(result.savedToLocal).toBe(true);
      });

      it('should handle corrupted hash values', async () => {
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
          hash: '' // Empty hash
        };

        // Mock successful database save
        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: 1, message: 'Result saved successfully' })
        });

        const result = await DataManager.saveResult(mockResult);
        expect(result.success).toBe(true);
        expect(result.savedToDatabase).toBe(true);
      });

      it('should handle invalid JSON responses', async () => {
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

        // Ensure DataManager is online for this test
        DataManager.setOnlineStatus(true);

        // Mock network error during save
        (fetch as jest.Mock).mockRejectedValueOnce(new Error('Invalid JSON response'));

        const result = await DataManager.saveResult(mockResult);
        
        // Debug: log the actual result to understand what's happening
        console.log('Test result:', JSON.stringify(result, null, 2));
        console.log('Fetch mock calls:', (fetch as jest.Mock).mock.calls);
        
        expect(result.success).toBe(true);
        // When database fails due to network error, it should fallback to localStorage
        expect(result.savedToDatabase).toBe(false);
        expect(result.savedToLocal).toBe(true);
      });
    });

    describe('Browser and Environment Issues', () => {
      it('should handle localStorage being disabled', async () => {
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

        // Ensure DataManager is online for this test
        DataManager.setOnlineStatus(true);

        // Mock localStorage being disabled
        (localStorage as any)._simulateError('localStorage not available');

        // Mock successful database save
        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: 1, message: 'Result saved successfully' })
        });

        const result = await DataManager.saveResult(mockResult);
        
        expect(result.success).toBe(true);
        // When database succeeds and localStorage is disabled, only database should be true
        expect(result.savedToDatabase).toBe(true);
        expect(result.savedToLocal).toBe(false); // localStorage is disabled, so this should be false

        // Clear error simulation
        (localStorage as any)._clearError();
      });

      it('should handle browser storage quota exceeded', async () => {
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

        // Mock quota exceeded - first call fails, retry succeeds
        const originalSetItem = (localStorage as any)._simulateQuotaExceeded();

        // Mock successful database save
        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: 1, message: 'Result saved successfully' })
        });

        const result = await DataManager.saveResult(mockResult);
        expect(result.success).toBe(true);
        expect(result.savedToDatabase).toBe(true);
        // When quota is exceeded, the retry logic should save with minimal data
        expect(result.savedToLocal).toBe(true);

        // Restore original localStorage
        (localStorage as any).setItem = originalSetItem;
      });

      it('should handle browser in private/incognito mode', async () => {
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

        // Mock private mode (localStorage throws error)
        (localStorage as any)._simulateError('localStorage not available in private mode');

        // Mock successful database save
        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: 1, message: 'Result saved successfully' })
        });

        const result = await DataManager.saveResult(mockResult);
        expect(result.success).toBe(true);
        expect(result.savedToDatabase).toBe(true);
        // When localStorage is not available in private mode, it should be false
        expect(result.savedToLocal).toBe(false);

        // Clear error simulation
        (localStorage as any)._clearError();
      });
    });
  });
});
