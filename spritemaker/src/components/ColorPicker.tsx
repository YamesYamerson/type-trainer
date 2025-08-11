import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { Color } from '../types'
import { 
  hsvToRgb, 
  rgbToHsv, 
  createSafeGradient, 
  safeFillRect, 
  isValidHexColor 
} from '../utils/colorUtils'

interface ColorPickerProps {
  primaryColor: Color
  onPrimaryColorChange: (color: Color) => void
  secondaryColor: Color
  onSecondaryColorChange: (color: Color) => void
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  primaryColor,
  onPrimaryColorChange,
  secondaryColor,
  onSecondaryColorChange
}) => {
  // Use simple state instead of refs to avoid complexity
  const [hue, setHue] = useState(0)
  const [saturation, setSaturation] = useState(100)
  const [value, setValue] = useState(100)

  const gradientRef = useRef<HTMLCanvasElement>(null)
  const hueRef = useRef<HTMLCanvasElement>(null)
  const alphaRef = useRef<HTMLCanvasElement>(null)

  // Default color palette (similar to Aseprite) - memoized to prevent recreation
  const defaultColors: Color[] = useMemo(() => [
    '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff',
    '#ffff00', '#ff00ff', '#00ffff', '#ff8000', '#8000ff',
    '#00ff80', '#ff0080', '#808000', '#800080', '#008080',
    '#808080', '#404040', '#c0c0c0', '#e0e0e0', '#a0a0a0',
    '#8b4513', '#006400', '#4b0082', '#ff1493', '#00ced1',
    '#ffd700', '#32cd32', '#ff6347', '#9370db', '#20b2aa'
  ], [])

  // Initialize HSV from primary color only when it changes externally
  useEffect(() => {
    try {
      const hsv = rgbToHsv(primaryColor)
      setHue(hsv.h)
      setSaturation(hsv.s)
      setValue(hsv.v)
    } catch (error) {
      console.warn('Failed to convert color to HSV:', error)
      // Set default values if conversion fails
      setHue(0)
      setSaturation(100)
      setValue(100)
    }
  }, [primaryColor])

  // Stable callback for color changes
  const handleColorChange = useCallback((newColor: Color) => {
    onPrimaryColorChange(newColor)
  }, [onPrimaryColorChange])

  // Handle HSV changes without triggering infinite loops
  const handleHSVChange = useCallback((h: number, s: number, v: number) => {
    setHue(h)
    setSaturation(s)
    setValue(v)
    
    try {
      const newColor = hsvToRgb(h, s, v)
      console.log('HSV to RGB conversion:', { h, s, v, result: newColor })
      handleColorChange(newColor)
    } catch (error) {
      console.warn('Failed to convert HSV to RGB:', error)
    }
  }, [handleColorChange])

  // Draw gradient canvas - only when hue changes
  useEffect(() => {
    const canvas = gradientRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const width = canvas.width
    const height = canvas.height
    
    // Clear canvas first
    ctx.clearRect(0, 0, width, height)
    
    // Create saturation/value gradient
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const s = (x / width) * 100
        const v = ((height - y) / height) * 100
        
        try {
          const color = hsvToRgb(hue, s, v)
          safeFillRect(ctx, x, y, 1, 1, color)
        } catch (error) {
          // Fallback to a safe color if conversion fails
          safeFillRect(ctx, x, y, 1, 1, '#000000')
        }
      }
    }
  }, [hue])

  // Draw hue bar - only once on mount
  useEffect(() => {
    const canvas = hueRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const width = canvas.width
    const height = canvas.height
    
    // Clear canvas first
    ctx.clearRect(0, 0, width, height)
    
    for (let x = 0; x < width; x++) {
      const h = (x / width) * 360
      
      try {
        const color = hsvToRgb(h, 100, 100)
        safeFillRect(ctx, x, 0, 1, height, color)
      } catch (error) {
        // Fallback to a safe color if conversion fails
        safeFillRect(ctx, x, 0, 1, height, '#000000')
      }
    }
  }, []) // Empty dependency array - only run once

  // Draw alpha bar - only when HSV changes
  useEffect(() => {
    const canvas = alphaRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const width = canvas.width
    const height = canvas.height
    
    // Clear canvas first
    ctx.clearRect(0, 0, width, height)
    
    try {
      // Create alpha gradient
      const gradient = createSafeGradient(ctx, 0, 0, width, 0, [
        { offset: 0, color: 'transparent' },
        { offset: 1, color: hsvToRgb(hue, saturation, value) }
      ])
      
      if (gradient) {
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, width, height)
      }
    } catch (error) {
      console.warn('Failed to create alpha gradient:', error)
      // Fallback to solid color
      try {
        const color = hsvToRgb(hue, saturation, value)
        ctx.fillStyle = color
        ctx.fillRect(0, 0, width, height)
      } catch (fallbackError) {
        // Final fallback
        ctx.fillStyle = '#000000'
        ctx.fillRect(0, 0, width, height)
      }
    }
  }, [hue, saturation, value])

  // Handle canvas clicks
  const handleGradientClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = e.currentTarget
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    const s = (x / rect.width) * 100
    const v = ((rect.height - y) / rect.height) * 100
    
    handleHSVChange(hue, s, v)
  }, [hue, handleHSVChange])

  const handleHueClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = e.currentTarget
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    
    const h = (x / rect.width) * 360
    handleHSVChange(h, saturation, value)
  }, [saturation, value, handleHSVChange])

  const handleAlphaClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = e.currentTarget
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    
    // For now, alpha is not implemented in the color output
    // This could be extended later
    console.log('Alpha clicked:', x / rect.width)
  }, [])

  // Handle color swatch clicks
  const handleSwatchClick = useCallback((color: Color) => {
    handleColorChange(color)
    try {
      const hsv = rgbToHsv(color)
      setHue(hsv.h)
      setSaturation(hsv.s)
      setValue(hsv.v)
    } catch (error) {
      console.warn('Failed to convert color to HSV:', error)
    }
  }, [handleColorChange])

  // Handle hex input changes
  const handleHexChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (isValidHexColor(value)) {
      handleColorChange(value)
      try {
        const hsv = rgbToHsv(value)
        setHue(hsv.h)
        setSaturation(hsv.s)
        setValue(hsv.v)
      } catch (error) {
        console.warn('Failed to convert hex to HSV:', error)
      }
    }
  }, [handleColorChange])

  // Handle swap colors
  const handleSwapColors = useCallback(() => {
    const temp = primaryColor
    onPrimaryColorChange(secondaryColor)
    onSecondaryColorChange(temp)
  }, [primaryColor, secondaryColor, onPrimaryColorChange, onSecondaryColorChange])

  return (
    <div className="color-picker" style={{
      position: 'fixed',
      right: '20px',
      top: '20px',
      width: '200px',
      backgroundColor: '#2d2d2d',
      border: '1px solid #555',
      borderRadius: '8px',
      padding: '15px',
      color: '#fff',
      fontFamily: 'monospace',
      fontSize: '12px'
    }}>
      <h3 style={{ margin: '0 0 15px 0', textAlign: 'center' }}>Color Picker</h3>
      
      {/* Main color display */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          backgroundColor: primaryColor,
          border: '2px solid #fff',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#000',
          fontWeight: 'bold'
        }}>
          II
        </div>
        <div style={{
          width: '40px',
          height: '40px',
          backgroundColor: secondaryColor,
          border: '2px solid #fff',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#000',
          fontWeight: 'bold'
        }}>
          I
        </div>
        <button
          onClick={handleSwapColors}
          style={{
            padding: '8px',
            backgroundColor: '#555',
            border: 'none',
            borderRadius: '4px',
            color: '#fff',
            cursor: 'pointer'
          }}
        >
          Swap Colors
        </button>
      </div>

      {/* Gradient picker */}
      <div style={{ marginBottom: '15px' }}>
        <canvas
          ref={gradientRef}
          width={160}
          height={120}
          onClick={handleGradientClick}
          style={{
            width: '100%',
            height: 'auto',
            border: '1px solid #555',
            borderRadius: '4px',
            cursor: 'crosshair'
          }}
        />
      </div>

      {/* Hue bar */}
      <div style={{ marginBottom: '15px' }}>
        <canvas
          ref={hueRef}
          width={160}
          height={20}
          onClick={handleHueClick}
          style={{
            width: '100%',
            height: 'auto',
            border: '1px solid #555',
            borderRadius: '4px',
            cursor: 'crosshair'
          }}
        />
      </div>

      {/* Alpha bar */}
      <div style={{ marginBottom: '15px' }}>
        <canvas
          ref={alphaRef}
          width={160}
          height={20}
          onClick={handleAlphaClick}
          style={{
            width: '100%',
            height: 'auto',
            border: '1px solid #555',
            borderRadius: '4px',
            cursor: 'crosshair'
          }}
        />
      </div>

      {/* Color inputs */}
      <div style={{ marginBottom: '15px' }}>
        <div style={{ marginBottom: '8px' }}>
          <label>Idx-1:</label>
          <input
            type="text"
            value={`Idx-${Math.floor(Math.random() * 1000)}`}
            readOnly
            style={{
              width: '100%',
              padding: '4px',
              backgroundColor: '#444',
              border: '1px solid #555',
              borderRadius: '4px',
              color: '#fff',
              fontSize: '11px'
            }}
          />
        </div>
        <div>
          <label>Color:</label>
          <input
            type="text"
            value={primaryColor}
            onChange={handleHexChange}
            style={{
              width: '100%',
              padding: '4px',
              backgroundColor: '#444',
              border: '1px solid #555',
              borderRadius: '4px',
              color: '#fff',
              fontSize: '11px'
            }}
          />
        </div>
      </div>

      {/* Color swatches */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '4px',
        marginBottom: '15px'
      }}>
        {defaultColors.map((color, index) => (
          <div
            key={index}
            onClick={() => handleSwatchClick(color)}
            style={{
              width: '20px',
              height: '20px',
              backgroundColor: color,
              border: '1px solid #555',
              borderRadius: '2px',
              cursor: 'pointer'
            }}
          />
        ))}
      </div>

      {/* HSV values display */}
      <div style={{ fontSize: '10px', color: '#aaa' }}>
        <div>H: {Math.round(hue)}°</div>
        <div>S: {Math.round(saturation)}%</div>
        <div>V: {Math.round(value)}%</div>
      </div>
    </div>
  )
}

export default ColorPicker
