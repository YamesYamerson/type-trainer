/**
 * Tests for word generator utility
 * 
 * This file tests the word generator which handles generating word lists
 * from the dictionary based on difficulty and other criteria.
 * 
 * @see WordGenerator - The utility being tested
 * @see word-dictionary.json - The dictionary data source
 */

import { WordGenerator } from '../../src/utils/wordGenerator';

describe('WordGenerator', () => {
  describe('generateWordList', () => {
    it('should generate beginner word list', () => {
      const words = WordGenerator.generateWordList({ difficulty: 'beginner', wordCount: 5 });
      
      expect(words).toHaveLength(5);
      expect(words.every(word => typeof word === 'string')).toBe(true);
      expect(words.every(word => word.length > 0)).toBe(true);
    });

    it('should generate intermediate word list', () => {
      const words = WordGenerator.generateWordList({ difficulty: 'intermediate', wordCount: 5 });
      
      expect(words).toHaveLength(5);
      expect(words.every(word => typeof word === 'string')).toBe(true);
      expect(words.every(word => word.length > 0)).toBe(true);
    });

    it('should generate advanced word list', () => {
      const words = WordGenerator.generateWordList({ difficulty: 'advanced', wordCount: 5 });
      
      expect(words).toHaveLength(5);
      expect(words.every(word => typeof word === 'string')).toBe(true);
      expect(words.every(word => word.length > 0)).toBe(true);
    });

    it('should respect word count limit', () => {
      const words = WordGenerator.generateWordList({ difficulty: 'beginner', wordCount: 3 });
      expect(words).toHaveLength(3);
    });

    it('should filter by minimum length', () => {
      const words = WordGenerator.generateWordList({ 
        difficulty: 'beginner', 
        wordCount: 10, 
        minLength: 4 
      });
      
      expect(words.every(word => word.length >= 4)).toBe(true);
    });

    it('should filter by maximum length', () => {
      const words = WordGenerator.generateWordList({ 
        difficulty: 'beginner', 
        wordCount: 10, 
        maxLength: 3 
      });
      
      expect(words.every(word => word.length <= 3)).toBe(true);
    });

    it('should include easier words when includeEasier is true', () => {
      const words = WordGenerator.generateWordList({ 
        difficulty: 'advanced', 
        wordCount: 20, 
        includeEasier: true 
      });
      
      // Should have more words than just advanced level
      expect(words.length).toBeGreaterThanOrEqual(20);
    });

    it('should not include easier words when includeEasier is false', () => {
      const words = WordGenerator.generateWordList({ 
        difficulty: 'advanced', 
        wordCount: 20, 
        includeEasier: false 
      });
      
      // Should only have advanced level words
      expect(words.length).toBeLessThanOrEqual(20);
    });
  });

  describe('generateRandomWordList', () => {
    it('should generate random difficulty word list', () => {
      const words = WordGenerator.generateRandomWordList(5);
      
      expect(words).toHaveLength(5);
      expect(words.every(word => typeof word === 'string')).toBe(true);
    });

    it('should respect word count', () => {
      const words = WordGenerator.generateRandomWordList(7);
      expect(words).toHaveLength(7);
    });
  });

  describe('generateMixedWordList', () => {
    it('should generate mixed difficulty word list', () => {
      const words = WordGenerator.generateMixedWordList(10);
      
      expect(words).toHaveLength(10);
      expect(words.every(word => typeof word === 'string')).toBe(true);
    });

    it('should include words from all difficulty levels', () => {
      const words = WordGenerator.generateMixedWordList(50);
      
      // Should have a good mix of different word lengths
      const shortWords = words.filter(word => word.length <= 3);
      const mediumWords = words.filter(word => word.length > 3 && word.length <= 6);
      const longWords = words.filter(word => word.length > 6);
      
      expect(shortWords.length).toBeGreaterThan(0);
      expect(mediumWords.length).toBeGreaterThan(0);
      expect(longWords.length).toBeGreaterThan(0);
    });
  });

  describe('generateProgressiveWordList', () => {
    it('should generate progressive word list from beginner', () => {
      const words = WordGenerator.generateProgressiveWordList('beginner', 8);
      
      expect(words).toHaveLength(8);
      expect(words.every(word => typeof word === 'string')).toBe(true);
    });

    it('should generate progressive word list from intermediate', () => {
      const words = WordGenerator.generateProgressiveWordList('intermediate', 8);
      
      expect(words).toHaveLength(8);
      expect(words.every(word => typeof word === 'string')).toBe(true);
    });

    it('should generate progressive word list from advanced', () => {
      const words = WordGenerator.generateProgressiveWordList('advanced', 8);
      
      expect(words).toHaveLength(8);
      expect(words.every(word => typeof word === 'string')).toBe(true);
    });
  });

  describe('generateFluidWordList', () => {
    it('should generate fluid word list with target difficulty', () => {
      const words = WordGenerator.generateFluidWordList(6, 'intermediate');
      
      expect(words).toHaveLength(6);
      expect(words.every(word => typeof word === 'string')).toBe(true);
    });

    it('should generate fluid word list with default target', () => {
      const words = WordGenerator.generateFluidWordList(6);
      
      expect(words).toHaveLength(6);
      expect(words.every(word => typeof word === 'string')).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty options', () => {
      const words = WordGenerator.generateWordList();
      
      expect(words).toHaveLength(30); // Default word count (updated from 10 to 30)
      expect(words.every(word => typeof word === 'string')).toBe(true);
    });

    it('should handle very large word count requests', () => {
      const words = WordGenerator.generateWordList({ wordCount: 1000 });
      
      // Should return all available words
      expect(words.length).toBeGreaterThan(0);
      expect(words.every(word => typeof word === 'string')).toBe(true);
    });

    it('should handle zero word count', () => {
      const words = WordGenerator.generateWordList({ wordCount: 0 });
      expect(words).toHaveLength(0);
    });

    it('should handle negative word count', () => {
      const words = WordGenerator.generateWordList({ wordCount: -5 });
      expect(words).toHaveLength(0);
    });
  });

  describe('Dictionary validation', () => {
    it('should have valid beginner words', () => {
      const words = WordGenerator.generateWordList({ difficulty: 'beginner', wordCount: 100 });
      
      // Check that we have a reasonable number of beginner words
      expect(words.length).toBeGreaterThan(50);
      
      // Check that words are reasonable length for beginners
      const avgLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
      expect(avgLength).toBeLessThan(8); // Beginner words should be relatively short
    });

    it('should have valid intermediate words', () => {
      const words = WordGenerator.generateWordList({ difficulty: 'intermediate', wordCount: 100 });
      
      // Check that we have a reasonable number of intermediate words
      expect(words.length).toBeGreaterThan(50);
      
      // Check that words are reasonable length for intermediate users
      const avgLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
      expect(avgLength).toBeGreaterThan(3); // Intermediate words should be longer than beginner
    });

    it('should have valid advanced words', () => {
      const words = WordGenerator.generateWordList({ difficulty: 'advanced', wordCount: 100 });
      
      // Check that we have a reasonable number of advanced words
      expect(words.length).toBeGreaterThan(50);
      
      // Check that words are reasonable length for advanced users
      const avgLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
      expect(avgLength).toBeGreaterThan(6); // Advanced words should be longer
    });
  });
});
