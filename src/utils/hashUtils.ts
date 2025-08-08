/**
 * Utility functions for generating unique hashes for test results
 */

import type { TypingResult } from '../types';

/**
 * Generate a unique hash for a typing result
 * Uses a combination of testId, timestamp, wpm, accuracy, and errors
 */
export function generateResultHash(result: Omit<TypingResult, 'hash'>): string {
  const data = `${result.testId}-${result.timestamp}-${result.wpm}-${result.accuracy}-${result.errors}-${result.totalCharacters}-${result.correctCharacters}`;
  return btoa(data).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
}

/**
 * Generate a hash for a result without the hash field
 */
export function generateHashForResult(
  testId: string,
  timestamp: number,
  wpm: number,
  accuracy: number,
  errors: number,
  totalCharacters: number,
  correctCharacters: number
): string {
  const data = `${testId}-${timestamp}-${wpm}-${accuracy}-${errors}-${totalCharacters}-${correctCharacters}`;
  return btoa(data).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
}

/**
 * Check if two results are duplicates based on hash
 */
export function areResultsDuplicate(result1: TypingResult, result2: TypingResult): boolean {
  return result1.hash === result2.hash;
}

/**
 * Check if a result already exists in an array based on hash
 */
export function resultExists(results: TypingResult[], newResult: TypingResult): boolean {
  return results.some(existing => existing.hash === newResult.hash);
}

/**
 * Remove duplicates from an array of results based on hash
 */
export function removeDuplicates(results: TypingResult[]): TypingResult[] {
  const seen = new Set<string>();
  return results.filter(result => {
    if (seen.has(result.hash)) {
      return false;
    }
    seen.add(result.hash);
    return true;
  });
}
