import type { TypingResult, UserStats } from '../types';
import { resultExists, removeDuplicates, generateHashForResult } from './hashUtils';

const API_BASE_URL = 'http://localhost:3001/api';

interface SyncResult {
  success: boolean;
  message: string;
  data?: any;
}

// LocalStorage keys
const STORAGE_KEYS = {
  RESULTS: 'typing-trainer-results',
  USER: 'typing-trainer-user',
  LAST_SYNC: 'typing-trainer-last-sync',
  PENDING_SYNC: 'typing-trainer-pending-sync'
};

// Database sync utility
export class DatabaseSync {
  private static isOnline = navigator.onLine;

  // Initialize online/offline detection
  static init() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncPendingData();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  // Save typing result (localStorage + sync to SQLite)
  static async saveTypingResult(result: TypingResult): Promise<SyncResult> {
    try {
      // Always save to localStorage first (immediate feedback)
      this.saveToLocalStorage(result);
      
      // Try to sync to SQLite if online
      if (this.isOnline) {
        const syncResult = await this.syncToDatabase(result);
        if (syncResult.success) {
          return { success: true, message: 'Result saved locally and synced to database' };
        } else {
          // If sync fails, mark for later sync
          this.markForPendingSync(result);
          return { success: true, message: 'Result saved locally, will sync when online' };
        }
      } else {
        // Mark for sync when back online
        this.markForPendingSync(result);
        return { success: true, message: 'Result saved locally, will sync when online' };
      }
    } catch (error) {
      console.error('Error saving typing result:', error);
      return { success: false, message: 'Failed to save result' };
    }
  }

  // Get user statistics (combine localStorage and SQLite)
  static async getUserStats(userId: string): Promise<UserStats> {
    try {
      // Get local stats first
      const localStats = this.getLocalStats();
      
      // Try to get database stats if online
      if (this.isOnline) {
        try {
          const response = await fetch(`${API_BASE_URL}/users/${userId}/stats`);
          if (response.ok) {
            const dbStats = await response.json();
            // Merge local and database stats
            return this.mergeStats(localStats, dbStats);
          }
        } catch (error) {
          console.warn('Could not fetch database stats, using local only:', error);
        }
      }
      
      return localStats;
    } catch (error) {
      console.error('Error getting user stats:', error);
      return this.getLocalStats();
    }
  }

