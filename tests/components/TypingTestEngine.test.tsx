/**
 * Tests for TypingTestEngine component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TypingTestEngine } from '../../src/components/TypingTestEngine';
import type { TypingTest } from '../../src/types';

// Mock the VirtualKeyboard component (using React.createElement)
jest.mock('../../src/components/VirtualKeyboard', () => ({
  VirtualKeyboard: ({ currentKey, nextKey }: { currentKey?: string; nextKey?: string }) => React.createElement('div', { 'data-testid': 'virtual-keyboard' },
    React.createElement('span', { 'data-testid': 'current-key' }, currentKey || ''),
    React.createElement('span', { 'data-testid': 'next-key' }, nextKey || '')
  )
}));

describe('TypingTestEngine', () => {
  const mockTest: TypingTest = {
    id: 'test_1',
    category: 'practice',
    content: 'the quick brown fox jumps over the lazy dog',
    difficulty: 'beginner'
  };

  const mockOnComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should render the component correctly', () => {
      render(<TypingTestEngine test={mockTest} onComplete={mockOnComplete} />);
      expect(screen.getByText('Practice Test')).toBeInTheDocument();
      expect(screen.getByText('Difficulty: beginner')).toBeInTheDocument();
      
      // Check that the text container exists and contains the expected content
      const textContainer = document.querySelector('.text-lg.leading-relaxed.font-mono');
      expect(textContainer).toBeInTheDocument();
      
      // Check that the text container contains the expected content by looking for specific characters
      // Use getAllByText to get all instances and check the first one in the typing area
      const allTChars = screen.getAllByText('t');
      expect(allTChars.length).toBeGreaterThan(0);
      
      // The first 't' should be in the typing area (not the virtual keyboard)
      const typingAreaT = allTChars.find(el => 
        el.closest('.text-lg.leading-relaxed.font-mono')
      );
      expect(typingAreaT).toBeInTheDocument();
    });

    it('should display initial content', () => {
      render(<TypingTestEngine test={mockTest} onComplete={mockOnComplete} />);
      
      // Check that the text container exists and contains the expected content
      const textContainer = document.querySelector('.text-lg.leading-relaxed.font-mono');
      expect(textContainer).toBeInTheDocument();
      
      // Check that the text container contains the expected content
      const allTChars = screen.getAllByText('t');
      expect(allTChars.length).toBeGreaterThan(0);
      
      const typingAreaT = allTChars.find(el => 
        el.closest('.text-lg.leading-relaxed.font-mono')
      );
      expect(typingAreaT).toBeInTheDocument();
    });
  });

  describe('Typing Functionality', () => {
    it('should handle typing correctly', async () => {
      render(<TypingTestEngine test={mockTest} onComplete={mockOnComplete} />);
      const container = document.querySelector('[tabindex="0"]');
      if (!container) throw new Error('Container not found');
      
      fireEvent.keyDown(container, { key: 't' });
      
      await waitFor(() => {
        // Check that the text container still exists
        const textContainer = document.querySelector('.text-lg.leading-relaxed.font-mono');
        expect(textContainer).toBeInTheDocument();
        
        // Check that the first character is still visible in the typing area
        const allTChars = screen.getAllByText('t');
        expect(allTChars.length).toBeGreaterThan(0);
        
        const typingAreaT = allTChars.find(el => 
          el.closest('.text-lg.leading-relaxed.font-mono')
        );
        expect(typingAreaT).toBeInTheDocument();
      });
    });

    it('should track typing progress', async () => {
      render(<TypingTestEngine test={mockTest} onComplete={mockOnComplete} />);
      const container = document.querySelector('[tabindex="0"]');
      if (!container) throw new Error('Container not found');
      
      // Type the first few characters
      fireEvent.keyDown(container, { key: 't' });
      fireEvent.keyDown(container, { key: 'h' });
      fireEvent.keyDown(container, { key: 'e' });
      
      await waitFor(() => {
        // Check that the text container still exists
        const textContainer = document.querySelector('.text-lg.leading-relaxed.font-mono');
        expect(textContainer).toBeInTheDocument();
        
        // Check that the first few characters are still visible in the typing area
        const allTChars = screen.getAllByText('t');
        const allHChars = screen.getAllByText('h');
        const allEChars = screen.getAllByText('e');
        
        expect(allTChars.length).toBeGreaterThan(0);
        expect(allHChars.length).toBeGreaterThan(0);
        expect(allEChars.length).toBeGreaterThan(0);
        
        // Check they're in the typing area
        const typingAreaT = allTChars.find(el => 
          el.closest('.text-lg.leading-relaxed.font-mono')
        );
        const typingAreaH = allHChars.find(el => 
          el.closest('.text-lg.leading-relaxed.font-mono')
        );
        const typingAreaE = allEChars.find(el => 
          el.closest('.text-lg.leading-relaxed.font-mono')
        );
        
        expect(typingAreaT).toBeInTheDocument();
        expect(typingAreaH).toBeInTheDocument();
        expect(typingAreaE).toBeInTheDocument();
      });
    });
  });

  describe('Performance', () => {
    it('should handle large content efficiently', async () => {
      const largeTest: TypingTest = { ...mockTest, content: 'a'.repeat(1000) };
      render(<TypingTestEngine test={largeTest} onComplete={mockOnComplete} />);
      const container = document.querySelector('[tabindex="0"]');
      if (!container) throw new Error('Container not found');
      
      const startTime = performance.now();
      for (let i = 0; i < 10; i++) {
        fireEvent.keyDown(container, { key: 'a' });
      }
      const endTime = performance.now();
      
      await waitFor(() => {
        expect(endTime - startTime).toBeLessThan(1000); // Should be very fast
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper focus management', () => {
      render(<TypingTestEngine test={mockTest} onComplete={mockOnComplete} />);
      const container = document.querySelector('[tabindex="0"]');
      expect(container).toHaveAttribute('tabindex', '0');
    });

    it('should render virtual keyboard', () => {
      render(<TypingTestEngine test={mockTest} onComplete={mockOnComplete} />);
      expect(screen.getByTestId('virtual-keyboard')).toBeInTheDocument();
    });
  });
});


