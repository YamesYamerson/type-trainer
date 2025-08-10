/**
 * Simplified Data Management System
 * Prioritizes database storage with localStorage as backup
 */

import type { TypingResult, UserStats } from '../types';
import { generateHashForResult } from './hashUtils';
import { config } from '../config/environment';

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
  private static isOnline = true; // Default to true to ensure immediate saving

  // Initialize online/offline detection
  static init() {
    // Check online status immediately
    this.isOnline = navigator.onLine;
    console.log('🌐 DataManager initialized, online status:', this.isOnline);
    
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('🌐 Back online, syncing local data...');
      this.syncLocalToDatabase();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('🌐 Went offline, will save locally');
    });
  }

  // Method to update online status for testing
  static setOnlineStatus(online: boolean) {
    this.isOnline = online;
    console.log('🌐 Online status manually set to:', online);
  }

  // Check if we can actually reach the server
  private static async checkServerConnectivity(): Promise<boolean> {
    try {
      const response = await fetch(`${config.apiBaseUrl}/db-info`, { 
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      return response.ok;
    } catch (error) {
      console.warn('⚠️ Server connectivity check failed:', error);
      return false;
    }
  }

  // Check if localStorage failure is temporary (can be retried)
  private static isTemporaryLocalStorageFailure(error: Error): boolean {
    // Quota exceeded is usually temporary
    if (error.message.includes('QuotaExceededError') || error.message.includes('quota')) {
      return true;
    }
    
    // Network or temporary storage issues
    if (error.message.includes('temporary') || error.message.includes('retry')) {
      return true;
    }
    
    // Permanent failures
    if (error.message.includes('localStorage not available') || 
        error.message.includes('disabled') ||
        error.message.includes('not supported')) {
      return false;
    }
    
    // Default to treating as temporary (can retry)
    return true;
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

      // Always try to save to database first for immediate persistence
      try {
        console.log('🚀 Attempting to save result to database...');
        const response = await fetch(`${config.apiBaseUrl}/results`, {
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
          console.log('✅ Result saved to database successfully');
        } else {
          const errorText = await response.text();
          console.warn('⚠️ Database save failed with status:', response.status, 'Error:', errorText);
        }
      } catch (error) {
        console.warn('⚠️ Database save failed with error:', error);
      }

      // Try to save to localStorage as backup
      try {
        this.saveToLocalStorage(result);
        savedToLocal = true;
      } catch (error) {
        console.warn('⚠️ localStorage save failed:', error);
        
        // Check if this is a temporary failure that we can recover from
        const isTemporaryFailure = this.isTemporaryLocalStorageFailure(error as Error);
        
        if (isTemporaryFailure) {
          // For temporary failures, try to save with a smaller payload or retry
          try {
            // Try to save with minimal data
            const minimalResult = {
              ...result,
              // Remove large fields that might cause quota issues
              testId: result.testId.substring(0, 50), // Limit testId length
            };
            this.saveToLocalStorage(minimalResult);
            savedToLocal = true;
            console.log('✅ Result saved to localStorage after retry with minimal data');
          } catch (retryError) {
            console.warn('⚠️ localStorage retry also failed:', retryError);
            // If retry fails, mark as not saved locally
            savedToLocal = false;
          }
        } else {
          // For permanent failures, don't mark as saved locally
          savedToLocal = false;
        }
        
        // If localStorage fails and database also failed, we still want to return success
        // but indicate that neither storage method worked
        if (!savedToDatabase && !savedToLocal) {
          console.error('❌ Both database and localStorage failed');
        }
      }

      return {
        success: true,
        message: savedToDatabase 
          ? (savedToLocal ? 'Result saved to database and local storage' : 'Result saved to database only (localStorage unavailable)')
          : savedToLocal
          ? 'Result saved to local storage (will sync when online)'
          : 'Result could not be saved to any storage',
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
          const response = await fetch(`${config.apiBaseUrl}/users/default_user/results?limit=${limit}`);
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
          await fetch(`${config.apiBaseUrl}/clear-stats`, { method: 'POST' });
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
      // Re-throw the error so the calling code can handle it
      throw error;
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
