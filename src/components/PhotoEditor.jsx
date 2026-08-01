// src/components/PhotoEditor.jsx
import React, { useState, useRef, useEffect } from 'react'
import { 
  ZoomIn, ZoomOut, RotateCw, Sun, Contrast, Droplet, 
  RefreshCw, Check, X
} from 'lucide-react'
import toast from 'react-hot-toast'

const PhotoEditor = ({ image, onSave, passportSize }) => {
  const [settings, setSettings] = useState({
    zoom: 100,
    rotation: 0,
    brightness: 0,
    contrast: 0,
    saturation: 0
  })
  const [originalImage, setOriginalImage] = useState(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!image) return
    
    const img = new Image()
    img.src = image
    img.crossOrigin = 'Anonymous'
    img.onload = () => {
      setOriginalImage(img)
      drawImage(img, settings)
    }
    img.onerror = () => {
      console.error('Failed to load image in editor')
      toast.error('Failed to load image')
    }
  }, [image])

  const drawImage = (img, currentSettings) => {
    if (!canvasRef.current || !img) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    // Calculate canvas size
    const maxSize = 500
    let width = img.width
    let height = img.height
    let scale = Math.min(maxSize / width, maxSize / height)
    width *= scale
    height *= scale
    
    canvas.width = width
    canvas.height = height
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Save context state
    ctx.save()
    
    // Center point
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    
    // Apply zoom
    const zoomScale = currentSettings.zoom / 100
    const scaledWidth = width * zoomScale
    const scaledHeight = height * zoomScale
    
    // Apply rotation
    ctx.translate(centerX, centerY)
    ctx.rotate((currentSettings.rotation * Math.PI) / 180)
    ctx.translate(-centerX, -centerY)
    
    // Apply image filters using CSS filters
    const brightnessValue = 100 + currentSettings.brightness
    const contrastValue = 100 + currentSettings.contrast
    const saturationValue = 100 + currentSettings.saturation
    
    ctx.filter = `brightness(${brightnessValue}%) contrast(${contrastValue}%) saturate(${saturationValue}%)`
    
    // Draw image
    const drawX = centerX - scaledWidth / 2
    const drawY = centerY - scaledHeight / 2
    ctx.drawImage(img, drawX, drawY, scaledWidth, scaledHeight)
    
    // Restore context state
    ctx.restore()
  }

  const updateSettings = (setting, value) => {
    const newSettings = { ...settings, [setting]: value }
    setSettings(newSettings)
    if (originalImage) {
      drawImage(originalImage, newSettings)
    }
  }

  const resetSettings = () => {
    const resetSettings = {
      zoom: 100,
      rotation: 0,
      brightness: 0,
      contrast: 0,
      saturation: 0
    }
    setSettings(resetSettings)
    if (originalImage) {
      drawImage(originalImage, resetSettings)
    }
    toast.success('All settings reset')
  }

  const saveChanges = () => {
    if (canvasRef.current) {
      try {
        const dataURL = canvasRef.current.toDataURL('image/png')
        // Check if onSave is a function before calling
        if (typeof onSave === 'function') {
          onSave(dataURL, settings)
          toast.success('Changes saved successfully!')
        } else {
          console.error('onSave is not a function', onSave)
          toast.error('Failed to save changes')
        }
      } catch (error) {
        console.error('Failed to save image:', error)
        toast.error('Failed to save image')
      }
    }
  }

  const cancelChanges = () => {
    if (typeof onSave === 'function') {
      onSave(image, settings)
    } else {
      console.error('onSave is not a function', onSave)
      toast.error('Failed to cancel')
    }
  }

  // Don't render if no image
  if (!image) {
    return (
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '40px',
        textAlign: 'center',
        color: '#6b7280'
      }}>
        No image loaded
      </div>
    )
  }

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05)',
      border: '1px solid #f0f0f0',
      overflow: 'hidden'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #eef2ff 0%, #faf5ff 100%)',
        padding: '12px 20px',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1f2937' }}>Photo Editor</h3>
        <button
          onClick={resetSettings}
          style={{
            fontSize: '12px',
            color: '#6366f1',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <RefreshCw style={{ width: '14px', height: '14px' }} />
          Reset All
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '20px', padding: '20px' }}>
        {/* Preview Area */}
        <div>
          <div style={{
            border: '2px solid #e5e7eb',
            borderRadius: '12px',
            padding: '20px',
            backgroundColor: '#f8fafc',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '400px'
          }}>
            <canvas
              ref={canvasRef}
              style={{
                maxWidth: '100%',
                height: 'auto',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
          </div>
          
          <div style={{ marginTop: '12px', textAlign: 'center' }}>
            <p style={{ fontSize: '12px', color: '#6b7280' }}>
              Preview - Adjust settings to see real-time changes
            </p>
            {passportSize && passportSize.width && (
              <p style={{ fontSize: '11px', color: '#6366f1', marginTop: '4px' }}>
                Final size: {passportSize.width} x {passportSize.height} {passportSize.unit}
              </p>
            )}
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Zoom Control */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: '#374151' }}>
              <ZoomIn style={{ width: '14px', height: '14px' }} />
              Zoom: {settings.zoom}%
            </label>
            <input
              type="range"
              min="50"
              max="200"
              value={settings.zoom}
              onChange={(e) => updateSettings('zoom', parseInt(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          {/* Rotation Control */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: '#374151' }}>
              <RotateCw style={{ width: '14px', height: '14px' }} />
              Rotation: {settings.rotation}°
            </label>
            <input
              type="range"
              min="-180"
              max="180"
              value={settings.rotation}
              onChange={(e) => updateSettings('rotation', parseInt(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          {/* Brightness Control */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: '#374151' }}>
              <Sun style={{ width: '14px', height: '14px' }} />
              Brightness: {settings.brightness > 0 ? '+' : ''}{settings.brightness}%
            </label>
            <input
              type="range"
              min="-100"
              max="100"
              value={settings.brightness}
              onChange={(e) => updateSettings('brightness', parseInt(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          {/* Contrast Control */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: '#374151' }}>
              <Contrast style={{ width: '14px', height: '14px' }} />
              Contrast: {settings.contrast > 0 ? '+' : ''}{settings.contrast}%
            </label>
            <input
              type="range"
              min="-100"
              max="100"
              value={settings.contrast}
              onChange={(e) => updateSettings('contrast', parseInt(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          {/* Saturation Control */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: '#374151' }}>
              <Droplet style={{ width: '14px', height: '14px' }} />
              Saturation: {settings.saturation > 0 ? '+' : ''}{settings.saturation}%
            </label>
            <input
              type="range"
              min="-100"
              max="100"
              value={settings.saturation}
              onChange={(e) => updateSettings('saturation', parseInt(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button
              onClick={saveChanges}
              style={{
                flex: 1,
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                padding: '10px',
                borderRadius: '10px',
                border: 'none',
                fontWeight: 500,
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <Check style={{ width: '16px', height: '16px' }} />
              Apply & Continue
            </button>
            <button
              onClick={cancelChanges}
              style={{
                flex: 1,
                background: 'transparent',
                color: '#6b7280',
                padding: '10px',
                borderRadius: '10px',
                border: '1px solid #e5e7eb',
                fontWeight: 500,
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <X style={{ width: '16px', height: '16px' }} />
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PhotoEditor