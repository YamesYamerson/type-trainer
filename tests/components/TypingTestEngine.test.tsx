/**
 * Tests for TypingTestEngine component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TypingTestEngine } from '../../src/components/TypingTestEngine';
import type { TypingTest } from '../../src/types';

// Mock the DataManager
jest.mock('../../src/utils/dataManager', () => ({
  DataManager: {
    saveResult: jest.fn(),
    getResults: jest.fn(),
    getUserStats: jest.fn(),
    clearAllData: jest.fn(),
    init: jest.fn()
  }
}));

// Mock the hashUtils
jest.mock('../../src/utils/hashUtils', () => ({
  generateHashForResult: jest.fn(() => 'mock_hash_123')
}));

// Mock the VirtualKeyboard component
jest.mock('../../src/components/VirtualKeyboard', () => ({
  VirtualKeyboard: ({ currentKey, nextKey }: { currentKey?: string; nextKey?: string }) => (
    <div data-testid="virtual-keyboard">
      <span data-testid="current-key">{currentKey || ''}</span>
      <span data-testid="next-key">{nextKey || ''}</span>
    </div>
  )
}));

describe('TypingTestEngine', () => {
  const mockTest: TypingTest = {
    id: 'test_1',
    content: 'the quick brown fox jumps over the lazy dog',
    category: 'lowercase',
    difficulty: 'beginner'
  };

  const mockOnComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('Initial Rendering', () => {
    it('should render the typing test area', () => {
      render(<TypingTestEngine test={mockTest} onComplete={mockOnComplete} />);
      
      expect(screen.getByTestId('typing-test-area')).toBeInTheDocument();
      expect(screen.getByTestId('typing-input')).toBeInTheDocument();
      expect(screen.getByTestId('virtual-keyboard')).toBeInTheDocument();
    });

    it('should display the test content', () => {
      render(<TypingTestEngine test={mockTest} onComplete={mockOnComplete} />);
      
      expect(screen.getByText('the quick brown fox jumps over the lazy dog')).toBeInTheDocument();
    });

    it('should show initial stats as 0', () => {
      render(<TypingTestEngine test={mockTest} onComplete={mockOnComplete} />);
      
      expect(screen.getByText('WPM: 0')).toBeInTheDocument();
      expect(screen.getByText('Accuracy: 0%')).toBeInTheDocument();
      expect(screen.getByText('Errors: 0')).toBeInTheDocument();
    });
  });

  describe('Typing Functionality', () => {
    it('should handle correct character input', async () => {
      render(<TypingTestEngine test={mockTest} onComplete={mockOnComplete} />);
      
      const input = screen.getByTestId('typing-input');
      fireEvent.keyDown(input, { key: 't' });
      
      await waitFor(() => {
        expect(screen.getByText('WPM: 0')).toBeInTheDocument(); // Still 0 as test hasn't started
      });
    });

    it('should start the test on first keystroke', async () => {
      render(<TypingTestEngine test={mockTest} onComplete={mockOnComplete} />);
      
      const input = screen.getByTestId('typing-input');
      fireEvent.keyDown(input, { key: 't' });
      
      await waitFor(() => {
        expect(screen.getByText('WPM: 0')).toBeInTheDocument();
      });
    });

    it('should handle incorrect character input', async () => {
      render(<TypingTestEngine test={mockTest} onComplete={mockOnComplete} />);
      
      const input = screen.getByTestId('typing-input');
      fireEvent.keyDown(input, { key: 'x' }); // Wrong character
      
      await waitFor(() => {
        expect(screen.getByText('Errors: 1')).toBeInTheDocument();
      });
    });

    it('should handle backspace correctly', async () => {
      render(<TypingTestEngine test={mockTest} onComplete={mockOnComplete} />);
      
      const input = screen.getByTestId('typing-input');
      
      // Type a correct character
      fireEvent.keyDown(input, { key: 't' });
      
      // Type an incorrect character
      fireEvent.keyDown(input, { key: 'x' });
      
      // Press backspace
      fireEvent.keyDown(input, { key: 'Backspace' });
      
      await waitFor(() => {
        expect(screen.getByText('Errors: 0')).toBeInTheDocument();
      });
    });

    it('should handle tab key correctly', async () => {
      const testWithTab: TypingTest = {
        id: 'test_tab',
        content: 'the\tquick\tbrown',
        category: 'code',
        difficulty: 'intermediate'
      };

      render(<TypingTestEngine test={testWithTab} onComplete={mockOnComplete} />);
      
      const input = screen.getByTestId('typing-input');
      fireEvent.keyDown(input, { key: 'Tab' });
      
      await waitFor(() => {
        expect(screen.getByText('the')).toBeInTheDocument();
      });
    });
  });

  describe('Test Completion', () => {
    it('should call onComplete when test is finished', async () => {
      render(<TypingTestEngine test={mockTest} onComplete={mockOnComplete} />);
      
      const input = screen.getByTestId('typing-input');
      
      // Type the entire test content
      const content = mockTest.content;
      for (let i = 0; i < content.length; i++) {
        fireEvent.keyDown(input, { key: content[i] });
      }
      
      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalledWith(expect.objectContaining({
          testId: mockTest.id,
          category: mockTest.category,
          wpm: expect.any(Number),
          accuracy: expect.any(Number),
          errors: expect.any(Number),
          hash: 'mock_hash_123'
        }));
      });
    });

    it('should calculate WPM correctly', async () => {
      render(<TypingTestEngine test={mockTest} onComplete={mockOnComplete} />);
      
      const input = screen.getByTestId('typing-input');
      
      // Simulate typing the content quickly
      const content = mockTest.content;
      const startTime = Date.now();
      
      for (let i = 0; i < content.length; i++) {
        fireEvent.keyDown(input, { key: content[i] });
      }
      
      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalled();
        const result = mockOnComplete.mock.calls[0][0];
        expect(result.wpm).toBeGreaterThan(0);
      });
    });

    it('should calculate accuracy correctly', async () => {
      render(<TypingTestEngine test={mockTest} onComplete={mockOnComplete} />);
      
      const input = screen.getByTestId('typing-input');
      
      // Type the content with some errors
      const content = mockTest.content;
      for (let i = 0; i < content.length; i++) {
        if (i === 5) {
          fireEvent.keyDown(input, { key: 'x' }); // Wrong character
          fireEvent.keyDown(input, { key: 'Backspace' }); // Correct it
        }
        fireEvent.keyDown(input, { key: content[i] });
      }
      
      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalled();
        const result = mockOnComplete.mock.calls[0][0];
        expect(result.accuracy).toBeGreaterThan(0);
        expect(result.accuracy).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('Virtual Keyboard Integration', () => {
    it('should highlight current key', async () => {
      render(<TypingTestEngine test={mockTest} onComplete={mockOnComplete} />);
      
      const input = screen.getByTestId('typing-input');
      fireEvent.keyDown(input, { key: 't' });
      
      await waitFor(() => {
        expect(screen.getByTestId('current-key')).toHaveTextContent('h');
      });
    });

    it('should highlight next key', async () => {
      render(<TypingTestEngine test={mockTest} onComplete={mockOnComplete} />);
      
      const input = screen.getByTestId('typing-input');
      fireEvent.keyDown(input, { key: 't' });
      
      await waitFor(() => {
        expect(screen.getByTestId('next-key')).toHaveTextContent('e');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle component errors gracefully', () => {
      // Mock console.error to avoid noise in tests
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      render(<TypingTestEngine test={mockTest} onComplete={mockOnComplete} />);
      
      expect(consoleSpy).not.toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });
});
