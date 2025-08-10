/**
 * Debug test for localStorage mock
 */

import { DataManager } from '../src/utils/dataManager';

describe('localStorage Mock Debug', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Reset fetch mock
    (global.fetch as jest.Mock).mockClear();
  });

  it('should store and retrieve data correctly', () => {
    // Set data
    localStorage.setItem('test-key', 'test-value');
    
    // Verify data is stored
    expect(localStorage.getItem('test-key')).toBe('test-value');
    
    // Set more data
    localStorage.setItem('typing-trainer-results', JSON.stringify([{ id: 1, name: 'test' }]));
    
    // Verify data is stored
    const stored = localStorage.getItem('typing-trainer-results');
    expect(stored).toBeDefined();
    
    const parsed = JSON.parse(stored || '[]');
    expect(parsed).toHaveLength(1);
    expect(parsed[0].id).toBe(1);
  });

  it('should persist data between operations', () => {
    // Set data
    localStorage.setItem('typing-trainer-results', JSON.stringify([{ id: 1, name: 'test' }]));
    
    // Simulate what DataManager does
    const stored = localStorage.getItem('typing-trainer-results');
    const existingResults = stored ? JSON.parse(stored) : [];
    
    // Add new result
    existingResults.unshift({ id: 2, name: 'test2' });
    
    // Store back
    localStorage.setItem('typing-trainer-results', JSON.stringify(existingResults));
    
    // Verify both results are there
    const finalStored = localStorage.getItem('typing-trainer-results');
    const finalParsed = JSON.parse(finalStored || '[]');
    
    expect(finalParsed).toHaveLength(2);
    expect(finalParsed[0].id).toBe(2);
    expect(finalParsed[1].id).toBe(1);
  });

  it('should simulate the failing integration test scenario', async () => {
    const mockResult = {
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
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1, message: 'Result saved successfully' })
    });

    // Call DataManager.saveResult
    const result = await DataManager.saveResult(mockResult);

    expect(result.success).toBe(true);
    expect(result.savedToLocal).toBe(true);

    // Verify data is in localStorage
    const storedResults = JSON.parse(localStorage.getItem('typing-trainer-results') || '[]');
    console.log('Stored results:', storedResults);
    console.log('localStorage keys:', Object.keys(localStorage));
    console.log('localStorage length:', localStorage.length);
    
    expect(storedResults).toHaveLength(1);
    expect(storedResults[0].hash).toBe(mockResult.hash);
  });

  it('should replicate the exact failing integration test', async () => {
    // This test replicates the exact scenario from the failing integration test
    const mockResult = {
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
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1, message: 'Result saved successfully' })
    });

    const result = await DataManager.saveResult(mockResult);

    expect(result.success).toBe(true);
    expect(result.savedToLocal).toBe(true);

    // This is the exact line that's failing in the integration test
    const storedResults = JSON.parse(localStorage.getItem('typing-trainer-results') || '[]');
    expect(storedResults).toHaveLength(1);
    expect(storedResults[0].hash).toBe(mockResult.hash);
  });
});
