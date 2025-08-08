export interface TypingTest {
  id: string;
  category: string;
  content: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  language?: string;
}

export interface TypingMode {
  id: string;
  name: string;
  options: string[];
  contentPath: string;
}

export interface TypingResult {
  wpm: number;
  accuracy: number;
  errors: number;
  totalCharacters: number;
  correctCharacters: number;
  timeElapsed: number;
  testId: string;
  category: string; // Add category field to track test type
  timestamp: number;
}

export interface UserStats {
  userId: string;
  totalTests: number;
  averageWpm: number;
  bestWpm: number;
  totalAccuracy: number;
  lastTestDate: number;
}

// New character tracking interface
export interface TypedCharacter {
  index: number;
  inputChar: string;
  expectedChar: string;
  isCorrect: boolean;
  timestamp: number;
}

export interface TypingState {
  currentIndex: number;
  typedCharacters: TypedCharacter[]; // Stack-like structure for character tracking
  isComplete: boolean;
  startTime: number | null;
  endTime: number | null;
  totalErrors: number; // Cached for performance
  totalCorrect: number; // Cached for performance
}
