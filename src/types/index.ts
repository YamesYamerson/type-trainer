export interface TypingTest {
  id: string;
  category: string;
  subcategory: string;
  content: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  language?: string;
}

export interface TypingMode {
  id: string;
  name: string;
  options: string[];
  contentPath: string;
  subcategories: TypingSubcategory[];
}

export interface TypingSubcategory {
  id: string;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
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
  subcategory: string; // Add subcategory field to track test subcategory
  timestamp: number;
  hash: string; // Unique hash to prevent duplicates
  sessionId?: string; // Optional session ID to group related test runs
}

export interface UserStats {
  totalTests: number;
  averageWpm: number;
  bestWpm: number;
  averageAccuracy: number;
  lastTestDate: number | null;
  totalCharacters?: number;
  totalErrors?: number;
  categoryStats?: {
    [key: string]: {
      tests: number;
      averageWpm: number;
      averageAccuracy: number;
    };
  };
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
