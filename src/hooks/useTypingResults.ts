import { useState, useEffect } from 'react';
import type { TypingResult } from '../types';
import { DatabaseSync } from '../utils/databaseSync';

export const useTypingResults = () => {
  const [results, setResults] = useState<TypingResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<string>('');

  // Initialize database sync
  useEffect(() => {
    DatabaseSync.init();
  }, []);

  // Load results from localStorage and sync with database
  useEffect(() => {
    const loadResults = async () => {
      setIsLoading(true);
      try {
        // Get results from hybrid storage (localStorage + SQLite)
        const hybridResults = await DatabaseSync.getUserResults('default_user', 100);
        setResults(hybridResults);
      } catch (error) {
        console.error('Failed to load results:', error);
        // Fallback to localStorage only
        const stored = localStorage.getItem('typing-trainer-results');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            setResults(parsed);
          } catch (error) {
            console.error('Failed to parse stored results:', error);
            setResults([]);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadResults();
  }, []);

  const addResult = async (result: TypingResult) => {
    try {
      // Save to hybrid storage (localStorage + SQLite)
      const syncResult = await DatabaseSync.saveTypingResult(result);
      setSyncStatus(syncResult.message);
      
      // Update local state
      setResults(prev => [result, ...prev]);
      
      // Clear sync status after 3 seconds
      setTimeout(() => setSyncStatus(''), 3000);
    } catch (error) {
      console.error('Failed to save result:', error);
      // Fallback to localStorage only
      setResults(prev => [result, ...prev]);
      setSyncStatus('Saved locally only');
    }
  };

  const clearResults = async () => {
    setResults([]);
    localStorage.removeItem('typing-trainer-results');
    setSyncStatus('Results cleared');
    setTimeout(() => setSyncStatus(''), 3000);
  };

  const getResultsByMode = (modeId: string) => {
    return results.filter(result => result.testId.startsWith(modeId));
  };

  const getRecentResults = (count: number = 10) => {
    return results.slice(0, count);
  };

  const syncPendingData = async () => {
    try {
      setSyncStatus('Syncing...');
      const result = await DatabaseSync.syncPendingData();
      setSyncStatus(result.message);
      setTimeout(() => setSyncStatus(''), 3000);
      return result;
    } catch (error) {
      setSyncStatus('Sync failed');
      setTimeout(() => setSyncStatus(''), 3000);
      return { success: false, message: 'Sync failed' };
    }
  };

  return {
    results,
    addResult,
    clearResults,
    getResultsByMode,
    getRecentResults,
    syncPendingData,
    isLoading,
    syncStatus
  };
};
