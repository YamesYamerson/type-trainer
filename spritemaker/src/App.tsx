import { useState } from 'react'
import SpriteEditor from './components/SpriteEditor'
import Toolbar from './components/Toolbar'
import LayerPanel from './components/LayerPanel'
import ColorPicker from './components/ColorPicker'
import ErrorBoundary from './components/ErrorBoundary'
import { Tool, Color, Layer, GridSettings } from './types'

function App() {
  const [selectedTool, setSelectedTool] = useState<Tool>('pencil')
  const [primaryColor, setPrimaryColor] = useState<Color>('#000000')
  const [secondaryColor, setSecondaryColor] = useState<Color>('#ffffff')
  const [brushSize, setBrushSize] = useState(1)
  const [canvasSize, setCanvasSize] = useState(32)
  const [layers, setLayers] = useState<Layer[]>([
    { id: 1, name: 'Layer 1', visible: true, active: true }
  ])
  const [canvasRef, setCanvasRef] = useState<React.RefObject<HTMLCanvasElement> | null>(null)
  const [gridSettings, setGridSettings] = useState<GridSettings>({
    visible: false,
    color: '#333',
    opacity: 0.5,
    quarter: false,
    eighths: false,
    sixteenths: false
  })

  const handleNewLayer = () => {
    const newLayer: Layer = {
      id: Date.now(),
      name: `Layer ${layers.length + 1}`,
      visible: true,
      active: false
    }
    setLayers(prev => prev.map(l => ({ ...l, active: false })).concat(newLayer))
  }

  const handleLayerToggle = (layerId: number) => {
    setLayers(prev => prev.map(l => 
      l.id === layerId ? { ...l, visible: !l.visible } : l
    ))
  }

  const handleLayerSelect = (layerId: number) => {
    setLayers(prev => prev.map(l => ({ ...l, active: l.id === layerId })))
  }

  return (
    <div className="App" style={{ 
      display: 'flex', 
      flexDirection: 'column',
      height: '100vh',
      width: '100%',
      overflow: 'hidden'
    }}>
      <Toolbar
        selectedTool={selectedTool}
        onToolSelect={setSelectedTool}
        primaryColor={primaryColor}
        onPrimaryColorChange={setPrimaryColor}
        secondaryColor={secondaryColor}
        onSecondaryColorChange={setSecondaryColor}
        brushSize={brushSize}
        onBrushSizeChange={setBrushSize}
        canvasSize={canvasSize}
        onCanvasSizeChange={setCanvasSize}
        gridSettings={gridSettings}
        onGridSettingsChange={setGridSettings}
        onNewProject={() => {
          // TODO: Implement new project functionality
          console.log('New Project clicked')
        }}
        onOpenProject={() => {
          // TODO: Implement open project functionality
          console.log('Open Project clicked')
        }}
        onSaveProject={() => {
          // TODO: Implement save project functionality
          console.log('Save Project clicked')
        }}
        onExportImage={() => {
          // TODO: Implement export image functionality
          console.log('Export Image clicked')
        }}
        onSettings={() => {
          // TODO: Implement settings functionality
          console.log('Settings clicked')
        }}
        canvasRef={canvasRef}
      />

      <div style={{ 
        display: 'flex', 
        flex: 1,
        overflow: 'hidden'
      }}>
        {/* Fixed Left Sidebar Column */}
        <div style={{ 
          width: '280px',
          backgroundColor: '#1e1e1e',
          borderRight: '1px solid #333',
          display: 'flex',
          flexDirection: 'column',
          padding: '15px',
          gap: '15px',
          flexShrink: 0,
          overflowY: 'auto'
        }}>
          {/* Color Picker - Below File Menu */}
          <div style={{ 
            width: '100%',
            flexShrink: 0
          }}>
            <ErrorBoundary>
              <ColorPicker
                primaryColor={primaryColor}
                onPrimaryColorChange={setPrimaryColor}
                secondaryColor={secondaryColor}
                onSecondaryColorChange={setSecondaryColor}
              />
            </ErrorBoundary>
          </div>

          {/* Layer Panel */}
          <div style={{ 
            width: '100%',
            flexShrink: 0
          }}>
            <LayerPanel
              layers={layers}
              onNewLayer={handleNewLayer}
              onLayerToggle={handleLayerToggle}
              onLayerSelect={handleLayerSelect}
            />
          </div>
        </div>

        {/* Main Canvas Area - Takes remaining space */}
        <div style={{ 
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px',
          overflow: 'auto'
        }}>
          <ErrorBoundary>
            <SpriteEditor
              selectedTool={selectedTool}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              brushSize={brushSize}
              canvasSize={canvasSize}
              layers={layers}
              onCanvasRef={setCanvasRef}
              gridSettings={gridSettings}
            />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  )
}

export default App
