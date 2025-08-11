import wordDictionary from '../data/word-dictionary.json';

export interface WordListOptions {
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  wordCount?: number;
  minLength?: number;
  maxLength?: number;
  includeEasier?: boolean; // Whether to include easier words in higher difficulties
}

export class WordGenerator {
  private static getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  static generateWordList(options: WordListOptions = {}): string[] {
    const {
      difficulty = 'beginner',
      wordCount = 30,
      minLength = 0,
      maxLength = Infinity,
      includeEasier = true
    } = options;

    // Handle invalid word counts
    if (wordCount <= 0) {
      return [];
    }

    let availableWords: string[] = [];
    
    if (difficulty === 'beginner') {
      // Beginner gets core words
      availableWords = wordDictionary.beginner.core;
    } else if (difficulty === 'intermediate') {
      // Intermediate gets mixed words (includes easier words)
      availableWords = wordDictionary.intermediate.mixed;
      if (includeEasier) {
        // Add some beginner words for fluidity
        availableWords = [...availableWords, ...wordDictionary.beginner.core];
      }
    } else if (difficulty === 'advanced') {
      // Advanced gets progressive words (includes easier words)
      availableWords = wordDictionary.advanced.progressive;
      if (includeEasier) {
        // Add intermediate and beginner words for fluidity
        availableWords = [
          ...availableWords, 
          ...wordDictionary.intermediate.mixed,
          ...wordDictionary.beginner.core
        ];
      }
    }

    // Filter words by length constraints
    let filteredWords = availableWords.filter(word => 
      word.length >= minLength && word.length <= maxLength
    );

    // If we don't have enough words after filtering, use all available
    if (filteredWords.length < wordCount) {
      filteredWords = availableWords;
    }

    // Shuffle and select the requested number of words
    const shuffled = this.shuffleArray(filteredWords);
    return shuffled.slice(0, Math.min(wordCount, shuffled.length));
  }

  static generateRandomWordList(wordCount: number = 30): string[] {
    // Handle invalid word counts
    if (wordCount <= 0) {
      return [];
    }
    
    // Randomly select difficulty
    const difficulties: Array<keyof typeof wordDictionary> = ['beginner', 'intermediate', 'advanced'];
    const randomDifficulty = this.getRandomElement(difficulties);
    
    return this.generateWordList({
      difficulty: randomDifficulty,
      wordCount,
      includeEasier: true
    });
  }

  static generateMixedWordList(wordCount: number = 30): string[] {
    // Handle invalid word counts
    if (wordCount <= 0) {
      return [];
    }
    
    const allWords: string[] = [];
    
    // Collect words from all difficulty levels
    allWords.push(...wordDictionary.beginner.core);
    allWords.push(...wordDictionary.intermediate.mixed);
    allWords.push(...wordDictionary.advanced.progressive);
    
    // Shuffle and select
    const shuffled = this.shuffleArray(allWords);
    return shuffled.slice(0, Math.min(wordCount, shuffled.length));
  }

  static generateProgressiveWordList(startDifficulty: 'beginner' | 'intermediate' | 'advanced' = 'beginner', wordCount: number = 30): string[] {
    // Handle invalid word counts
    if (wordCount <= 0) {
      return [];
    }
    
    const difficulties: Array<keyof typeof wordDictionary> = ['beginner', 'intermediate', 'advanced'];
    const startIndex = difficulties.indexOf(startDifficulty);
    
    let allWords: string[] = [];
    
    // Add words from starting difficulty and beyond, with easier words included
    for (let i = startIndex; i < difficulties.length; i++) {
      const diffLevel = difficulties[i];
      if (diffLevel === 'beginner') {
        allWords.push(...wordDictionary.beginner.core);
      } else if (diffLevel === 'intermediate') {
        allWords.push(...wordDictionary.intermediate.mixed);
        // Include some beginner words for fluidity
        allWords.push(...wordDictionary.beginner.core);
      } else if (diffLevel === 'advanced') {
        allWords.push(...wordDictionary.advanced.progressive);
        // Include intermediate and beginner words for fluidity
        allWords.push(...wordDictionary.intermediate.mixed);
        allWords.push(...wordDictionary.beginner.core);
      }
    }
    
    // Shuffle and select
    const shuffled = this.shuffleArray(allWords);
    return shuffled.slice(0, Math.min(wordCount, shuffled.length));
  }

  static generateFluidWordList(wordCount: number = 30, targetDifficulty: 'beginner' | 'intermediate' | 'advanced' = 'intermediate'): string[] {
    // Handle invalid word counts
    if (wordCount <= 0) {
      return [];
    }
    
    // Create a fluid mix that feels natural
    let primaryWords: string[] = [];
    let secondaryWords: string[] = [];
    let tertiaryWords: string[] = [];
    
    if (targetDifficulty === 'beginner') {
      primaryWords = wordDictionary.beginner.core;
      secondaryWords = wordDictionary.intermediate.mixed.slice(0, 20); // Just a few intermediate
    } else if (targetDifficulty === 'intermediate') {
      primaryWords = wordDictionary.intermediate.mixed;
      secondaryWords = wordDictionary.beginner.core;
      tertiaryWords = wordDictionary.advanced.progressive.slice(0, 15); // Just a few advanced
    } else { // advanced
      primaryWords = wordDictionary.advanced.progressive;
      secondaryWords = wordDictionary.intermediate.mixed;
      tertiaryWords = wordDictionary.beginner.core;
    }
    
    // Create a natural distribution: 60% primary, 30% secondary, 10% tertiary
    const primaryCount = Math.floor(wordCount * 0.6);
    const secondaryCount = Math.floor(wordCount * 0.3);
    const tertiaryCount = wordCount - primaryCount - secondaryCount;
    
    const shuffledPrimary = this.shuffleArray(primaryWords);
    const shuffledSecondary = this.shuffleArray(secondaryWords);
    const shuffledTertiary = this.shuffleArray(tertiaryWords);
    
    // Ensure we have enough words from each source
    let availablePrimary = Math.min(primaryCount, shuffledPrimary.length);
    let availableSecondary = Math.min(secondaryCount, shuffledSecondary.length);
    let availableTertiary = Math.min(tertiaryCount, shuffledTertiary.length);
    
    let result = [
      ...shuffledPrimary.slice(0, availablePrimary),
      ...shuffledSecondary.slice(0, availableSecondary),
      ...shuffledTertiary.slice(0, availableTertiary)
    ];
    
    // If we don't have enough words, fill from available sources
    while (result.length < wordCount) {
      if (shuffledPrimary.length > availablePrimary) {
        result.push(shuffledPrimary[availablePrimary]);
        availablePrimary++;
      } else if (shuffledSecondary.length > availableSecondary) {
        result.push(shuffledSecondary[availableSecondary]);
        availableSecondary++;
      } else if (shuffledTertiary.length > availableTertiary) {
        result.push(shuffledTertiary[availableTertiary]);
        availableTertiary++;
      } else {
        // If we still don't have enough, duplicate some words to reach the target
        const remainingNeeded = wordCount - result.length;
        const wordsToDuplicate = result.slice(0, Math.min(remainingNeeded, result.length));
        result.push(...wordsToDuplicate.slice(0, remainingNeeded));
        break;
      }
    }
    
    // Shuffle the final result to mix the difficulty levels naturally
    return this.shuffleArray(result);
  }
}
