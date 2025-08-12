import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ColorPicker from '../../src/components/ColorPicker';
import { Color } from '../../src/types';

// Mock the color utilities
jest.mock('../../src/utils/colorUtils', () => ({
  hsvToRgb: jest.fn((h: number, s: number, v: number) => {
    // Simple mock implementation
    if (h === 0 && s === 100 && v === 100) return '#ff0000';
    if (h === 120 && s === 100 && v === 100) return '#00ff00';
    if (h === 240 && s === 100 && v === 100) return '#0000ff';
    return '#000000';
  }),
  rgbToHsv: jest.fn((color: Color) => {
    // Simple mock implementation
    if (color === '#ff0000') return { h: 0, s: 100, v: 100 };
    if (color === '#00ff00') return { h: 120, s: 100, v: 100 };
    if (color === '#0000ff') return { h: 240, s: 100, v: 100 };
    return { h: 0, s: 0, v: 100 };
  }),
  createSafeGradient: jest.fn(() => ({
    addColorStop: jest.fn()
  })),
  safeFillRect: jest.fn(),
  getSafeColor: jest.fn((color: string) => color),
  isValidHexColor: jest.fn((color: string) => /^#[0-9A-Fa-f]{6}$/.test(color))
}));

describe('ColorPicker', () => {
  const defaultProps = {
    primaryColor: '#ff0000',
    onPrimaryColorChange: jest.fn(),
    secondaryColor: '#00ff00',
    onSecondaryColorChange: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing', () => {
    render(<ColorPicker {...defaultProps} />);
    // Check that the color picker container is rendered
    expect(screen.getByText('II')).toBeInTheDocument(); // Primary color display
    expect(screen.getByText('I')).toBeInTheDocument();  // Secondary color display
  });

  it('should display the primary color correctly', () => {
    render(<ColorPicker {...defaultProps} />);
    
    // The color display now has a nested structure with checkerboard background
    // We need to find the inner div that contains the actual color
    const colorText = screen.getByText('II');
    const colorDisplay = colorText.parentElement;
    // The inner div with the color is the second child (index 1) of the container
    const innerColorDiv = colorDisplay?.children[1] as HTMLElement;
    
    expect(innerColorDiv).toHaveAttribute('style');
    expect(innerColorDiv!.getAttribute('style')).toContain('background-color: rgb(255, 0, 0)'); // Default red with full alpha (converted from hsla by Jest/jsdom)
  });

  it('should render color swatches', () => {
    render(<ColorPicker {...defaultProps} />);
    
    // Check that we have multiple color swatches
    const swatches = document.querySelectorAll('[style*="background-color"]');
    expect(swatches.length).toBeGreaterThan(20); // Should have at least 20 swatches
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
    console.log('Found color swatches:', swatches.length);
    
    // Find a swatch that's not the current primary color (#ff0000)
    let targetSwatch: HTMLElement | null = null;
    for (let i = 0; i < swatches.length; i++) {
      const swatch = swatches[i] as HTMLElement;
      const style = swatch.getAttribute('style');
      console.log(`Swatch ${i} style:`, style);
      if (style && !style.includes('rgb(255, 0, 0)')) {
        targetSwatch = swatch;
        console.log(`Found target swatch at index ${i}`);
        break;
      }
    }
    
    expect(targetSwatch).not.toBeNull();
    if (targetSwatch) {
      console.log('Clicking target swatch');
      // Use fireEvent for more reliable clicking
      fireEvent.click(targetSwatch);
      console.log('onPrimaryColorChange calls:', onPrimaryColorChange.mock.calls);
      expect(onPrimaryColorChange).toHaveBeenCalled();
    }
  });

  it('should render gradient picker canvas', () => {
    render(<ColorPicker {...defaultProps} />);
    
    const gradientCanvas = document.querySelector('canvas');
    expect(gradientCanvas).toBeInTheDocument();
  });

  it('should render hue bar canvas', () => {
    render(<ColorPicker {...defaultProps} />);
    
    const canvases = document.querySelectorAll('canvas');
    expect(canvases.length).toBeGreaterThanOrEqual(3); // gradient, hue, alpha
  });

  it('should render alpha bar canvas', () => {
    render(<ColorPicker {...defaultProps} />);
    
    const canvases = document.querySelectorAll('canvas');
    expect(canvases.length).toBeGreaterThanOrEqual(3);
  });

  it('should display color inputs', () => {
    render(<ColorPicker {...defaultProps} />);
    
    // Check for index input
    const indexInput = screen.getByDisplayValue(/Idx-/);
    expect(indexInput).toBeInTheDocument();
    
    // Check for hex color input
    const hexInput = screen.getByDisplayValue('#ff0000');
    expect(hexInput).toBeInTheDocument();
  });

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

  it('should render swap colors button', () => {
    render(<ColorPicker {...defaultProps} />);
    
    const swapButton = screen.getByText('Swap Colors');
    expect(swapButton).toBeInTheDocument();
  });

  it('should handle color swap', async () => {
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

  it('should handle gradient canvas clicks', async () => {
    const user = userEvent.setup();
    
    render(<ColorPicker {...defaultProps} />);
    
    const canvases = document.querySelectorAll('canvas');
    const gradientCanvas = canvases[0] as HTMLCanvasElement;
    
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
    
    await user.click(gradientCanvas);
    
    // Should not crash on click
    expect(gradientCanvas).toBeInTheDocument();
  });

  it('should handle hue bar clicks', async () => {
    const user = userEvent.setup();
    
    render(<ColorPicker {...defaultProps} />);
    
    const canvases = document.querySelectorAll('canvas');
    const hueCanvas = canvases[1] as HTMLCanvasElement;
    
    // Mock getBoundingClientRect
    hueCanvas.getBoundingClientRect = jest.fn(() => ({
      width: 160,
      height: 20,
      top: 0,
      left: 0,
      right: 160,
      bottom: 20,
      x: 0,
      y: 0,
    }));
    
    await user.click(hueCanvas);
    
    // Should not crash on click
    expect(hueCanvas).toBeInTheDocument();
  });

  it('should handle alpha bar clicks', async () => {
    const user = userEvent.setup();
    
    render(<ColorPicker {...defaultProps} />);
    
    const canvases = document.querySelectorAll('canvas');
    const alphaCanvas = canvases[2] as HTMLCanvasElement;
    
    // Mock getBoundingClientRect
    alphaCanvas.getBoundingClientRect = jest.fn(() => ({
      width: 160,
      height: 20,
      top: 0,
      left: 0,
      right: 160,
      bottom: 20,
      x: 0,
      y: 0,
    }));
    
    await user.click(alphaCanvas);
    
    // Should not crash on click
    expect(alphaCanvas).toBeInTheDocument();
  });

  it('should update when primary color changes externally', async () => {
    const { rerender } = render(<ColorPicker {...defaultProps} />);
    
    // Change the primary color
    rerender(
      <ColorPicker
        {...defaultProps}
        primaryColor="#00ff00"
      />
    );
    
    // Wait for the state update to complete
    await waitFor(() => {
      const colorText = screen.getByText('II');
      const colorDisplay = colorText.parentElement;
      const innerColorDiv = colorDisplay?.children[1] as HTMLElement;
      expect(innerColorDiv!.getAttribute('style')).toContain('background-color: rgb(0, 255, 0)'); // Green with full alpha (converted from hsla by Jest/jsdom)
    });
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
    expect(innerColorDiv!.getAttribute('style')).toContain('background-color: rgb(255, 0, 0)'); // Red with full alpha (converted from hsla by Jest/jsdom)
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
