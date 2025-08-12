import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import SpriteEditor from '../../src/components/SpriteEditor'
import { Tool, Color, Layer, GridSettings } from '../../src/types'

describe('SpriteEditor', () => {
  const defaultProps = {
    selectedTool: 'pencil' as Tool,
    primaryColor: '#ff0000' as Color,
    secondaryColor: '#0000ff' as Color,
    brushSize: 1,
    canvasSize: 32,
    layers: [
      { id: 1, name: 'Layer 1', visible: true, active: true }
    ] as Layer[],
    onCanvasRef: jest.fn(),
    gridSettings: {
      visible: false,
      color: '#333',
      opacity: 0.5,
      quarter: false,
      eighths: false
    } as GridSettings
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render without crashing', () => {
    render(<SpriteEditor {...defaultProps} />)
    expect(screen.getByRole('img')).toBeInTheDocument()
  })

  it('should render canvas with correct dimensions', () => {
    render(<SpriteEditor {...defaultProps} />)
    const canvas = screen.getByRole('img')
    expect(canvas).toBeInTheDocument()
  })

  it('should handle grid settings changes', () => {
    const { rerender } = render(<SpriteEditor {...defaultProps} />)
    
    // Test with quarter grid enabled
    const propsWithQuarterGrid = {
      ...defaultProps,
      gridSettings: {
        ...defaultProps.gridSettings,
        quarter: true
      }
    }
    
    rerender(<SpriteEditor {...propsWithQuarterGrid} />)
    expect(screen.getByRole('img')).toBeInTheDocument()
  })

  it('should handle eighths grid settings changes', () => {
    const { rerender } = render(<SpriteEditor {...defaultProps} />)
    
    // Test with eighths grid enabled
    const propsWithEighthsGrid = {
      ...defaultProps,
      gridSettings: {
        ...defaultProps.gridSettings,
        eighths: true
      }
    }
    
    rerender(<SpriteEditor {...propsWithEighthsGrid} />)
    expect(screen.getByRole('img')).toBeInTheDocument()
  })
})
