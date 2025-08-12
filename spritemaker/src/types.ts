export type Tool = 'pencil' | 'eraser' | 'fill' | 'eyedropper' | 'rectangle' | 'circle' | 'line'

export type Color = string

export interface Layer {
  id: number
  name: string
  visible: boolean
  active: boolean
}

export interface PixelData {
  x: number
  y: number
  color: Color
  layerId: number
}

export interface CanvasState {
  width: number
  height: number
  pixels: Map<string, PixelData>
  layers: Layer[]
}

export interface GridSettings {
  visible: boolean
  color: string
  opacity: number
  quarter: boolean // Enable quarter grid divisions
  eighths: boolean // Enable eighths grid divisions
  sixteenths: boolean // Enable sixteenths grid divisions
  thirtyseconds: boolean // Enable thirty-seconds grid divisions
}
