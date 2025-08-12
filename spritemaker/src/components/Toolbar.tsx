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
  onNewProject?: () => void
  onOpenProject?: () => void
  onSaveProject?: () => void
  onExportImage?: () => void
  onSettings?: () => void
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
  onGridSettingsChange,
  onNewProject,
  onOpenProject,
  onSaveProject,
  onExportImage,
  onSettings
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
      {/* File Menu - Far Left */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          backgroundColor: '#2a2a2a',
          border: '1px solid #555',
          borderRadius: '4px',
          cursor: 'pointer',
          color: '#fff',
          fontSize: '14px',
          fontWeight: '500',
          minWidth: '240px',
          justifyContent: 'center',
          position: 'absolute',
          left: '20px'
        }}
        onClick={() => {
          // Simple dropdown toggle - you can enhance this later
          if (onNewProject) onNewProject()
        }}
        title="File Menu - Click for New Project"
      >
        {/* File Icon */}
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="currentColor"
          style={{ flexShrink: 0 }}
        >
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
        </svg>
        File
      </div>

      {/* Spacer to maintain centering of other content */}
      <div style={{ width: '260px', flexShrink: 0 }}></div>

      {/* Brush Size Control - positioned to the left of tools */}
      <div 
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 12px',
          border: '1px solid #555',
          background: '#333',
          borderRadius: '4px',
          height: '36px',
          justifyContent: 'center',
          marginRight: '15px',
          cursor: 'pointer',
          position: 'relative'
        }}
        onClick={() => {
          const select = document.getElementById('brush-size-select') as HTMLSelectElement;
          if (select) {
            select.focus();
            select.click();
          }
        }}
      >
        <div style={{ fontSize: '10px', color: '#ccc', whiteSpace: 'nowrap' }}>Brush:</div>
        
        {/* Visual brush size representation */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '24px',
          height: '24px',
          position: 'relative'
        }}>
          {/* Subtle background grid for scale reference */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '6px 6px',
            opacity: 0.2
          }} />
          
          {/* Brush size circle */}
          <div style={{
            width: `${brushSize * 4}px`,
            height: `${brushSize * 4}px`,
            backgroundColor: '#000',
            borderRadius: '50%',
            border: '1px solid #fff',
            position: 'relative',
            zIndex: 1
          }} />
        </div>
        
        <div style={{ fontSize: '10px', color: '#ccc' }}>{brushSize}px</div>
        
        {/* Hidden select element */}
        <select
          id="brush-size-select"
          value={brushSize}
          onChange={(e) => onBrushSizeChange(parseInt(e.target.value))}
          style={{
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            opacity: 0,
            cursor: 'pointer'
          }}
        >
          {[1, 2, 3, 4].map(size => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
      </div>

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

      {/* Color Display - Single icon box split diagonally */}
      <div style={{ display: 'flex', alignItems: 'center', marginLeft: '20px' }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            position: 'relative',
            border: '2px solid #555',
            borderRadius: '4px',
            cursor: 'pointer',
            overflow: 'hidden'
          }}
          title="Primary (I) / Secondary (II) Colors"
        >
          {/* Primary color (top-left) */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: primaryColor,
              clipPath: 'polygon(0 0, 100% 0, 0 100%)'
            }}
          />
          
          {/* Secondary color (bottom-right) */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: secondaryColor,
              clipPath: 'polygon(100% 0, 100% 100%, 0 100%)'
            }}
          />
          
          {/* "I" label for primary */}
          <div
            style={{
              position: 'absolute',
              top: '2px',
              left: '2px',
              fontSize: '10px',
              fontWeight: 'bold',
              color: '#fff',
              textShadow: '1px 1px 1px #000',
              zIndex: 2
            }}
          >
            I
          </div>
          
          {/* "II" label for secondary */}
          <div
            style={{
              position: 'absolute',
              bottom: '2px',
              right: '2px',
              fontSize: '10px',
              fontWeight: 'bold',
              color: '#fff',
              textShadow: '1px 1px 1px #000',
              zIndex: 2
            }}
          >
            II
          </div>
        </div>
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
