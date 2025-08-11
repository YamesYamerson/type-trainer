import { useState, useEffect } from 'react';
import type { TypingResult } from '../types';
import { DataManager } from '../utils/dataManager';

export const useTypingResults = () => {
  const [results, setResults] = useState<TypingResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<string>('');

  // Initialize data manager
  useEffect(() => {
    DataManager.init();
  }, []);

  // Load results
  useEffect(() => {
    const loadResults = async () => {
      setIsLoading(true);
      try {
        const loadedResults = await DataManager.getResults(100);
        setResults(loadedResults);
      } catch (error) {
        console.error('Failed to load results:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadResults();
  }, []);

  const addResult = async (result: TypingResult) => {
    try {
      const saveResult = await DataManager.saveResult(result);
      setSyncStatus(saveResult.message);
      
      // Update local state
      setResults(prev => {
        // Check for duplicates
        const exists = prev.some(r => r.hash === result.hash);
        if (exists) {
          return prev;
        }
        return [result, ...prev];
      });
      
      // Clear sync status after 3 seconds
      setTimeout(() => setSyncStatus(''), 3000);
    } catch (error) {
      console.error('❌ useTypingResults: Failed to save result:', error);
      setSyncStatus('Failed to save result');
    }
  };

  const clearResults = async () => {
    try {
      await DataManager.clearAllData();
      setResults([]);
      setSyncStatus('All results cleared');
      setTimeout(() => setSyncStatus(''), 3000);
    } catch (error) {
      console.error('Failed to clear results:', error);
      setSyncStatus('Failed to clear results');
    }
  };

  const getResultsByMode = (modeId: string) => {
    return results.filter(result => result.category === modeId);
  };

  const getRecentResults = (count: number = 10) => {
    return results.slice(0, count);
  };

  return {
    results,
    isLoading,
    syncStatus,
    addResult,
    clearResults,
    getResultsByMode,
    getRecentResults
  };
};
