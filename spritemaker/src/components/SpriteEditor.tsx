import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Tool, Color, Layer, PixelData, GridSettings } from '../types'

interface SpriteEditorProps {
  selectedTool: Tool
  primaryColor: Color
  secondaryColor: Color
  brushSize: number
  canvasSize: number
  layers: Layer[]
  onCanvasRef?: (ref: React.RefObject<HTMLCanvasElement>) => void
  gridSettings: GridSettings
}

const SpriteEditor: React.FC<SpriteEditorProps> = ({
  selectedTool,
  primaryColor,
  canvasSize,
  layers,
  onCanvasRef,
  gridSettings
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [pixels, setPixels] = useState<Map<string, PixelData>>(new Map())
  const [lastPos, setLastPos] = useState<{ x: number; y: number } | null>(null)

  const activeLayer = layers.find(l => l.visible && l.active)
  const pixelSize = Math.max(1, Math.floor(512 / canvasSize))

  // Expose canvas ref to parent
  useEffect(() => {
    if (onCanvasRef) {
      onCanvasRef(canvasRef)
    }
  }, [onCanvasRef])

  // Initialize canvas when size changes
  useEffect(() => {
    setPixels(new Map())
    setLastPos(null)
  }, [canvasSize])

  // Draw function
  const drawPixel = useCallback((x: number, y: number, color: Color) => {
    if (!activeLayer) return

    const key = `${x},${y}`
    const newPixels = new Map(pixels)
    
    if (color === 'transparent') {
      newPixels.delete(key)
    } else {
      newPixels.set(key, {
        x,
        y,
        color,
        layerId: activeLayer.id
      })
    }
    
    // Force a new Map instance to ensure React detects the change
    setPixels(new Map(newPixels))
  }, [pixels, activeLayer])

  // Flood fill algorithm
  const floodFill = useCallback((startX: number, startY: number, targetColor: Color, replacementColor: Color) => {
    // Only return early if we're trying to fill with the exact same color AND it's not transparent
    // This allows filling transparent areas with transparent colors (useful for erasing)
    if (targetColor === replacementColor && targetColor !== 'transparent') return
    
    // Create a local copy of pixels to avoid race conditions during the fill
    const localPixels = new Map(pixels)
    const stack: [number, number][] = [[startX, startY]]
    const visited = new Set<string>()
    let filledCount = 0
    
    while (stack.length > 0) {
      const [x, y] = stack.pop()!
      const key = `${x},${y}`
      
      if (visited.has(key)) continue
      visited.add(key)
      
      // Check if current position matches target color
      // For transparent areas, we need to check if there's no pixel OR if the pixel is transparent
      const currentPixel = localPixels.get(key)
      const currentColor = currentPixel ? currentPixel.color : 'transparent'
      
      if (currentColor !== targetColor) continue
      
      // Update the local pixels Map instead of calling drawPixel
      if (replacementColor === 'transparent') {
        localPixels.delete(key)
      } else {
        localPixels.set(key, {
          x,
          y,
          color: replacementColor,
          layerId: activeLayer!.id
        })
      }
      filledCount++
      
      // Add neighbors
      const neighbors = [
        [x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]
      ]
      
      for (const [nx, ny] of neighbors) {
        if (nx >= 0 && nx < canvasSize && ny >= 0 && ny < canvasSize) {
          stack.push([nx, ny])
        }
      }
    }
    
    // After flood fill is complete, update the state with all changes at once
    setPixels(new Map(localPixels))
  }, [pixels, activeLayer, canvasSize])

  // Get color at position
  const getColorAt = useCallback((x: number, y: number): Color => {
    const key = `${x},${y}`
    const pixel = pixels.get(key)
    return pixel ? pixel.color : 'transparent'
  }, [pixels])

  // Handle mouse events
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!activeLayer) return
    
    const rect = canvasRef.current!.getBoundingClientRect()
    const rawX = e.clientX - rect.left
    const rawY = e.clientY - rect.top
    const x = Math.floor(rawX / pixelSize)
    const y = Math.floor(rawY / pixelSize)
    
    if (x < 0 || x >= canvasSize || y < 0 || y >= canvasSize) return
    
    setIsDrawing(true)
    setLastPos({ x, y })
    
    switch (selectedTool) {
      case 'pencil':
        drawPixel(x, y, primaryColor)
        break
      case 'eraser':
        drawPixel(x, y, 'transparent')
        break
      case 'fill':
        const targetColor = getColorAt(x, y)
        floodFill(x, y, targetColor, primaryColor)
        break
      case 'eyedropper':
        const color = getColorAt(x, y)
        if (color !== 'transparent') {
          // Update primary color (you might want to add a callback for this)
        }
        break
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !lastPos || !activeLayer) return
    
    const rect = canvasRef.current!.getBoundingClientRect()
    const x = Math.floor((e.clientX - rect.left) / pixelSize)
    const y = Math.floor((e.clientY - rect.top) / pixelSize)
    
    if (x < 0 || x >= canvasSize || y < 0 || y >= canvasSize) return
    
    if (selectedTool === 'pencil' || selectedTool === 'eraser') {
      // Simple line drawing between last position and current
      const dx = Math.abs(x - lastPos.x)
      const dy = Math.abs(y - lastPos.y)
      const sx = lastPos.x < x ? 1 : -1
      const sy = lastPos.y < y ? 1 : -1
      let err = dx - dy
      
      let currentX = lastPos.x
      let currentY = lastPos.y
      
      while (true) {
        if (selectedTool === 'pencil') {
          drawPixel(currentX, currentY, primaryColor)
        } else if (selectedTool === 'eraser') {
          drawPixel(currentX, currentY, 'transparent')
        }
        
        if (currentX === x && currentY === y) break
        
        const e2 = 2 * err
        if (e2 > -dy) {
          err -= dy
          currentX += sx
        }
        if (e2 < dx) {
          err += dx
          currentY += sy
        }
      }
    }
    
    setLastPos({ x, y })
  }

  const handleMouseUp = () => {
    setIsDrawing(false)
    setLastPos(null)
  }

  // Render canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Draw checkered transparent background aligned with pixel grid
    const checkerSize = 16 * pixelSize // Each checker represents a 16x16 pixel area
    
    for (let y = 0; y < canvas.height; y += checkerSize) {
      for (let x = 0; x < canvas.width; x += checkerSize) {
        const isEvenRow = Math.floor(y / checkerSize) % 2 === 0
        const isEvenCol = Math.floor(x / checkerSize) % 2 === 0
        const isLight = (isEvenRow && isEvenCol) || (!isEvenRow && !isEvenCol)
        
        // Calculate actual checker size for this position (handles partial checkers at edges)
        const actualWidth = Math.min(checkerSize, canvas.width - x)
        const actualHeight = Math.min(checkerSize, canvas.height - y)
        
        ctx.fillStyle = isLight ? '#e0e0e0' : '#c0c0c0'
        ctx.fillRect(x, y, actualWidth, actualHeight)
      }
    }
    
    // Draw grid (only if enabled)
    if (gridSettings.visible) {
      ctx.strokeStyle = gridSettings.color
      ctx.globalAlpha = gridSettings.opacity
      ctx.lineWidth = 1
      
      for (let i = 0; i <= canvasSize; i++) {
        const pos = i * pixelSize
        ctx.beginPath()
        ctx.moveTo(pos, 0)
        ctx.lineTo(pos, canvas.height)
        ctx.stroke()
        
        ctx.beginPath()
        ctx.moveTo(0, pos)
        ctx.lineTo(canvas.width, pos)
        ctx.stroke()
      }
      
      // Reset global alpha
      ctx.globalAlpha = 1.0
    }

    // Draw quarter grid divisions (if enabled)
    if (gridSettings.quarter) {
      ctx.strokeStyle = gridSettings.color
      ctx.globalAlpha = gridSettings.opacity
      ctx.lineWidth = 1
      
      // Draw center vertical line
      const centerX = (canvasSize / 2) * pixelSize
      ctx.beginPath()
      ctx.moveTo(centerX, 0)
      ctx.lineTo(centerX, canvas.height)
      ctx.stroke()
      
      // Draw center horizontal line
      const centerY = (canvasSize / 2) * pixelSize
      ctx.beginPath()
      ctx.moveTo(0, centerY)
      ctx.lineTo(canvas.width, centerY)
      ctx.stroke()
      
      // Reset global alpha
      ctx.globalAlpha = 1.0
    }

    // Draw eighths grid divisions (if enabled)
    if (gridSettings.eighths) {
      ctx.strokeStyle = gridSettings.color
      ctx.globalAlpha = gridSettings.opacity
      ctx.lineWidth = 1
      
      // Draw vertical division lines at 1/4, 1/2, and 3/4 positions
      const quarterPositions = [1, 2, 3] // 1/4, 2/4, 3/4
      quarterPositions.forEach(quarter => {
        const pos = (canvasSize * quarter / 4) * pixelSize
        ctx.beginPath()
        ctx.moveTo(pos, 0)
        ctx.lineTo(pos, canvas.height)
        ctx.stroke()
      })
      
      // Draw horizontal division lines at 1/4, 1/2, and 3/4 positions
      quarterPositions.forEach(quarter => {
        const pos = (canvasSize * quarter / 4) * pixelSize
        ctx.beginPath()
        ctx.moveTo(0, pos)
        ctx.lineTo(canvas.width, pos)
        ctx.stroke()
      })
      
      // Reset global alpha
      ctx.globalAlpha = 1.0
    }

    // Draw sixteenths grid divisions (if enabled)
    if (gridSettings.sixteenths) {
      ctx.strokeStyle = gridSettings.color
      ctx.globalAlpha = gridSettings.opacity
      ctx.lineWidth = 1
      
      // Draw vertical division lines at 1/8, 1/4, 3/8, 1/2, 5/8, 3/4, 7/8 positions
      const eighthPositions = [1, 2, 3, 4, 5, 6, 7] // 1/8, 2/8, 3/8, 4/8, 5/8, 6/8, 7/8
      eighthPositions.forEach(eighth => {
        const pos = (canvasSize * eighth / 8) * pixelSize
        ctx.beginPath()
        ctx.moveTo(pos, 0)
        ctx.lineTo(pos, canvas.height)
        ctx.stroke()
      })
      
      // Draw horizontal division lines at 1/8, 1/4, 3/8, 1/2, 5/8, 3/4, 7/8 positions
      eighthPositions.forEach(eighth => {
        const pos = (canvasSize * eighth / 8) * pixelSize
        ctx.beginPath()
        ctx.moveTo(0, pos)
        ctx.lineTo(canvas.width, pos)
        ctx.stroke()
      })
      
      // Reset global alpha
      ctx.globalAlpha = 1.0
    }

    // Draw thirty-seconds grid divisions (if enabled)
    if (gridSettings.thirtyseconds) {
      ctx.strokeStyle = gridSettings.color
      ctx.globalAlpha = gridSettings.opacity
      ctx.lineWidth = 1
      
      // Draw vertical division lines at 1/16, 1/8, 3/16, 1/4, 5/16, 3/8, 7/16, 1/2, 9/16, 5/8, 11/16, 3/4, 13/16, 7/8, 15/16 positions
      const sixteenthPositions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] // 1/16 through 15/16
      sixteenthPositions.forEach(sixteenth => {
        const pos = (canvasSize * sixteenth / 16) * pixelSize
        ctx.beginPath()
        ctx.moveTo(pos, 0)
        ctx.lineTo(pos, canvas.height)
        ctx.stroke()
      })
      
      // Draw horizontal division lines at 1/16, 1/8, 3/16, 1/4, 5/16, 3/8, 7/16, 1/2, 9/16, 5/8, 11/16, 3/4, 13/16, 7/8, 15/16 positions
      sixteenthPositions.forEach(sixteenth => {
        const pos = (canvasSize * sixteenth / 16) * pixelSize
        ctx.beginPath()
        ctx.moveTo(0, pos)
        ctx.lineTo(canvas.width, pos)
        ctx.stroke()
      })
      
      // Reset global alpha
      ctx.globalAlpha = 1.0
    }
    
    // Draw pixels
    pixels.forEach((pixel) => {
      const layer = layers.find(l => l.id === pixel.layerId)
      
      if (layer && layer.visible) {
        ctx.fillStyle = pixel.color
        ctx.fillRect(
          pixel.x * pixelSize,
          pixel.y * pixelSize,
          pixelSize,
          pixelSize
        )
      }
    })
  }, [pixels, layers, canvasSize, pixelSize, gridSettings.visible, gridSettings.color, gridSettings.opacity, gridSettings.quarter, gridSettings.eighths, gridSettings.sixteenths, gridSettings.thirtyseconds])

  return (
    <div className="canvas-container">
      <canvas
        ref={canvasRef}
        width={canvasSize * pixelSize}
        height={canvasSize * pixelSize}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          cursor: 'crosshair',
          backgroundColor: 'transparent'
        }}
        data-testid="sprite-canvas"
      />
    </div>
  )
}

export default SpriteEditor
