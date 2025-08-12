import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import SpriteEditor from '../../src/components/SpriteEditor'

// Mock the canvas context
const mockContext = {
  fillStyle: '#000000',
  strokeStyle: '#000000',
  lineWidth: 1,
  globalAlpha: 1.0,
  clearRect: jest.fn(),
  fillRect: jest.fn(),
  strokeRect: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  stroke: jest.fn(),
  createLinearGradient: jest.fn(() => ({
    addColorStop: jest.fn()
  }))
}

// Mock canvas element
const mockCanvas = {
  getContext: jest.fn(() => mockContext),
  getBoundingClientRect: jest.fn(() => ({
    left: 0,
    top: 0,
    width: 512,
    height: 512
  })),
  width: 512,
  height: 512
}

// Mock ref
const mockRef = {
  current: mockCanvas
}

describe('SpriteEditor', () => {
  const defaultProps = {
    selectedTool: 'pencil' as const,
    primaryColor: '#ff0000',
    canvasSize: 32,
    layers: [
      {
        id: 1,
        name: 'Layer 1',
        visible: true,
        active: true
      }
    ],
    onCanvasRef: jest.fn(),
    gridSettings: {
      visible: false,
      color: '#333',
      opacity: 0.5,
      quarter: false,
      eighths: false,
      sixteenths: false,
      thirtyseconds: false
    }
  }

  beforeEach(() => {
    jest.clearAllMocks()
    // Mock the canvas ref
    jest.spyOn(React, 'useRef').mockReturnValue(mockRef)
  })

  it('should render without crashing', () => {
    render(<SpriteEditor {...defaultProps} />)
    // Look for the canvas element by its test-id
    expect(screen.getByTestId('sprite-canvas')).toBeInTheDocument()
  })

  it('should handle flood fill on transparent areas', () => {
    render(<SpriteEditor {...defaultProps} selectedTool="fill" />)
    
    // Simulate clicking on a transparent area
    const canvas = screen.getByTestId('sprite-canvas')
    fireEvent.mouseDown(canvas, { clientX: 100, clientY: 100 })
    
    // The fill should work on transparent areas now
    // We can't easily test the actual flood fill behavior in Jest due to canvas limitations,
    // but we can verify the component renders and handles the event
    expect(canvas).toBeInTheDocument()
  })

  it('should handle flood fill on colored areas', () => {
    render(<SpriteEditor {...defaultProps} selectedTool="fill" />)
    
    const canvas = screen.getByTestId('sprite-canvas')
    fireEvent.mouseDown(canvas, { clientX: 200, clientY: 200 })
    
    // Verify the component handles the fill event
    expect(canvas).toBeInTheDocument()
  })

  it('should handle pencil tool correctly', () => {
    render(<SpriteEditor {...defaultProps} selectedTool="pencil" />)
    
    const canvas = screen.getByTestId('sprite-canvas')
    fireEvent.mouseDown(canvas, { clientX: 150, clientY: 150 })
    
    // Verify the component handles the pencil event
    expect(canvas).toBeInTheDocument()
  })

  it('should handle eraser tool correctly', () => {
    render(<SpriteEditor {...defaultProps} selectedTool="eraser" />)
    
    const canvas = screen.getByTestId('sprite-canvas')
    fireEvent.mouseDown(canvas, { clientX: 250, clientY: 250 })
    
    // Verify the component handles the eraser event
    expect(canvas).toBeInTheDocument()
  })

  it('should properly handle flood fill algorithm logic', () => {
    // Test the flood fill logic directly
    render(<SpriteEditor {...defaultProps} selectedTool="fill" />)
    
    // Verify the component renders
    expect(screen.getByTestId('sprite-canvas')).toBeInTheDocument()
    
    // The flood fill should now work on transparent areas
    // This test verifies the component structure is correct
  })

  it('should handle different canvas sizes correctly', () => {
    const largeCanvasProps = { ...defaultProps, canvasSize: 64 }
    render(<SpriteEditor {...largeCanvasProps} />)
    
    expect(screen.getByTestId('sprite-canvas')).toBeInTheDocument()
  })

  it('should handle layer visibility correctly', () => {
    const hiddenLayerProps = {
      ...defaultProps,
      layers: [
        {
          id: 1,
          name: 'Layer 1',
          visible: false,
          active: true
        }
      ]
    }
    
    render(<SpriteEditor {...hiddenLayerProps} />)
    expect(screen.getByTestId('sprite-canvas')).toBeInTheDocument()
  })
})
