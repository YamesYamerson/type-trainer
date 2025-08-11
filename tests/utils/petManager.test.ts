import { PetManager } from '../../src/utils/petManager';
import type { TypingResult } from '../../src/types';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
  removeItem: jest.fn(),
  length: 0,
  key: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('PetManager', () => {
  let petManager: PetManager;

  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockClear();
    petManager = PetManager.getInstance();
  });

  afterEach(() => {
    // Reset singleton instance
    (PetManager as any).instance = undefined;
  });

  describe('Initialization', () => {
    it('should create a singleton instance', () => {
      const instance1 = PetManager.getInstance();
      const instance2 = PetManager.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should initialize with default egg pet state', () => {
      const state = petManager.getPetState();
      expect(state.stats.level).toBe(1);
      expect(state.stats.evolutionStage).toBe(0); // Should start as egg
      expect(state.stats.experience).toBe(0);
      expect(state.stats.happiness).toBe(50);
      expect(state.stats.energy).toBe(100);
    });
  });

  describe('Pet Evolution', () => {
    it('should get current evolution stage', () => {
      const evolution = petManager.getCurrentEvolution();
      expect(evolution.stage).toBe(0);
      expect(evolution.name).toBe('Egg');
    });

    it('should get next evolution when available', () => {
      const nextEvolution = petManager.getNextEvolution();
      expect(nextEvolution).toBeTruthy();
      expect(nextEvolution?.stage).toBe(1);
      expect(nextEvolution?.name).toBe('Baby');
    });

    it('should return null for next evolution at max stage', () => {
      // Mock pet at max evolution stage
      const mockState = {
        stats: {
          level: 10,
          experience: 1000,
          happiness: 95,
          evolutionStage: 7,
          energy: 100,
          lastFed: Date.now(),
          lastPlayed: Date.now(),
          totalTestsCompleted: 100,
          averageWpm: 80,
          bestWpm: 120
        },
        animation: {
          currentAnimation: 'idle',
          currentFrame: 0,
          frameCount: 0,
          animationSpeed: 150,
          lastFrameTime: Date.now(),
          isMoving: false,
          direction: 'right',
          targetX: 0,
          currentX: 0
        },
        isVisible: true,
        position: { x: 100, y: 300 }
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockState));
      const maxStagePet = PetManager.getInstance();
      const nextEvolution = maxStagePet.getNextEvolution();
      expect(nextEvolution).toBeNull();
    });
  });

  describe('Experience and Leveling', () => {
    it('should gain experience from good test results', () => {
      const goodResult: TypingResult = {
        wpm: 60,
        accuracy: 98,
        errors: 2,
        totalCharacters: 100,
        correctCharacters: 98,
        timeElapsed: 60000,
        testId: 'test1',
        category: 'lowercase',
        subcategory: 'random_words',
        timestamp: Date.now(),
        hash: 'hash1'
      };

      const initialState = petManager.getPetState();
      petManager.updatePetFromTestResult(goodResult);
      const updatedState = petManager.getPetState();

      expect(updatedState.stats.experience).toBeGreaterThan(initialState.stats.experience);
      expect(updatedState.stats.happiness).toBeGreaterThan(initialState.stats.happiness);
    });

    it('should lose happiness from poor test results', () => {
      const poorResult: TypingResult = {
        wpm: 15,
        accuracy: 75,
        errors: 25,
        totalCharacters: 100,
        correctCharacters: 75,
        timeElapsed: 60000,
        testId: 'test2',
        category: 'lowercase',
        subcategory: 'random_words',
        timestamp: Date.now(),
        hash: 'hash2'
      };

      const initialState = petManager.getPetState();
      petManager.updatePetFromTestResult(poorResult);
      const updatedState = petManager.getPetState();

      expect(updatedState.stats.happiness).toBeLessThan(initialState.stats.happiness);
    });

    it('should level up when experience threshold is met', () => {
      const highExpResult: TypingResult = {
        wpm: 80,
        accuracy: 100,
        errors: 0,
        totalCharacters: 100,
        correctCharacters: 100,
        timeElapsed: 60000,
        testId: 'test3',
        category: 'lowercase',
        subcategory: 'random_words',
        timestamp: Date.now(),
        hash: 'hash3'
      };

      // Give enough experience to level up
      for (let i = 0; i < 10; i++) {
        petManager.updatePetFromTestResult(highExpResult);
      }

      const state = petManager.getPetState();
      expect(state.stats.level).toBeGreaterThan(1);
    });
  });

  describe('Evolution Progress', () => {
    it('should calculate evolution progress correctly', () => {
      const progress = petManager.getEvolutionProgress();
      expect(progress.current).toBe(0);
      expect(progress.next).toBe(1);
      expect(progress.percentage).toBeGreaterThanOrEqual(0);
      expect(progress.percentage).toBeLessThanOrEqual(100);
    });

    it('should show 100% progress at max evolution', () => {
      // Mock pet at max evolution stage
      const mockState = {
        stats: {
          level: 10,
          experience: 1000,
          happiness: 95,
          evolutionStage: 7,
          energy: 100,
          lastFed: Date.now(),
          lastPlayed: Date.now(),
          totalTestsCompleted: 100,
          averageWpm: 80,
          bestWpm: 120
        },
        animation: {
          currentAnimation: 'idle',
          currentFrame: 0,
          frameCount: 0,
          animationSpeed: 150,
          lastFrameTime: Date.now(),
          isMoving: false,
          direction: 'right',
          targetX: 0,
          currentX: 0
        },
        isVisible: true,
        position: { x: 100, y: 300 }
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockState));
      const maxStagePet = PetManager.getInstance();
      const progress = maxStagePet.getEvolutionProgress();
      expect(progress.percentage).toBe(100);
    });
  });

  describe('State Persistence', () => {
    it('should save state to localStorage', () => {
      const testResult: TypingResult = {
        wpm: 50,
        accuracy: 95,
        errors: 1,
        totalCharacters: 100,
        correctCharacters: 95,
        timeElapsed: 60000,
        testId: 'test4',
        category: 'lowercase',
        subcategory: 'random_words',
        timestamp: Date.now(),
        hash: 'hash4'
      };
      
      petManager.updatePetFromTestResult(testResult);
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('should load state from localStorage', () => {
      const mockState = {
        stats: {
          level: 5,
          experience: 500,
          happiness: 80,
          evolutionStage: 2,
          energy: 75,
          lastFed: Date.now(),
          lastPlayed: Date.now(),
          totalTestsCompleted: 50,
          averageWpm: 60,
          bestWpm: 100
        },
        animation: {
          currentAnimation: 'idle',
          currentFrame: 0,
          frameCount: 0,
          animationSpeed: 150,
          lastFrameTime: Date.now(),
          isMoving: false,
          direction: 'right',
          targetX: 0,
          currentX: 0
        },
        isVisible: true,
        position: { x: 100, y: 300 }
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockState));
      const loadedPet = PetManager.getInstance();
      const state = loadedPet.getPetState();

      expect(state.stats.level).toBe(5);
      expect(state.stats.evolutionStage).toBe(2);
    });
  });

  describe('Automatic Progression', () => {
    it('should automatically progress pet based on test performance', () => {
      const excellentResult: TypingResult = {
        wpm: 100,
        accuracy: 100,
        errors: 0,
        totalCharacters: 100,
        correctCharacters: 100,
        timeElapsed: 60000,
        testId: 'excellent-test',
        category: 'lowercase',
        subcategory: 'random_words',
        timestamp: Date.now(),
        hash: 'excellent-hash'
      };

      // Complete multiple excellent tests to trigger evolution
      for (let i = 0; i < 15; i++) {
        petManager.updatePetFromTestResult(excellentResult);
      }

      const state = petManager.getPetState();
      expect(state.stats.level).toBeGreaterThan(1);
      expect(state.stats.experience).toBeGreaterThan(100);
    });
  });
});
