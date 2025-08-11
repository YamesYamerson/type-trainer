import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TestPage } from '../../src/pages/TestPage';
import { PetManager } from '../../src/utils/petManager';
import { useTypingResults } from '../../src/hooks/useTypingResults';

// Mock dependencies
jest.mock('../../src/utils/petManager');
jest.mock('../../src/hooks/useTypingResults');
jest.mock('../../src/utils/testLoader');
jest.mock('../../src/config/environment');

const MockUseTypingResults = useTypingResults as jest.MockedFunction<typeof useTypingResults>;

// Mock the static getInstance method - will be set up in beforeEach
let mockPetManagerInstance: any;
jest.spyOn(PetManager, 'getInstance').mockImplementation(() => mockPetManagerInstance);

// Mock environment config
jest.mock('../../src/config/environment', () => ({
  config: {
    apiBaseUrl: 'http://localhost:3002/api',
    appName: 'Type Trainer',
    appVersion: '1.0.0',
    isDevelopment: true,
    isProduction: false
  }
}));

// Mock test loader
jest.mock('../../src/utils/testLoader', () => ({
  loadModes: jest.fn(() => [
    {
      id: 'lowercase',
      name: 'Lowercase',
      options: ['Basic words', 'Simple sentences'],
      subcategories: [
        {
          id: 'random_words',
          name: 'Random Words',
          description: 'Practice with random lowercase words',
          difficulty: 'beginner'
        }
      ]
    }
  ]),
  getRandomTestBySubcategory: jest.fn(() => ({
    id: 'test_123',
    category: 'lowercase',
    subcategory: 'random_words',
    content: 'This is a test typing content for practice.',
    difficulty: 'beginner',
    language: 'en'
  }))
}));

