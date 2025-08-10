// Simple test script to verify dictionary functionality
const fs = require('fs');
const path = require('path');

// Read the dictionary
const dictionaryPath = path.join(__dirname, 'src/data/word-dictionary.json');
const dictionary = JSON.parse(fs.readFileSync(dictionaryPath, 'utf8'));

console.log('Dictionary loaded successfully!');
console.log(`Beginner words: ${dictionary.beginner.core.length}`);
console.log(`Intermediate words: ${dictionary.intermediate.mixed.length}`);
console.log(`Advanced words: ${dictionary.advanced.progressive.length}`);

// Test word generation logic
function generateWordList(options = {}) {
  const {
    difficulty = 'beginner',
    wordCount = 10,
    minLength = 0,
    maxLength = Infinity,
    includeEasier = true
  } = options;

  if (wordCount <= 0) {
    return [];
  }

  let availableWords = [];
  
  if (difficulty === 'beginner') {
    availableWords = dictionary.beginner.core;
  } else if (difficulty === 'intermediate') {
    availableWords = dictionary.intermediate.mixed;
    if (includeEasier) {
      availableWords = [...availableWords, ...dictionary.beginner.core];
    }
  } else { // advanced
    availableWords = dictionary.advanced.progressive;
    if (includeEasier) {
      availableWords = [...availableWords, ...dictionary.intermediate.mixed, ...dictionary.beginner.core];
    }
  }

  // Filter by length
  availableWords = availableWords.filter(word => 
    word.length >= minLength && word.length <= maxLength
  );

  // Shuffle and select
  const shuffled = availableWords.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(wordCount, shuffled.length));
}

// Test the word generation
console.log('\n--- Testing Word Generation ---');
console.log('Beginner (5 words):', generateWordList({ difficulty: 'beginner', wordCount: 5 }));
console.log('Intermediate (5 words):', generateWordList({ difficulty: 'intermediate', wordCount: 5 }));
console.log('Advanced (5 words):', generateWordList({ difficulty: 'advanced', wordCount: 5 }));
console.log('Mixed with easier words:', generateWordList({ difficulty: 'intermediate', wordCount: 8, includeEasier: true }));

// Test edge cases
console.log('\n--- Testing Edge Cases ---');
console.log('Zero words:', generateWordList({ wordCount: 0 }));
console.log('Negative words:', generateWordList({ wordCount: -5 }));
console.log('Very large request:', generateWordList({ wordCount: 1000 }).length);
console.log('Length filtering:', generateWordList({ difficulty: 'beginner', wordCount: 10, minLength: 4, maxLength: 6 }));

console.log('\n✅ Dictionary test completed successfully!');
