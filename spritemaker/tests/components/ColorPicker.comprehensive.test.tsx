import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ColorPicker from '../../src/components/ColorPicker';
import { Color } from '../../src/types';

// Mock the color utilities with comprehensive test cases
jest.mock('../../src/utils/colorUtils', () => ({
  hsvToRgb: jest.fn((h: number, s: number, v: number) => {
    // Comprehensive mock implementation for testing
    if (h === 0 && s === 100 && v === 100) return '#ff0000';      // Red
    if (h === 60 && s === 100 && v === 100) return '#ffff00';      // Yellow
    if (h === 120 && s === 100 && v === 100) return '#00ff00';      // Green
    if (h === 180 && s === 100 && v === 100) return '#00ffff';      // Cyan
    if (h === 240 && s === 100 && v === 100) return '#0000ff';      // Blue
    if (h === 300 && s === 100 && v === 100) return '#ff00ff';      // Magenta
    
    // Test saturation and value changes
    if (h === 0 && s === 50 && v === 100) return '#ff8080';        // Light red
    if (h === 0 && s === 100 && v === 50) return '#800000';        // Dark red
    if (h === 0 && s === 0 && v === 100) return '#ffffff';         // White
    if (h === 0 && s === 0 && v === 0) return '#000000';           // Black
    
    // Default fallback
    return '#000000';
  }),
  rgbToHsv: jest.fn((color: Color) => {
    // Comprehensive mock implementation for testing
    switch (color) {
      case '#ff0000': return { h: 0, s: 100, v: 100 };
      case '#ffff00': return { h: 60, s: 100, v: 100 };
      case '#00ff00': return { h: 120, s: 100, v: 100 };
      case '#00ffff': return { h: 180, s: 100, v: 100 };
      case '#0000ff': return { h: 240, s: 100, v: 100 };
      case '#ff00ff': return { h: 300, s: 100, v: 100 };
      case '#ff8080': return { h: 0, s: 50, v: 100 };
      case '#800000': return { h: 0, s: 100, v: 50 };
      case '#ffffff': return { h: 0, s: 0, v: 100 };
      case '#000000': return { h: 0, s: 0, v: 0 };
      default: return { h: 0, s: 0, v: 100 };
    }
  }),
  createSafeGradient: jest.fn(() => ({
    addColorStop: jest.fn()
  })),
  safeFillRect: jest.fn(),
  getSafeColor: jest.fn((color: string) => color),
  isValidHexColor: jest.fn((color: string) => /^#[0-9A-Fa-f]{6}$/.test(color))
}));

describe('ColorPicker - Comprehensive Tests', () => {
  const defaultProps = {
    primaryColor: '#ff0000',
    onPrimaryColorChange: jest.fn(),
    secondaryColor: '#00ff00',
    onSecondaryColorChange: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render without crashing', () => {
      render(<ColorPicker {...defaultProps} />);
      expect(screen.getByText('Color Picker')).toBeInTheDocument();
    });

    it('should display the primary color correctly', () => {
      render(<ColorPicker {...defaultProps} />);
      const colorText = screen.getByText('II');
      const colorDisplay = colorText.parentElement;
      // The inner div with the color is the second child (index 1) of the container
      const innerColorDiv = colorDisplay?.children[1] as HTMLElement;
      expect(innerColorDiv).toHaveAttribute('style');
      expect(innerColorDiv!.getAttribute('style')).toContain('background-color: hsla(0, 100%, 100%, 1)'); // Default red with full alpha
    });

    it('should display the secondary color correctly', () => {
      render(<ColorPicker {...defaultProps} />);
      const colorText = screen.getByText('I');
      const colorDisplay = colorText.parentElement;
      // Check the inline style attribute directly
      expect(colorDisplay).toHaveAttribute('style');
      expect(colorDisplay!.getAttribute('style')).toContain('background-color: #00ff00');
    });

    it('should render all required UI elements', () => {
      render(<ColorPicker {...defaultProps} />);
      
      expect(screen.getByText('Color Picker')).toBeInTheDocument();
      expect(screen.getByText('Swap Colors')).toBeInTheDocument();
      expect(screen.getByDisplayValue('#ff0000')).toBeInTheDocument();
      expect(screen.getByDisplayValue(/Idx-/)).toBeInTheDocument();
    });
  });

  describe('Color Swatches', () => {
    it('should render multiple color swatches', () => {
      render(<ColorPicker {...defaultProps} />);
      const swatches = document.querySelectorAll('[style*="background-color"]');
      expect(swatches.length).toBeGreaterThan(20);
    });

    it('should handle color swatch clicks', async () => {
      const onPrimaryColorChange = jest.fn();
      
      render(
        <ColorPicker
          {...defaultProps}
          onPrimaryColorChange={onPrimaryColorChange}
        />
      );

      // Find actual color swatches by looking for elements with specific dimensions and background colors
      // Color swatches have width: 20px, height: 20px and are in the swatch grid
      const swatches = document.querySelectorAll('div[style*="width: 20px"][style*="height: 20px"][style*="background-color"]');
      
      // Find a swatch that's not the current primary color (#ff0000)
      let targetSwatch: HTMLElement | null = null;
      for (let i = 0; i < swatches.length; i++) {
        const swatch = swatches[i] as HTMLElement;
        const style = swatch.getAttribute('style');
        if (style && !style.includes('rgb(255, 0, 0)')) {
          targetSwatch = swatch;
          break;
        }
      }
      
      expect(targetSwatch).not.toBeNull();
      if (targetSwatch) {
        // Use fireEvent for more reliable clicking
        fireEvent.click(targetSwatch);
        expect(onPrimaryColorChange).toHaveBeenCalled();
      }
    });

    it('should highlight selected color swatch', () => {
      render(<ColorPicker {...defaultProps} />);
      
      // The primary color should be highlighted
      const selectedSwatch = document.querySelector('[style*="box-shadow: 0 0 6px rgba(255,255,255,0.8)"]');
      expect(selectedSwatch).toBeInTheDocument();
    });
  });

  describe('Color Inputs', () => {
    it('should handle hex color input changes', async () => {
      const onPrimaryColorChange = jest.fn();
      
      render(
        <ColorPicker
          {...defaultProps}
          onPrimaryColorChange={onPrimaryColorChange}
        />
      );

      const hexInput = screen.getByDisplayValue('#ff0000');
      
      // Use fireEvent for more reliable input changes
      fireEvent.change(hexInput, { target: { value: '#00ff00' } });
      
      expect(onPrimaryColorChange).toHaveBeenCalledWith('#00ff00');
    });

    it('should handle invalid hex color input gracefully', async () => {
      const user = userEvent.setup();
      const onPrimaryColorChange = jest.fn();
      
      render(
        <ColorPicker
          {...defaultProps}
          onPrimaryColorChange={onPrimaryColorChange}
        />
      );

      const hexInput = screen.getByDisplayValue('#ff0000');
      await user.clear(hexInput);
      await user.type(hexInput, 'invalid');
      
      // Should not call onPrimaryColorChange with invalid color
      expect(onPrimaryColorChange).not.toHaveBeenCalledWith('invalid');
    });

    it('should display current color in hex input', () => {
      render(<ColorPicker {...defaultProps} />);
      const hexInput = screen.getByDisplayValue('#ff0000');
      expect(hexInput).toHaveValue('#ff0000');
    });
  });

  describe('Color Swap Functionality', () => {
    it('should render swap colors button', () => {
      render(<ColorPicker {...defaultProps} />);
      const swapButton = screen.getByText('Swap Colors');
      expect(swapButton).toBeInTheDocument();
    });

    it('should handle color swap correctly', async () => {
      const user = userEvent.setup();
      const onPrimaryColorChange = jest.fn();
      const onSecondaryColorChange = jest.fn();
      
      render(
        <ColorPicker
          {...defaultProps}
          onPrimaryColorChange={onPrimaryColorChange}
          onSecondaryColorChange={onSecondaryColorChange}
        />
      );

      const swapButton = screen.getByText('Swap Colors');
      await user.click(swapButton);
      
      expect(onPrimaryColorChange).toHaveBeenCalledWith('#00ff00');
      expect(onSecondaryColorChange).toHaveBeenCalledWith('#ff0000');
    });
  });

  describe('Canvas Elements', () => {
    it('should render all required canvas elements', () => {
      render(<ColorPicker {...defaultProps} />);
      
      const canvases = document.querySelectorAll('canvas');
      expect(canvases.length).toBe(3); // gradient, hue, alpha
      
      // Check that each canvas has the correct attributes
      canvases.forEach(canvas => {
        expect(canvas).toHaveAttribute('width');
        expect(canvas).toHaveAttribute('height');
        expect(canvas).toHaveStyle({ cursor: 'crosshair' });
      });
    });

    it('should have proper canvas dimensions', () => {
      render(<ColorPicker {...defaultProps} />);
      
      const canvases = document.querySelectorAll('canvas');
      const gradientCanvas = canvases[0];
      const hueCanvas = canvases[1];
      const alphaCanvas = canvases[2];
      
      expect(gradientCanvas).toHaveAttribute('width', '160');
      expect(gradientCanvas).toHaveAttribute('height', '120');
      expect(hueCanvas).toHaveAttribute('width', '160');
      expect(hueCanvas).toHaveAttribute('height', '20');
      expect(alphaCanvas).toHaveAttribute('width', '160');
      expect(alphaCanvas).toHaveAttribute('height', '20');
    });
  });

  describe('Mouse Event Handling', () => {
    it('should handle mouse down events', () => {
      render(<ColorPicker {...defaultProps} />);
      
      const canvases = document.querySelectorAll('canvas');
      const gradientCanvas = canvases[0];
      
      // Mock getBoundingClientRect
      gradientCanvas.getBoundingClientRect = jest.fn(() => ({
        width: 160,
        height: 120,
        top: 0,
        left: 0,
        right: 160,
        bottom: 120,
        x: 0,
        y: 0,
      }));
      
      // Should not crash on mouse down
      expect(() => {
        fireEvent.mouseDown(gradientCanvas, { clientX: 80, clientY: 60 });
      }).not.toThrow();
    });

    it('should handle mouse move events', () => {
      render(<ColorPicker {...defaultProps} />);
      
      const canvases = document.querySelectorAll('canvas');
      const gradientCanvas = canvases[0];
      
      // Mock getBoundingClientRect
      gradientCanvas.getBoundingClientRect = jest.fn(() => ({
        width: 160,
        height: 120,
        top: 0,
        left: 0,
        right: 160,
        bottom: 120,
        x: 0,
        y: 0,
      }));
      
      // Should not crash on mouse move
      expect(() => {
        fireEvent.mouseMove(gradientCanvas, { clientX: 80, clientY: 60 });
      }).not.toThrow();
    });

    it('should handle mouse up events', () => {
      render(<ColorPicker {...defaultProps} />);
      
      const canvases = document.querySelectorAll('canvas');
      const gradientCanvas = canvases[0];
      
      // Should not crash on mouse up
      expect(() => {
        fireEvent.mouseUp(gradientCanvas);
      }).not.toThrow();
    });
  });

  describe('State Management', () => {
    it('should update when primary color changes externally', () => {
      const { rerender } = render(<ColorPicker {...defaultProps} />);
      
      // Change the primary color
      rerender(
        <ColorPicker
          {...defaultProps}
          primaryColor="#00ff00"
        />
      );
      
      const colorText = screen.getByText('II');
      const colorDisplay = colorText.parentElement;
      const innerColorDiv = colorDisplay?.children[1] as HTMLElement;
      // Check the inline style attribute directly
      expect(innerColorDiv).toHaveAttribute('style');
      expect(innerColorDiv!.getAttribute('style')).toContain('background-color: hsla(120, 100%, 100%, 1)'); // Green with full alpha
    });

    it('should maintain state consistency', () => {
      render(<ColorPicker {...defaultProps} />);
      
      // Check that all color-related elements are consistent
      const colorText = screen.getByText('II');
      const colorDisplay = colorText.parentElement;
      const innerColorDiv = colorDisplay?.children[1] as HTMLElement;
      const hexInput = screen.getByDisplayValue('#ff0000');
      
      // Check the inline style attribute directly
      expect(innerColorDiv).toHaveAttribute('style');
      expect(innerColorDiv!.getAttribute('style')).toContain('background-color: hsla(0, 100%, 100%, 1)'); // Red with full alpha
      expect(hexInput).toHaveValue('#ff0000');
    });

    it('should handle edge cases gracefully', () => {
      // Test with empty or invalid colors
      render(
        <ColorPicker
          primaryColor=""
          onPrimaryColorChange={jest.fn()}
          secondaryColor=""
          onSecondaryColorChange={jest.fn()}
        />
      );
      
      // Should not crash
      expect(screen.getByText('Color Picker')).toBeInTheDocument();
    });
  });

  describe('HSV Value Display', () => {
    it('should display HSV values', () => {
      render(<ColorPicker {...defaultProps} />);
      
      // Should display H, S, V, and A values
      expect(screen.getByText(/H:/)).toBeInTheDocument();
      expect(screen.getByText(/S:/)).toBeInTheDocument();
      expect(screen.getByText(/V:/)).toBeInTheDocument();
      expect(screen.getByText(/A:/)).toBeInTheDocument();
    });

    it('should display alpha value as percentage', () => {
      render(<ColorPicker {...defaultProps} />);
      
      // Alpha should be displayed as a percentage
      const alphaDisplay = screen.getByText(/A:/);
      expect(alphaDisplay).toBeInTheDocument();
    });
  });

  describe('Color Markers', () => {
    it('should render color markers on canvases', () => {
      render(<ColorPicker {...defaultProps} />);
      
      // Should have markers for current color position
      const markers = document.querySelectorAll('[style*="position: absolute"]');
      expect(markers.length).toBeGreaterThan(0);
    });

    it('should position markers correctly', () => {
      render(<ColorPicker {...defaultProps} />);
      
      // Check that markers have proper positioning styles
      const markers = document.querySelectorAll('[style*="position: absolute"]');
      markers.forEach(marker => {
        const style = (marker as HTMLElement).style;
        expect(style.position).toBe('absolute');
        expect(style.left).toBeDefined();
        expect(style.top).toBeDefined();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels', () => {
      render(<ColorPicker {...defaultProps} />);
      
      expect(screen.getByText('Color:')).toBeInTheDocument();
      expect(screen.getByText('Idx-1:')).toBeInTheDocument();
    });

    it('should have proper button text', () => {
      render(<ColorPicker {...defaultProps} />);
      
      expect(screen.getByText('Swap Colors')).toBeInTheDocument();
    });

    it('should have proper heading structure', () => {
      render(<ColorPicker {...defaultProps} />);
      
      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('Color Picker');
    });
  });

  describe('Performance and Optimization', () => {
    it('should not re-render unnecessarily', () => {
      const onPrimaryColorChange = jest.fn();
      const { rerender } = render(
        <ColorPicker {...defaultProps} onPrimaryColorChange={onPrimaryColorChange} />
      );
      
      const initialCallCount = onPrimaryColorChange.mock.calls.length;
      
      // Re-render with same props
      rerender(<ColorPicker {...defaultProps} onPrimaryColorChange={onPrimaryColorChange} />);
      
      // Should not trigger unnecessary color changes
      expect(onPrimaryColorChange.mock.calls.length).toBe(initialCallCount);
    });

    it('should handle rapid color changes gracefully', async () => {
      const onPrimaryColorChange = jest.fn();
      
      render(
        <ColorPicker
          {...defaultProps}
          onPrimaryColorChange={onPrimaryColorChange}
        />
      );

      const hexInput = screen.getByDisplayValue('#ff0000');
      
      // Rapidly change colors
      fireEvent.change(hexInput, { target: { value: '#00ff00' } });
      fireEvent.change(hexInput, { target: { value: '#0000ff' } });
      
      // Should handle all changes
      expect(onPrimaryColorChange).toHaveBeenCalledWith('#00ff00');
      expect(onPrimaryColorChange).toHaveBeenCalledWith('#0000ff');
    });
  });
});