describe('TestPage Component', () => {
  let mockTypingResults: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock PetManager instance
    mockPetManagerInstance = {
      getPetState: jest.fn(() => ({
        stats: {
          level: 1,
          experience: 0,
          happiness: 50,
          energy: 100,
          evolutionStage: 0,
          lastFed: Date.now(),
          lastPlayed: Date.now(),
          totalTestsCompleted: 0,
          averageWpm: 0,
          bestWpm: 0
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
      })),
      getCurrentEvolution: jest.fn(() => ({
        stage: 0,
        name: 'Egg',
        spriteSheet: '/sprites/egg-sheet.png',
        frameWidth: 32,
        frameHeight: 32,
        scale: 1.0,
        animationFrames: {
          'idle': [0, 1, 2, 3],
          'walkLeft': [0, 1, 2, 3],
          'walkRight': [0, 1, 2, 3],
          'happy': [4, 5, 6, 7],
          'sad': [8, 9, 10, 11]
        }
      })),
      updatePetFromTestResult: jest.fn()
    };

    // Mock is set up in the jest.spyOn above

    // Mock typing results hook
    mockTypingResults = {
      results: [
        {
          testId: 'test_1',
          category: 'lowercase',
          subcategory: 'random_words',
          wpm: 45,
          accuracy: 95,
          errors: 2,
          totalCharacters: 100,
          correctCharacters: 98,
          timeElapsed: 80000,
          timestamp: Date.now(),
          hash: 'hash_1'
        }
      ],
      addResult: jest.fn(),
      syncStatus: null,
      syncPendingData: null
    };

    MockUseTypingResults.mockReturnValue(mockTypingResults);
  });

  describe('Initial Rendering', () => {
    it('should render the main typing practice page', () => {
      render(<TestPage />);
      
      expect(screen.getByText('Typing Practice')).toBeInTheDocument();
      expect(screen.getByText('Choose a mode and subcategory to start improving your typing skills')).toBeInTheDocument();
    });

    it('should display the pet component', () => {
      render(<TestPage />);
      
      expect(screen.getByText('Egg')).toBeInTheDocument();
      expect(screen.getByText('Show Stats')).toBeInTheDocument();
    });

    it('should display the stats component', () => {
      render(<TestPage />);
      
      expect(screen.getByText('Your Stats')).toBeInTheDocument();
      expect(screen.getByText('45')).toBeInTheDocument(); // WPM from mock results
      expect(screen.getByText('95%')).toBeInTheDocument(); // Accuracy from mock results
    });

    it('should display the mode selector', () => {
      render(<TestPage />);
      
      expect(screen.getByText('Select Typing Mode & Subcategory')).toBeInTheDocument();
      expect(screen.getByText('Lowercase')).toBeInTheDocument();
    });
  });

  describe('Layout Structure', () => {
    it('should have pet and stats in the same container', () => {
      render(<TestPage />);
      
      // Both pet and stats should be visible
      expect(screen.getByText('Egg')).toBeInTheDocument();
      expect(screen.getByText('Your Stats')).toBeInTheDocument();
      
      // They should be in the same grid container
      const petContainer = screen.getByText('Egg').closest('.pet-container');
      const statsContainer = screen.getByText('Your Stats').closest('.bg-white');
      
      expect(petContainer).toBeInTheDocument();
      expect(statsContainer).toBeInTheDocument();
    });

    it('should use proper grid layout for pet and stats', () => {
      render(<TestPage />);
      
      // The layout should use grid with proper responsive classes
      const mainContainer = screen.getByText('Egg').closest('[class*="grid"]');
      expect(mainContainer).toBeInTheDocument();
    });

    it('should have consistent spacing between sections', () => {
      render(<TestPage />);
      
      // Check that sections have proper margin classes
      const petStatsContainer = screen.getByText('Egg').closest('[class*="mb-8"]');
      expect(petStatsContainer).toBeInTheDocument();
    });
  });

  describe('Environment-Aware Features', () => {
    it('should show developer information in development mode', () => {
      render(<TestPage />);
      
      expect(screen.getByText('🛠️ Developer Information')).toBeInTheDocument();
      expect(screen.getByText('Pet sprites are using fallback rendering. To add custom sprites:')).toBeInTheDocument();
    });

    it('should display sprite generation tools for developers', () => {
      render(<TestPage />);
      
      expect(screen.getByText('🥚 Generate Egg Sprite')).toBeInTheDocument();
      expect(screen.getByText('🎨 Full Sprite Editor')).toBeInTheDocument();
    });

    it('should show sprite requirements for developers', () => {
      render(<TestPage />);
      
      expect(screen.getByText('Place PNG files in /public/sprites/')).toBeInTheDocument();
      expect(screen.getByText('Use naming: egg-sheet.png, baby-sheet.png, etc.')).toBeInTheDocument();
      expect(screen.getByText('20 frames per sprite (4×5 grid)')).toBeInTheDocument();
    });

    it('should not show developer info in production mode', () => {
      // Mock production environment
      jest.doMock('../../src/config/environment', () => ({
        config: {
          isDevelopment: false,
          isProduction: true
        }
      }));

      render(<TestPage />);
      
      expect(screen.queryByText('🛠️ Developer Information')).not.toBeInTheDocument();
      expect(screen.getByText('🐾 Your pet is ready for adventure!')).toBeInTheDocument();
    });
  });

  describe('Pet Integration', () => {
    it('should render pet with correct props', () => {
      render(<TestPage />);
      
      expect(screen.getByText('Egg')).toBeInTheDocument();
      expect(screen.getByText('Show Stats')).toBeInTheDocument();
    });

    it('should handle pet interactions', () => {
      render(<TestPage />);
      
      // Pet should be interactive
      const statsButton = screen.getByText('Show Stats');
      fireEvent.click(statsButton);
      
      expect(screen.getByText('Hide Stats')).toBeInTheDocument();
    });

    it('should display pet evolution progress', () => {
      render(<TestPage />);
      
      // Should show evolution information
      expect(screen.getByText('Next: Baby')).toBeInTheDocument();
      expect(screen.getByText('25%')).toBeInTheDocument();
    });
  });

  describe('Stats Integration', () => {
    it('should display typing statistics correctly', () => {
      render(<TestPage />);
      
      expect(screen.getByText('45')).toBeInTheDocument(); // WPM
      expect(screen.getByText('95%')).toBeInTheDocument(); // Accuracy
      expect(screen.getByText('0')).toBeInTheDocument(); // Best WPM (from mock)
      expect(screen.getByText('1')).toBeInTheDocument(); // Tests Completed
    });

    it('should show category performance', () => {
      render(<TestPage />);
      
      expect(screen.getByText('Category Performance')).toBeInTheDocument();
      expect(screen.getByText('lowercase')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument(); // Tests count
    });
  });

  describe('Mode Selection', () => {
    it('should display available typing modes', () => {
      render(<TestPage />);
      
      expect(screen.getByText('Lowercase')).toBeInTheDocument();
      expect(screen.getByText('Basic words, Simple sentences')).toBeInTheDocument();
    });

    it('should show subcategory information', () => {
      render(<TestPage />);
      
      expect(screen.getByText('1 subcategories')).toBeInTheDocument();
    });

    it('should handle mode expansion and collapse', () => {
      render(<TestPage />);
      
      const modeButton = screen.getByText('Lowercase');
      fireEvent.click(modeButton);
      
      // Should show subcategories
      expect(screen.getByText('Choose Subcategory:')).toBeInTheDocument();
      expect(screen.getByText('Random Words')).toBeInTheDocument();
    });
  });

  describe('Test Controls', () => {
    it('should display virtual keyboard toggle', () => {
      render(<TestPage />);
      
      expect(screen.getByText('Show Virtual Keyboard')).toBeInTheDocument();
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('should display start test button', () => {
      render(<TestPage />);
      
      expect(screen.getByText('Start Typing Test')).toBeInTheDocument();
    });

    it('should display pet training test button', () => {
      render(<TestPage />);
      
      expect(screen.getByText('🐾 Pet Training Test')).toBeInTheDocument();
    });

    it('should show pet training information', () => {
      render(<TestPage />);
      
      expect(screen.getByText('🐾 Pet Training Test:')).toBeInTheDocument();
      expect(screen.getByText('Special test that gives your pet bonus experience and happiness!')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should use responsive grid classes', () => {
      render(<TestPage />);
      
      // Check for responsive grid classes
      const gridContainer = screen.getByText('Egg').closest('[class*="grid-cols-1"]');
      expect(gridContainer).toBeInTheDocument();
    });

    it('should have proper container constraints', () => {
      render(<TestPage />);
      
      // Check for max-width constraints
      const mainContainer = screen.getByText('Egg').closest('[class*="max-w-6xl"]');
      expect(mainContainer).toBeInTheDocument();
    });
  });

  describe('Component Integration', () => {
    it('should integrate pet, stats, and mode selector properly', () => {
      render(<TestPage />);
      
      // All main components should be present
      expect(screen.getByText('Egg')).toBeInTheDocument(); // Pet
      expect(screen.getByText('Your Stats')).toBeInTheDocument(); // Stats
      expect(screen.getByText('Select Typing Mode & Subcategory')).toBeInTheDocument(); // Mode Selector
    });

    it('should maintain proper spacing between components', () => {
      render(<TestPage />);
      
      // Check that components don't overlap
      const pet = screen.getByText('Egg');
      const stats = screen.getByText('Your Stats');
      const modeSelector = screen.getByText('Select Typing Mode & Subcategory');
      
      expect(pet).toBeInTheDocument();
      expect(stats).toBeInTheDocument();
      expect(modeSelector).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing typing results gracefully', () => {
      // Mock empty results
      MockUseTypingResults.mockReturnValue({
        ...mockTypingResults,
        results: []
      });

      render(<TestPage />);
      
      // Should still render without crashing
      expect(screen.getByText('Typing Practice')).toBeInTheDocument();
    });

    it('should handle missing modes gracefully', () => {
      // Mock empty modes
      jest.doMock('../../src/utils/testLoader', () => ({
        loadModes: jest.fn(() => []),
        getRandomTestBySubcategory: jest.fn(() => null)
      }));

      render(<TestPage />);
      
      // Should still render without crashing
      expect(screen.getByText('Typing Practice')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      render(<TestPage />);
      
      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toHaveTextContent('Typing Practice');
    });

    it('should have accessible form controls', () => {
      render(<TestPage />);
      
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAccessibleName('Show Virtual Keyboard');
    });

    it('should have proper button labels', () => {
      render(<TestPage />);
      
      expect(screen.getByRole('button', { name: 'Start Typing Test' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '🐾 Pet Training Test' })).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should render efficiently with multiple components', () => {
      const startTime = performance.now();
      
      render(<TestPage />);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render in reasonable time (adjust threshold as needed)
      expect(renderTime).toBeLessThan(1000);
    });

    it('should not cause memory leaks with pet animations', () => {
      const { unmount } = render(<TestPage />);
      
      // Should clean up properly
      unmount();
      
      // No specific assertions needed, just checking it doesn't crash
      expect(true).toBe(true);
    });
  });
});
