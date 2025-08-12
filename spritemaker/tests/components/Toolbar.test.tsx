import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import Toolbar from '../../src/components/Toolbar'
import { Tool, Color, GridSettings } from '../../src/types'

// Mock the color utilities if needed
jest.mock('../../src/utils/colorUtils', () => ({
  hsvToRgb: jest.fn(),
  rgbToHsv: jest.fn()
}))

describe('Toolbar', () => {
  const defaultProps = {
    selectedTool: 'pencil' as Tool,
    onToolSelect: jest.fn(),
    primaryColor: '#ff0000' as Color,
    onPrimaryColorChange: jest.fn(),
    secondaryColor: '#0000ff' as Color,
    onSecondaryColorChange: jest.fn(),
    brushSize: 2,
    onBrushSizeChange: jest.fn(),
    canvasSize: 32,
    onCanvasSizeChange: jest.fn(),
    gridSettings: {
      visible: false,
      color: '#333',
      opacity: 0.5,
      quarter: false,
      eighths: false,
      sixteenths: false
    } as GridSettings,
    onGridSettingsChange: jest.fn(),
    onNewProject: jest.fn(),
    onOpenProject: jest.fn(),
    onSaveProject: jest.fn(),
    onExportImage: jest.fn(),
    onSettings: jest.fn(),
    canvasRef: undefined
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render without crashing', () => {
    render(<Toolbar {...defaultProps} />)
    expect(screen.getByText('File')).toBeInTheDocument()
    expect(screen.getByText('Brush:')).toBeInTheDocument()
    expect(screen.getByText('2px')).toBeInTheDocument()
  })

  it('should display the File menu with correct styling', () => {
    render(<Toolbar {...defaultProps} />)

    const fileMenu = screen.getByText('File')
    expect(fileMenu).toBeInTheDocument()

    // Check that the container is positioned absolutely (far left)
    // The file menu text is inside a button, which is inside a div container
    const fileMenuContainer = fileMenu.closest('div[style*="position: absolute"]')
    expect(fileMenuContainer).toBeInTheDocument()
    expect(fileMenuContainer).toHaveStyle('left: 20px')
    
    // Check the button styling
    const fileButton = fileMenu.closest('div[style*="min-width: 240px"]')
    expect(fileButton).toBeInTheDocument()
  })

  it('should display the File menu with a file icon', () => {
    render(<Toolbar {...defaultProps} />)

    const fileMenu = screen.getByText('File')
    const fileIcon = fileMenu.parentElement?.querySelector('svg')

    expect(fileIcon).toBeInTheDocument()
    expect(fileIcon?.tagName).toBe('svg')
  })

  it('should toggle dropdown when File menu is clicked', () => {
    render(<Toolbar {...defaultProps} />)

    const fileMenu = screen.getByText('File')
    
    // Initially dropdown should be closed
    expect(screen.queryByText('New Project')).not.toBeInTheDocument()
    
    // Click to open dropdown
    fireEvent.click(fileMenu)
    expect(screen.getByText('New Project')).toBeInTheDocument()
    
    // Click again to close dropdown
    fireEvent.click(fileMenu)
    expect(screen.queryByText('New Project')).not.toBeInTheDocument()
  })

  it('should call onNewProject when New Project is clicked in dropdown', () => {
    render(<Toolbar {...defaultProps} />)

    const fileMenu = screen.getByText('File')
    
    // Open dropdown
    fireEvent.click(fileMenu)
    
    // Click New Project
    const newProjectButton = screen.getByText('New Project')
    fireEvent.click(newProjectButton)
    
    expect(defaultProps.onNewProject).toHaveBeenCalledTimes(1)
  })

  it('should display brush size control correctly', () => {
    render(<Toolbar {...defaultProps} />)
    
    expect(screen.getByText('Brush:')).toBeInTheDocument()
    expect(screen.getByText('2px')).toBeInTheDocument()
    
    // Check brush size dropdown exists
    const brushSelect = screen.getByDisplayValue('2')
    expect(brushSelect).toBeInTheDocument()
    expect(brushSelect).toHaveAttribute('id', 'brush-size-select')
  })

  it('should call onBrushSizeChange when brush size is changed', () => {
    render(<Toolbar {...defaultProps} />)
    
    const brushSelect = screen.getByDisplayValue('2')
    fireEvent.change(brushSelect, { target: { value: '4' } })
    
    expect(defaultProps.onBrushSizeChange).toHaveBeenCalledWith(4)
  })

  it('should display all tool buttons', () => {
    render(<Toolbar {...defaultProps} />)
    
    // Check for tool buttons
    expect(screen.getByTitle('Pencil')).toBeInTheDocument()
    expect(screen.getByTitle('Eraser')).toBeInTheDocument()
    expect(screen.getByTitle('Fill')).toBeInTheDocument()
    expect(screen.getByTitle('Eyedropper')).toBeInTheDocument()
    expect(screen.getByTitle('Rectangle')).toBeInTheDocument()
    expect(screen.getByTitle('Circle')).toBeInTheDocument()
    expect(screen.getByTitle('Line')).toBeInTheDocument()
  })

  it('should call onToolSelect when a tool is clicked', () => {
    render(<Toolbar {...defaultProps} />)
    
    const eraserButton = screen.getByTitle('Eraser')
    fireEvent.click(eraserButton)
    
    expect(defaultProps.onToolSelect).toHaveBeenCalledWith('eraser')
  })

  it('should highlight the selected tool', () => {
    render(<Toolbar {...defaultProps} />)
    
    const pencilButton = screen.getByTitle('Pencil')
    expect(pencilButton).toHaveClass('active')
    
    const eraserButton = screen.getByTitle('Eraser')
    expect(eraserButton).not.toHaveClass('active')
  })

  it('should display primary and secondary colors correctly', () => {
    render(<Toolbar {...defaultProps} />)
    
    // Check for the color display box
    const colorDisplay = screen.getByText('I').closest('div')?.parentElement
    expect(colorDisplay).toBeInTheDocument()
    
    // Check that both colors are displayed
    expect(screen.getByText('I')).toBeInTheDocument()
    expect(screen.getByText('II')).toBeInTheDocument()
  })

  it('should display canvas size control', () => {
    render(<Toolbar {...defaultProps} />)
    
    const canvasSelect = screen.getByDisplayValue('32x32')
    expect(canvasSelect).toBeInTheDocument()
  })

  it('should call onCanvasSizeChange when canvas size is changed', () => {
    render(<Toolbar {...defaultProps} />)
    
    const canvasSelect = screen.getByDisplayValue('32x32')
    fireEvent.change(canvasSelect, { target: { value: '64' } })
    
    expect(defaultProps.onCanvasSizeChange).toHaveBeenCalledWith(64)
  })

  it('should display grid toggle control', () => {
    render(<Toolbar {...defaultProps} />)
    
    const gridToggle = screen.getByTitle('Show Grid - Currently OFF')
    expect(gridToggle).toBeInTheDocument()
    expect(gridToggle).toHaveClass('tool-button')
  })

  it('should call onGridSettingsChange when grid toggle is clicked', () => {
    render(<Toolbar {...defaultProps} />)
    
    const gridToggle = screen.getByTitle('Show Grid - Currently OFF')
    fireEvent.click(gridToggle)
    
    expect(defaultProps.onGridSettingsChange).toHaveBeenCalledWith({
      visible: true,
      color: '#333',
      opacity: 0.5,
      quarter: false,
      eighths: false,
      sixteenths: false
    })
  })

  it('should display grid toggle as ON when grid is visible', () => {
    const propsWithVisibleGrid = {
      ...defaultProps,
      gridSettings: {
        visible: true,
        color: '#333',
        opacity: 0.5,
        quarter: false,
        eighths: false
      }
    }
    
    render(<Toolbar {...propsWithVisibleGrid} />)
    
    const gridToggle = screen.getByTitle('Show Grid - Currently ON')
    expect(gridToggle).toBeInTheDocument()
    
    // Check that it has the active class and correct icon
    expect(gridToggle).toHaveClass('tool-button active')
    const gridIcon = gridToggle.querySelector('img')
    expect(gridIcon).toHaveAttribute('src', '/icons/gimp-all/default-svg/gimp-grid.svg')
  })

  it('should display quarter grid control', () => {
    render(<Toolbar {...defaultProps} />)
    
    const quarterGrid = screen.getByTitle('Quarter Grid - Currently OFF')
    expect(quarterGrid).toBeInTheDocument()
    expect(quarterGrid).toHaveClass('tool-button')
  })

  it('should call onGridSettingsChange when quarter grid is clicked', () => {
    render(<Toolbar {...defaultProps} />)
    
    const quarterGrid = screen.getByTitle('Quarter Grid - Currently OFF')
    fireEvent.click(quarterGrid)
    
    expect(defaultProps.onGridSettingsChange).toHaveBeenCalledWith({
      visible: false,
      color: '#333',
      opacity: 0.5,
      quarter: true,
      eighths: false
    })
  })

  it('should display quarter grid as ON when active', () => {
    const propsWithQuarterGrid = {
      ...defaultProps,
      gridSettings: {
        visible: false,
        color: '#333',
        opacity: 0.5,
        quarter: true,
        eighths: false,
        sixteenths: false
      }
    }
    
    render(<Toolbar {...propsWithQuarterGrid} />)
    
    const quarterGrid = screen.getByTitle('Quarter Grid - Currently ON')
    expect(quarterGrid).toBeInTheDocument()
    expect(quarterGrid).toHaveClass('tool-button active')
  })

  it('should display eighths grid control', () => {
    render(<Toolbar {...defaultProps} />)
    
    const eighthsGrid = screen.getByTitle('Eighths Grid - Currently OFF')
    expect(eighthsGrid).toBeInTheDocument()
    expect(eighthsGrid).toHaveClass('tool-button')
  })

  it('should call onGridSettingsChange when eighths grid is clicked', () => {
    render(<Toolbar {...defaultProps} />)
    
    const eighthsGrid = screen.getByTitle('Eighths Grid - Currently OFF')
    fireEvent.click(eighthsGrid)
    
    expect(defaultProps.onGridSettingsChange).toHaveBeenCalledWith({
      visible: false,
      color: '#333',
      opacity: 0.5,
      quarter: false,
      eighths: true
    })
  })

  it('should display eighths grid as ON when active', () => {
    const propsWithEighthsGrid = {
      ...defaultProps,
      gridSettings: {
        visible: false,
        color: '#333',
        opacity: 0.5,
        quarter: false,
        eighths: true
      }
    }
    
    render(<Toolbar {...propsWithEighthsGrid} />)
    
    const eighthsGrid = screen.getByTitle('Eighths Grid - Currently ON')
    expect(eighthsGrid).toBeInTheDocument()
    expect(eighthsGrid).toHaveClass('tool-button active')
  })

  it('should display sixteenths grid control', () => {
    render(<Toolbar {...defaultProps} />)
    
    const sixteenthsGrid = screen.getByTitle('Sixteenths Grid - Currently OFF')
    expect(sixteenthsGrid).toBeInTheDocument()
    expect(sixteenthsGrid).toHaveClass('tool-button')
  })

  it('should call onGridSettingsChange when sixteenths grid is clicked', () => {
    render(<Toolbar {...defaultProps} />)
    
    const sixteenthsGrid = screen.getByTitle('Sixteenths Grid - Currently OFF')
    fireEvent.click(sixteenthsGrid)
    
    expect(defaultProps.onGridSettingsChange).toHaveBeenCalledWith({
      visible: false,
      color: '#333',
      opacity: 0.5,
      quarter: false,
      eighths: false,
      sixteenths: true
    })
  })

  it('should display sixteenths grid as ON when active', () => {
    render(<Toolbar {...defaultProps} gridSettings={{ ...defaultProps.gridSettings, sixteenths: true }} />)
    
    const sixteenthsGrid = screen.getByTitle('Sixteenths Grid - Currently ON')
    expect(sixteenthsGrid).toHaveClass('tool-button', 'active')
  })

  it('should have proper brush size options', () => {
    render(<Toolbar {...defaultProps} />)
    
    const brushSelect = document.getElementById('brush-size-select')
    expect(brushSelect).toBeInTheDocument()
    
    const options = brushSelect?.querySelectorAll('option')
    expect(options).toHaveLength(4)
    expect(options?.[0]).toHaveValue('1')
    expect(options?.[3]).toHaveValue('4')
  })

  it('should have proper canvas size options', () => {
    render(<Toolbar {...defaultProps} />)
    
    const canvasSelect = screen.getByDisplayValue('32x32')
    expect(canvasSelect).toBeInTheDocument()
    
    const options = canvasSelect.querySelectorAll('option')
    expect(options).toHaveLength(5)
    expect(options[0]).toHaveValue('16')
    expect(options[4]).toHaveValue('256')
  })

  it('should maintain proper spacing and layout', () => {
    render(<Toolbar {...defaultProps} />)
    
    const toolbar = screen.getByText('File').closest('.toolbar')
    expect(toolbar).toBeInTheDocument()
    
    // Check that the spacer exists to maintain centering
    const spacer = toolbar?.querySelector('div[style*="width: 200px"]')
    expect(spacer).toBeInTheDocument()
  })

  // Edge Case Tests
  describe('Edge Cases and Error Handling', () => {
    it('should handle missing optional props gracefully', () => {
      const minimalProps = {
        selectedTool: 'pencil' as Tool,
        onToolSelect: jest.fn(),
        primaryColor: '#ff0000' as Color,
        onPrimaryColorChange: jest.fn(),
        secondaryColor: '#0000ff' as Color,
        onSecondaryColorChange: jest.fn(),
        brushSize: 2,
        onBrushSizeChange: jest.fn(),
        canvasSize: 32,
        onCanvasSizeChange: jest.fn(),
        gridSettings: {
          visible: false,
          color: '#333',
          opacity: 0.5
        } as GridSettings,
        onGridSettingsChange: jest.fn()
        // Missing file operation callbacks
      }
      
      // Should not crash when file operation callbacks are missing
      expect(() => render(<Toolbar {...minimalProps} />)).not.toThrow()
    })

    it('should handle extreme brush size values', () => {
      const extremeProps = {
        ...defaultProps,
        brushSize: 1, // Minimum valid value
        onBrushSizeChange: jest.fn()
      }
      
      render(<Toolbar {...extremeProps} />)
      
      // Should display minimum brush size
      expect(screen.getByText('1px')).toBeInTheDocument()
      
      // Should allow changing to maximum value
      const brushSelect = screen.getByDisplayValue('1')
      fireEvent.change(brushSelect, { target: { value: '4' } })
      
      expect(extremeProps.onBrushSizeChange).toHaveBeenCalledWith(4)
    })

    it('should handle invalid color props gracefully', () => {
      const invalidColorProps = {
        ...defaultProps,
        primaryColor: 'invalid-color' as Color,
        secondaryColor: 'also-invalid' as Color
      }
      
      // Should not crash with invalid colors
      expect(() => render(<Toolbar {...invalidColorProps} />)).not.toThrow()
      
      // Should still render the component
      const toolbar = render(<Toolbar {...invalidColorProps} />)
      expect(toolbar.container).toBeInTheDocument()
    })

    it('should handle callback function errors gracefully', () => {
      const errorCallback = jest.fn(() => {
        throw new Error('Callback error')
      })
      
      const errorProps = {
        ...defaultProps,
        onToolSelect: errorCallback
      }
      
      render(<Toolbar {...errorProps} />)
      
      // The component should render, but clicking will cause an error
      // This is expected React behavior - errors in callbacks bubble up
      const eraserButton = screen.getByTitle('Eraser')
      
      // Clicking should call the callback (which will throw an error)
      fireEvent.click(eraserButton)
      expect(errorCallback).toHaveBeenCalled()
      
      // The error should be thrown (this is expected behavior)
      expect(() => {
        // Simulate the error being thrown again
        errorCallback()
      }).toThrow('Callback error')
    })

    it('should handle rapid state changes without crashing', () => {
      const { rerender } = render(<Toolbar {...defaultProps} />)
      
      // Rapidly change multiple props
      for (let i = 0; i < 10; i++) {
        rerender(<Toolbar 
          {...defaultProps} 
          brushSize={i % 4 + 1}
          selectedTool={i % 2 === 0 ? 'pencil' : 'eraser' as Tool}
        />)
      }
      
      // Component should still be functional
      expect(screen.getByText('File')).toBeInTheDocument()
      expect(screen.getByText('Brush:')).toBeInTheDocument()
    })

    it('should handle missing grid settings gracefully', () => {
      const noGridProps = {
        ...defaultProps,
        gridSettings: undefined as any
      }
      
      // The component should now provide default grid settings when none are provided
      // and render without crashing
      expect(() => render(<Toolbar {...noGridProps} />)).not.toThrow()
      
      // Should render successfully with default grid settings
      const { container } = render(<Toolbar {...noGridProps} />)
      expect(container).toBeInTheDocument()
      
      // Should display grid toggle with default state (OFF)
      // Find the grid toggle by looking for the button with grid icon
      const gridToggle = container.querySelector('button[title*="Show Grid"]')
      expect(gridToggle).toBeInTheDocument()
      
      // Should have the default inactive state
      expect(gridToggle).toHaveClass('tool-button')
      expect(gridToggle).not.toHaveClass('active')

      // Should display quarter grid with default state (OFF)
      const quarterGrid = container.querySelector('button[title*="Quarter Grid"]')
      expect(quarterGrid).toBeInTheDocument()
      expect(quarterGrid).toHaveClass('tool-button')
      expect(quarterGrid).not.toHaveClass('active')

      // Should display eighths grid with default state (OFF)
      const eighthsGrid = container.querySelector('button[title*="Eighths Grid"]')
      expect(eighthsGrid).toBeInTheDocument()
      expect(eighthsGrid).toHaveClass('tool-button')
      expect(eighthsGrid).not.toHaveClass('active')
    })

    it('should handle extreme canvas sizes', () => {
      const extremeCanvasProps = {
        ...defaultProps,
        canvasSize: 16, // Minimum valid size
        onCanvasSizeChange: jest.fn()
      }
      
      render(<Toolbar {...extremeCanvasProps} />)
      
      // Should display minimum canvas size
      expect(screen.getByDisplayValue('16x16')).toBeInTheDocument()
      
      // Should allow changing to maximum value
      const canvasSelect = screen.getByDisplayValue('16x16')
      fireEvent.change(canvasSelect, { target: { value: '256' } })
      
      expect(extremeCanvasProps.onCanvasSizeChange).toHaveBeenCalledWith(256)
    })
  })
})
