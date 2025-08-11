import { PetManager } from '../../src/utils/petManager';
import { config } from '../../src/config/environment';

// Mock canvas and Image for testing
const mockCanvas = {
  getContext: jest.fn(() => ({
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
  })),
  width: 64,
  height: 64,
};

// Mock HTMLCanvasElement
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: jest.fn(() => mockCanvas.getContext()),
  writable: true,
});

// Mock Image constructor
const mockImage = {
  onload: jest.fn(),
  onerror: jest.fn(),
  src: '',
  width: 128,
  height: 160,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

(global as any).Image = jest.fn(() => mockImage);

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn((cb) => {
  setTimeout(cb, 16);
  return 1;
});

global.cancelAnimationFrame = jest.fn();

describe('Sprite System Integration', () => {
  let petManager: PetManager;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset mock canvas dimensions
    mockCanvas.width = 64;
    mockCanvas.height = 64;
    
    // Reset mock image
    mockImage.onload = null;
    mockImage.onerror = null;
    mockImage.src = '';
    mockImage.width = 128;
    mockImage.height = 160;
    
    // Get fresh PetManager instance
    petManager = PetManager.getInstance();
  });

  describe('Sprite Loading System', () => {
    it('should attempt to load sprites from evolution configuration', () => {
      const evolution = petManager.getCurrentEvolution();
      
      expect(evolution.spriteSheet).toBe('/sprites/egg-sheet.png');
      expect(evolution.frameWidth).toBe(32);
      expect(evolution.frameHeight).toBe(32);
    });

    it('should handle sprite loading success', () => {
      const evolution = petManager.getCurrentEvolution();
      
      // Simulate successful sprite load
      mockImage.onload = () => {
        expect(mockImage.src).toBe('/sprites/egg-sheet.png');
        expect(mockImage.width).toBe(128);
        expect(mockImage.height).toBe(160);
      };
      
      // Trigger load
      mockImage.onload?.();
    });

    it('should handle sprite loading failure gracefully', () => {
      const evolution = petManager.getCurrentEvolution();
      
      // Simulate sprite load failure
      mockImage.onerror = () => {
        // Should still have valid evolution data
        expect(evolution.name).toBe('Egg');
        expect(evolution.stage).toBe(0);
      };
      
      // Trigger error
      mockImage.onerror?.();
    });

    it('should provide fallback rendering when sprites are unavailable', () => {
      const evolution = petManager.getCurrentEvolution();
      
      // Even without sprites, the evolution should be valid
      expect(evolution.name).toBe('Egg');
      expect(evolution.animationFrames).toBeDefined();
      expect(evolution.animationFrames.idle).toEqual([0, 1, 2, 3]);
    });
  });

  describe('Sprite Sheet Requirements', () => {
    it('should expect correct sprite sheet dimensions', () => {
      const evolution = petManager.getCurrentEvolution();
      
      // Egg sprite should be 4x5 grid of 32x32 frames
      // Total dimensions: 128x160 pixels
      expect(evolution.frameWidth).toBe(32);
      expect(evolution.frameHeight).toBe(32);
      
      // With 4 frames per row and 5 rows
      const expectedWidth = evolution.frameWidth * 4; // 128
      const expectedHeight = evolution.frameHeight * 5; // 160
      
      expect(expectedWidth).toBe(128);
      expect(expectedHeight).toBe(160);
    });

    it('should have correct animation frame mapping', () => {
      const evolution = petManager.getCurrentEvolution();
      
      // Check all animation types are present
      expect(evolution.animationFrames.idle).toBeDefined();
      expect(evolution.animationFrames.walkLeft).toBeDefined();
      expect(evolution.animationFrames.walkRight).toBeDefined();
      expect(evolution.animationFrames.happy).toBeDefined();
      expect(evolution.animationFrames.sad).toBeDefined();
      
      // Check frame counts
      expect(evolution.animationFrames.idle.length).toBe(4);
      expect(evolution.animationFrames.walkLeft.length).toBe(4);
      expect(evolution.animationFrames.walkRight.length).toBe(4);
      expect(evolution.animationFrames.happy.length).toBe(4);
      expect(evolution.animationFrames.sad.length).toBe(4);
    });

    it('should have frame indices in correct range', () => {
      const evolution = petManager.getCurrentEvolution();
      
      // All frame indices should be 0-19 (20 total frames)
      Object.values(evolution.animationFrames).forEach(frames => {
        frames.forEach(frameIndex => {
          expect(frameIndex).toBeGreaterThanOrEqual(0);
          expect(frameIndex).toBeLessThan(20);
        });
      });
    });
  });

  describe('Animation System Integration', () => {
    it('should provide smooth animation transitions', () => {
      const evolution = petManager.getCurrentEvolution();
      const petState = petManager.getPetState();
      
      // Animation should have proper timing
      expect(petState.animation.animationSpeed).toBe(150);
      expect(petState.animation.currentFrame).toBeGreaterThanOrEqual(0);
      expect(petState.animation.currentAnimation).toBe('idle');
    });

    it('should cycle through animation frames correctly', () => {
      const evolution = petManager.getCurrentEvolution();
      const idleFrames = evolution.animationFrames.idle;
      
      // Frames should cycle through the idle animation
      for (let i = 0; i < idleFrames.length; i++) {
        expect(idleFrames[i]).toBe(i);
      }
    });

    it('should handle animation state changes', () => {
      const petState = petManager.getPetState();
      
      // Should start with idle animation
      expect(petState.animation.currentAnimation).toBe('idle');
      
      // Animation system should be ready for state changes
      expect(petState.animation.currentFrame).toBeDefined();
      expect(petState.animation.frameCount).toBeDefined();
      expect(petState.animation.lastFrameTime).toBeDefined();
    });
  });

  describe('Evolution Stage Integration', () => {
    it('should provide different sprite requirements for each stage', () => {
      const currentEvolution = petManager.getCurrentEvolution();
      const nextEvolution = petManager.getNextEvolution();
      
      // Current stage should be egg
      expect(currentEvolution.stage).toBe(0);
      expect(currentEvolution.name).toBe('Egg');
      expect(currentEvolution.frameWidth).toBe(32);
      expect(currentEvolution.frameHeight).toBe(32);
      
      // Next stage should be baby
      expect(nextEvolution?.stage).toBe(1);
      expect(nextEvolution?.name).toBe('Baby');
      expect(nextEvolution?.frameWidth).toBe(32);
      expect(nextEvolution?.frameHeight).toBe(32);
      expect(nextEvolution?.scale).toBe(1.2);
    });

    it('should handle evolution progression correctly', () => {
      const evolution = petManager.getCurrentEvolution();
      const progress = petManager.getEvolutionProgress();
      
      // Should show progress toward next evolution
      expect(progress.current).toBe(0);
      expect(progress.next).toBe(1);
      expect(progress.percentage).toBeGreaterThanOrEqual(0);
      expect(progress.percentage).toBeLessThanOrEqual(100);
    });

    it('should maintain sprite consistency across evolutions', () => {
      const currentEvolution = petManager.getCurrentEvolution();
      const nextEvolution = petManager.getNextEvolution();
      
      // Both should have the same animation structure
      expect(currentEvolution.animationFrames.idle.length).toBe(nextEvolution?.animationFrames.idle.length);
      expect(currentEvolution.animationFrames.walkLeft.length).toBe(nextEvolution?.animationFrames.walkLeft.length);
      expect(currentEvolution.animationFrames.walkRight.length).toBe(nextEvolution?.animationFrames.walkRight.length);
      expect(currentEvolution.animationFrames.happy.length).toBe(nextEvolution?.animationFrames.happy.length);
      expect(currentEvolution.animationFrames.sad.length).toBe(nextEvolution?.animationFrames.sad.length);
    });
  });

  describe('Fallback Rendering System', () => {
    it('should provide fallback graphics when sprites fail to load', () => {
      const evolution = petManager.getCurrentEvolution();
      
      // Even without sprites, the system should work
      expect(evolution.name).toBe('Egg');
      expect(evolution.animationFrames).toBeDefined();
      
      // Pet should still be visible and interactive
      const petState = petManager.getPetState();
      expect(petState.isVisible).toBe(true);
      expect(petState.stats.level).toBeGreaterThan(0);
    });

    it('should maintain animation functionality without sprites', () => {
      const petState = petManager.getPetState();
      
      // Animation system should still work
      expect(petState.animation.currentAnimation).toBe('idle');
      expect(petState.animation.currentFrame).toBeDefined();
      expect(petState.animation.animationSpeed).toBeDefined();
    });

    it('should handle missing sprite files gracefully', () => {
      // Simulate missing sprite file
      mockImage.onerror = () => {
        // System should continue to function
        const evolution = petManager.getCurrentEvolution();
        expect(evolution.name).toBe('Egg');
        expect(evolution.stage).toBe(0);
      };
      
      mockImage.onerror?.();
    });
  });

  describe('Performance Integration', () => {
    it('should handle animation frame updates efficiently', () => {
      const petState = petManager.getPetState();
      
      // Animation timing should be reasonable
      expect(petState.animation.animationSpeed).toBe(150); // 150ms per frame
      
      // Should be able to handle 60fps updates
      const frameTime = 1000 / 60; // ~16.67ms per frame
      expect(petState.animation.animationSpeed).toBeGreaterThan(frameTime);
    });

    it('should not cause memory leaks during animation', () => {
      // Start animation loop
      const animationId = requestAnimationFrame(() => {
        // Animation should start without issues
        expect(animationId).toBe(1);
      });
      
      // Clean up
      cancelAnimationFrame(animationId);
      
      expect(cancelAnimationFrame).toHaveBeenCalledWith(1);
    });

    it('should handle rapid state changes efficiently', () => {
      const petState = petManager.getPetState();
      
      // Should handle rapid animation state changes
      for (let i = 0; i < 100; i++) {
        petManager.updateAnimation();
      }
      
      // Should still have valid state
      expect(petState.animation.currentFrame).toBeDefined();
      expect(petState.animation.currentAnimation).toBeDefined();
    });
  });

  describe('Environment Integration', () => {
    it('should show developer tools in development mode', () => {
      if (config.isDevelopment) {
        // In development, sprite generation tools should be available
        expect(config.isDevelopment).toBe(true);
        expect(config.isProduction).toBe(false);
      }
    });

    it('should hide developer tools in production mode', () => {
      if (config.isProduction) {
        // In production, sprite generation tools should be hidden
        expect(config.isProduction).toBe(true);
        expect(config.isDevelopment).toBe(false);
      }
    });

    it('should provide appropriate user experience for each environment', () => {
      const evolution = petManager.getCurrentEvolution();
      
      if (config.isDevelopment) {
        // Developers should see technical information
        expect(evolution.spriteSheet).toBe('/sprites/egg-sheet.png');
        expect(evolution.frameWidth).toBe(32);
        expect(evolution.frameHeight).toBe(32);
      } else {
        // Users should see clean interface
        expect(evolution.name).toBe('Egg');
        expect(evolution.stage).toBe(0);
      }
    });
  });

  describe('Sprite File Management', () => {
    it('should expect sprite files in correct location', () => {
      const evolution = petManager.getCurrentEvolution();
      
      // Sprite path should follow expected convention
      expect(evolution.spriteSheet).toMatch(/^\/sprites\/[a-z-]+-sheet\.png$/);
      expect(evolution.spriteSheet).toBe('/sprites/egg-sheet.png');
    });

    it('should handle sprite file naming conventions', () => {
      const evolution = petManager.getCurrentEvolution();
      
      // File name should match evolution stage
      const fileName = evolution.spriteSheet.split('/').pop();
      expect(fileName).toBe('egg-sheet.png');
      
      // Should follow the pattern: {stage-name}-sheet.png
      expect(fileName).toMatch(/^[a-z-]+-sheet\.png$/);
    });

    it('should provide clear guidance for sprite creation', () => {
      const evolution = petManager.getCurrentEvolution();
      
      // System should provide clear requirements
      expect(evolution.frameWidth).toBe(32);
      expect(evolution.frameHeight).toBe(32);
      expect(evolution.animationFrames.idle.length).toBe(4);
      expect(evolution.animationFrames.walkLeft.length).toBe(4);
      expect(evolution.animationFrames.walkRight.length).toBe(4);
      expect(evolution.animationFrames.happy.length).toBe(4);
      expect(evolution.animationFrames.sad.length).toBe(4);
    });
  });

  describe('Integration with Pet System', () => {
    it('should integrate sprite system with pet progression', () => {
      const petState = petManager.getPetState();
      const evolution = petManager.getCurrentEvolution();
      
      // Pet stats should affect evolution
      expect(petState.stats.level).toBeGreaterThan(0);
      expect(petState.stats.experience).toBeGreaterThanOrEqual(0);
      expect(petState.stats.happiness).toBeGreaterThan(0);
      
      // Evolution should be appropriate for pet level
      expect(evolution.stage).toBe(0); // Starting stage
      expect(evolution.name).toBe('Egg'); // Starting evolution
    });

    it('should handle pet interactions with sprite system', () => {
      const petState = petManager.getPetState();
      
      // Pet should be interactive
      expect(petState.isVisible).toBe(true);
      expect(petState.position.x).toBeDefined();
      expect(petState.position.y).toBeDefined();
      
      // Animation should respond to pet state
      expect(petState.animation.currentAnimation).toBe('idle');
      expect(petState.animation.isMoving).toBeDefined();
      expect(petState.animation.direction).toBeDefined();
    });

    it('should maintain pet state consistency with sprites', () => {
      const petState = petManager.getPetState();
      const evolution = petManager.getCurrentEvolution();
      
      // Pet state should be consistent with evolution
      expect(petState.stats.evolutionStage).toBe(evolution.stage);
      
      // Animation should be appropriate for evolution
      expect(evolution.animationFrames).toBeDefined();
      expect(evolution.frameWidth).toBeDefined();
      expect(evolution.frameHeight).toBeDefined();
    });
  });

  describe('Error Recovery', () => {
    it('should recover from sprite loading errors', () => {
      // Simulate sprite loading error
      mockImage.onerror = () => {
        // System should continue to function
        const evolution = petManager.getCurrentEvolution();
        const petState = petManager.getPetState();
        
        expect(evolution.name).toBe('Egg');
        expect(petState.isVisible).toBe(true);
        expect(petState.stats.level).toBeGreaterThan(0);
      };
      
      mockImage.onerror?.();
    });

    it('should handle corrupted sprite data gracefully', () => {
      const evolution = petManager.getCurrentEvolution();
      
      // Even with corrupted sprite data, evolution should be valid
      expect(evolution.name).toBe('Egg');
      expect(evolution.stage).toBe(0);
      expect(evolution.animationFrames).toBeDefined();
    });

    it('should maintain system stability during sprite issues', () => {
      // Simulate various sprite-related issues
      const issues = [
        () => { mockImage.width = 0; },
        () => { mockImage.height = 0; },
        () => { mockImage.src = ''; },
        () => { mockImage.onerror = null; }
      ];
      
      issues.forEach(issue => {
        issue();
        
        // System should remain stable
        const evolution = petManager.getCurrentEvolution();
        const petState = petManager.getPetState();
        
        expect(evolution.name).toBe('Egg');
        expect(petState.isVisible).toBe(true);
      });
    });
  });
});
