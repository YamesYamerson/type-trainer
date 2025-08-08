import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { TypingTest, TypingState, TypingResult, TypedCharacter } from '../types';
import { VirtualKeyboard } from './VirtualKeyboard';

interface TypingTestEngineProps {
  test: TypingTest;
  onComplete: (result: TypingResult) => void;
  onKeyPress?: (key: string) => void;
  showKeyboard?: boolean;
}

export const TypingTestEngine: React.FC<TypingTestEngineProps> = ({
  test,
  onComplete,
  onKeyPress,
  showKeyboard = true
}) => {
  const [typingState, setTypingState] = useState<TypingState>({
    currentIndex: 0,
    typedCharacters: [],
    isComplete: false,
    startTime: null,
    endTime: null,
    totalErrors: 0,
    totalCorrect: 0
  });
  const [currentKey, setCurrentKey] = useState<string>('');

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

  // Robust character comparison function
  const compareCharacters = useCallback((inputChar: string, expectedChar: string): boolean => {
    // Handle special cases first
    if (expectedChar === '\t' && inputChar === 'Tab') return true;
    if (expectedChar === '\n' && (inputChar === 'Enter' || inputChar === '\r')) return true;
    if (expectedChar === ' ' && inputChar === ' ') return true;
    
    // Direct comparison first (most common case)
    if (inputChar === expectedChar) return true;
    
    // Normalize characters for comparison
    const normalizedInput = inputChar.normalize();
    const normalizedExpected = expectedChar.normalize();
    
    // Normalized comparison
    if (normalizedInput === normalizedExpected) return true;
    
    // Case-insensitive comparison for alphabetic characters
    if (/[a-zA-Z]/.test(normalizedInput) && /[a-zA-Z]/.test(normalizedExpected)) {
      return normalizedInput.toLowerCase() === normalizedExpected.toLowerCase();
    }
    
    return false;
  }, []);

  // Memoized character status for performance
  const characterStatus = useMemo(() => {
    const status = new Map<number, 'correct' | 'incorrect' | 'pending' | 'current'>();
    
    // Mark all characters as pending initially
    for (let i = 0; i < test.content.length; i++) {
      status.set(i, 'pending');
    }
    
    // Mark typed characters
    typingState.typedCharacters.forEach(typedChar => {
      status.set(typedChar.index, typedChar.isCorrect ? 'correct' : 'incorrect');
    });
    
    // Mark current position
    if (typingState.currentIndex < test.content.length) {
      status.set(typingState.currentIndex, 'current');
    }
    
    return status;
  }, [typingState.typedCharacters, typingState.currentIndex, test.content.length]);

  // Handle key press events with robust state management
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (typingState.isComplete) return;

    const { key } = event;
    
    // Set current key for keyboard display
    setCurrentKey(key);
    
    // Prevent default for most keys to avoid unwanted behavior
    if (key.length === 1 || key === 'Backspace' || key === 'Enter' || key === 'Tab') {
      event.preventDefault();
    }

    // Start timer on first key press
    if (typingState.startTime === null) {
      setTypingState(prev => ({
        ...prev,
        startTime: Date.now()
      }));
    }

    // Handle backspace with proper character removal
    if (key === 'Backspace') {
      setTypingState(prev => {
        if (prev.currentIndex === 0) return prev;
        
        const newCurrentIndex = prev.currentIndex - 1;
        const newTypedCharacters = prev.typedCharacters.slice(0, -1); // Remove last character
        
        // Recalculate totals
        const newTotalErrors = newTypedCharacters.filter(char => !char.isCorrect).length;
        const newTotalCorrect = newTypedCharacters.filter(char => char.isCorrect).length;
        
        return {
          ...prev,
          currentIndex: newCurrentIndex,
          typedCharacters: newTypedCharacters,
          totalErrors: newTotalErrors,
          totalCorrect: newTotalCorrect
        };
      });
      return;
    }

    // Handle character input (including Tab)
    if (key.length === 1 || key === 'Tab') {
      setTypingState(prev => {
        if (prev.currentIndex >= test.content.length) return prev;
        
        const expectedChar = test.content[prev.currentIndex];
        const isCorrect = compareCharacters(key, expectedChar);
        
        // Create new typed character
        const newTypedCharacter: TypedCharacter = {
          index: prev.currentIndex,
          inputChar: key === 'Tab' ? '\t' : key,
          expectedChar,
          isCorrect,
          timestamp: Date.now()
        };
        
        // Add to typed characters
        const newTypedCharacters = [...prev.typedCharacters, newTypedCharacter];
        const newCurrentIndex = prev.currentIndex + 1;
        
        // Update totals
        const newTotalErrors = newTypedCharacters.filter(char => !char.isCorrect).length;
        const newTotalCorrect = newTypedCharacters.filter(char => char.isCorrect).length;
        
        // Check if test is complete
        const isComplete = newCurrentIndex >= test.content.length;
        const endTime = isComplete ? Date.now() : null;
        
        if (isComplete && endTime) {
          const timeElapsed = endTime - (prev.startTime || endTime);
          const wpm = calculateWPM(newTotalCorrect, timeElapsed);
          const accuracy = calculateAccuracy(newTotalCorrect, test.content.length);
          
          const result: TypingResult = {
            wpm,
            accuracy,
            errors: newTotalErrors,
            totalCharacters: test.content.length,
            correctCharacters: newTotalCorrect,
            timeElapsed,
            testId: test.id,
            timestamp: Date.now()
          };
          
          // Call onComplete after state update
          setTimeout(async () => {
            try {
              await onComplete(result);
            } catch (error) {
              console.error('Error completing test:', error);
            }
          }, 0);
        }
        
        return {
          ...prev,
          currentIndex: newCurrentIndex,
          typedCharacters: newTypedCharacters,
          totalErrors: newTotalErrors,
          totalCorrect: newTotalCorrect,
          isComplete,
          endTime
        };
      });
    }

    // Call onKeyPress callback if provided
    if (onKeyPress) {
      onKeyPress(key);
    }
  }, [typingState, test, onComplete, onKeyPress, calculateWPM, calculateAccuracy, compareCharacters]);

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

  // Clear current key after a short delay
  useEffect(() => {
    if (currentKey) {
      const timer = setTimeout(() => {
        setCurrentKey('');
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [currentKey]);

  // Render the text with proper styling using the new character status
  const renderText = () => {
    const characters = test.content.split('');
    
    return characters.map((char, index) => {
      const status = characterStatus.get(index) || 'pending';
      let className = 'typing-pending';
      let displayChar = char;
      
      // Check if there's a typed character for this index
      const typedChar = typingState.typedCharacters.find(tc => tc.index === index);
      
      switch (status) {
        case 'correct':
          className = 'typing-correct';
          // Use the actual typed character (should be the same as expected)
          displayChar = typedChar ? typedChar.inputChar : char;
          break;
        case 'incorrect':
          className = 'typing-incorrect';
          // Use the actual incorrect character that was typed
          displayChar = typedChar ? typedChar.inputChar : char;
          break;
        case 'current':
          className = 'typing-cursor';
          break;
        default:
          className = 'typing-pending';
      }
      
      // Handle special characters for display
      const displayText = displayChar === '\n' ? '\u00A0' : 
                         displayChar === '\t' ? '\u00A0\u00A0\u00A0\u00A0' : 
                         displayChar;
      
      return (
        <span key={index} className={className}>
          {displayText}
        </span>
      );
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div 
        ref={containerRef}
        className="p-6 bg-white rounded-lg shadow-lg"
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

        {/* Virtual Keyboard - integrated into the same card */}
        {showKeyboard && (
          <div className="border-t border-gray-200 pt-6">
            <VirtualKeyboard 
              currentKey={currentKey} 
              isActive={!typingState.isComplete}
              nextKey={typingState.currentIndex < test.content.length ? test.content[typingState.currentIndex] : undefined}
            />
          </div>
        )}
      </div>
    </div>
  );
};
