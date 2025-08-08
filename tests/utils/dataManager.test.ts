/**
 * Tests for DataManager utility
 */

import { DataManager } from '../../src/utils/dataManager';
import type { TypingResult, UserStats } from '../../src/types';

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

describe('DataManager', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Clear fetch mock
    (fetch as jest.Mock).mockClear();
  });

  describe('init', () => {
    it('should initialize the data manager', async () => {
      // Mock successful fetch response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Database connected' })
      });

      await DataManager.init();
      
      expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/db-info');
    });

    it('should handle initialization failure gracefully', async () => {
      // Mock failed fetch response
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(DataManager.init()).resolves.not.toThrow();
    });
  });

  describe('saveResult', () => {
    it('should save result to database and localStorage', async () => {
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

    it('should handle database save failure and fallback to localStorage', async () => {
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

      // Mock failed database save
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

      const result = await DataManager.saveResult(mockResult);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Saved to localStorage');
      
      // Check localStorage
      const storedResults = JSON.parse(localStorage.getItem('typing-trainer-results') || '[]');
      expect(storedResults).toHaveLength(1);
      expect(storedResults[0].hash).toBe(mockResult.hash);
    });

    it('should handle duplicate results', async () => {
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

  describe('getResults', () => {
    it('should get results from database when available', async () => {
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
        }
      ];

      // Mock successful database fetch
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResults
      });

      const results = await DataManager.getResults(10);

      expect(results).toHaveLength(2);
      expect(results[0].hash).toBe('hash_1');
      expect(results[1].hash).toBe('hash_2');
      expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/users/default_user/results?limit=10');
    });

    it('should fallback to localStorage when database is unavailable', async () => {
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
        }
      ];

      // Store in localStorage
      localStorage.setItem('typing-trainer-results', JSON.stringify(mockResults));

      // Mock failed database fetch
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

      const results = await DataManager.getResults(10);

      expect(results).toHaveLength(1);
      expect(results[0].hash).toBe('hash_1');
    });

    it('should return empty array when no results available', async () => {
      // Mock successful but empty database response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

      const results = await DataManager.getResults(10);

      expect(results).toEqual([]);
    });
  });

  describe('getUserStats', () => {
    it('should get user statistics from database', async () => {
      const mockStats: UserStats = {
        totalTests: 10,
        averageWpm: 45,
        averageAccuracy: 95,
        bestWpm: 60,
        totalCharacters: 1000,
        totalErrors: 20,
        categoryStats: {
          lowercase: { tests: 5, averageWpm: 40, averageAccuracy: 90 },
          punctuation: { tests: 3, averageWpm: 50, averageAccuracy: 95 },
          code: { tests: 2, averageWpm: 35, averageAccuracy: 85 }
        }
      };

      // Mock successful database fetch
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockStats
      });

      const stats = await DataManager.getUserStats();

      expect(stats).toEqual(mockStats);
      expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/users/default_user/stats');
    });

    it('should handle database failure gracefully', async () => {
      // Mock failed database fetch
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

      const stats = await DataManager.getUserStats();

      expect(stats).toEqual({
        totalTests: 0,
        averageWpm: 0,
        averageAccuracy: 0,
        bestWpm: 0,
        totalCharacters: 0,
        totalErrors: 0,
        categoryStats: {}
      });
    });
  });

  describe('clearAllData', () => {
    it('should clear data from both database and localStorage', async () => {
      // Store some data in localStorage
      localStorage.setItem('typing-trainer-results', JSON.stringify([{ testId: 'test_1' }]));

      // Mock successful database clear
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'All data cleared' })
      });

      await DataManager.clearAllData();

      expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/results', {
        method: 'DELETE'
      });

      // Check localStorage is cleared
      const storedResults = JSON.parse(localStorage.getItem('typing-trainer-results') || '[]');
      expect(storedResults).toEqual([]);
    });

    it('should handle database clear failure gracefully', async () => {
      // Store some data in localStorage
      localStorage.setItem('typing-trainer-results', JSON.stringify([{ testId: 'test_1' }]));

      // Mock failed database clear
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

      await expect(DataManager.clearAllData()).resolves.not.toThrow();

      // Check localStorage is still cleared
      const storedResults = JSON.parse(localStorage.getItem('typing-trainer-results') || '[]');
      expect(storedResults).toEqual([]);
    });
  });
});
