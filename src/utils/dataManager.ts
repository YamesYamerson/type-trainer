/**
 * Simplified Data Management System
 * Prioritizes database storage with localStorage as backup
 */

import type { TypingResult, UserStats } from '../types';
import { generateHashForResult } from './hashUtils';

const API_BASE_URL = 'http://localhost:3001/api';

interface SaveResult {
  success: boolean;
  message: string;
  savedToDatabase: boolean;
  savedToLocal: boolean;
}

// LocalStorage keys
const STORAGE_KEYS = {
  RESULTS: 'typing-trainer-results',
  USER: 'typing-trainer-user',
  LAST_SYNC: 'typing-trainer-last-sync'
};

export class DataManager {
  private static isOnline = navigator.onLine;

  // Initialize online/offline detection
  static init() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncLocalToDatabase();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  // Save a typing result
  static async saveResult(result: TypingResult): Promise<SaveResult> {
    try {
      // Generate hash if not provided
      if (!result.hash) {
        result.hash = generateHashForResult(
          result.testId,
          result.timestamp,
          result.wpm,
          result.accuracy,
          result.errors,
          result.totalCharacters,
          result.correctCharacters
        );
      }

      let savedToDatabase = false;
      let savedToLocal = false;

      // Try to save to database first (if online)
      if (this.isOnline) {
        try {
          const response = await fetch(`${API_BASE_URL}/results`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: 'default_user',
              testId: result.testId,
              category: result.category,
              wpm: result.wpm,
              accuracy: result.accuracy,
              errors: result.errors,
              totalCharacters: result.totalCharacters,
              correctCharacters: result.correctCharacters,
              timeElapsed: result.timeElapsed,
              timestamp: result.timestamp,
              hash: result.hash
            })
          });

          if (response.ok) {
            savedToDatabase = true;
            console.log('✅ Result saved to database');
          } else {
            console.warn('⚠️ Failed to save to database, saving locally');
          }
        } catch (error) {
          console.warn('⚠️ Database save failed, saving locally:', error);
        }
      }

      // Always save to localStorage as backup
      this.saveToLocalStorage(result);
      savedToLocal = true;

      return {
        success: true,
        message: savedToDatabase 
          ? 'Result saved to database and local storage' 
          : 'Result saved to local storage (will sync when online)',
        savedToDatabase,
        savedToLocal
      };

    } catch (error) {
      console.error('❌ Failed to save result:', error);
      return {
        success: false,
        message: 'Failed to save result',
        savedToDatabase: false,
        savedToLocal: false
      };
    }
  }

  // Get all results (database first, then localStorage)
  static async getResults(limit: number = 100): Promise<TypingResult[]> {
    try {
      let results: TypingResult[] = [];

      // Try to get from database first
      if (this.isOnline) {
        try {
          const response = await fetch(`${API_BASE_URL}/users/default_user/results?limit=${limit}`);
          if (response.ok) {
            const dbResults = await response.json();
            results = dbResults.map((r: any) => ({
              wpm: r.wpm,
              accuracy: r.accuracy,
              errors: r.errors,
              totalCharacters: r.total_characters,
              correctCharacters: r.correct_characters,
              timeElapsed: r.time_elapsed,
              testId: r.test_id,
              category: r.category,
              timestamp: r.timestamp,
              hash: r.hash
            }));
            console.log(`✅ Loaded ${results.length} results from database`);
          }
        } catch (error) {
          console.warn('⚠️ Could not load from database, using local storage:', error);
        }
      }

      // If no database results, use localStorage
      if (results.length === 0) {
        results = this.getLocalResults();
        console.log(`✅ Loaded ${results.length} results from local storage`);
      }

      // Sort by timestamp (newest first) and limit
      return results
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, limit);

    } catch (error) {
      console.error('❌ Failed to load results:', error);
      return this.getLocalResults().slice(0, limit);
    }
  }

  // Get results by category
  static async getResultsByCategory(category: string): Promise<TypingResult[]> {
    const allResults = await this.getResults();
    return allResults.filter(r => r.category === category);
  }

  // Get user statistics
  static async getUserStats(): Promise<UserStats> {
    try {
      const results = await this.getResults();
      
      if (results.length === 0) {
        return {
          totalTests: 0,
          averageWpm: 0,
          bestWpm: 0,
          averageAccuracy: 0,
          lastTestDate: null
        };
      }

      const totalTests = results.length;
      const averageWpm = Math.round(results.reduce((sum, r) => sum + r.wpm, 0) / totalTests);
      const bestWpm = Math.max(...results.map(r => r.wpm));
      const averageAccuracy = Math.round(results.reduce((sum, r) => sum + r.accuracy, 0) / totalTests);
      const lastTestDate = Math.max(...results.map(r => r.timestamp));

      return {
        totalTests,
        averageWpm,
        bestWpm,
        averageAccuracy,
        lastTestDate
      };

    } catch (error) {
      console.error('❌ Failed to get user stats:', error);
      return {
        totalTests: 0,
        averageWpm: 0,
        bestWpm: 0,
        averageAccuracy: 0,
        lastTestDate: null
      };
    }
  }

  // Clear all data
  static async clearAllData(): Promise<void> {
    try {
      // Clear localStorage
      localStorage.removeItem(STORAGE_KEYS.RESULTS);
      localStorage.removeItem(STORAGE_KEYS.LAST_SYNC);
      
      // Clear database if online
      if (this.isOnline) {
        try {
          await fetch(`${API_BASE_URL}/clear-stats`, { method: 'POST' });
          console.log('✅ Database cleared');
        } catch (error) {
          console.warn('⚠️ Could not clear database:', error);
        }
      }
      
      console.log('✅ All data cleared');
    } catch (error) {
      console.error('❌ Failed to clear data:', error);
    }
  }

  // Sync local data to database
  private static async syncLocalToDatabase(): Promise<void> {
    try {
      const localResults = this.getLocalResults();
      if (localResults.length === 0) return;

      console.log(`🔄 Syncing ${localResults.length} local results to database...`);

      for (const result of localResults) {
        try {
          await this.saveResult(result);
        } catch (error) {
          console.warn(`⚠️ Failed to sync result ${result.testId}:`, error);
        }
      }

      console.log('✅ Local sync completed');
    } catch (error) {
      console.error('❌ Local sync failed:', error);
    }
  }

  // Save to localStorage
  private static saveToLocalStorage(result: TypingResult): void {
    try {
      const existingResults = this.getLocalResults();
      
      // Check for duplicates
      const exists = existingResults.some(r => r.hash === result.hash);
      if (exists) {
        console.log('⚠️ Result already exists in localStorage, skipping');
        return;
      }

      // Add new result
      existingResults.unshift(result);
      
      // Keep only last 100 results
      const limitedResults = existingResults.slice(0, 100);
      localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(limitedResults));
      
      console.log('✅ Result saved to localStorage');
    } catch (error) {
      console.error('❌ Failed to save to localStorage:', error);
    }
  }

  // Get results from localStorage
  private static getLocalResults(): TypingResult[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.RESULTS);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('❌ Failed to parse localStorage results:', error);
      return [];
    }
  }
}
