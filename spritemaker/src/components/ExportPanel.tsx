import React from 'react'

interface ExportPanelProps {
  canvasRef: React.RefObject<HTMLCanvasElement>
  canvasSize: number
}

const ExportPanel: React.FC<ExportPanelProps> = ({ canvasRef, canvasSize }) => {
  const exportAsPNG = () => {
    if (!canvasRef.current) return
    
    const canvas = canvasRef.current
    const link = document.createElement('a')
    link.download = `sprite-${canvasSize}x${canvasSize}.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  const exportAsJSON = () => {
    // This would export the pixel data as JSON for later editing
    // For now, just show an alert
    alert('JSON export coming soon!')
  }

  return (
    <div style={{
      position: 'fixed',
      left: '20px',
      top: '280px',
      background: '#333',
      border: '1px solid #555',
      borderRadius: '4px',
      padding: '15px',
      minWidth: '150px'
    }}>
      <h3>Export</h3>
      <button
        className="tool-button"
        onClick={exportAsPNG}
        style={{ marginBottom: '10px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
      >
        <img src="/icons/fill.svg" alt="Export" style={{ width: '16px', height: '16px' }} />
        Export PNG
      </button>
      <button
        className="tool-button"
        onClick={exportAsJSON}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
      >
        <img src="/icons/fill.svg" alt="Export" style={{ width: '16px', height: '16px' }} />
        Export JSON
      </button>
    </div>
  )
}

export default ExportPanel
