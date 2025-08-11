import { useState } from 'react'
import SpriteEditor from './components/SpriteEditor'
import Toolbar from './components/Toolbar'
import LayerPanel from './components/LayerPanel'
import ColorPicker from './components/ColorPicker'
import ExportPanel from './components/ExportPanel'
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
    opacity: 0.5
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
    <div className="App">
      <h1>Sprite Maker</h1>
      
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
      />

      <ErrorBoundary>
        <ColorPicker
          primaryColor={primaryColor}
          onPrimaryColorChange={setPrimaryColor}
          secondaryColor={secondaryColor}
          onSecondaryColorChange={setSecondaryColor}
        />
      </ErrorBoundary>

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

      <LayerPanel
        layers={layers}
        onNewLayer={handleNewLayer}
        onLayerToggle={handleLayerToggle}
        onLayerSelect={handleLayerSelect}
      />

      {canvasRef && (
        <ExportPanel
          canvasRef={canvasRef}
          canvasSize={canvasSize}
        />
      )}
    </div>
  )
}

export default App
