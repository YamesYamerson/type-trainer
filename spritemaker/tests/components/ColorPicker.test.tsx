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
    expect(screen.getByText('Color Picker')).toBeInTheDocument();
  });

  it('should display the primary color correctly', () => {
    render(<ColorPicker {...defaultProps} />);
    
    const colorDisplay = screen.getByText('II').parentElement;
    expect(colorDisplay).toHaveStyle({ backgroundColor: '#ff0000' });
  });

  it('should render color swatches', () => {
    render(<ColorPicker {...defaultProps} />);
    
    // Check that we have multiple color swatches
    const swatches = document.querySelectorAll('[style*="background-color"]');
    expect(swatches.length).toBeGreaterThan(20); // Should have at least 20 swatches
  });

  it('should handle color swatch clicks', async () => {
    const user = userEvent.setup();
    const onPrimaryColorChange = jest.fn();
    
    render(
      <ColorPicker
        {...defaultProps}
        onPrimaryColorChange={onPrimaryColorChange}
      />
    );

    // Find and click a color swatch
    const swatches = document.querySelectorAll('[style*="background-color"]');
    const firstSwatch = swatches[0] as HTMLElement;
    
    await user.click(firstSwatch);
    
    expect(onPrimaryColorChange).toHaveBeenCalled();
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
    await user.type(hexInput, '#00ff00');
    
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

  it('should update when primary color changes externally', () => {
    const { rerender } = render(<ColorPicker {...defaultProps} />);
    
    // Change the primary color
    rerender(
      <ColorPicker
        {...defaultProps}
        primaryColor="#00ff00"
      />
    );
    
    const colorDisplay = screen.getByText('II').parentElement;
    expect(colorDisplay).toHaveStyle({ backgroundColor: '#00ff00' });
  });

  it('should maintain state consistency', () => {
    render(<ColorPicker {...defaultProps} />);
    
    // Check that all color-related elements are consistent
    const colorDisplay = screen.getByText('II').parentElement;
    const hexInput = screen.getByDisplayValue('#ff0000');
    
    expect(colorDisplay).toHaveStyle({ backgroundColor: '#ff0000' });
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
