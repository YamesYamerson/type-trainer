/**
 * Utility functions for generating unique hashes for test results
 */

import type { TypingResult } from '../types';

/**
 * Generate a unique hash for a typing result
 * Uses a combination of testId, timestamp, wpm, accuracy, errors, and a random component
 * to ensure each test run is truly unique
 */
export function generateResultHash(result: Omit<TypingResult, 'hash'>): string {
  // Include a random component to ensure uniqueness even for identical results
  const randomComponent = Math.random().toString(36).substring(2, 8);
  
  // Include more granular data for better uniqueness
  const data = `${result.testId}-${result.timestamp}-${result.wpm}-${result.accuracy}-${result.errors}-${result.totalCharacters}-${result.correctCharacters}-${result.timeElapsed}-${randomComponent}`;
  
  // Use a more robust hashing approach
  return generateHashFromString(data);
}

/**
 * Generate a hash for a result without the hash field
 * This function is deterministic - same input always produces same output
 */
export function generateHashForResult(
  testId: string,
  timestamp: number,
  wpm: number,
  accuracy: number,
  errors: number,
  totalCharacters: number,
  correctCharacters: number,
  timeElapsed: number
): string {
  // Remove random component for deterministic hashing
  const data = `${testId}-${timestamp}-${wpm}-${accuracy}-${errors}-${totalCharacters}-${correctCharacters}-${timeElapsed}`;
  
  return generateHashFromString(data);
}

/**
 * Generate a hash from a string using a simple but effective algorithm
 * Always returns exactly 16 characters
 */
function generateHashFromString(str: string): string {
  let hash = 0;
  if (str.length === 0) return hash.toString();
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Convert to base36 and ensure it's always positive
  const positiveHash = Math.abs(hash);
  const base36Hash = positiveHash.toString(36);
  
  // Pad to exactly 16 characters with leading zeros if needed
  return base36Hash.padStart(16, '0').substring(0, 16);
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

/**
 * Generate a test session ID to group related test runs
 * This can be used to identify when multiple tests are run in the same session
 */
export function generateTestSessionId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `session_${timestamp}_${random}`;
}

/**
 * Check if two results are from the same test session (within a time window)
 */
export function areResultsFromSameSession(result1: TypingResult, result2: TypingResult, timeWindowMs: number = 300000): boolean {
  const timeDiff = Math.abs(result1.timestamp - result2.timestamp);
  return timeDiff < timeWindowMs && result1.testId === result2.testId;
}
