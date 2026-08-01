import React, { useState, useRef } from 'react'
import { Download, RotateCcw, Maximize2, Settings2, Image as ImageIcon, Sparkles, CheckCircle, ArrowRight, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import SEO from './SEO'
import ImageUploader from '../components/ImageUploader'

const ImageResizer = () => {
  const [originalImage, setOriginalImage] = useState(null)
  const [resizedImage, setResizedImage] = useState(null)
  const [width, setWidth] = useState('')
  const [height, setHeight] = useState('')
  const [maintainAspect, setMaintainAspect] = useState(true)
  const [aspectRatio, setAspectRatio] = useState(null)
  const [activeView, setActiveView] = useState('original') // 'original' | 'resized'
  const canvasRef = useRef(null)

  const handleImageUpload = (image) => {
    const img = new Image()
    img.src = image.preview
    img.onload = () => {
      setOriginalImage({ ...image, img })
      setWidth(img.width.toString())
      setHeight(img.height.toString())
      setAspectRatio(img.width / img.height)
      setResizedImage(null)
      setActiveView('original')
    }
  }

  const handleWidthChange = (e) => {
    const newWidth = parseInt(e.target.value) || 0
    setWidth(e.target.value)
    if (maintainAspect && aspectRatio && newWidth > 0) {
      const newHeight = Math.round(newWidth / aspectRatio)
      setHeight(newHeight.toString())
    }
  }

  const handleHeightChange = (e) => {
    const newHeight = parseInt(e.target.value) || 0
    setHeight(e.target.value)
    if (maintainAspect && aspectRatio && newHeight > 0) {
      const newWidth = Math.round(newHeight * aspectRatio)
      setWidth(newWidth.toString())
    }
  }

  const resizeImage = () => {
    const w = parseInt(width)
    const h = parseInt(height)

    if (!originalImage || !w || !h || w <= 0 || h <= 0) {
      toast.error('Please enter valid dimensions above 0')
      return
    }

    const canvas = canvasRef.current
    canvas.width = w
    canvas.height = h
    
    const ctx = canvas.getContext('2d')
    // Use high quality image smoothing
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(originalImage.img, 0, 0, w, h)
    
    const resizedDataURL = canvas.toDataURL('image/png', 1.0)
    setResizedImage(resizedDataURL)
    setActiveView('resized')
    toast.success('Image resized successfully!', { icon: '✨' })
  }

  const downloadImage = () => {
    if (resizedImage) {
      const link = document.createElement('a')
      link.download = `resized-${width}x${height}-${Date.now()}.png`
      link.href = resizedImage
      link.click()
      toast.success('Image downloaded successfully!', { icon: '🎉' })
    }
  }

  const handleStartOver = () => {
    setOriginalImage(null)
    setResizedImage(null)
    setWidth('')
    setHeight('')
    setAspectRatio(null)
    setActiveView('original')
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
      "name": "Image Resizer",
      "item": "https://Uploadio.com/image-resizer"
    }]
  }

  return (
    <>
      <SEO 
        title="Image Resizer - Resize Images Online Free"
        description="Resize your images to any dimension online for free. Maintain aspect ratio or set custom dimensions."
        url="https://Uploadio.com/image-resizer"
      />
      
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </script>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden font-sans flex flex-col">
        
        {/* Subtle background dotted pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none" 
          style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }} 
        />

        {/* Ambient Glowing Blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl pointer-events-none translate-y-1/2" />

        {/* Hidden Canvas for Processing */}
        <canvas ref={canvasRef} className="hidden" />

        <div className="flex-1 flex flex-col container mx-auto px-4 py-8 md:py-12 relative z-10 min-h-0">
          
          {/* Header Section */}
          <div className="text-center mb-8 shrink-0 animate-in fade-in slide-in-from-top-4 duration-700">
            {/* <div className="inline-flex items-center justify-center p-2 bg-blue-50 rounded-2xl mb-3 border border-blue-100 shadow-sm">
              <Maximize2 className="w-6 h-6 text-blue-600" />
            </div> */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 tracking-tight">
              Smart Image Resizer
            </h1>
            <p className="text-sm md:text-base text-gray-500 max-w-xl mx-auto font-medium">
              Resize your images instantly while preserving stunning quality and perfectly maintaining aspect ratios.
            </p>
          </div>

          <div className="flex-1 flex flex-col min-h-0 w-full max-w-6xl mx-auto">
            {!originalImage ? (
              // Upload Stage
              <div className="flex-1 flex flex-col justify-center min-h-0 animate-in fade-in zoom-in-95 duration-500 max-w-3xl mx-auto w-full">
                <ImageUploader onImageUpload={handleImageUpload} />
                
                {/* Features Grid */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0 px-4">
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white shadow-lg shadow-gray-200/50 flex flex-col items-center text-center hover:-translate-y-1 transition-transform">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mb-3 shadow-md shadow-blue-500/30">
                      <Maximize2 className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-sm font-bold mb-1 text-gray-900">Custom Dimensions</h3>
                    <p className="text-xs text-gray-500 font-medium">Scale precisely to your needs.</p>
                  </div>
                  
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white shadow-lg shadow-gray-200/50 flex flex-col items-center text-center hover:-translate-y-1 transition-transform hidden md:flex">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mb-3 shadow-md shadow-indigo-500/30">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-sm font-bold mb-1 text-gray-900">Maintain Quality</h3>
                    <p className="text-xs text-gray-500 font-medium">High-resolution export smoothing.</p>
                  </div>
                  
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white shadow-lg shadow-gray-200/50 flex flex-col items-center text-center hover:-translate-y-1 transition-transform hidden md:flex">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center mb-3 shadow-md shadow-emerald-500/30">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-sm font-bold mb-1 text-gray-900">100% Secure</h3>
                    <p className="text-xs text-gray-500 font-medium">Processed locally on your device.</p>
                  </div>
                </div>
              </div>
            ) : (
              // Editor Stage (Side-by-Side Layout)
              <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0 animate-in fade-in zoom-in-95 duration-500">
                
                {/* Left Panel: Preview Area */}
                <div className="flex-1 flex flex-col bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-xl shadow-blue-500/5 border border-white p-4 md:p-6 min-h-[400px]">
                  
                  {/* Segmented Toggle for Preview */}
                  <div className="shrink-0 flex justify-between items-center mb-4">
                    <div className="bg-gray-100/80 backdrop-blur-md p-1 rounded-full inline-flex relative shadow-inner">
                      <button
                        onClick={() => setActiveView('original')}
                        className={`relative z-10 flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-bold transition-all duration-300 ${
                          activeView === 'original' ? 'text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        Original
                      </button>
                      {resizedImage && (
                        <button
                          onClick={() => setActiveView('resized')}
                          className={`relative z-10 flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-bold transition-all duration-300 ${
                            activeView === 'resized' ? 'text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          Resized Result
                        </button>
                      )}
                      
                      {/* Animated Slider Background */}
                      <div 
                        className="absolute top-1 bottom-1 bg-white rounded-full shadow-sm transition-all duration-300 ease-out"
                        style={{ 
                          width: resizedImage ? 'calc(50% - 4px)' : 'calc(100% - 8px)',
                          transform: activeView === 'original' ? 'translateX(0)' : 'translateX(100%)' 
                        }}
                      />
                    </div>
                    
                    <button onClick={handleStartOver} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors" title="Start Over">
                      <RotateCcw className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Image Display */}
                  <div className="flex-1 relative w-full rounded-3xl overflow-hidden bg-gray-50/50 border border-gray-100 flex items-center justify-center group">
                    <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ 
                      backgroundImage: 'repeating-linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), repeating-linear-gradient(45deg, #000 25%, #fff 25%, #fff 75%, #000 75%, #000)', 
                      backgroundPosition: '0 0, 10px 10px', 
                      backgroundSize: '20px 20px' 
                    }} />

                    <img 
                      src={activeView === 'original' ? originalImage.preview : resizedImage} 
                      alt="Preview"
                      className="max-w-full max-h-full object-contain p-4 drop-shadow-2xl transition-all duration-300"
                    />

                    {/* Dimension Badge floating */}
                    <div className="absolute bottom-4 right-4 bg-gray-900/80 backdrop-blur-md text-white text-[11px] font-mono font-medium px-3 py-1.5 rounded-lg shadow-lg">
                      {activeView === 'original' 
                        ? `${originalImage.img.width} × ${originalImage.img.height} px` 
                        : `${width} × ${height} px`
                      }
                    </div>
                  </div>
                </div>

                {/* Right Panel: Settings & Actions */}
                <div className="w-full lg:w-[360px] flex flex-col gap-4 shrink-0">
                  
                  {/* Settings Card */}
                  <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-xl shadow-blue-500/5 border border-white p-6 md:p-8">
                    <div className="flex items-center gap-2 mb-6">
                      <Settings2 className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-bold text-gray-900">Resize Settings</h3>
                    </div>

                    <div className="space-y-5">
                      {/* Width Input */}
                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Width</label>
                        <div className="relative group">
                          <input
                            type="number"
                            value={width}
                            onChange={handleWidthChange}
                            className="w-full pl-4 pr-12 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-xl focus:ring-0 focus:border-blue-500 focus:bg-white text-gray-800 font-semibold transition-all outline-none"
                            placeholder="e.g. 1920"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 group-focus-within:text-blue-500 transition-colors">PX</span>
                        </div>
                      </div>
                      
                      {/* Height Input */}
                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Height</label>
                        <div className="relative group">
                          <input
                            type="number"
                            value={height}
                            onChange={handleHeightChange}
                            className="w-full pl-4 pr-12 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-xl focus:ring-0 focus:border-blue-500 focus:bg-white text-gray-800 font-semibold transition-all outline-none"
                            placeholder="e.g. 1080"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 group-focus-within:text-blue-500 transition-colors">PX</span>
                        </div>
                      </div>

                      <div className="h-px bg-gray-100 my-2" />
                      
                      {/* Toggle Switch */}
                      <label className="flex items-center justify-between cursor-pointer group">
                        <span className="text-sm font-bold text-gray-700 group-hover:text-blue-600 transition-colors">Maintain Aspect Ratio</span>
                        <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${maintainAspect ? 'bg-blue-600 shadow-inner' : 'bg-gray-200'}`}>
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${maintainAspect ? 'translate-x-6' : 'translate-x-1'}`} />
                          <input type="checkbox" className="sr-only" checked={maintainAspect} onChange={(e) => setMaintainAspect(e.target.checked)} />
                        </div>
                      </label>
                    </div>

                    {/* Primary Action Button */}
                    <button
                      onClick={resizeImage}
                      className="mt-8 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                    >
                      <Maximize2 className="w-5 h-5" />
                      Apply Resize
                    </button>
                  </div>

                  {/* Download Card (Appears after resizing) */}
                  {resizedImage && (
                    <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-xl shadow-green-500/5 border border-white p-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
                      <div className="flex items-center justify-center gap-2 text-sm font-bold text-emerald-700 bg-emerald-50 py-3 rounded-xl mb-4 border border-emerald-100">
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                        Image Resized Successfully!
                      </div>
                      <button
                        onClick={downloadImage}
                        className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold shadow-lg shadow-gray-900/20 hover:shadow-gray-900/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                      >
                        <Download className="w-5 h-5 text-gray-300" />
                        Download Image
                      </button>
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default ImageResizer