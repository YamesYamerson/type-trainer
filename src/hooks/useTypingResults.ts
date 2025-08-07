import { useState, useEffect } from 'react';
import type { TypingResult } from '../types';

const STORAGE_KEY = 'typing-trainer-results';

export const useTypingResults = () => {
  const [results, setResults] = useState<TypingResult[]>([]);

  // Load results from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setResults(parsed);
      } catch (error) {
        console.error('Failed to parse stored results:', error);
        setResults([]);
      }
    }
  }, []);

  // Save results to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
  }, [results]);

  const addResult = (result: TypingResult) => {
    setResults(prev => [result, ...prev]);
  };

  const clearResults = () => {
    setResults([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const getResultsByMode = (modeId: string) => {
    return results.filter(result => result.testId.startsWith(modeId));
  };

  const getRecentResults = (count: number = 10) => {
    return results.slice(0, count);
  };

  return {
    results,
    addResult,
    clearResults,
    getResultsByMode,
    getRecentResults
  };
};
