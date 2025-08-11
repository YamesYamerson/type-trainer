/// <reference types="@testing-library/jest-dom" />
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ModeSelector } from '../../src/components/ModeSelector';
import type { TypingMode } from '../../src/types';

describe('ModeSelector Component', () => {
  const mockModes: TypingMode[] = [
    {
      id: 'lowercase',
      name: 'Lowercase',
      contentPath: '/data/lowercase.json',
      options: ['Basic words', 'Simple sentences'],
      subcategories: [
        {
          id: 'random_words',
          name: 'Random Words',
          description: 'Practice with random lowercase words',
          difficulty: 'beginner'
        },
        {
          id: 'simple_sentences',
          name: 'Simple Sentences',
          description: 'Practice with simple sentence structures',
          difficulty: 'beginner'
        }
      ]
    },
    {
      id: 'uppercase',
      name: 'Uppercase',
      contentPath: '/data/uppercase.json',
      options: ['Capital letters', 'Titles'],
      subcategories: [
        {
          id: 'capital_letters',
          name: 'Capital Letters',
          description: 'Practice with capital letter words',
          difficulty: 'intermediate'
        },
        {
          id: 'titles',
          name: 'Titles',
          description: 'Practice with title case text',
          difficulty: 'intermediate'
        }
      ]
    },
    {
      id: 'mixed_case',
      name: 'Mixed Case',
      contentPath: '/data/mixed-case.json',
      options: ['Mixed words', 'Complex sentences'],
      subcategories: [
        {
          id: 'mixed_words',
          name: 'Mixed Words',
          description: 'Practice with mixed case words',
          difficulty: 'advanced'
        },
        {
          id: 'complex_sentences',
          name: 'Complex Sentences',
          description: 'Practice with complex sentence structures',
          difficulty: 'advanced'
        }
      ]
    }
  ];

  const mockOnModeSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Rendering', () => {
    it('should render the mode selector component', () => {
      render(
        <ModeSelector
          modes={mockModes}
          selectedMode=""
          selectedSubcategory=""
          onModeSelect={mockOnModeSelect}
        />
      );
      
      expect(screen.getByText('Select Typing Mode & Subcategory')).toBeInTheDocument();
    });

    it('should display all available modes', () => {
      render(
        <ModeSelector
          modes={mockModes}
          selectedMode=""
          selectedSubcategory=""
          onModeSelect={mockOnModeSelect}
        />
      );
      
      expect(screen.getByText('Lowercase')).toBeInTheDocument();
      expect(screen.getByText('Uppercase')).toBeInTheDocument();
      expect(screen.getByText('Mixed Case')).toBeInTheDocument();
    });

    it('should show mode options for each mode', () => {
      render(
        <ModeSelector
          modes={mockModes}
          selectedMode=""
          selectedSubcategory=""
          onModeSelect={mockOnModeSelect}
        />
      );
      
      expect(screen.getByText('Basic words, Simple sentences')).toBeInTheDocument();
      expect(screen.getByText('Capital letters, Titles')).toBeInTheDocument();
      expect(screen.getByText('Mixed words, Complex sentences')).toBeInTheDocument();
    });

    it('should display subcategory counts', () => {
      render(
        <ModeSelector
          modes={mockModes}
          selectedMode=""
          selectedSubcategory=""
          onModeSelect={mockOnModeSelect}
        />
      );
      
      // Should find multiple elements with the same text
      expect(screen.getAllByText('2 subcategories')).toHaveLength(3);
    });
  });

  describe('Mode Selection', () => {
    it('should call onModeSelect when a mode is clicked', () => {
      render(
        <ModeSelector
          modes={mockModes}
          selectedMode=""
          selectedSubcategory=""
          onModeSelect={mockOnModeSelect}
        />
      );
      
      const lowercaseButton = screen.getByText('Lowercase');
      fireEvent.click(lowercaseButton);
      
      expect(mockOnModeSelect).toHaveBeenCalledWith('lowercase', 'random_words');
    });

    it('should expand mode to show subcategories when clicked', () => {
      render(
        <ModeSelector
          modes={mockModes}
          selectedMode=""
          selectedSubcategory=""
          onModeSelect={mockOnModeSelect}
        />
      );
      
      const lowercaseButton = screen.getByText('Lowercase');
      fireEvent.click(lowercaseButton);
      
      expect(screen.getByText('Choose Subcategory:')).toBeInTheDocument();
      expect(screen.getByText('Random Words')).toBeInTheDocument();
      expect(screen.getByText('Simple Sentences')).toBeInTheDocument();
    });

    it('should collapse mode when clicked again', () => {
      render(
        <ModeSelector
          modes={mockModes}
          selectedMode=""
          selectedSubcategory=""
          onModeSelect={mockOnModeSelect}
        />
      );
      
      const lowercaseButton = screen.getByText('Lowercase');
      
      // First click to expand
      fireEvent.click(lowercaseButton);
      expect(screen.getByText('Choose Subcategory:')).toBeInTheDocument();
      
      // Second click to collapse
      fireEvent.click(lowercaseButton);
      expect(screen.queryByText('Choose Subcategory:')).not.toBeInTheDocument();
    });

    it('should only show subcategories for the selected mode', () => {
      render(
        <ModeSelector
          modes={mockModes}
          selectedMode=""
          selectedSubcategory=""
          onModeSelect={mockOnModeSelect}
        />
      );
      
      // Click lowercase mode
      fireEvent.click(screen.getByText('Lowercase'));
      expect(screen.getByText('Random Words')).toBeInTheDocument();
      expect(screen.getByText('Simple Sentences')).toBeInTheDocument();
      expect(screen.queryByText('Capital Letters')).not.toBeInTheDocument();
      
      // Click uppercase mode
      fireEvent.click(screen.getByText('Uppercase'));
      expect(screen.getByText('Capital Letters')).toBeInTheDocument();
      expect(screen.getByText('Titles')).toBeInTheDocument();
      expect(screen.queryByText('Random Words')).not.toBeInTheDocument();
    });
  });

  describe('Subcategory Display', () => {
    it('should display subcategory descriptions', () => {
      render(
        <ModeSelector
          modes={mockModes}
          selectedMode=""
          selectedSubcategory=""
          onModeSelect={mockOnModeSelect}
        />
      );
      
      // Expand lowercase mode
      fireEvent.click(screen.getByText('Lowercase'));
      
      expect(screen.getByText('Practice with random lowercase words')).toBeInTheDocument();
      expect(screen.getByText('Practice with simple sentence structures')).toBeInTheDocument();
    });

    it('should show difficulty levels for subcategories', () => {
      render(
        <ModeSelector
          modes={mockModes}
          selectedMode=""
          selectedSubcategory=""
          onModeSelect={mockOnModeSelect}
        />
      );
      
      // Expand lowercase mode
      fireEvent.click(screen.getByText('Lowercase'));
      
      // Should find multiple elements with the same difficulty
      expect(screen.getAllByText('beginner')).toHaveLength(2);
    });
  });

  describe('Layout and Styling', () => {
    it('should use proper container classes', () => {
      render(
        <ModeSelector
          modes={mockModes}
          selectedMode=""
          selectedSubcategory=""
          onModeSelect={mockOnModeSelect}
        />
      );
      
      const container = screen.getByText('Select Typing Mode & Subcategory').closest('.bg-white');
      expect(container).toHaveClass('bg-white', 'rounded-lg', 'shadow-lg', 'p-6');
    });

    it('should have proper width constraints', () => {
      render(
        <ModeSelector
          modes={mockModes}
          selectedMode=""
          selectedSubcategory=""
          onModeSelect={mockOnModeSelect}
        />
      );
      
      const container = screen.getByText('Select Typing Mode & Subcategory').closest('.bg-white');
      expect(container).toHaveClass('mb-8', 'max-w-6xl', 'mx-auto');
    });

    it('should use proper spacing between elements', () => {
      render(
        <ModeSelector
          modes={mockModes}
          selectedMode=""
          selectedSubcategory=""
          onModeSelect={mockOnModeSelect}
        />
      );
      
      const heading = screen.getByText('Select Typing Mode & Subcategory');
      expect(heading).toHaveClass('text-xl', 'font-semibold', 'text-gray-800', 'mb-4');
    });

    it('should have proper button styling', () => {
      render(
        <ModeSelector
          modes={mockModes}
          selectedMode=""
          selectedSubcategory=""
          onModeSelect={mockOnModeSelect}
        />
      );
      
      const modeButton = screen.getByRole('button', { name: /Lowercase.*/ });
      expect(modeButton).toHaveClass('w-full', 'text-left', 'p-4', 'bg-gray-50', 'hover:bg-gray-100');
    });
  });

  describe('Responsive Design', () => {
    it('should use responsive container classes', () => {
      render(
        <ModeSelector
          modes={mockModes}
          selectedMode=""
          selectedSubcategory=""
          onModeSelect={mockOnModeSelect}
        />
      );
      
      const container = screen.getByText('Select Typing Mode & Subcategory').closest('.max-w-6xl');
      expect(container).toHaveClass('max-w-6xl', 'mx-auto');
    });

    it('should have proper text sizing', () => {
      render(
        <ModeSelector
          modes={mockModes}
          selectedMode=""
          selectedSubcategory=""
          onModeSelect={mockOnModeSelect}
        />
      );
      
      const heading = screen.getByText('Select Typing Mode & Subcategory');
      expect(heading).toHaveClass('text-xl');
    });
  });

  describe('State Management', () => {
    it('should track which mode is expanded', () => {
      render(
        <ModeSelector
          modes={mockModes}
          selectedMode=""
          selectedSubcategory=""
          onModeSelect={mockOnModeSelect}
        />
      );
      
      // Initially no mode should be expanded
      expect(screen.queryByText('Choose Subcategory:')).not.toBeInTheDocument();
      
      // Click lowercase mode
      fireEvent.click(screen.getByText('Lowercase'));
      expect(screen.getByText('Choose Subcategory:')).toBeInTheDocument();
      
      // Click uppercase mode (should collapse lowercase and expand uppercase)
      fireEvent.click(screen.getByText('Uppercase'));
      expect(screen.getByText('Capital Letters')).toBeInTheDocument();
      expect(screen.queryByText('Random Words')).not.toBeInTheDocument();
    });

    it('should handle multiple rapid clicks correctly', () => {
      render(
        <ModeSelector
          modes={mockModes}
          selectedMode=""
          selectedSubcategory=""
          onModeSelect={mockOnModeSelect}
        />
      );
      
      const lowercaseButton = screen.getByText('Lowercase');
      
      // Rapid clicks - first click expands, second collapses, third expands again
      fireEvent.click(lowercaseButton); // Expand
      fireEvent.click(lowercaseButton); // Collapse
      fireEvent.click(lowercaseButton); // Expand again
      
      // Should be in a consistent state (expanded)
      expect(screen.getByText('Choose Subcategory:')).toBeInTheDocument();
      expect(mockOnModeSelect).toHaveBeenCalledTimes(2); // Called on expand and collapse
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      render(
        <ModeSelector
          modes={mockModes}
          selectedMode=""
          selectedSubcategory=""
          onModeSelect={mockOnModeSelect}
        />
      );
      
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('Select Typing Mode & Subcategory');
    });

    it('should have accessible button labels', () => {
      render(
        <ModeSelector
          modes={mockModes}
          selectedMode=""
          selectedSubcategory=""
          onModeSelect={mockOnModeSelect}
        />
      );
      
      expect(screen.getByRole('button', { name: /Lowercase.*/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Uppercase.*/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Mixed Case.*/ })).toBeInTheDocument();
    });

    it('should provide clear visual feedback for interactions', () => {
      render(
        <ModeSelector
          modes={mockModes}
          selectedMode=""
          selectedSubcategory=""
          onModeSelect={mockOnModeSelect}
        />
      );
      
      const modeButton = screen.getByRole('button', { name: /Lowercase.*/ });
      expect(modeButton).toHaveClass('hover:bg-gray-100');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty modes array', () => {
      render(
        <ModeSelector
          modes={[]}
          selectedMode=""
          selectedSubcategory=""
          onModeSelect={mockOnModeSelect}
        />
      );
      
      expect(screen.getByText('Select Typing Mode & Subcategory')).toBeInTheDocument();
      expect(screen.queryByText('subcategories')).not.toBeInTheDocument();
    });

    it('should handle modes with no subcategories', () => {
      const modesWithoutSubcategories: TypingMode[] = [
        {
          id: 'empty_mode',
          name: 'Empty Mode',
          contentPath: '/data/empty.json',
          options: ['No subcategories'],
          subcategories: []
        }
      ];

      render(
        <ModeSelector
          modes={modesWithoutSubcategories}
          selectedMode=""
          selectedSubcategory=""
          onModeSelect={mockOnModeSelect}
        />
      );
      
      expect(screen.getByText('Empty Mode')).toBeInTheDocument();
      expect(screen.getByText('0 subcategories')).toBeInTheDocument();
    });

    it('should handle modes with missing properties', () => {
      const incompleteModes: TypingMode[] = [
        {
          id: 'incomplete',
          name: 'Incomplete Mode',
          contentPath: '/data/incomplete.json',
          options: ['Missing properties'],
          subcategories: []
        }
      ];

      render(
        <ModeSelector
          modes={incompleteModes}
          selectedMode=""
          selectedSubcategory=""
          onModeSelect={mockOnModeSelect}
        />
      );
      
      // Should still render without crashing
      expect(screen.getByText('Incomplete Mode')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should render efficiently with many modes', () => {
      const manyModes: TypingMode[] = Array.from({ length: 50 }, (_, i) => ({
        id: `mode_${i}`,
        name: `Mode ${i}`,
        contentPath: `/data/mode_${i}.json`,
        options: [`Option ${i}`],
        subcategories: [
          {
            id: `sub_${i}`,
            name: `Subcategory ${i}`,
            description: `Description ${i}`,
            difficulty: 'beginner' as const
          }
        ]
      }));

      const startTime = performance.now();
      
      render(
        <ModeSelector
          modes={manyModes}
          selectedMode=""
          selectedSubcategory=""
          onModeSelect={mockOnModeSelect}
        />
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render in reasonable time
      expect(renderTime).toBeLessThan(1000);
    });

    it('should handle rapid state changes efficiently', () => {
      render(
        <ModeSelector
          modes={mockModes}
          selectedMode=""
          selectedSubcategory=""
          onModeSelect={mockOnModeSelect}
        />
      );
      
      const lowercaseButton = screen.getByText('Lowercase');
      const uppercaseButton = screen.getByText('Uppercase');
      
      // Rapid state changes
      for (let i = 0; i < 10; i++) {
        fireEvent.click(lowercaseButton);
        fireEvent.click(uppercaseButton);
      }
      
      // Should handle without performance issues
      expect(mockOnModeSelect).toHaveBeenCalledTimes(20);
    });
  });

  describe('Integration', () => {
    it('should work correctly with parent component callbacks', () => {
      const mockModeSelect = jest.fn();
      
      render(
        <ModeSelector
          modes={mockModes}
          selectedMode=""
          selectedSubcategory=""
          onModeSelect={mockModeSelect}
        />
      );
      
      // Test mode selection
      fireEvent.click(screen.getByText('Lowercase'));
      expect(mockModeSelect).toHaveBeenCalledWith('lowercase', 'random_words');
    });

    it('should maintain state consistency across re-renders', () => {
      const { rerender } = render(
        <ModeSelector
          modes={mockModes}
          selectedMode=""
          selectedSubcategory=""
          onModeSelect={mockOnModeSelect}
        />
      );
      
      // Expand lowercase mode
      fireEvent.click(screen.getByText('Lowercase'));
      expect(screen.getByText('Choose Subcategory:')).toBeInTheDocument();
      
      // Re-render with same props
      rerender(
        <ModeSelector
          modes={mockModes}
          selectedMode=""
          selectedSubcategory=""
          onModeSelect={mockOnModeSelect}
        />
      );
      
      // State should be preserved
      expect(screen.getByText('Choose Subcategory:')).toBeInTheDocument();
    });
  });
});
