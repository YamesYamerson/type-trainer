import React, { useState, useRef, useEffect } from 'react'
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
  canvasRef?: React.RefObject<HTMLCanvasElement>
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
  onSettings,
  canvasRef
}) => {
  // State for file dropdown
  const [isFileMenuOpen, setIsFileMenuOpen] = useState(false)
  const fileMenuRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fileMenuRef.current && !fileMenuRef.current.contains(event.target as Node)) {
        setIsFileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Safe grid settings with defaults
  const safeGridSettings = gridSettings || {
    visible: false,
    color: '#333',
    opacity: 0.5,
    quarter: false,
    eighths: false,
    sixteenths: false,
    thirtyseconds: false
  }

  // Safe callback wrappers to prevent crashes from callback errors
  const safeToolSelect = (tool: Tool) => {
    try {
      onToolSelect(tool)
    } catch (error) {
      console.warn('Error in tool selection callback:', error)
    }
  }

  const safeBrushSizeChange = (size: number) => {
    try {
      onBrushSizeChange(size)
    } catch (error) {
      console.warn('Error in brush size change callback:', error)
    }
  }

  const safeCanvasSizeChange = (size: number) => {
    try {
      onCanvasSizeChange(size)
    } catch (error) {
      console.warn('Error in canvas size change callback:', error)
    }
  }

  const safeGridSettingsChange = (settings: GridSettings) => {
    try {
      onGridSettingsChange(settings)
    } catch (error) {
      console.warn('Error in grid settings change callback:', error)
    }
  }

  const safeNewProject = () => {
    try {
      if (onNewProject) onNewProject()
    } catch (error) {
      console.warn('Error in new project callback:', error)
    }
  }

  const safeOpenProject = () => {
    try {
      if (onOpenProject) onOpenProject()
    } catch (error) {
      console.warn('Error in open project callback:', error)
    }
  }

  const safeSaveProject = () => {
    try {
      if (onSaveProject) onSaveProject()
    } catch (error) {
      console.warn('Error in save project callback:', error)
    }
  }

  const safeSettings = () => {
    try {
      if (onSettings) onSettings()
    } catch (error) {
      console.warn('Error in settings callback:', error)
    }
  }

  // Export functions
  const exportAsPNG = () => {
    if (!canvasRef?.current) return
    
    const canvas = canvasRef.current
    const link = document.createElement('a')
    link.download = `sprite-${canvasSize}x${canvasSize}.png`
    link.href = canvas.toDataURL()
    link.click()
    setIsFileMenuOpen(false)
  }

  const exportAsJSON = () => {
    // This would export the pixel data as JSON for later editing
    // For now, just show an alert
    alert('JSON export coming soon!')
    setIsFileMenuOpen(false)
  }

  const toggleFileMenu = () => {
    setIsFileMenuOpen(!isFileMenuOpen)
  }

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
        ref={fileMenuRef}
        style={{
          position: 'absolute',
          left: '20px',
          zIndex: 1000
        }}
      >
        {/* File Button */}
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
            borderBottomLeftRadius: isFileMenuOpen ? '0' : '4px',
            borderBottomRightRadius: isFileMenuOpen ? '0' : '4px'
          }}
          onClick={toggleFileMenu}
          title="File Menu - Click to open"
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
          {/* Dropdown Arrow */}
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="currentColor"
            style={{
              transform: isFileMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease'
            }}
          >
            <path d="M7,10L12,15L17,10H7Z" />
          </svg>
        </div>

        {/* File Dropdown Menu */}
        {isFileMenuOpen && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              backgroundColor: '#2a2a2a',
              border: '1px solid #555',
              borderTop: 'none',
              borderRadius: '0 0 4px 4px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
              zIndex: 1001
            }}
          >
            {/* File Operations */}
            <div
              style={{
                padding: '8px 0',
                borderBottom: '1px solid #555'
              }}
            >
              <button
                onClick={safeNewProject}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3a3a3a'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
                </svg>
                New Project
              </button>
              
              <button
                onClick={safeOpenProject}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3a3a3a'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                </svg>
                Open Project
              </button>
              
              <button
                onClick={safeSaveProject}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3a3a3a'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15,9H5V5H15M12,19A3,3 0 0,1 9,16A3,3 0 0,1 12,13A3,3 0 0,1 15,16A3,3 0 0,1 12,19M17,3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V7L17,3Z" />
                </svg>
                Save Project
              </button>
            </div>

            {/* Export Operations */}
            <div
              style={{
                padding: '8px 0',
                borderBottom: '1px solid #555'
              }}
            >
              <button
                onClick={exportAsPNG}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3a3a3a'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                </svg>
                Export PNG
              </button>
              
              <button
                onClick={exportAsJSON}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3a3a3a'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                </svg>
                Export JSON
              </button>
            </div>

            {/* Settings */}
            <div style={{ padding: '8px 0' }}>
              <button
                onClick={safeSettings}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3a3a3a'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.22,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.22,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z" />
                </svg>
                Settings
              </button>
            </div>

            {/* Canvas Size Selection */}
            <div style={{ padding: '8px 0', borderTop: '1px solid #555' }}>
              <div style={{ padding: '8px 12px', color: '#ccc', fontSize: '12px', borderBottom: '1px solid #555' }}>
                Canvas Size
              </div>
              {[16, 32, 64, 128, 256].map(size => (
                <button
                  key={size}
                  onClick={() => {
                    safeCanvasSizeChange(size)
                    setIsFileMenuOpen(false)
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: 'transparent',
                    border: 'none',
                    color: canvasSize === size ? '#4CAF50' : '#fff',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: canvasSize === size ? 'bold' : 'normal'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3a3a3a'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M19,19H5V5H19V19Z" />
                  </svg>
                  {size}×{size}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      

      {/* Brush Size Control - positioned to the left of tools */}
      <div 
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 12px',
          border: '1px solid #666',
          background: '#4a4a4a',
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
          onChange={(e) => safeBrushSizeChange(parseInt(e.target.value))}
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
            onClick={() => safeToolSelect(tool.id)}
            title={tool.name}
          >
            {tool.iconType === 'svg' ? (
              <img src={tool.icon} alt={tool.name} style={{ width: '20px', height: '20px' }} />
            ) : (
              <img src={tool.icon} alt={tool.name} style={{ width: '20px', height: '20px' }} />
            )}
          </button>
        ))}
        
        {/* Grid Toggle Tool */}
        <button
          className={`tool-button ${safeGridSettings.visible ? 'active' : ''}`}
          onClick={() => safeGridSettingsChange({
            ...safeGridSettings,
            visible: !safeGridSettings.visible
          })}
          title={`Show Grid - Currently ${safeGridSettings.visible ? 'ON' : 'OFF'}`}
          style={{ marginLeft: '8px' }}
        >
          <img
            src={safeGridSettings.visible ? '/icons/gimp-all/default-svg/gimp-grid.svg' : '/icons/gimp-all/default-svg/gimp-grid-symbolic.svg'}
            alt="Grid"
            style={{ 
              width: '20px', 
              height: '20px',
              filter: safeGridSettings.visible ? 'brightness(1.2) saturate(1.2)' : 'none',
              border: safeGridSettings.visible ? '1px solid #666' : 'none',
              borderRadius: safeGridSettings.visible ? '2px' : '0'
            }}
          />
        </button>

        {/* Quarter Grid Tool */}
        <button
          className={`tool-button ${safeGridSettings.quarter ? 'active' : ''}`}
          onClick={() => safeGridSettingsChange({
            ...safeGridSettings,
            quarter: !safeGridSettings.quarter,
            eighths: false,
            sixteenths: false,
            thirtyseconds: false
          })}
          title={`Quarter Grid - Currently ${safeGridSettings.quarter ? 'ON' : 'OFF'}`}
        >
          <img
            src="/icons/quarter-new-icon.svg"
            alt="Quarter Grid"
            style={{ width: '20px', height: '20px' }}
          />
        </button>

        {/* Eighths Grid Tool */}
        <button
          className={`tool-button ${safeGridSettings.eighths ? 'active' : ''}`}
          onClick={() => safeGridSettingsChange({
            ...safeGridSettings,
            quarter: false,
            eighths: !safeGridSettings.eighths,
            sixteenths: false,
            thirtyseconds: false
          })}
          title={`Eighths Grid - Currently ${safeGridSettings.eighths ? 'ON' : 'OFF'}`}
        >
          <img
            src="/icons/eighth-new-icon.svg"
            alt="Eighths Grid"
            style={{ width: '20px', height: '20px' }}
          />
        </button>

        {/* Sixteenths Grid Tool */}
        <button
          className={`tool-button ${safeGridSettings.sixteenths ? 'active' : ''}`}
          onClick={() => safeGridSettingsChange({
            ...safeGridSettings,
            quarter: false,
            eighths: false,
            sixteenths: !safeGridSettings.sixteenths,
            thirtyseconds: false
          })}
          title={`Sixteenths Grid - Currently ${safeGridSettings.sixteenths ? 'ON' : 'OFF'}`}
        >
          <img
            src="/icons/sixteenths-icon.svg"
            alt="Sixteenths Grid"
            style={{ width: '20px', height: '20px' }}
          />
        </button>

        {/* Thirty-Second Grid Tool */}
        <button
          className={`tool-button ${safeGridSettings.thirtyseconds ? 'active' : ''}`}
          onClick={() => safeGridSettingsChange({
            ...safeGridSettings,
            quarter: false,
            eighths: false,
            sixteenths: false,
            thirtyseconds: !safeGridSettings.thirtyseconds
          })}
          title={`Thirty-Second Grid - Currently ${safeGridSettings.thirtyseconds ? 'ON' : 'OFF'}`}
        >
          <img
            src="/icons/thirtyseconds-icon.svg"
            alt="Thirty-Second Grid"
            style={{ width: '20px', height: '20px' }}
          />
        </button>
      </div>

      {/* Color Display - Single icon box split diagonally */}
      <div style={{ display: 'flex', alignItems: 'center', marginLeft: '8px' }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            position: 'relative',
            border: '2px solid #666',
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

      {/* Spacer to maintain centering of other content */}
      <div style={{ width: '200px', flexShrink: 0 }}></div>
    </div>
  )
}

export default Toolbar
