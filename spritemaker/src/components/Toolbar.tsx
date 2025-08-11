import React from 'react'
import { Tool, Color, GridSettings } from '../types'

interface ToolbarProps {
  selectedTool: Tool
  onToolSelect: (tool: Tool) => void
  primaryColor: Color
  onPrimaryColorChange: (color: Color) => void
  secondaryColor: Color
  onSecondaryColorChange: (color: Color) => void
  brushSize: number
  onBrushSizeChange: (size: number) => void
  canvasSize: number
  onCanvasSizeChange: (size: number) => void
  gridSettings: GridSettings
  onGridSettingsChange: (settings: GridSettings) => void
}

const Toolbar: React.FC<ToolbarProps> = ({
  selectedTool,
  onToolSelect,
  primaryColor,
  secondaryColor,
  brushSize,
  onBrushSizeChange,
  canvasSize,
  onCanvasSizeChange,
  gridSettings,
  onGridSettingsChange
}) => {
  const tools: { id: Tool; name: string; icon: string; iconType: 'svg' | 'png' }[] = [
    { id: 'pencil', name: 'Pencil', icon: '/icons/pencil.svg', iconType: 'svg' },
    { id: 'eraser', name: 'Eraser', icon: '/icons/eraser.svg', iconType: 'svg' },
    { id: 'fill', name: 'Fill', icon: '/icons/fill.svg', iconType: 'svg' },
    { id: 'eyedropper', name: 'Eyedropper', icon: '/icons/eyedropper.png', iconType: 'png' },
    { id: 'rectangle', name: 'Rectangle', icon: '/icons/rectangle.png', iconType: 'png' },
    { id: 'circle', name: 'Circle', icon: '/icons/circle.png', iconType: 'png' },
    { id: 'line', name: 'Line', icon: '/icons/line.png', iconType: 'png' }
  ]

  const canvasSizes = [16, 32, 64, 128, 256]

  return (
    <div className="toolbar">
      {/* Tools */}
      <div>
        {tools.map(tool => (
          <button
            key={tool.id}
            className={`tool-button ${selectedTool === tool.id ? 'active' : ''}`}
            onClick={() => onToolSelect(tool.id)}
            title={tool.name}
          >
            {tool.iconType === 'svg' ? (
              <img src={tool.icon} alt={tool.name} style={{ width: '20px', height: '20px' }} />
            ) : (
              <img src={tool.icon} alt={tool.name} style={{ width: '20px', height: '20px' }} />
            )}
          </button>
        ))}
      </div>

      {/* Color Display */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <label style={{ fontSize: '12px', color: '#ccc' }}>Primary:</label>
          <div
            style={{
              width: '24px',
              height: '24px',
              backgroundColor: primaryColor,
              border: '2px solid #555',
              borderRadius: '4px'
            }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <label style={{ fontSize: '12px', color: '#ccc' }}>Secondary:</label>
          <div
            style={{
              width: '24px',
              height: '24px',
              backgroundColor: secondaryColor,
              border: '2px solid #555',
              borderRadius: '4px'
            }}
          />
        </div>
      </div>

      {/* Brush Size */}
      <div className="control-group">
        <label>Brush Size</label>
        <input
          type="range"
          min="1"
          max="10"
          value={brushSize}
          onChange={(e) => onBrushSizeChange(parseInt(e.target.value))}
        />
        <span>{brushSize}</span>
      </div>

      {/* Canvas Size */}
      <div className="control-group">
        <label>Canvas Size</label>
        <select
          value={canvasSize}
          onChange={(e) => onCanvasSizeChange(parseInt(e.target.value))}
          style={{
            padding: '4px',
            border: '1px solid #555',
            background: '#333',
            color: 'white',
            borderRadius: '4px'
          }}
        >
          {canvasSizes.map(size => (
            <option key={size} value={size}>{size}x{size}</option>
          ))}
        </select>
      </div>

      {/* Grid Toggle */}
      <div className="control-group">
        <label>Show Grid</label>
        <button
          className={`tool-button ${gridSettings.visible ? 'active' : ''}`}
          onClick={() => onGridSettingsChange({
            ...gridSettings,
            visible: !gridSettings.visible
          })}
          style={{ width: '80px', height: '30px' }}
        >
          {gridSettings.visible ? 'ON' : 'OFF'}
        </button>
      </div>
    </div>
  )
}

export default Toolbar
