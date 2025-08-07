import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { TypingTest, TypingState, TypingResult } from '../types';

interface TypingTestEngineProps {
  test: TypingTest;
  onComplete: (result: TypingResult) => void;
  onKeyPress?: (key: string) => void;
}

export const TypingTestEngine: React.FC<TypingTestEngineProps> = ({
  test,
  onComplete,
  onKeyPress
}) => {
  const [typingState, setTypingState] = useState<TypingState>({
    currentIndex: 0,
    typedText: '',
    errors: [],
    isComplete: false,
    startTime: null,
    endTime: null
  });

  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate WPM (Words Per Minute)
  const calculateWPM = useCallback((correctCharacters: number, timeElapsed: number): number => {
    if (timeElapsed === 0) return 0;
    // Standard WPM calculation: 5 characters = 1 word
    const words = correctCharacters / 5;
    const minutes = timeElapsed / 60000; // Convert milliseconds to minutes
    return Math.round(words / minutes);
  }, []);

  // Calculate accuracy percentage
  const calculateAccuracy = useCallback((correctCharacters: number, totalCharacters: number): number => {
    if (totalCharacters === 0) return 100;
    return Math.round((correctCharacters / totalCharacters) * 100);
  }, []);

  // Handle key press events
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (typingState.isComplete) return;

    const { key } = event;
    
    // Prevent default for most keys to avoid unwanted behavior
    if (key.length === 1 || key === 'Backspace' || key === 'Enter') {
      event.preventDefault();
    }

    // Start timer on first key press
    if (typingState.startTime === null) {
      setTypingState(prev => ({
        ...prev,
        startTime: Date.now()
      }));
    }

    // Handle backspace
    if (key === 'Backspace') {
      setTypingState(prev => {
        if (prev.currentIndex === 0) return prev;
        
        const newTypedText = prev.typedText.slice(0, -1);
        const newCurrentIndex = prev.currentIndex - 1;
        const newErrors = [...prev.errors];
        
        // Remove error if we're backing up over an error
        if (newErrors.includes(newCurrentIndex)) {
          newErrors.splice(newErrors.indexOf(newCurrentIndex), 1);
        }
        
        return {
          ...prev,
          typedText: newTypedText,
          currentIndex: newCurrentIndex,
          errors: newErrors
        };
      });
      return;
    }

    // Handle regular character input
    if (key.length === 1) {
      setTypingState(prev => {
        const expectedChar = test.content[prev.currentIndex];
        const isCorrect = key === expectedChar;
        const newErrors = isCorrect ? prev.errors : [...prev.errors, prev.currentIndex];
        
        const newTypedText = prev.typedText + key;
        const newCurrentIndex = prev.currentIndex + 1;
        
        // Check if test is complete
        const isComplete = newCurrentIndex >= test.content.length;
        const endTime = isComplete ? Date.now() : null;
        
        if (isComplete && endTime) {
          const timeElapsed = endTime - (prev.startTime || endTime);
          const correctCharacters = newTypedText.length - newErrors.length;
          const wpm = calculateWPM(correctCharacters, timeElapsed);
          const accuracy = calculateAccuracy(correctCharacters, test.content.length);
          
          const result: TypingResult = {
            wpm,
            accuracy,
            errors: newErrors.length,
            totalCharacters: test.content.length,
            correctCharacters,
            timeElapsed,
            testId: test.id,
            timestamp: Date.now()
          };
          
          // Call onComplete after state update
          setTimeout(() => onComplete(result), 0);
        }
        
        return {
          ...prev,
          typedText: newTypedText,
          currentIndex: newCurrentIndex,
          errors: newErrors,
          isComplete,
          endTime
        };
      });
    }

    // Call onKeyPress callback if provided
    if (onKeyPress) {
      onKeyPress(key);
    }
  }, [typingState, test, onComplete, onKeyPress, calculateWPM, calculateAccuracy]);

  // Set up keyboard event listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('keydown', handleKeyDown);
    container.focus();

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Render the text with proper styling
  const renderText = () => {
    const characters = test.content.split('');
    const typedChars = typingState.typedText.split('');
    
    return characters.map((char, index) => {
      let className = 'typing-pending';
      
      if (index < typingState.currentIndex) {
        // Already typed
        if (typingState.errors.includes(index)) {
          className = 'typing-incorrect';
        } else {
          className = 'typing-correct';
        }
      } else if (index === typingState.currentIndex) {
        // Current position
        className = 'typing-cursor';
      }
      
      return (
        <span key={index} className={className}>
          {char === '\n' ? '\u00A0' : char}
        </span>
      );
    });
  };

  return (
    <div 
      ref={containerRef}
      className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg"
      tabIndex={0}
    >
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          {test.category.charAt(0).toUpperCase() + test.category.slice(1)} Test
        </h2>
        <p className="text-sm text-gray-600">
          Difficulty: {test.difficulty}
        </p>
      </div>
      
      <div className="mb-6">
        <div className="text-lg leading-relaxed font-mono bg-gray-50 p-4 rounded border-2 border-gray-200 min-h-[120px] whitespace-pre-wrap">
          {renderText()}
        </div>
      </div>
      
      <div className="text-sm text-gray-600">
        <p>Click in the text area above and start typing to begin the test.</p>
        <p>Use Backspace to correct mistakes. The test will complete when you finish typing all characters.</p>
      </div>
    </div>
  );
};