  // Get user results (combine localStorage and SQLite)
  static async getUserResults(userId: string, limit: number = 50): Promise<TypingResult[]> {
    try {
      // Get local results first
      const localResults = this.getLocalResults();
      console.log('🔍 DatabaseSync.getUserResults - local results:', localResults.length, 'results');
      console.log('🔍 Local results:', localResults.map(r => ({ 
        testId: r.testId, 
        category: r.category, 
        wpm: r.wpm,
        hasCategory: !!r.category 
      })));
      
      // Always try to get database results
      try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/results?limit=${limit}`);
        if (response.ok) {
          const dbResults = await response.json();
          console.log('🔍 DatabaseSync.getUserResults - database results:', dbResults.length, 'results');
          console.log('🔍 Database results:', dbResults.map((r: any) => ({ 
            test_id: r.test_id, 
            category: r.category, 
            wpm: r.wpm,
            hasCategory: !!r.category 
          })));
          // Merge and deduplicate results
          const merged = this.mergeResults(localResults, dbResults);
          console.log('🔍 DatabaseSync.getUserResults - merged results:', merged.length, 'results');
          console.log('🔍 Merged results:', merged.map(r => ({ 
            testId: r.testId, 
            category: r.category, 
            wpm: r.wpm,
            hasCategory: !!r.category 
          })));
          return merged;
        }
      } catch (error) {
        console.warn('Could not fetch database results, using local only:', error);
      }
      
      console.log('🔍 DatabaseSync.getUserResults - returning local results only');
      return localResults.slice(0, limit);
    } catch (error) {
      console.error('Error getting user results:', error);
      return this.getLocalResults().slice(0, limit);
    }
  }

  // Sync pending data when back online
  static async syncPendingData(): Promise<SyncResult> {
    try {
      const pendingData = this.getPendingSyncData();
      if (pendingData.length === 0) {
        return { success: true, message: 'No pending data to sync' };
      }

      let successCount = 0;
      let failCount = 0;

      for (const result of pendingData) {
        try {
          const response = await fetch(`${API_BASE_URL}/results`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(result)
          });

          if (response.ok) {
            successCount++;
          } else {
            failCount++;
          }
        } catch (error) {
          failCount++;
          console.error('Failed to sync result:', error);
        }
      }

      // Clear successfully synced data
      if (successCount > 0) {
        this.clearPendingSyncData();
      }

      return {
        success: failCount === 0,
        message: `Synced ${successCount} results${failCount > 0 ? `, ${failCount} failed` : ''}`
      };
    } catch (error) {
      console.error('Error syncing pending data:', error);
      return { success: false, message: 'Failed to sync pending data' };
    }
  }

  // Private methods

  private static saveToLocalStorage(result: TypingResult) {
    const existingResults = this.getLocalResults();
    
    // Check if this result already exists using hash
    const exists = resultExists(existingResults, result);
    
    if (exists) {
      return;
    }
    
    existingResults.unshift(result);
    
    // Keep only last 100 results in localStorage
    const limitedResults = existingResults.slice(0, 100);
    localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(limitedResults));
  }

  private static getLocalResults(): TypingResult[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.RESULTS);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading local results:', error);
      return [];
    }
  }

  private static getLocalStats(): UserStats {
    const results = this.getLocalResults();
    if (results.length === 0) {
      return {
        userId: 'default_user',
        totalTests: 0,
        averageWpm: 0,
        bestWpm: 0,
        totalAccuracy: 0,
        lastTestDate: 0
      };
    }

    const totalTests = results.length;
    const averageWpm = Math.round(results.reduce((sum, r) => sum + r.wpm, 0) / totalTests);
    const bestWpm = Math.max(...results.map(r => r.wpm));
    const totalAccuracy = Math.round(results.reduce((sum, r) => sum + r.accuracy, 0) / totalTests);
    const lastTestDate = Math.max(...results.map(r => r.timestamp));

    return {
      userId: 'default_user',
      totalTests,
      averageWpm,
      bestWpm,
      totalAccuracy,
      lastTestDate
    };
  }

  private static markForPendingSync(result: TypingResult) {
    try {
      const pending = this.getPendingSyncData();
      pending.push(result);
      localStorage.setItem(STORAGE_KEYS.PENDING_SYNC, JSON.stringify(pending));
    } catch (error) {
      console.error('Error marking for pending sync:', error);
    }
  }

  private static getPendingSyncData(): TypingResult[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PENDING_SYNC);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading pending sync data:', error);
      return [];
    }
  }

  private static clearPendingSyncData() {
    localStorage.removeItem(STORAGE_KEYS.PENDING_SYNC);
  }

  private static mergeStats(localStats: UserStats, dbStats: any): UserStats {
    // Combine stats from both sources
    const totalTests = localStats.totalTests + (dbStats.total_tests || 0);
    const totalWpm = (localStats.averageWpm * localStats.totalTests) + (dbStats.average_wpm || 0) * (dbStats.total_tests || 0);
    const averageWpm = totalTests > 0 ? Math.round(totalWpm / totalTests) : 0;
    const bestWpm = Math.max(localStats.bestWpm, dbStats.best_wpm || 0);
    const totalAccuracy = Math.round((localStats.totalAccuracy + (dbStats.average_accuracy || 0)) / 2);
    const lastTestDate = Math.max(localStats.lastTestDate, dbStats.last_test_date || 0);

    return {
      userId: localStats.userId,
      totalTests,
      averageWpm,
      bestWpm,
      totalAccuracy,
      lastTestDate
    };
  }

  private static mergeResults(localResults: TypingResult[], dbResults: any[]): TypingResult[] {
    // Start with database results as the primary source
    const combined: TypingResult[] = [];
    
    // Process database results first (they have priority)
    for (const dbResult of dbResults) {
      // Handle missing category field for existing records
      let category = dbResult.category;
      if (!category) {
        // Try to infer category from test_id for backward compatibility
        if (dbResult.test_id.startsWith('lowercase')) {
          category = 'lowercase';
        } else if (dbResult.test_id.startsWith('punctuation')) {
          category = 'punctuation';
        } else if (dbResult.test_id.startsWith('code')) {
          category = 'code';
        } else if (dbResult.test_id.startsWith('data_entry')) {
          category = 'data_entry';
        } else {
          category = 'unknown';
        }
      }
      
      combined.push({
        wpm: dbResult.wpm,
        accuracy: dbResult.accuracy,
        errors: dbResult.errors,
        totalCharacters: dbResult.total_characters,
        correctCharacters: dbResult.correct_characters,
        timeElapsed: dbResult.time_elapsed,
        testId: dbResult.test_id,
        category: category,
        timestamp: dbResult.timestamp,
        hash: dbResult.hash || generateHashForResult(
          dbResult.test_id,
          dbResult.timestamp,
          dbResult.wpm,
          dbResult.accuracy,
          dbResult.errors,
          dbResult.total_characters,
          dbResult.correct_characters
        )
      });
    }
    
    // Now add local results only if they don't exist in database
    for (const localResult of localResults) {
      const exists = resultExists(combined, localResult);
      
      if (!exists) {
        combined.push(localResult);
      }
    }

    // Remove any remaining duplicates and sort by timestamp (newest first)
    return removeDuplicates(combined).sort((a, b) => b.timestamp - a.timestamp);
  }

  private static async syncToDatabase(result: TypingResult): Promise<SyncResult> {
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
        return { success: true, message: 'Synced to database successfully' };
      } else {
        const error = await response.text();
        return { success: false, message: `Database sync failed: ${error}` };
      }
    } catch (error) {
      return { success: false, message: `Database sync failed: ${error}` };
    }
  }
}
