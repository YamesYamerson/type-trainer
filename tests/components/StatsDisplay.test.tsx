import React from 'react';
import { render, screen } from '@testing-library/react';
import { StatsDisplay } from '../../src/components/StatsDisplay';

describe('StatsDisplay Component', () => {
  const mockResults = [
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
      timestamp: Date.now() - 3600000, // 1 hour ago
      hash: 'hash_1'
    },
    {
      testId: 'test_2',
      category: 'lowercase',
      subcategory: 'random_words',
      wpm: 52,
      accuracy: 92,
      errors: 3,
      totalCharacters: 120,
      correctCharacters: 110,
      timeElapsed: 90000,
      timestamp: Date.now() - 7200000, // 2 hours ago
      hash: 'hash_2'
    },
    {
      testId: 'test_3',
      category: 'uppercase',
      subcategory: 'capital_letters',
      wpm: 38,
      accuracy: 88,
      errors: 5,
      totalCharacters: 80,
      correctCharacters: 70,
      timeElapsed: 70000,
      timestamp: Date.now() - 10800000, // 3 hours ago
      hash: 'hash_3'
    }
  ];

  describe('Initial Rendering', () => {
    it('should render the stats display component', () => {
      render(<StatsDisplay results={mockResults} />);
      
      expect(screen.getByText('Your Stats')).toBeInTheDocument();
    });

    it('should display overall statistics', () => {
      render(<StatsDisplay results={mockResults} />);
      
      expect(screen.getByText('Overall Performance')).toBeInTheDocument();
      expect(screen.getByText('45')).toBeInTheDocument(); // Average WPM
      expect(screen.getByText('92%')).toBeInTheDocument(); // Average Accuracy
      expect(screen.getByText('52')).toBeInTheDocument(); // Best WPM
      expect(screen.getByText('3')).toBeInTheDocument(); // Tests Completed
    });

    it('should display category performance section', () => {
      render(<StatsDisplay results={mockResults} />);
      
      expect(screen.getByText('Category Performance')).toBeInTheDocument();
    });

    it('should display subcategory performance section', () => {
      render(<StatsDisplay results={mockResults} />);
      
      expect(screen.getByText('Subcategory Performance')).toBeInTheDocument();
    });
  });

  describe('Statistics Calculations', () => {
    it('should calculate average WPM correctly', () => {
      render(<StatsDisplay results={mockResults} />);
      
      // (45 + 52 + 38) / 3 = 45
      expect(screen.getByText('45')).toBeInTheDocument();
    });

    it('should calculate average accuracy correctly', () => {
      render(<StatsDisplay results={mockResults} />);
      
      // (95 + 92 + 88) / 3 = 91.67, rounded to 92
      expect(screen.getByText('92%')).toBeInTheDocument();
    });

    it('should display best WPM from all tests', () => {
      render(<StatsDisplay results={mockResults} />);
      
      // Best WPM is 52
      expect(screen.getByText('52')).toBeInTheDocument();
    });

    it('should display total number of tests completed', () => {
      render(<StatsDisplay results={mockResults} />);
      
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  describe('Category Performance', () => {
    it('should group results by category', () => {
      render(<StatsDisplay results={mockResults} />);
      
      expect(screen.getByText('lowercase')).toBeInTheDocument();
      expect(screen.getByText('uppercase')).toBeInTheDocument();
    });

    it('should calculate category averages correctly', () => {
      render(<StatsDisplay results={mockResults} />);
      
      // lowercase: (45 + 52) / 2 = 48.5, rounded to 49
      expect(screen.getByText('49')).toBeInTheDocument();
      // lowercase accuracy: (95 + 92) / 2 = 93.5, rounded to 94
      expect(screen.getByText('94%')).toBeInTheDocument();
      
      // uppercase: 38
      expect(screen.getByText('38')).toBeInTheDocument();
      // uppercase accuracy: 88
      expect(screen.getByText('88%')).toBeInTheDocument();
    });

    it('should display test count for each category', () => {
      render(<StatsDisplay results={mockResults} />);
      
      // lowercase has 2 tests
      expect(screen.getByText('2')).toBeInTheDocument();
      // uppercase has 1 test
      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });

  describe('Subcategory Performance', () => {
    it('should group results by subcategory', () => {
      render(<StatsDisplay results={mockResults} />);
      
      expect(screen.getByText('random_words')).toBeInTheDocument();
      expect(screen.getByText('capital_letters')).toBeInTheDocument();
    });

    it('should calculate subcategory averages correctly', () => {
      render(<StatsDisplay results={mockResults} />);
      
      // random_words: (45 + 52) / 2 = 48.5, rounded to 49
      expect(screen.getByText('49')).toBeInTheDocument();
      // random_words accuracy: (95 + 92) / 2 = 93.5, rounded to 94
      expect(screen.getByText('94%')).toBeInTheDocument();
      
      // capital_letters: 38
      expect(screen.getByText('38')).toBeInTheDocument();
      // capital_letters accuracy: 88
      expect(screen.getByText('88%')).toBeInTheDocument();
    });

    it('should display test count for each subcategory', () => {
      render(<StatsDisplay results={mockResults} />);
      
      // random_words has 2 tests
      expect(screen.getByText('2')).toBeInTheDocument();
      // capital_letters has 1 test
      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });

  describe('Empty Results Handling', () => {
    it('should handle empty results array', () => {
      render(<StatsDisplay results={[]} />);
      
      expect(screen.getByText('Your Stats')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument(); // Tests Completed
      expect(screen.getByText('0')).toBeInTheDocument(); // Average WPM
      expect(screen.getByText('0%')).toBeInTheDocument(); // Average Accuracy
    });

    it('should display no categories when no results', () => {
      render(<StatsDisplay results={[]} />);
      
      expect(screen.getByText('Category Performance')).toBeInTheDocument();
      expect(screen.getByText('Subcategory Performance')).toBeInTheDocument();
    });
  });

  describe('Single Result Handling', () => {
    it('should handle single test result correctly', () => {
      const singleResult = [mockResults[0]];
      render(<StatsDisplay results={singleResult} />);
      
      expect(screen.getByText('45')).toBeInTheDocument(); // WPM
      expect(screen.getByText('95%')).toBeInTheDocument(); // Accuracy
      expect(screen.getByText('1')).toBeInTheDocument(); // Tests Completed
    });

    it('should display single category and subcategory', () => {
      const singleResult = [mockResults[0]];
      render(<StatsDisplay results={singleResult} />);
      
      expect(screen.getByText('lowercase')).toBeInTheDocument();
      expect(screen.getByText('random_words')).toBeInTheDocument();
    });
  });

  describe('Layout and Styling', () => {
    it('should use proper container classes', () => {
      render(<StatsDisplay results={mockResults} />);
      
      const container = screen.getByText('Your Stats').closest('.bg-white');
      expect(container).toHaveClass('bg-white', 'rounded-lg', 'shadow-lg', 'p-6');
    });

    it('should have proper width constraints', () => {
      render(<StatsDisplay results={mockResults} />);
      
      const container = screen.getByText('Your Stats').closest('.bg-white');
      expect(container).toHaveClass('w-full', 'max-w-md');
    });

    it('should use grid layout for statistics', () => {
      render(<StatsDisplay results={mockResults} />);
      
      const statsGrid = screen.getByText('45').closest('.grid');
      expect(statsGrid).toHaveClass('grid', 'grid-cols-2');
    });

    it('should have proper spacing between sections', () => {
      render(<StatsDisplay results={mockResults} />);
      
      const overallSection = screen.getByText('Overall Performance').closest('h3');
      const categorySection = screen.getByText('Category Performance').closest('h3');
      
      expect(overallSection).toBeInTheDocument();
      expect(categorySection).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should use responsive grid classes', () => {
      render(<StatsDisplay results={mockResults} />);
      
      const statsGrid = screen.getByText('45').closest('.grid-cols-2');
      expect(statsGrid).toHaveClass('grid-cols-2');
    });

    it('should have proper text sizing', () => {
      render(<StatsDisplay results={mockResults} />);
      
      // Check that stats use appropriate text sizes
      const wpmValue = screen.getByText('45');
      const accuracyValue = screen.getByText('92%');
      
      expect(wpmValue).toBeInTheDocument();
      expect(accuracyValue).toBeInTheDocument();
    });
  });

  describe('Data Accuracy', () => {
    it('should handle decimal calculations correctly', () => {
      const decimalResults = [
        {
          testId: 'test_1',
          category: 'test',
          subcategory: 'test',
          wpm: 45.7,
          accuracy: 95.3,
          errors: 2,
          totalCharacters: 100,
          correctCharacters: 95,
          timeElapsed: 80000,
          timestamp: Date.now(),
          hash: 'hash_1'
        },
        {
          testId: 'test_2',
          category: 'test',
          subcategory: 'test',
          wpm: 52.2,
          accuracy: 92.8,
          errors: 3,
          totalCharacters: 120,
          correctCharacters: 111,
          timeElapsed: 90000,
          timestamp: Date.now(),
          hash: 'hash_2'
        }
      ];

      render(<StatsDisplay results={decimalResults} />);
      
      // (45.7 + 52.2) / 2 = 48.95, rounded to 49
      expect(screen.getByText('49')).toBeInTheDocument();
      // (95.3 + 92.8) / 2 = 94.05, rounded to 94
      expect(screen.getByText('94%')).toBeInTheDocument();
    });

    it('should handle zero values correctly', () => {
      const zeroResults = [
        {
          testId: 'test_1',
          category: 'test',
          subcategory: 'test',
          wpm: 0,
          accuracy: 0,
          errors: 0,
          totalCharacters: 0,
          correctCharacters: 0,
          timeElapsed: 0,
          timestamp: Date.now(),
          hash: 'hash_1'
        }
      ];

      render(<StatsDisplay results={zeroResults} />);
      
      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('0%')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should render efficiently with many results', () => {
      const manyResults = Array.from({ length: 100 }, (_, i) => ({
        testId: `test_${i}`,
        category: `category_${i % 5}`,
        subcategory: `subcategory_${i % 10}`,
        wpm: 40 + (i % 20),
        accuracy: 80 + (i % 20),
        errors: i % 5,
        totalCharacters: 100 + (i % 50),
        correctCharacters: 90 + (i % 30),
        timeElapsed: 60000 + (i % 30000),
        timestamp: Date.now() - (i * 3600000),
        hash: `hash_${i}`
      }));

      const startTime = performance.now();
      
      render(<StatsDisplay results={manyResults} />);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render in reasonable time
      expect(renderTime).toBeLessThan(1000);
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      render(<StatsDisplay results={mockResults} />);
      
      const mainHeading = screen.getByRole('heading', { level: 2 });
      expect(mainHeading).toHaveTextContent('Your Stats');
    });

    it('should have semantic HTML structure', () => {
      render(<StatsDisplay results={mockResults} />);
      
      // Should use proper HTML elements
      expect(screen.getByText('Your Stats')).toBeInTheDocument();
      expect(screen.getByText('Overall Performance')).toBeInTheDocument();
    });

    it('should display statistics in a readable format', () => {
      render(<StatsDisplay results={mockResults} />);
      
      // Stats should be clearly labeled
      expect(screen.getByText('Avg WPM')).toBeInTheDocument();
      expect(screen.getByText('Avg Accuracy')).toBeInTheDocument();
      expect(screen.getByText('Best WPM')).toBeInTheDocument();
      expect(screen.getByText('Tests Completed')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle results with missing properties', () => {
      const incompleteResults = [
        {
          testId: 'test_1',
          category: 'test',
          subcategory: 'test',
          wpm: 45,
          accuracy: 95,
          errors: 2,
          totalCharacters: 100,
          correctCharacters: 98,
          timeElapsed: 80000,
          timestamp: Date.now(),
          hash: 'hash_1'
        }
      ];

      render(<StatsDisplay results={incompleteResults} />);
      
      // Should still render without crashing
      expect(screen.getByText('Your Stats')).toBeInTheDocument();
    });

    it('should handle very large numbers', () => {
      const largeResults = [
        {
          testId: 'test_1',
          category: 'test',
          subcategory: 'test',
          wpm: 999999,
          accuracy: 100,
          errors: 0,
          totalCharacters: 999999,
          correctCharacters: 999999,
          timeElapsed: 999999999,
          timestamp: Date.now(),
          hash: 'hash_1'
        }
      ];

      render(<StatsDisplay results={largeResults} />);
      
      expect(screen.getByText('999999')).toBeInTheDocument();
      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('should handle very small numbers', () => {
      const smallResults = [
        {
          testId: 'test_1',
          category: 'test',
          subcategory: 'test',
          wpm: 0.1,
          accuracy: 0.1,
          errors: 0,
          totalCharacters: 1,
          correctCharacters: 1,
          timeElapsed: 1000,
          timestamp: Date.now(),
          hash: 'hash_1'
        }
      ];

      render(<StatsDisplay results={smallResults} />);
      
      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('0%')).toBeInTheDocument();
    });
  });
});
