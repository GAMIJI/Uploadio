import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Download, RotateCcw, Sparkles, Wand2, CheckCircle, Image as ImageIcon, Palette, Eraser, Undo2, Check, Zap, Layers, ShieldCheck, HelpCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import SEO from './SEO'
import ImageUploader from '../components/ImageUploader'
import { removeBackground } from '../services/backgroundRemoval'

const PRESET_COLORS = [
  { id: 'transparent', hex: 'transparent', label: 'Transparent' },
  { id: 'white', hex: '#FFFFFF', label: 'White' },
  { id: 'gray', hex: '#F3F4F6', label: 'Light Gray' },
  { id: 'black', hex: '#000000', label: 'Black' },
  { id: 'blue', hex: '#3B82F6', label: 'Blue' },
  { id: 'pink', hex: '#EC4899', label: 'Pink' },
]

const BackgroundRemover = () => {
  const [originalImage, setOriginalImage] = useState(null)
  const [processedImage, setProcessedImage] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeView, setActiveView] = useState('original')
  const [bgColor, setBgColor] = useState('transparent')
  const [customColor, setCustomColor] = useState('#8B5CF6')

  // Touch-up / Eraser state
  const [isEraserMode, setIsEraserMode] = useState(false)
  const [eraserSize, setEraserSize] = useState(20)
  const [eraserZoom, setEraserZoom] = useState(100)
  const [isErasing, setIsErasing] = useState(false)
  const [eraserHistory, setEraserHistory] = useState([])
  
  const eraserCanvasRef = useRef(null)
  const lastPos = useRef({ x: 0, y: 0 })

  const handleImageUpload = (image) => {
    setOriginalImage(image)
    setProcessedImage(null)
    setActiveView('original')
    setBgColor('transparent')
    setIsEraserMode(false)
    setEraserHistory([])
  }

  const handleRemoveBackground = async () => {
    if (!originalImage) return

    setIsProcessing(true)
    try {
      const img = new Image()
      img.src = originalImage.preview
      await new Promise((resolve) => { img.onload = resolve })
      
      const result = await removeBackground(img)
      setProcessedImage(result)
      setActiveView('removed') 
      setEraserHistory([result])
      
      toast.success('Background removed successfully!', { icon: '✨' })
    } catch (error) {
      console.error('Background removal failed:', error)
      toast.error('Failed to remove background. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  // Eraser Canvas Initialization
  useEffect(() => {
    if (isEraserMode && eraserCanvasRef.current && processedImage) {
      const canvas = eraserCanvasRef.current
      const ctx = canvas.getContext('2d')
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx.globalCompositeOperation = 'source-over'
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0)
        setEraserZoom(100)
      }
      img.src = processedImage
    }
  }, [isEraserMode, processedImage])

  const getEraserMousePosition = useCallback((clientX, clientY) => {
    const canvas = eraserCanvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY }
  }, [])

  const drawErase = useCallback((x1, y1, x2, y2) => {
    const canvas = eraserCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.globalCompositeOperation = 'destination-out'
    ctx.beginPath()
    ctx.lineWidth = eraserSize
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
  }, [eraserSize])

  const handleEraserStart = useCallback((e) => {
    if (!isEraserMode) return
    setIsErasing(true)
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    const pos = getEraserMousePosition(clientX, clientY)
    lastPos.current = pos
    drawErase(pos.x, pos.y, pos.x, pos.y)
  }, [isEraserMode, getEraserMousePosition, drawErase])

  const handleEraserMove = useCallback((e) => {
    if (!isErasing || !isEraserMode) return
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    const pos = getEraserMousePosition(clientX, clientY)
    drawErase(lastPos.current.x, lastPos.current.y, pos.x, pos.y)
    lastPos.current = pos
  }, [isErasing, isEraserMode, getEraserMousePosition, drawErase])

  const handleEraserEnd = useCallback(() => {
    if (!isErasing) return
    setIsErasing(false)
    if (eraserCanvasRef.current) {
      const newProcessed = eraserCanvasRef.current.toDataURL('image/png')
      setProcessedImage(newProcessed)
      setEraserHistory(prev => [...prev, newProcessed])
    }
  }, [isErasing])

  const undoEraser = useCallback(() => {
    if (eraserHistory.length > 1) {
      const newHistory = [...eraserHistory]
      newHistory.pop()
      const previousState = newHistory[newHistory.length - 1]
      setEraserHistory(newHistory)
      setProcessedImage(previousState)
      
      const canvas = eraserCanvasRef.current
      if (canvas) {
        const ctx = canvas.getContext('2d')
        const img = new Image()
        img.onload = () => {
          ctx.globalCompositeOperation = 'source-over'
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          ctx.drawImage(img, 0, 0)
        }
        img.src = previousState
      }
    }
  }, [eraserHistory])

  const downloadImage = () => {
    if (!processedImage) return

    if (bgColor === 'transparent') {
      const link = document.createElement('a')
      link.download = `removed-bg-${Date.now()}.png`
      link.href = processedImage
      link.click()
      toast.success('Transparent PNG downloaded!', { icon: '🎉' })
      return
    }

    const toastId = toast.loading('Exporting image...')
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')

      ctx.fillStyle = bgColor
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)

      const link = document.createElement('a')
      link.download = `background-image-${Date.now()}.jpg`
      link.href = canvas.toDataURL('image/jpeg', 0.95)
      link.click()
      toast.success('Image exported successfully!', { id: toastId, icon: '🎉' })
    }
    img.onerror = () => toast.error('Export failed. Try again.', { id: toastId })
    img.src = processedImage
  }

  const resetUploader = () => {
    setOriginalImage(null)
    setProcessedImage(null)
    setActiveView('original')
    setBgColor('transparent')
    setIsEraserMode(false)
    setEraserHistory([])
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [{
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://Uploadio.com"
    }, {
      "@type": "ListItem",
      "position": 2,
      "name": "Background Remover",
      "item": "https://Uploadio.com/background-remover"
    }]
  }

  return (
    <>
      <SEO 
        title="Free AI Background Remover - Instant Transparent PNGs"
        description="Remove image backgrounds instantly in high quality with our AI tool. Includes manual fine-tuning, custom backdrop replacement, and zero registration."
        url="https://Uploadio.com/background-remover"
      />
      
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </script>

      <div className="min-h-screen bg-slate-50 relative font-sans flex flex-col overflow-x-hidden">
        {/* Background Decorative Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] pointer-events-none overflow-hidden">
          <div className="absolute -top-32 left-1/4 w-96 h-96 bg-purple-300/30 rounded-full blur-3xl" />
          <div className="absolute -top-20 right-1/4 w-96 h-96 bg-pink-300/30 rounded-full blur-3xl" />
        </div>

        {/* Main Application Container */}
        <main className="flex-1 container mx-auto px-4 pt-8 md:pt-12 pb-16 relative z-10 max-w-6xl">
          
          {/* Section Header */}
          <header className="text-center mb-8 md:mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-100 text-purple-700 text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Gen Machine Vision</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-3">
              Remove Backgrounds <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Instantly</span>
            </h1>
            <p className="text-slate-600 text-sm md:text-base max-w-xl mx-auto font-normal leading-relaxed">
              Extract people, products, and graphics with high precision. Fine-tune edge details with integrated manual touch-up tools.
            </p>
          </header>

          {/* Interactive Workspace */}
          <div className="w-full">
            {!originalImage ? (
              <div className="flex flex-col items-center max-w-2xl mx-auto">
                <div className="w-full mb-10">
                  <ImageUploader onImageUpload={handleImageUpload} theme="purple" />
                </div>
                
                {/* Feature Highlights Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                    <div className="p-2.5 bg-purple-50 rounded-xl text-purple-600 shrink-0">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">Instant AI Cutouts</h3>
                      <p className="text-[11px] text-slate-500">Auto-detect subject boundaries.</p>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                    <div className="p-2.5 bg-pink-50 rounded-xl text-pink-600 shrink-0">
                      <Eraser className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">Precision Eraser</h3>
                      <p className="text-[11px] text-slate-500">Manual touch-ups for tricky edges.</p>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                    <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600 shrink-0">
                      <Palette className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">Color Swapper</h3>
                      <p className="text-[11px] text-slate-500">Apply custom solid backgrounds.</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col lg:flex-row gap-6 min-h-[520px]">
                
                {/* Left Area: Viewport Canvas */}
                <div className="flex-1 flex flex-col bg-white rounded-3xl shadow-sm border border-slate-200/80 p-4 md:p-6">
                  
                  {/* Top Bar Navigation */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1">
                      <button
                        onClick={() => { setActiveView('original'); setIsEraserMode(false); }}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          activeView === 'original' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        Original
                      </button>
                      {processedImage && (
                        <button
                          onClick={() => setActiveView('removed')}
                          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            activeView === 'removed' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          Cutout
                        </button>
                      )}
                    </div>

                    <button 
                      onClick={resetUploader} 
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Upload new image"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Main Display Area */}
                  <div 
                    className="flex-1 min-h-[380px] relative rounded-2xl overflow-hidden border border-slate-100 flex items-center justify-center transition-colors"
                    style={{ backgroundColor: activeView === 'removed' && bgColor !== 'transparent' && !isEraserMode ? bgColor : '#F8FAFC' }}
                  >
                    {/* Checkerboard Pattern for Transparency */}
                    <div className={`absolute inset-0 pointer-events-none transition-opacity ${activeView === 'removed' && (bgColor === 'transparent' || isEraserMode) ? 'opacity-100' : 'opacity-0'}`} style={{ 
                      backgroundImage: 'repeating-linear-gradient(45deg, #e2e8f0 25%, transparent 25%, transparent 75%, #e2e8f0 75%, #e2e8f0), repeating-linear-gradient(45deg, #e2e8f0 25%, #ffffff 25%, #ffffff 75%, #e2e8f0 75%, #e2e8f0)', 
                      backgroundPosition: '0 0, 10px 10px', 
                      backgroundSize: '20px 20px' 
                    }} />

                    {isEraserMode ? (
                      <div className="relative w-full h-full p-4 flex items-center justify-center overflow-auto z-10">
                        <style>{`.eraser-canvas { cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="${eraserSize}" height="${eraserSize}" viewBox="0 0 ${eraserSize} ${eraserSize}"><circle cx="${eraserSize / 2}" cy="${eraserSize / 2}" r="${eraserSize / 2 - 1}" fill="rgba(239, 68, 68, 0.4)" stroke="%23ef4444" stroke-width="1"/></svg>') ${eraserSize / 2} ${eraserSize / 2}, crosshair !important; }`}</style>
                        <canvas 
                          ref={eraserCanvasRef} 
                          className="eraser-canvas touch-none max-w-full max-h-full object-contain" 
                          style={{ width: `${eraserZoom}%`, height: 'auto' }} 
                          onMouseDown={handleEraserStart} 
                          onTouchStart={handleEraserStart} 
                          onMouseMove={handleEraserMove}
                          onTouchMove={handleEraserMove}
                          onMouseUp={handleEraserEnd}
                          onTouchEnd={handleEraserEnd}
                        />
                      </div>
                    ) : activeView === 'original' || !processedImage ? (
                      <img 
                        src={originalImage.preview} 
                        alt="Original Upload"
                        className="max-w-full max-h-[420px] object-contain p-4 drop-shadow-md"
                      />
                    ) : (
                      <img 
                        src={processedImage} 
                        alt="Background Removed Result"
                        className="max-w-full max-h-[420px] object-contain p-4 drop-shadow-md"
                      />
                    )}
                    
                    {/* Processing Overlay */}
                    {isProcessing && (
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                        <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30 animate-bounce mb-3">
                          <Wand2 className="w-6 h-6 text-white" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-800">Removing Background...</h4>
                        <p className="text-xs text-slate-500 mt-1">Processing edges and subject details</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Area: Control Panel */}
                <div className="w-full lg:w-80 flex flex-col gap-4">
                  {isEraserMode ? (
                    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 flex flex-col gap-5">
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                        <Eraser className="w-4 h-4 text-purple-600" />
                        <h3 className="text-sm font-bold text-slate-900">Touch-up Settings</h3>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                            <span>Brush Size</span>
                            <span className="font-mono text-purple-600">{eraserSize}px</span>
                          </div>
                          <input 
                            type="range" 
                            min="5" 
                            max="100" 
                            value={eraserSize} 
                            onChange={(e) => setEraserSize(Number(e.target.value))} 
                            className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-purple-600" 
                          />
                        </div>

                        <div>
                          <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                            <span>Zoom Level</span>
                            <span className="font-mono text-purple-600">{eraserZoom}%</span>
                          </div>
                          <input 
                            type="range" 
                            min="100" 
                            max="300" 
                            value={eraserZoom} 
                            onChange={(e) => setEraserZoom(Number(e.target.value))} 
                            className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-purple-600" 
                          />
                        </div>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        <button 
                          onClick={undoEraser} 
                          disabled={eraserHistory.length <= 1} 
                          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 transition-colors disabled:opacity-50"
                        >
                          <Undo2 className="w-3.5 h-3.5" />
                          Undo Stroke
                        </button>
                        <button 
                          onClick={() => setIsEraserMode(false)} 
                          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Apply Edits
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 flex flex-col gap-5">
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                        <Palette className="w-4 h-4 text-purple-600" />
                        <h3 className="text-sm font-bold text-slate-900">Background Options</h3>
                      </div>

                      <div className={`space-y-4 ${!processedImage ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Preset Color</label>
                          <div className="grid grid-cols-4 gap-2">
                            {PRESET_COLORS.map((c) => (
                              <button
                                key={c.id}
                                onClick={() => setBgColor(c.hex)}
                                title={c.label}
                                className={`w-full aspect-square rounded-xl border-2 transition-all ${
                                  bgColor === c.hex ? 'border-purple-600 scale-105 shadow-sm' : 'border-slate-200 hover:border-slate-300'
                                }`}
                                style={
                                  c.hex === 'transparent' 
                                    ? { 
                                        backgroundImage: 'repeating-linear-gradient(45deg, #cbd5e1 25%, transparent 25%, transparent 75%, #cbd5e1 75%, #cbd5e1), repeating-linear-gradient(45deg, #cbd5e1 25%, #ffffff 25%, #ffffff 75%, #cbd5e1 75%, #cbd5e1)', 
                                        backgroundPosition: '0 0, 4px 4px', 
                                        backgroundSize: '8px 8px' 
                                      }
                                    : { backgroundColor: c.hex }
                                }
                              />
                            ))}
                            
                            <div className="relative col-span-2 w-full h-full rounded-xl border-2 border-slate-200 hover:border-slate-300 overflow-hidden flex items-center justify-center">
                              <input
                                type="color"
                                value={customColor}
                                onChange={(e) => {
                                  setCustomColor(e.target.value)
                                  setBgColor(e.target.value)
                                }}
                                className="absolute inset-0 w-[200%] h-[200%] -top-[50%] -left-[50%] cursor-pointer opacity-0"
                              />
                              <div className="absolute inset-0" style={{ backgroundColor: customColor }} />
                              <span className="relative z-10 text-[10px] font-bold text-white drop-shadow-md">
                                Custom
                              </span>
                            </div>
                          </div>
                        </div>

                        {processedImage && (
                          <button
                            onClick={() => { setIsEraserMode(true); setActiveView('removed'); }}
                            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs rounded-xl border border-purple-200/60 transition-colors"
                          >
                            <Eraser className="w-3.5 h-3.5" />
                            Refine Edges Manually
                          </button>
                        )}
                      </div>

                      <button
                        onClick={handleRemoveBackground}
                        disabled={isProcessing || !!processedImage}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-xl font-bold text-xs shadow-md shadow-purple-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <Wand2 className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
                        {isProcessing ? 'Processing Image...' : processedImage ? 'Background Removed' : 'Remove Background'}
                      </button>
                    </div>
                  )}

                  {/* Export Box */}
                  {processedImage && !isEraserMode && (
                    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 flex flex-col gap-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 py-2 px-3 rounded-xl border border-emerald-100">
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>Ready for export</span>
                      </div>
                      <button
                        onClick={downloadImage}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                      >
                        <Download className="w-4 h-4 text-slate-300" />
                        Download {bgColor === 'transparent' ? 'PNG' : 'JPG'}
                      </button>
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        </main>

        {/* --- EDUCATIONAL BLOG & FAQ SECTION (SEO BOOST) --- */}
        <section className="bg-white border-t border-slate-200/80 py-16 px-4">
          <div className="max-w-4xl mx-auto space-y-12">
            
            {/* Guide Intro */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-4">
                How AI Background Removal Works
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                Automated image background isolation relies on deep convolutional neural networks trained on object segmentation. Instead of relying solely on contrast differences or high-contrast chromatic keys (like traditional green-screen techniques), AI vision models evaluate localized visual cues—such as hair textures, lighting boundaries, and depth planes—to generate a accurate opacity mask.
              </p>
              <p className="text-slate-600 text-sm leading-relaxed">
                Whether you are optimizing product photography for e-commerce platforms or isolating subjects for composite graphic design, automated background removal speeds up asset preparation from minutes to seconds.
              </p>
            </div>

            {/* How-To Steps */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-600" />
                Step-by-Step Isolation Process
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-xs font-extrabold text-purple-600 font-mono">STEP 01</span>
                  <h4 className="text-xs font-bold text-slate-900 mt-1 mb-1">Upload Source</h4>
                  <p className="text-[11px] text-slate-500">Drop your JPG, PNG, or WebP file into the uploader area.</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-xs font-extrabold text-purple-600 font-mono">STEP 02</span>
                  <h4 className="text-xs font-bold text-slate-900 mt-1 mb-1">Automated Cutout</h4>
                  <p className="text-[11px] text-slate-500">The segmentation network processes edges and generates an alpha matte.</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-xs font-extrabold text-purple-600 font-mono">STEP 03</span>
                  <h4 className="text-xs font-bold text-slate-900 mt-1 mb-1">Refine & Export</h4>
                  <p className="text-[11px] text-slate-500">Fine-tune stray pixels using the manual brush and download a high-res PNG.</p>
                </div>
              </div>
            </div>

            {/* FAQ Accordion Grid */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-purple-600" />
                Frequently Asked Questions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-900">Which file formats support transparent backgrounds?</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    To preserve alpha transparency, export your final image in **PNG** or **WebP** format. Exporting as a JPEG will automatically fill empty regions with a default background (usually white).
                  </p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-900">Are uploaded images saved or used for AI training?</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    All processing takes place within secure temporary execution sessions. Raw and processed images are purged after your session ends.
                  </p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-900">How do I fix rough edges or missed background details?</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Click the **Touch-up (Manual Eraser Tool)** button after generating your initial cutout. Adjust brush size and zoom level to clean up stray background elements manually.
                  </p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-900">Is there a maximum image resolution limit?</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Images up to 25 Megapixels (5000x5000 resolution) are processed cleanly without downscaling dimensions.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </section>

      </div>
    </>
  )
}

export default BackgroundRemover