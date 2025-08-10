import type { TypingTest, TypingMode, TypingSubcategory } from '../types';
import testData from '../data/typing-tests.json';
import modeData from '../data/typing-modes.json';
import { WordGenerator } from './wordGenerator';

export const loadTests = (): TypingTest[] => {
  return testData as TypingTest[];
};

export const loadTestsByCategory = (category: string): TypingTest[] => {
  return testData.filter(test => test.category === category) as TypingTest[];
};

export const loadTestsBySubcategory = (category: string, subcategory: string): TypingTest[] => {
  const tests = testData.filter(test => 
    test.category === category && test.subcategory === subcategory
  ) as TypingTest[];
  return tests;
};

export const loadTestById = (id: string): TypingTest | undefined => {
  return (testData as TypingTest[]).find(test => test.id === id);
};

export const getAvailableCategories = (): string[] => {
  const categories = (testData as TypingTest[]).map(test => test.category);
  return [...new Set(categories)]; // Remove duplicates
};

export const getAvailableSubcategories = (category: string): string[] => {
  const subcategories = (testData as TypingTest[])
    .filter(test => test.category === category)
    .map(test => test.subcategory);
  return [...new Set(subcategories)]; // Remove duplicates
};

export const loadModes = (): TypingMode[] => {
  return modeData as TypingMode[];
};

export const loadModeById = (id: string): TypingMode | undefined => {
  return (modeData as TypingMode[]).find(mode => mode.id === id);
};

export const getRandomTestByCategory = (category: string): TypingTest | undefined => {
  const tests = loadTestsByCategory(category);
  if (tests.length === 0) return undefined;
  return tests[Math.floor(Math.random() * tests.length)];
};

export const getRandomTestBySubcategory = (category: string, subcategory: string): TypingTest | undefined => {
  // Special handling for random_words subcategory
  if (subcategory === 'random_words') {
    const difficulty = category === 'lowercase' ? 'beginner' : 
                      category === 'uppercase' ? 'intermediate' : 'beginner';
    
    // Use fluid word generation for natural difficulty progression
    const words = WordGenerator.generateFluidWordList(8, difficulty);
    
    const content = category === 'uppercase' ? words.join(' ').toUpperCase() : words.join(' ');
    
    return {
      id: `generated_${category}_${subcategory}_${Date.now()}`,
      category,
      subcategory,
      content,
      difficulty,
      language: 'en'
    };
  }
  
  // Fallback to existing logic for other subcategories
  const tests = loadTestsBySubcategory(category, subcategory);
  if (tests.length === 0) {
    return undefined;
  }
  const randomIndex = Math.floor(Math.random() * tests.length);
  return tests[randomIndex];
};

export const getSubcategoriesForMode = (modeId: string): TypingSubcategory[] => {
  const mode = loadModeById(modeId);
  return mode?.subcategories || [];
};
