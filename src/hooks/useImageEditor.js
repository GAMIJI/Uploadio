import { useState, useCallback, useRef } from 'react'

export const useImageEditor = () => {
  const [image, setImage] = useState(null)
  const [settings, setSettings] = useState({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    rotation: 0,
    zoom: 100
  })
  const [history, setHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  
  const canvasRef = useRef(null)
  const ctxRef = useRef(null)

  const loadImage = useCallback((imageUrl) => {
    const img = new Image()
    img.src = imageUrl
    img.onload = () => {
      setImage(img)
      // Save to history
      setHistory(prev => [...prev.slice(0, historyIndex + 1), { imageUrl, settings }])
      setHistoryIndex(prev => prev + 1)
    }
  }, [historyIndex, settings])

  const updateSettings = useCallback((newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
  }, [])

  const applyFilter = useCallback(() => {
    if (!canvasRef.current || !image) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    // Apply filters
    const filterString = `brightness(${100 + settings.brightness}%) 
                          contrast(${100 + settings.contrast}%) 
                          saturate(${100 + settings.saturation}%)`
    
    ctx.filter = filterString
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
    
    // Save to history
    const dataURL = canvas.toDataURL()
    setHistory(prev => [...prev.slice(0, historyIndex + 1), { imageUrl: dataURL, settings }])
    setHistoryIndex(prev => prev + 1)
  }, [image, settings, historyIndex])

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1]
      setImage(prevState.imageUrl)
      setSettings(prevState.settings)
      setHistoryIndex(prev => prev - 1)
      return true
    }
    return false
  }, [history, historyIndex])

  const reset = useCallback(() => {
    setSettings({
      brightness: 0,
      contrast: 0,
      saturation: 0,
      rotation: 0,
      zoom: 100
    })
  }, [])

  const getImageDataURL = useCallback(() => {
    if (canvasRef.current) {
      return canvasRef.current.toDataURL('image/png')
    }
    return null
  }, [])

  return {
    image,
    settings,
    canvasRef,
    loadImage,
    updateSettings,
    applyFilter,
    undo,
    reset,
    getImageDataURL,
    canUndo: historyIndex > 0
  }
}