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

export interface TypingState {
  currentIndex: number;
  typedText: string;
  errors: number[];
  isComplete: boolean;
  startTime: number | null;
  endTime: number | null;
}
