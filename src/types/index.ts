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
      totalWpm: number;
      totalAccuracy: number;
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

// Pet System Types
export interface PetStats {
  happiness: number; // 0-100
  energy: number; // 0-100
  experience: number; // 0-1000
  level: number; // 1-10
  evolutionStage: number; // 0-7 (8 evolutions total)
  lastFed: number; // timestamp
  lastPlayed: number; // timestamp
  totalTestsCompleted: number;
  averageWpm: number;
  bestWpm: number;
}

export interface PetEvolution {
  stage: number;
  name: string;
  spriteSheet: string;
  frameWidth: number;
  frameHeight: number;
  animationFrames: {
    idle: number[];
    walkLeft: number[];
    walkRight: number[];
    happy: number[];
    sad: number[];
  };
  scale: number;
  requirements: {
    level: number;
    experience: number;
    happiness: number;
  };
}

export interface PetAnimation {
  currentAnimation: 'idle' | 'walkLeft' | 'walkRight' | 'happy' | 'sad';
  currentFrame: number;
  frameCount: number;
  animationSpeed: number;
  lastFrameTime: number;
  isMoving: boolean;
  direction: 'left' | 'right';
  targetX: number;
  currentX: number;
}

export interface PetState {
  stats: PetStats;
  animation: PetAnimation;
  isVisible: boolean;
  position: {
    x: number;
    y: number;
  };
}
