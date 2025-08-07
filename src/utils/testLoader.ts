import type { TypingTest, TypingMode } from '../types';
import testData from '../data/typing-tests.json';
import modeData from '../data/typing-modes.json';

export const loadTests = (): TypingTest[] => {
  return testData as TypingTest[];
};

export const loadTestsByCategory = (category: string): TypingTest[] => {
  return testData.filter(test => test.category === category) as TypingTest[];
};

export const loadTestById = (id: string): TypingTest | undefined => {
  return (testData as TypingTest[]).find(test => test.id === id);
};

export const getAvailableCategories = (): string[] => {
  const categories = (testData as TypingTest[]).map(test => test.category);
  return [...new Set(categories)]; // Remove duplicates
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
