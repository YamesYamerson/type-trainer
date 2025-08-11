import React, { useEffect, useRef, useCallback, useState } from 'react';
import { PetManager } from '../utils/petManager';
import type { PetState, PetEvolution } from '../types';
import './Pet.css';

interface PetProps {
  className?: string;
  onPetInteraction?: (action: 'feed' | 'play') => void;
}

export const Pet: React.FC<PetProps> = ({ className = '', onPetInteraction }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number>(0);
  
  const [petState, setPetState] = useState<PetState>(PetManager.getInstance().getPetState());
  const [currentEvolution, setCurrentEvolution] = useState<PetEvolution>(PetManager.getInstance().getCurrentEvolution());
  const [showStats, setShowStats] = useState(false);
  const [spriteImage, setSpriteImage] = useState<HTMLImageElement | null>(null);
  const [spriteLoadError, setSpriteLoadError] = useState(false);
  
  const petManager = PetManager.getInstance();

  // Load sprite image
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setSpriteImage(img);
      setSpriteLoadError(false);
    };
    img.onerror = () => {
      setSpriteImage(null);
      setSpriteLoadError(true);
    };
    img.src = currentEvolution.spriteSheet;
  }, [currentEvolution.spriteSheet]);

  // Animation loop
  const animate = useCallback((currentTime: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = currentTime;
    const deltaTime = currentTime - lastTimeRef.current;
    lastTimeRef.current = currentTime;

    // Update pet animation
    petManager.updateAnimation();
    
    // Get updated state
    const updatedState = petManager.getPetState();
    setPetState(updatedState);
    
    // Check if evolution changed
    const newEvolution = petManager.getCurrentEvolution();
    if (newEvolution.stage !== currentEvolution.stage) {
      setCurrentEvolution(newEvolution);
    }

    // Render frame
    renderFrame(updatedState, newEvolution);

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [currentEvolution.stage, petManager]);

  // Start animation loop
  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [animate]);

  // Render a single frame
  const renderFrame = useCallback((state: PetState, evolution: PetEvolution) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set canvas size to match sprite dimensions
    const scaledWidth = evolution.frameWidth * evolution.scale;
    const scaledHeight = evolution.frameHeight * evolution.scale;
    
    if (canvas.width !== scaledWidth || canvas.height !== scaledHeight) {
      canvas.width = scaledWidth;
      canvas.height = scaledHeight;
    }

    // If sprite image is available, render it
    if (spriteImage && !spriteLoadError) {
      // Get current animation frames
      const animationFrames = evolution.animationFrames[state.animation.currentAnimation];
      if (!animationFrames || animationFrames.length === 0) return;

      const currentFrame = state.animation.currentFrame % animationFrames.length;
      const frameIndex = animationFrames[currentFrame];

      // Calculate sprite position in spritesheet
      const spritesPerRow = Math.floor(spriteImage.width / evolution.frameWidth);
      const spriteRow = Math.floor(frameIndex / spritesPerRow);
      const spriteCol = frameIndex % spritesPerRow;

      const sourceX = spriteCol * evolution.frameWidth;
      const sourceY = spriteRow * evolution.frameHeight;

      // Draw sprite
      ctx.drawImage(
        spriteImage,
        sourceX, sourceY, evolution.frameWidth, evolution.frameHeight,
        0, 0, scaledWidth, scaledHeight
      );
    } else {
      // Fallback rendering when sprites aren't available
      renderFallbackSprite(ctx, state, evolution, scaledWidth, scaledHeight);
    }

    // Draw pet name above sprite
    ctx.fillStyle = '#333';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(evolution.name, scaledWidth / 2, -10);

    // Draw level indicator
    ctx.fillStyle = '#666';
    ctx.font = '12px Arial';
    ctx.fillText(`Lv.${state.stats.level}`, scaledWidth / 2, -25);
  }, [spriteImage, spriteLoadError]);

  // Fallback rendering when sprites aren't available
  const renderFallbackSprite = (
    ctx: CanvasRenderingContext2D, 
    state: PetState, 
    evolution: PetEvolution, 
    width: number, 
    height: number
  ) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const size = Math.min(width, height) * 0.6;
    
    // Draw background circle
    ctx.fillStyle = '#f0f0f0';
    ctx.beginPath();
    ctx.arc(centerX, centerY, size / 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw border
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw evolution stage indicator
    ctx.fillStyle = '#333';
    ctx.font = `${Math.max(12, size / 4)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Different shapes based on evolution stage
    switch (evolution.stage) {
      case 0: // Egg
        // Draw egg shape
        ctx.fillStyle = '#f5f5dc';
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, size / 3, size / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#d3d3d3';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Draw face
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(centerX - size / 8, centerY - size / 8, size / 16, 0, Math.PI * 2);
        ctx.arc(centerX + size / 8, centerY - size / 8, size / 16, 0, Math.PI * 2);
        ctx.fill();
        break;
        
      case 1: // Baby
        // Draw baby shape (circle with simple features)
        ctx.fillStyle = '#ffb6c1';
        ctx.beginPath();
        ctx.arc(centerX, centerY, size / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw simple face
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(centerX - size / 6, centerY - size / 6, size / 12, 0, Math.PI * 2);
        ctx.arc(centerX + size / 6, centerY - size / 6, size / 12, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw smile
        ctx.beginPath();
        ctx.arc(centerX, centerY + size / 8, size / 8, 0, Math.PI);
        ctx.stroke();
        break;
        
      default:
        // Draw generic character shape
        ctx.fillStyle = '#87ceeb';
        ctx.beginPath();
        ctx.arc(centerX, centerY - size / 4, size / 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#ffb6c1';
        ctx.beginPath();
        ctx.arc(centerX, centerY + size / 4, size / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw face
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(centerX - size / 6, centerY - size / 6, size / 12, 0, Math.PI * 2);
        ctx.arc(centerX + size / 6, centerY - size / 6, size / 12, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw smile
        ctx.beginPath();
        ctx.arc(centerX, centerY + size / 8, size / 8, 0, Math.PI);
        ctx.stroke();
        break;
    }
    
    // Draw animation indicator
    const animationColors = {
      'idle': '#87ceeb',
      'walkLeft': '#ffa500',
      'walkRight': '#ffa500',
      'happy': '#32cd32',
      'sad': '#ff6347'
    };
    
    const animColor = animationColors[state.animation.currentAnimation] || '#87ceeb';
    ctx.fillStyle = animColor;
    ctx.beginPath();
    ctx.arc(width - 15, 15, 8, 0, Math.PI * 2);
    ctx.fill();
  };

  const evolutionProgress = petManager.getEvolutionProgress();
  const nextEvolution = petManager.getNextEvolution();

  return (
    <div className={`pet-container ${className}`}>
      {/* Pet Canvas */}
      <div className="pet-canvas-wrapper">
        <canvas
          ref={canvasRef}
          className="pet-canvas"
          style={{
            border: '2px solid #ddd',
            borderRadius: '8px',
            backgroundColor: '#f8f9fa'
          }}
        />
        

      </div>

      {/* Pet Stats Panel */}
      <div className="pet-stats-panel">
        <div className="pet-stats-header">
          <h3 className="pet-name">{currentEvolution.name}</h3>
          <button
            onClick={() => setShowStats(!showStats)}
            className="stats-toggle-btn"
          >
            {showStats ? 'Hide Stats' : 'Show Stats'}
          </button>
        </div>

        {showStats && (
          <div className="pet-stats-content">
            <div className="stat-row">
              <span className="stat-label">Level:</span>
              <span className="stat-value">{petState.stats.level}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Experience:</span>
              <span className="stat-value">{petState.stats.experience}/1000</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Happiness:</span>
              <div className="stat-bar">
                <div 
                  className="stat-bar-fill happiness-bar"
                  style={{ width: `${petState.stats.happiness}%` }}
                />
              </div>
              <span className="stat-value">{petState.stats.happiness}%</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Energy:</span>
              <div className="stat-bar">
                <div 
                  className="stat-bar-fill energy-bar"
                  style={{ width: `${petState.stats.energy}%` }}
                />
              </div>
              <span className="stat-value">{petState.stats.energy}%</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Tests Completed:</span>
              <span className="stat-value">{petState.stats.totalTestsCompleted}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Best WPM:</span>
              <span className="stat-value">{petState.stats.bestWpm}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Average WPM:</span>
              <span className="stat-value">{petState.stats.averageWpm}</span>
            </div>
          </div>
        )}

        {/* Evolution Progress */}
        {nextEvolution && (
          <div className="evolution-progress">
            <div className="evolution-info">
              <span>Next: {nextEvolution.name}</span>
              <span>{evolutionProgress.percentage}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${evolutionProgress.percentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Pet Status Indicators */}
        <div className="pet-status">
          {petState.stats.energy < 30 && (
            <div className="status-indicator hungry">😴 Hungry</div>
          )}
          {petState.stats.happiness < 30 && (
            <div className="status-indicator sad">😢 Sad</div>
          )}
          {petState.stats.happiness > 80 && (
            <div className="status-indicator happy">😊 Happy</div>
          )}
        </div>
      </div>
    </div>
  );
};
