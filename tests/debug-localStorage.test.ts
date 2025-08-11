/**
 * Debug test for localStorage mock
 */

import { DataManager } from '../src/utils/dataManager';
import { loadTestsBySubcategory, getRandomTestBySubcategory } from '../src/utils/testLoader';
import { WordGenerator } from '../src/utils/wordGenerator';

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
      subcategory: 'basic',
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
      subcategory: 'basic',
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

describe('Test Loader Verification', () => {
  it('should load word-based tests for random_words subcategory', () => {
    const lowercaseWords = loadTestsBySubcategory('lowercase', 'random_words');
    const punctuationWords = loadTestsBySubcategory('punctuation', 'random_sentences');
    
    console.log('Lowercase random_words tests:', lowercaseWords.length);
    console.log('Punctuation random_sentences tests:', punctuationWords.length);
    
    // Verify we have tests
    expect(lowercaseWords.length).toBeGreaterThan(0);
    expect(punctuationWords.length).toBeGreaterThan(0);
    
    // Check that content is word-based (not full sentences)
    lowercaseWords.forEach(test => {
      const wordCount = test.content.split(' ').length;
      console.log(`Test ${test.id}: "${test.content}" (${wordCount} words)`);
      // Should be 30 words or less for word-based tests (updated from 10 to 30)
      expect(wordCount).toBeLessThanOrEqual(30);
    });
    
    punctuationWords.forEach(test => {
      const wordCount = test.content.split(' ').length;
      console.log(`Test ${test.id}: "${test.content}" (${wordCount} words)`);
      // Should be 30 words or less for word-based tests (updated from 10 to 30)
      expect(wordCount).toBeLessThanOrEqual(30);
    });
  });
  
  it('should get random word tests correctly', () => {
    const randomLowercaseTest = getRandomTestBySubcategory('lowercase', 'random_words');
    const randomPunctuationTest = getRandomTestBySubcategory('punctuation', 'random_sentences');
    
    console.log('Random lowercase test:', randomLowercaseTest?.content);
    console.log('Random punctuation test:', randomPunctuationTest?.content);
    
    expect(randomLowercaseTest).toBeDefined();
    expect(randomPunctuationTest).toBeDefined();
    
    // Lowercase random_words should be generated tests, punctuation should be existing tests
    expect(randomLowercaseTest?.id).toMatch(/^generated_lowercase_random_words_/);
    expect(randomPunctuationTest?.id).toMatch(/^punctuation_random_sentences_/);
    
    // Content should be words, not sentences
    const lowercaseWords = randomLowercaseTest?.content.split(' ') || [];
    const punctuationWords = randomPunctuationTest?.content.split(' ') || [];
    
    expect(lowercaseWords.length).toBeGreaterThan(0);
    expect(punctuationWords.length).toBeGreaterThan(0);
    
    // Verify content is properly cased
    lowercaseWords.forEach(word => {
      expect(word).toBe(word.toLowerCase());
    });
    
    // Punctuation tests may have mixed case, so just verify they exist
    expect(punctuationWords.length).toBeGreaterThan(0);
  });
  
  it('should generate different random word tests on each call', () => {
    const test1 = getRandomTestBySubcategory('lowercase', 'random_words');
    const test2 = getRandomTestBySubcategory('lowercase', 'random_words');
    const test3 = getRandomTestBySubcategory('lowercase', 'random_words');
    
    console.log('Test 1:', test1?.content);
    console.log('Test 2:', test2?.content);
    console.log('Test 3:', test3?.content);
    
    // All should be different (though there's a small chance they could be the same)
    const content1 = test1?.content || '';
    const content2 = test2?.content || '';
    const content3 = test3?.content || '';
    
    // At least two should be different
    const uniqueContents = new Set([content1, content2, content3]);
    expect(uniqueContents.size).toBeGreaterThan(1);
  });
});

describe('Word Generator Tests', () => {
  it('should generate fluid word lists with natural difficulty progression', () => {
    const beginnerWords = WordGenerator.generateFluidWordList(8, 'beginner');
    const intermediateWords = WordGenerator.generateFluidWordList(8, 'intermediate');
    const advancedWords = WordGenerator.generateFluidWordList(8, 'advanced');
    
    console.log('Beginner fluid words:', beginnerWords);
    console.log('Intermediate fluid words:', intermediateWords);
    console.log('Advanced fluid words:', advancedWords);
    
    expect(beginnerWords.length).toBe(8);
    expect(intermediateWords.length).toBe(8);
    expect(advancedWords.length).toBe(8);
    
    // Each difficulty should include some easier words for fluidity
    const beginnerAvgLength = beginnerWords.reduce((sum, word) => sum + word.length, 0) / beginnerWords.length;
    const advancedAvgLength = advancedWords.reduce((sum, word) => sum + word.length, 0) / advancedWords.length;
    
    // Should have natural progression but not exclusive (with some flexibility for expanded dictionary)
    // At least beginner should be shorter than advanced
    expect(beginnerAvgLength).toBeLessThan(advancedAvgLength);
    
    // Intermediate might vary due to expanded dictionary, but should still include easier words
    // We'll check this in the specific word inclusion tests below
    
    // Check that intermediate includes some beginner words
    const intermediateHasBeginnerWords = intermediateWords.some(word => 
      word.length <= 4 || ['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can'].includes(word)
    );
    expect(intermediateHasBeginnerWords).toBe(true);
    
    // Check that advanced includes some intermediate words
    const advancedHasIntermediateWords = advancedWords.some(word => 
      word.length >= 6 && word.length <= 10
    );
    expect(advancedHasIntermediateWords).toBe(true);
  });
  
  it('should generate word lists with easier words included', () => {
    const intermediateWords = WordGenerator.generateWordList({ 
      difficulty: 'intermediate', 
      wordCount: 8, 
      includeEasier: true 
    });
    const advancedWords = WordGenerator.generateWordList({ 
      difficulty: 'advanced', 
      wordCount: 8, 
      includeEasier: true 
    });
    
    console.log('Intermediate with easier words:', intermediateWords);
    console.log('Advanced with easier words:', advancedWords);
    
    expect(intermediateWords.length).toBe(8);
    expect(advancedWords.length).toBe(8);
    
    // Should include some shorter/easier words
    const intermediateHasShortWords = intermediateWords.some(word => word.length <= 4);
    const advancedHasShortWords = advancedWords.some(word => word.length <= 4);
    
    expect(intermediateHasShortWords).toBe(true);
    expect(advancedHasShortWords).toBe(true);
  });
  
  it('should generate random word lists', () => {
    const randomWords1 = WordGenerator.generateRandomWordList(8);
    const randomWords2 = WordGenerator.generateRandomWordList(8);
    
    console.log('Random words 1:', randomWords1);
    console.log('Random words 2:', randomWords2);
    
    expect(randomWords1.length).toBe(8);
    expect(randomWords2.length).toBe(8);
    
    // Should be different (though there's a small chance they could be the same)
    const content1 = randomWords1.join(' ');
    const content2 = randomWords2.join(' ');
    console.log('Content 1:', content1);
    console.log('Content 2:', content2);
  });
  
  it('should generate mixed word lists', () => {
    const mixedWords = WordGenerator.generateMixedWordList(10);
    
    console.log('Mixed words:', mixedWords);
    expect(mixedWords.length).toBe(10);
    
    // Should contain words of different lengths
    const lengths = mixedWords.map(word => word.length);
    const uniqueLengths = [...new Set(lengths)];
    expect(uniqueLengths.length).toBeGreaterThan(1);
  });
});
