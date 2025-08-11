import type { PetEvolution, PetState, TypingResult } from '../types';
import petEvolutions from '../data/pet-evolutions.json';

export class PetManager {
  private static instance: PetManager;
  private petState: PetState;

  private constructor() {
    this.petState = this.getInitialPetState();
  }

  public static getInstance(): PetManager {
    if (!PetManager.instance) {
      PetManager.instance = new PetManager();
    }
    return PetManager.instance;
  }

  private getInitialPetState(): PetState {
    const savedState = localStorage.getItem('petState');
    if (savedState) {
      try {
        return JSON.parse(savedState);
      } catch (error) {
        console.warn('Failed to parse saved pet state, using default');
      }
    }

    // Always start with an egg pet
    return {
      stats: {
        happiness: 50,
        energy: 100,
        experience: 0,
        level: 1,
        evolutionStage: 0, // Start as egg
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
        animationSpeed: 150, // milliseconds per frame
        lastFrameTime: Date.now(),
        isMoving: false,
        direction: 'right',
        targetX: 0,
        currentX: 0
      },
      isVisible: true,
      position: {
        x: 100,
        y: 300
      }
    };
  }

  public getPetState(): PetState {
    return { ...this.petState };
  }

  public updatePetFromTestResult(result: TypingResult): void {
    const stats = this.petState.stats;
    
    // Calculate experience gain based on performance
    const wpmBonus = Math.min(result.wpm / 10, 20); // Max 20 exp for WPM
    const accuracyBonus = result.accuracy >= 95 ? 15 : result.accuracy >= 90 ? 10 : 5;
    const experienceGain = Math.round(wpmBonus + accuracyBonus);
    
    // Update stats
    stats.experience += experienceGain;
    stats.totalTestsCompleted++;
    
    // Update average WPM
    const totalWpm = stats.averageWpm * (stats.totalTestsCompleted - 1) + result.wpm;
    stats.averageWpm = Math.round(totalWpm / stats.totalTestsCompleted);
    
    // Update best WPM
    if (result.wpm > stats.bestWpm) {
      stats.bestWpm = result.wpm;
    }
    
    // Update happiness based on performance
    if (result.accuracy >= 95 && result.wpm >= 40) {
      stats.happiness = Math.min(100, stats.happiness + 5);
    } else if (result.accuracy < 80 || result.wpm < 20) {
      stats.happiness = Math.max(0, stats.happiness - 3);
    }
    
    // Update energy (decreases over time and with tests)
    const timeSinceLastFed = Date.now() - stats.lastFed;
    const hoursSinceLastFed = timeSinceLastFed / (1000 * 60 * 60);
    stats.energy = Math.max(0, stats.energy - Math.floor(hoursSinceLastFed * 2));
    
    // Check for level up
    this.checkLevelUp();
    
    // Check for evolution
    this.checkEvolution();
    
    // Save state
    this.savePetState();
  }

  private checkLevelUp(): void {
    const stats = this.petState.stats;
    const newLevel = Math.floor(stats.experience / 100) + 1;
    
    if (newLevel > stats.level) {
      stats.level = newLevel;
      stats.happiness = Math.min(100, stats.happiness + 10);
      stats.energy = Math.min(100, stats.energy + 20);
      
      // Trigger happy animation
      this.petState.animation.currentAnimation = 'happy';
      this.petState.animation.currentFrame = 0;
      this.petState.animation.lastFrameTime = Date.now();
    }
  }

  private checkEvolution(): void {
    const stats = this.petState.stats;
    
    // Check if requirements are met for next evolution
    const nextEvolution = petEvolutions.find(e => e.stage === stats.evolutionStage + 1);
    if (nextEvolution && 
        stats.level >= nextEvolution.requirements.level &&
        stats.experience >= nextEvolution.requirements.experience &&
        stats.happiness >= nextEvolution.requirements.happiness) {
      
      stats.evolutionStage = nextEvolution.stage;
      stats.happiness = Math.min(100, stats.happiness + 25);
      stats.energy = 100;
      
      // Trigger happy animation
      this.petState.animation.currentAnimation = 'happy';
      this.petState.animation.currentFrame = 0;
      this.petState.animation.lastFrameTime = Date.now();
    }
  }

  public getCurrentEvolution(): PetEvolution {
    const stats = this.petState.stats;
    return petEvolutions.find(e => e.stage === stats.evolutionStage) || petEvolutions[0];
  }

  public getNextEvolution(): PetEvolution | null {
    const stats = this.petState.stats;
    const nextStage = stats.evolutionStage + 1;
    return petEvolutions.find(e => e.stage === nextStage) || null;
  }

  public getEvolutionProgress(): { current: number; next: number; percentage: number } {
    const stats = this.petState.stats;
    const nextEvolution = this.getNextEvolution();
    
    if (!nextEvolution) {
      return { current: stats.evolutionStage, next: stats.evolutionStage, percentage: 100 };
    }
    
    const currentExp = stats.experience;
    const requiredExp = nextEvolution.requirements.experience;
    const currentLevel = stats.level;
    const requiredLevel = nextEvolution.requirements.level;
    const currentHappiness = stats.happiness;
    const requiredHappiness = nextEvolution.requirements.happiness;
    
    const expProgress = Math.min(1, currentExp / requiredExp);
    const levelProgress = Math.min(1, currentLevel / requiredLevel);
    const happinessProgress = Math.min(1, currentHappiness / requiredHappiness);
    
    const overallProgress = (expProgress + levelProgress + happinessProgress) / 3;
    
    return {
      current: stats.evolutionStage,
      next: nextEvolution.stage,
      percentage: Math.round(overallProgress * 100)
    };
  }

  private savePetState(): void {
    localStorage.setItem('petState', JSON.stringify(this.petState));
  }

  public resetPet(): void {
    this.petState = this.getInitialPetState();
    this.savePetState();
  }

  public updateAnimation(): void {
    const animation = this.petState.animation;
    
    // Update frame timing
    if (Date.now() - animation.lastFrameTime >= animation.animationSpeed) {
      animation.currentFrame = (animation.currentFrame + 1) % this.getCurrentEvolution().animationFrames[animation.currentAnimation].length;
      animation.lastFrameTime = Date.now();
    }
    
    // Update movement
    if (animation.isMoving) {
      const moveSpeed = 2;
      if (animation.direction === 'right') {
        animation.currentX += moveSpeed;
        if (animation.currentX >= animation.targetX) {
          animation.isMoving = false;
          animation.currentAnimation = 'idle';
          animation.currentX = animation.targetX;
        }
      } else {
        animation.currentX -= moveSpeed;
        if (animation.currentX <= animation.targetX) {
          animation.isMoving = false;
          animation.currentAnimation = 'idle';
          animation.currentX = animation.targetX;
        }
      }
      
      this.petState.position.x = animation.currentX;
    }
  }
}
