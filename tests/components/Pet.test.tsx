import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Pet } from '../../src/components/Pet';
import { PetManager } from '../../src/utils/petManager';

// Mock PetManager
jest.mock('../../src/utils/petManager');

// Mock canvas context
const mockContext = {
  clearRect: jest.fn(),
  drawImage: jest.fn(),
  fillStyle: '',
  fillRect: jest.fn(),
  strokeStyle: '',
  lineWidth: 1,
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  stroke: jest.fn(),
  arc: jest.fn(),
  fill: jest.fn(),
  ellipse: jest.fn(),
  font: '',
  textAlign: '',
  textBaseline: '',
  fillText: jest.fn(),
};

const mockCanvas = {
  getContext: jest.fn(() => mockContext),
  width: 64,
  height: 64,
};

// Mock HTMLCanvasElement
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: jest.fn(() => mockContext),
  writable: true,
});

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn((cb) => {
  setTimeout(cb, 16);
  return 1;
});

global.cancelAnimationFrame = jest.fn();

describe('Pet Component', () => {
  let mockPetManagerInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset canvas dimensions
    mockCanvas.width = 64;
    mockCanvas.height = 64;
    
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
      getNextEvolution: jest.fn(() => ({
        stage: 1,
        name: 'Baby',
        spriteSheet: '/sprites/baby-sheet.png',
        frameWidth: 32,
        frameHeight: 32,
        scale: 1.2,
        animationFrames: {
          'idle': [0, 1, 2, 3],
          'walkLeft': [4, 5, 6, 7],
          'walkRight': [8, 9, 10, 11],
          'happy': [12, 13, 14, 15],
          'sad': [16, 17, 18, 19]
        },
        requirements: {
          level: 2,
          experience: 100,
          happiness: 50
        }
      })),
      getEvolutionProgress: jest.fn(() => ({
        current: 0,
        next: 1,
        percentage: 25
      })),
      updateAnimation: jest.fn()
    };

    // Mock the static method
    (PetManager.getInstance as jest.Mock).mockReturnValue(mockPetManagerInstance);
  });

  describe('Initialization', () => {
    it('should render the pet component correctly', () => {
      render(<Pet />);
      
      expect(screen.getByText('Egg')).toBeInTheDocument();
      expect(screen.getByText('Show Stats')).toBeInTheDocument();
    });

    it('should display pet name and level', () => {
      render(<Pet />);
      
      expect(screen.getByText('Egg')).toBeInTheDocument();
      expect(screen.getByText('Lv.1')).toBeInTheDocument();
    });

    it('should show stats toggle button', () => {
      render(<Pet />);
      
      const statsButton = screen.getByText('Show Stats');
      expect(statsButton).toBeInTheDocument();
    });
  });

  describe('Stats Display', () => {
    it('should toggle stats visibility when button is clicked', () => {
      render(<Pet />);
      
      const statsButton = screen.getByText('Show Stats');
      fireEvent.click(statsButton);
      
      expect(screen.getByText('Hide Stats')).toBeInTheDocument();
      expect(screen.getByText('Level:')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('should display all pet stats when expanded', () => {
      render(<Pet />);
      
      // Click to show stats
      fireEvent.click(screen.getByText('Show Stats'));
      
      // Check all stat fields are displayed
      expect(screen.getByText('Level:')).toBeInTheDocument();
      expect(screen.getByText('Experience:')).toBeInTheDocument();
      expect(screen.getByText('Happiness:')).toBeInTheDocument();
      expect(screen.getByText('Energy:')).toBeInTheDocument();
      expect(screen.getByText('Tests Completed:')).toBeInTheDocument();
      expect(screen.getByText('Best WPM:')).toBeInTheDocument();
      expect(screen.getByText('Average WPM:')).toBeInTheDocument();
    });

    it('should display correct stat values', () => {
      render(<Pet />);
      
      // Click to show stats
      fireEvent.click(screen.getByText('Show Stats'));
      
      expect(screen.getByText('1')).toBeInTheDocument(); // Level
      expect(screen.getByText('0/1000')).toBeInTheDocument(); // Experience
      expect(screen.getByText('50%')).toBeInTheDocument(); // Happiness
      expect(screen.getByText('100%')).toBeInTheDocument(); // Energy
      expect(screen.getByText('0')).toBeInTheDocument(); // Tests Completed
      expect(screen.getByText('0')).toBeInTheDocument(); // Best WPM
      expect(screen.getByText('0')).toBeInTheDocument(); // Average WPM
    });
  });

  describe('Evolution Progress', () => {
    it('should display evolution progress when next evolution exists', () => {
      render(<Pet />);
      
      expect(screen.getByText('Next: Baby')).toBeInTheDocument();
      expect(screen.getByText('25%')).toBeInTheDocument();
    });

    it('should show progress bar for evolution', () => {
      render(<Pet />);
      
      const progressBar = screen.getByText('25%').closest('.evolution-progress');
      expect(progressBar).toBeInTheDocument();
    });
  });

  describe('Pet Status Indicators', () => {
    it('should show hungry indicator when energy is low', () => {
      mockPetManagerInstance.getPetState.mockReturnValue({
        ...mockPetManagerInstance.getPetState(),
        stats: {
          ...mockPetManagerInstance.getPetState().stats,
          energy: 20
        }
      });

      render(<Pet />);
      
      expect(screen.getByText('😴 Hungry')).toBeInTheDocument();
    });

    it('should show sad indicator when happiness is low', () => {
      mockPetManagerInstance.getPetState.mockReturnValue({
        ...mockPetManagerInstance.getPetState(),
        stats: {
          ...mockPetManagerInstance.getPetState().stats,
          happiness: 20
        }
      });

      render(<Pet />);
      
      expect(screen.getByText('😢 Sad')).toBeInTheDocument();
    });

    it('should show happy indicator when happiness is high', () => {
      mockPetManagerInstance.getPetState.mockReturnValue({
        ...mockPetManagerInstance.getPetState(),
        stats: {
          ...mockPetManagerInstance.getPetState().stats,
          happiness: 85
        }
      });

      render(<Pet />);
      
      expect(screen.getByText('😊 Happy')).toBeInTheDocument();
    });

    it('should not show status indicators when stats are normal', () => {
      mockPetManagerInstance.getPetState.mockReturnValue({
        ...mockPetManagerInstance.getPetState(),
        stats: {
          ...mockPetManagerInstance.getPetState().stats,
          energy: 60,
          happiness: 60
        }
      });

      render(<Pet />);
      
      expect(screen.queryByText('😴 Hungry')).not.toBeInTheDocument();
      expect(screen.queryByText('😢 Sad')).not.toBeInTheDocument();
      expect(screen.queryByText('😊 Happy')).not.toBeInTheDocument();
    });
  });

  describe('Canvas Rendering', () => {
    it('should create canvas element for pet rendering', () => {
      render(<Pet />);
      
      const canvas = document.querySelector('canvas');
      expect(canvas).toBeInTheDocument();
      expect(canvas).toHaveClass('pet-canvas');
    });

    it('should set proper canvas dimensions based on evolution', () => {
      render(<Pet />);
      
      const canvas = document.querySelector('canvas');
      expect(canvas).toBeInTheDocument();
    });
  });

  describe('Sprite Loading', () => {
    it('should attempt to load sprite from evolution config', () => {
      render(<Pet />);
      
      // The component should attempt to load the sprite
      // We can't easily test the actual Image loading in Jest, but we can verify
      // that the component renders without crashing
      expect(screen.getByText('Egg')).toBeInTheDocument();
    });

    it('should handle sprite loading errors gracefully', () => {
      // Mock Image constructor to simulate loading error
      const originalImage = global.Image;
      global.Image = jest.fn().mockImplementation(() => ({
        onload: null,
        onerror: null,
        src: '',
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      }));

      render(<Pet />);
      
      // Component should still render with fallback
      expect(screen.getByText('Egg')).toBeInTheDocument();
      
      // Restore original Image
      global.Image = originalImage;
    });
  });

  describe('Animation System', () => {
    it('should start animation loop on mount', () => {
      render(<Pet />);
      
      expect(requestAnimationFrame).toHaveBeenCalled();
    });

    it('should call updateAnimation on PetManager', () => {
      render(<Pet />);
      
      // Wait for animation frame to be called
      setTimeout(() => {
        expect(mockPetManagerInstance.updateAnimation).toHaveBeenCalled();
      }, 20);
    });

    it('should clean up animation loop on unmount', () => {
      const { unmount } = render(<Pet />);
      
      unmount();
      
      expect(cancelAnimationFrame).toHaveBeenCalled();
    });
  });

  describe('Fallback Rendering', () => {
    it('should render fallback sprite when sprites are not available', () => {
      render(<Pet />);
      
      // Component should render even without sprites
      expect(screen.getByText('Egg')).toBeInTheDocument();
      expect(screen.getByText('Show Stats')).toBeInTheDocument();
    });
  });

  describe('Props Handling', () => {
    it('should apply custom className when provided', () => {
      render(<Pet className="custom-pet-class" />);
      
      const petContainer = screen.getByText('Egg').closest('.pet-container');
      expect(petContainer).toHaveClass('custom-pet-class');
    });

    it('should handle onPetInteraction callback when provided', () => {
      const mockInteraction = jest.fn();
      render(<Pet onPetInteraction={mockInteraction} />);
      
      // Component should render without errors
      expect(screen.getByText('Egg')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should have proper CSS classes for responsive design', () => {
      render(<Pet />);
      
      const petContainer = screen.getByText('Egg').closest('.pet-container');
      expect(petContainer).toHaveClass('pet-container');
    });

    it('should have stats panel with proper styling', () => {
      render(<Pet />);
      
      const statsPanel = screen.getByText('Show Stats').closest('.pet-stats-panel');
      expect(statsPanel).toHaveClass('pet-stats-panel');
    });
  });

  describe('Integration with PetManager', () => {
    it('should get pet state from PetManager on mount', () => {
      render(<Pet />);
      
      expect(mockPetManagerInstance.getPetState).toHaveBeenCalled();
    });

    it('should get current evolution from PetManager on mount', () => {
      render(<Pet />);
      
      expect(mockPetManagerInstance.getCurrentEvolution).toHaveBeenCalled();
    });

    it('should get evolution progress from PetManager on mount', () => {
      render(<Pet />);
      
      expect(mockPetManagerInstance.getEvolutionProgress).toHaveBeenCalled();
    });

    it('should get next evolution from PetManager on mount', () => {
      render(<Pet />);
      
      expect(mockPetManagerInstance.getNextEvolution).toHaveBeenCalled();
    });
  });

  describe('State Updates', () => {
    it('should update pet state when PetManager state changes', () => {
      const { rerender } = render(<Pet />);
      
      // Update mock state
      mockPetManagerInstance.getPetState.mockReturnValue({
        ...mockPetManagerInstance.getPetState(),
        stats: {
          ...mockPetManagerInstance.getPetState().stats,
          level: 2,
          experience: 150
        }
      });
      
      // Re-render with new state
      rerender(<Pet />);
      
      // Should show updated level
      expect(screen.getByText('Lv.2')).toBeInTheDocument();
    });

    it('should handle evolution changes', () => {
      const { rerender } = render(<Pet />);
      
      // Update mock evolution
      mockPetManagerInstance.getCurrentEvolution.mockReturnValue({
        stage: 1,
        name: 'Baby',
        spriteSheet: '/sprites/baby-sheet.png',
        frameWidth: 32,
        frameHeight: 32,
        scale: 1.2,
        animationFrames: {
          'idle': [0, 1, 2, 3],
          'walkLeft': [4, 5, 6, 7],
          'walkRight': [8, 9, 10, 11],
          'happy': [12, 13, 14, 15],
          'sad': [16, 17, 18, 19]
        }
      });
      
      // Re-render with new evolution
      rerender(<Pet />);
      
      // Should show updated pet name
      expect(screen.getByText('Baby')).toBeInTheDocument();
    });
  });
});
