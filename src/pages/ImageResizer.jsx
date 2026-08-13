import React, { useState, useRef, useEffect } from 'react'
import { 
  Download, RotateCcw, Maximize2, Settings2, Image as ImageIcon, 
  Sparkles, CheckCircle, ArrowRight, Check, Sliders, X, 
  HelpCircle, ShieldCheck, Zap, Layers, Grid, FileImage
} from 'lucide-react'
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
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false)
  const canvasRef = useRef(null)
  const rafRef = useRef(null)

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
      setIsMobilePanelOpen(false)
    }
  }

  const handleWidthChange = (e) => {
    const val = e.target.value
    setWidth(val)
    
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      const newWidth = parseInt(val) || 0
      if (maintainAspect && aspectRatio && newWidth > 0) {
        const newHeight = Math.round(newWidth / aspectRatio)
        setHeight(newHeight.toString())
      }
    })
  }

  const handleHeightChange = (e) => {
    const val = e.target.value
    setHeight(val)

    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      const newHeight = parseInt(val) || 0
      if (maintainAspect && aspectRatio && newHeight > 0) {
        const newWidth = Math.round(newHeight * aspectRatio)
        setWidth(newWidth.toString())
      }
    })
  }

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

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
    setIsMobilePanelOpen(false)
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
    setIsMobilePanelOpen(false)
  }

  // --- STRUCTURED DATA SCHEMAS (TECHNICAL SEO) ---
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

  const webApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Smart Image Resizer - Uploadio",
    "url": "https://Uploadio.com/image-resizer",
    "applicationCategory": "MultimediaApplication",
    "operatingSystem": "All",
    "browserRequirements": "Requires JavaScript. Requires HTML5 Canvas.",
    "description": "Free web-based tool to resize JPG, PNG, and WebP images to custom pixel dimensions while preserving quality and aspect ratios.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How do I resize an image online?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Upload your photo, input your preferred width or height in pixels, keep 'Maintain Aspect Ratio' enabled to avoid stretching, and click 'Apply Resize' to preview and download your resized file."
        }
      },
      {
        "@type": "Question",
        "name": "Can I resize an image to custom dimensions?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. You can enter any custom pixel width and height. Disabling the aspect ratio toggle allows independent stretching or squishing to meet exact platform specifications."
        }
      },
      {
        "@type": "Question",
        "name": "How do I resize an image without stretching or distortion?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ensure the 'Maintain Aspect Ratio' toggle is turned on. When you change either the width or height, the other value automatically recalculates proportionally based on the original image dimensions."
        }
      },
      {
        "@type": "Question",
        "name": "Are my images uploaded to a remote server?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No. All canvas rendering and resizing logic happens completely locally inside your web browser. Your images are never saved, transferred, or stored on remote servers."
        }
      },
      {
        "@type": "Question",
        "name": "Does resizing an image affect its quality?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Scaling an image down generally preserves high sharpness and detail using HTML5 canvas smoothing. Upscaling a small image significantly beyond its original pixel count may introduce soft edges or blur, as missing detail cannot be artificially created."
        }
      },
      {
        "@type": "Question",
        "name": "Is this online image resizer free to use?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, our image resizer is completely free with no usage caps, registration, or hidden fees."
        }
      }
    ]
  }

  return (
    <>
      <SEO 
        title="Image Resizer - Resize Images Online Free | Uploadio"
        description="Resize JPG, PNG, and WebP images online for free. Set custom pixel dimensions, maintain aspect ratios, and download high-quality resized images instantly."
        url="https://Uploadio.com/image-resizer"
      />
      
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(webApplicationSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(faqSchema)}
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

        <div className="flex-1 flex flex-col container mx-auto px-3 md:px-4 py-4 md:py-12 relative z-10 min-h-0">
          
          {/* Main Tool Header */}
          <div className="text-center mb-4 md:mb-8 shrink-0 animate-in fade-in slide-in-from-top-4 duration-700">
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-extrabold mb-1 md:mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 tracking-tight">
              Smart Image Resizer
            </h1>
            <p className="text-xs md:text-base text-gray-500 max-w-xl mx-auto font-medium">
              Resize your images instantly while preserving stunning quality and perfectly maintaining aspect ratios.
            </p>
          </div>

          <div className="flex-1 flex flex-col min-h-0 w-full max-w-6xl mx-auto">
            {!originalImage ? (
              // Upload Stage
              <div className="flex-1 flex flex-col justify-center min-h-0 animate-in fade-in zoom-in-95 duration-500 max-w-3xl mx-auto w-full">
                <ImageUploader onImageUpload={handleImageUpload} />
                
                {/* Features Grid */}
                <div className="mt-6 md:mt-8 grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 shrink-0 px-2 md:px-4">
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 md:p-5 border border-white shadow-lg shadow-gray-200/50 flex flex-col items-center text-center hover:-translate-y-1 transition-transform">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mb-2 md:mb-3 shadow-md shadow-blue-500/30">
                      <Maximize2 className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <h3 className="text-xs md:text-sm font-bold mb-1 text-gray-900">Custom Dimensions</h3>
                    <p className="text-[11px] md:text-xs text-gray-500 font-medium">Scale precisely to your needs.</p>
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
              <div className="flex-1 flex flex-col lg:flex-row gap-4 md:gap-6 min-h-0 animate-in fade-in zoom-in-95 duration-500 pb-16 md:pb-0">
                
                {/* Left Panel: Preview Area */}
                <div className="flex-1 flex flex-col bg-white/80 backdrop-blur-xl rounded-[1.5rem] md:rounded-[2rem] shadow-xl shadow-blue-500/5 border border-white p-3 md:p-6 min-h-[350px] md:min-h-[400px]">
                  
                  {/* Segmented Toggle for Preview */}
                  <div className="shrink-0 flex justify-between items-center mb-3 md:mb-4">
                    <div className="bg-gray-100/80 backdrop-blur-md p-1 rounded-full inline-flex relative shadow-inner">
                      <button
                        onClick={() => setActiveView('original')}
                        className={`relative z-10 flex items-center gap-1.5 px-3.5 md:px-5 py-1.5 md:py-2 rounded-full text-xs font-bold transition-all duration-300 ${
                          activeView === 'original' ? 'text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        Original
                      </button>
                      {resizedImage && (
                        <button
                          onClick={() => setActiveView('resized')}
                          className={`relative z-10 flex items-center gap-1.5 px-3.5 md:px-5 py-1.5 md:py-2 rounded-full text-xs font-bold transition-all duration-300 ${
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
                  <div className="flex-1 relative w-full rounded-2xl md:rounded-3xl overflow-hidden bg-gray-50/50 border border-gray-100 flex items-center justify-center group touch-none">
                    <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ 
                      backgroundImage: 'repeating-linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), repeating-linear-gradient(45deg, #000 25%, #fff 25%, #fff 75%, #000 75%, #000)', 
                      backgroundPosition: '0 0, 10px 10px', 
                      backgroundSize: '20px 20px' 
                    }} />

                    <img 
                      src={activeView === 'original' ? originalImage.preview : resizedImage} 
                      alt={activeView === 'original' ? "Original uploaded image preview" : "Resized image result preview"}
                      className="max-w-full max-h-[50vh] md:max-h-full object-contain p-2 md:p-4 drop-shadow-2xl transition-all duration-300 select-none"
                    />

                    {/* Dimension Badge floating */}
                    <div className="absolute bottom-3 right-3 md:bottom-4 md:right-4 bg-gray-900/80 backdrop-blur-md text-white text-[10px] md:text-[11px] font-mono font-medium px-2.5 py-1 md:px-3 md:py-1.5 rounded-lg shadow-lg">
                      {activeView === 'original' 
                        ? `${originalImage.img.width} × ${originalImage.img.height} px` 
                        : `${width} × ${height} px`
                      }
                    </div>
                  </div>
                </div>

                {/* Mobile Floating Action Toggle Button */}
                <div className="fixed bottom-4 left-4 right-4 z-30 md:hidden">
                  <button
                    onClick={() => setIsMobilePanelOpen(true)}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 px-4 rounded-2xl font-bold shadow-xl flex items-center justify-center gap-2"
                  >
                    <Sliders className="w-4 h-4" />
                    <span>Configure Dimensions & Apply</span>
                  </button>
                </div>

                {/* Right Panel: Settings & Actions (Desktop view & Mobile drawer overlay) */}
                <div className={`w-full lg:w-[360px] flex flex-col gap-4 shrink-0 max-md:fixed max-md:inset-x-0 max-md:bottom-0 max-md:z-40 max-md:bg-white max-md:rounded-t-[2rem] max-md:p-5 max-md:shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.15)] max-md:transition-transform max-md:duration-300 ${
                  isMobilePanelOpen ? 'max-md:translate-y-0' : 'max-md:translate-y-full max-md:pointer-events-none'
                }`}>
                  
                  {/* Mobile Header handle */}
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100 md:hidden">
                    <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-2.5" />
                    <span className="text-xs font-extrabold text-gray-800 uppercase tracking-wider">Resize Controls</span>
                    <button onClick={() => setIsMobilePanelOpen(false)} className="p-1 rounded-full text-gray-400 hover:text-gray-600">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Settings Card */}
                  <div className="bg-white/80 backdrop-blur-xl rounded-[1.5rem] md:rounded-[2rem] md:shadow-xl md:shadow-blue-500/5 md:border md:border-white p-1 md:p-8">
                    <div className="hidden md:flex items-center gap-2 mb-6">
                      <Settings2 className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-bold text-gray-900">Resize Settings</h3>
                    </div>

                    <div className="space-y-4 md:space-y-5">
                      {/* Width Input */}
                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5 md:mb-2">Width</label>
                        <div className="relative group">
                          <input
                            type="number"
                            value={width}
                            onChange={handleWidthChange}
                            className="w-full pl-4 pr-12 py-3 md:py-3.5 bg-gray-50 border-2 border-gray-100 rounded-xl focus:ring-0 focus:border-blue-500 focus:bg-white text-gray-800 font-semibold transition-all outline-none text-sm md:text-base"
                            placeholder="e.g. 1920"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 group-focus-within:text-blue-500 transition-colors">PX</span>
                        </div>
                      </div>
                      
                      {/* Height Input */}
                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5 md:mb-2">Height</label>
                        <div className="relative group">
                          <input
                            type="number"
                            value={height}
                            onChange={handleHeightChange}
                            className="w-full pl-4 pr-12 py-3 md:py-3.5 bg-gray-50 border-2 border-gray-100 rounded-xl focus:ring-0 focus:border-blue-500 focus:bg-white text-gray-800 font-semibold transition-all outline-none text-sm md:text-base"
                            placeholder="e.g. 1080"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 group-focus-within:text-blue-500 transition-colors">PX</span>
                        </div>
                      </div>

                      <div className="h-px bg-gray-100 my-1 md:my-2" />
                      
                      {/* Toggle Switch */}
                      <label className="flex items-center justify-between cursor-pointer group py-1">
                        <span className="text-xs md:text-sm font-bold text-gray-700 group-hover:text-blue-600 transition-colors">Maintain Aspect Ratio</span>
                        <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${maintainAspect ? 'bg-blue-600 shadow-inner' : 'bg-gray-200'}`}>
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${maintainAspect ? 'translate-x-6' : 'translate-x-1'}`} />
                          <input type="checkbox" className="sr-only" checked={maintainAspect} onChange={(e) => setMaintainAspect(e.target.checked)} />
                        </div>
                      </label>
                    </div>

                    {/* Primary Action Button */}
                    <button
                      onClick={resizeImage}
                      className="mt-6 md:mt-8 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-3.5 md:py-4 rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 text-sm md:text-base"
                    >
                      <Maximize2 className="w-4 h-4 md:w-5 md:h-5" />
                      Apply Resize
                    </button>
                  </div>

                  {/* Download Card (Appears after resizing) */}
                  {resizedImage && (
                    <div className="bg-white/80 backdrop-blur-xl rounded-[1.5rem] md:rounded-[2rem] md:shadow-xl md:shadow-green-500/5 md:border md:border-white p-4 md:p-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
                      <div className="flex items-center justify-center gap-2 text-xs md:text-sm font-bold text-emerald-700 bg-emerald-50 py-2.5 md:py-3 rounded-xl mb-3 md:mb-4 border border-emerald-100">
                        <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-emerald-500" />
                        Image Resized Successfully!
                      </div>
                      <button
                        onClick={downloadImage}
                        className="w-full bg-gray-900 text-white py-3.5 md:py-4 rounded-xl font-bold shadow-lg shadow-gray-900/20 hover:shadow-gray-900/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 text-sm md:text-base"
                      >
                        <Download className="w-4 h-4 md:w-5 md:h-5 text-gray-300" />
                        Download Image
                      </button>
                    </div>
                  )}
                </div>

                {/* Mobile Backdrop for Drawer */}
                {isMobilePanelOpen && (
                  <div 
                    onClick={() => setIsMobilePanelOpen(false)} 
                    className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs z-30 md:hidden"
                  />
                )}

              </div>
            )}
          </div>
        </div>

        {/* ==================================================== */}
        {/*           TECHNICAL SEO CONTENT SECTIONS            */}
        {/* ==================================================== */}
        <footer className="w-full bg-white/70 backdrop-blur-md border-t border-gray-200/80 mt-12 py-12 md:py-16 text-gray-800">
          <div className="container mx-auto px-4 max-w-5xl space-y-16">
            
            {/* SECTION 1: HOW TO RESIZE AN IMAGE ONLINE */}
            <section className="space-y-6">
              <div className="text-center max-w-2xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                  How to Resize an Image Online
                </h2>
                <p className="text-xs md:text-sm text-gray-500 mt-2 font-medium">
                  Follow these four quick steps to change your image dimensions in seconds without installing extra software.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-md shadow-gray-100/80 flex flex-col relative group">
                  <span className="text-3xl font-black text-blue-100 group-hover:text-blue-500/20 transition-colors mb-2">01</span>
                  <h3 className="text-sm font-bold text-gray-900 mb-1">Upload Your File</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Select or drag and drop your JPG, PNG, or supported image format directly into the canvas area.
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-md shadow-gray-100/80 flex flex-col relative group">
                  <span className="text-3xl font-black text-blue-100 group-hover:text-blue-500/20 transition-colors mb-2">02</span>
                  <h3 className="text-sm font-bold text-gray-900 mb-1">Set Dimensions</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Enter your desired width or height in pixels. The opposing dimension adjusts automatically if locked.
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-md shadow-gray-100/80 flex flex-col relative group">
                  <span className="text-3xl font-black text-blue-100 group-hover:text-blue-500/20 transition-colors mb-2">03</span>
                  <h3 className="text-sm font-bold text-gray-900 mb-1">Lock Proportions</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Keep 'Maintain Aspect Ratio' turned on to protect your graphics from squishing or stretching distortion.
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-md shadow-gray-100/80 flex flex-col relative group">
                  <span className="text-3xl font-black text-blue-100 group-hover:text-blue-500/20 transition-colors mb-2">04</span>
                  <h3 className="text-sm font-bold text-gray-900 mb-1">Resize & Download</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Click 'Apply Resize' to generate your new image preview, then hit 'Download' to save the file to your device.
                  </p>
                </div>
              </div>
            </section>

            {/* SECTION 2: WHY USE OUR IMAGE RESIZER */}
            <section className="space-y-6">
              <div className="text-center max-w-2xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                  Why Use Our Online Image Resizer
                </h2>
                <p className="text-xs md:text-sm text-gray-500 mt-2 font-medium">
                  Designed for creators, marketers, and developers who need fast, privacy-focused image resizing.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                    <Zap className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-1.5">Instant High-Quality Output</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Utilizes hardware-accelerated HTML5 canvas smoothing to render clean, crisp images across any target dimension.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-1.5">Client-Side Privacy</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Your photos are processed entirely inside your local browser memory. Files are never uploaded or stored on external servers.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                  <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4">
                    <Layers className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-1.5">Flexible Aspect Controls</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Seamlessly toggle aspect ratio locking to either maintain original geometry or force explicit width-and-height pixel limits.
                  </p>
                </div>
              </div>
            </section>

            {/* SECTION 3: RESIZE IMAGES WITHOUT LOSING QUALITY */}
            <section className="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-3xl p-6 md:p-10 text-white relative overflow-hidden shadow-xl">
              <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 opacity-10 pointer-events-none">
                <FileImage className="w-96 h-96" />
              </div>
              <div className="relative z-10 max-w-3xl space-y-4">
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                  Resize Images Without Losing Quality
                </h2>
                <p className="text-xs md:text-sm text-blue-100 leading-relaxed">
                  Image scaling behavior varies depending on whether you are downsizing or upscaling your source asset. Downscaling an image reduces pixel count while maintaining high visual density, resulting in sharp, lightweight graphics perfect for websites and mobile applications.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10">
                    <h3 className="text-xs font-bold text-blue-200 uppercase tracking-wider mb-1">Downscaling (Reducing Size)</h3>
                    <p className="text-xs text-gray-200">
                      High-quality bicubic canvas interpolation blends pixel density smoothly, producing clean visuals with smaller file sizes.
                    </p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10">
                    <h3 className="text-xs font-bold text-blue-200 uppercase tracking-wider mb-1">Upscaling (Enlarging Size)</h3>
                    <p className="text-xs text-gray-200">
                      Significantly inflating small source images duplicates existing pixel data, which can naturally introduce slight softness.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 4: POPULAR IMAGE DIMENSIONS TABLE */}
            <section className="space-y-6">
              <div className="text-center max-w-2xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                  Popular Image Dimensions Guide
                </h2>
                <p className="text-xs md:text-sm text-gray-500 mt-2 font-medium">
                  Use these standard pixel recommendations when preparing graphics for major web and social platforms.
                </p>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
                <table className="w-full text-left border-collapse text-xs md:text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-700">
                      <th className="py-3.5 px-4 font-bold">Platform / Purpose</th>
                      <th className="py-3.5 px-4 font-bold">Recommended Size (Pixels)</th>
                      <th className="py-3.5 px-4 font-bold">Aspect Ratio</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-600 font-medium">
                    <tr className="hover:bg-gray-50/50">
                      <td className="py-3 px-4 font-semibold text-gray-900">Instagram Post (Square)</td>
                      <td className="py-3 px-4 font-mono">1080 × 1080 px</td>
                      <td className="py-3 px-4">1:1</td>
                    </tr>
                    <tr className="hover:bg-gray-50/50">
                      <td className="py-3 px-4 font-semibold text-gray-900">Instagram / TikTok Story</td>
                      <td className="py-3 px-4 font-mono">1080 × 1920 px</td>
                      <td className="py-3 px-4">9:16</td>
                    </tr>
                    <tr className="hover:bg-gray-50/50">
                      <td className="py-3 px-4 font-semibold text-gray-900">YouTube Video Thumbnail</td>
                      <td className="py-3 px-4 font-mono">1280 × 720 px</td>
                      <td className="py-3 px-4">16:9</td>
                    </tr>
                    <tr className="hover:bg-gray-50/50">
                      <td className="py-3 px-4 font-semibold text-gray-900">Facebook Cover Photo</td>
                      <td className="py-3 px-4 font-mono">820 × 312 px</td>
                      <td className="py-3 px-4">20.5:8</td>
                    </tr>
                    <tr className="hover:bg-gray-50/50">
                      <td className="py-3 px-4 font-semibold text-gray-900">Web Hero Banner</td>
                      <td className="py-3 px-4 font-mono">1920 × 1080 px</td>
                      <td className="py-3 px-4">16:9</td>
                    </tr>
                    <tr className="hover:bg-gray-50/50">
                      <td className="py-3 px-4 font-semibold text-gray-900">Standard Blog Feature</td>
                      <td className="py-3 px-4 font-mono">1200 × 630 px</td>
                      <td className="py-3 px-4">1.91:1</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* SECTION 5: ACCESSIBLE FAQ SECTION */}
            <section className="space-y-6">
              <div className="text-center max-w-2xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center justify-center gap-2">
                  <HelpCircle className="w-6 h-6 text-blue-600" />
                  Frequently Asked Questions
                </h2>
                <p className="text-xs md:text-sm text-gray-500 mt-2 font-medium">
                  Answers to common questions regarding online image resizing, file formats, and aspect ratios.
                </p>
              </div>

              <div className="space-y-3 max-w-3xl mx-auto">
                <details className="group bg-white rounded-2xl border border-gray-200/80 shadow-sm p-4 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex items-center justify-between font-bold text-gray-900 text-xs md:text-sm cursor-pointer select-none">
                    <span>How do I resize an image online?</span>
                    <span className="ml-2 text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="mt-3 text-xs md:text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-3">
                    Upload your photo using the uploader, enter your target width or height in pixels, keep 'Maintain Aspect Ratio' turned on to preserve image geometry, and click 'Apply Resize' to generate and download your resized file.
                  </p>
                </details>

                <details className="group bg-white rounded-2xl border border-gray-200/80 shadow-sm p-4 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex items-center justify-between font-bold text-gray-900 text-xs md:text-sm cursor-pointer select-none">
                    <span>Can I resize an image to custom dimensions?</span>
                    <span className="ml-2 text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="mt-3 text-xs md:text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-3">
                    Yes. You can specify any custom width and height in pixels. Disabling the aspect ratio lock allows independent width and height adjustments when needed.
                  </p>
                </details>

                <details className="group bg-white rounded-2xl border border-gray-200/80 shadow-sm p-4 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex items-center justify-between font-bold text-gray-900 text-xs md:text-sm cursor-pointer select-none">
                    <span>How do I resize an image without stretching it?</span>
                    <span className="ml-2 text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="mt-3 text-xs md:text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-3">
                    Keep the 'Maintain Aspect Ratio' toggle active. When active, typing a new width automatically calculates the matching proportional height to keep your graphic looking natural.
                  </p>
                </details>

                <details className="group bg-white rounded-2xl border border-gray-200/80 shadow-sm p-4 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex items-center justify-between font-bold text-gray-900 text-xs md:text-sm cursor-pointer select-none">
                    <span>Are my files processed safely on my local device?</span>
                    <span className="ml-2 text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="mt-3 text-xs md:text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-3">
                    Yes. Image resizing operations execute locally using HTML5 client-side web technologies inside your browser memory. Your images are never saved or stored on any server.
                  </p>
                </details>

                <details className="group bg-white rounded-2xl border border-gray-200/80 shadow-sm p-4 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex items-center justify-between font-bold text-gray-900 text-xs md:text-sm cursor-pointer select-none">
                    <span>Does resizing an image reduce its file size?</span>
                    <span className="ml-2 text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="mt-3 text-xs md:text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-3">
                    In most cases, reducing an image's pixel dimensions lowers its total memory footprint because fewer pixels are stored in the output PNG bitmap.
                  </p>
                </details>

                <details className="group bg-white rounded-2xl border border-gray-200/80 shadow-sm p-4 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex items-center justify-between font-bold text-gray-900 text-xs md:text-sm cursor-pointer select-none">
                    <span>Is this image resizer free to use?</span>
                    <span className="ml-2 text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="mt-3 text-xs md:text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-3">
                    Yes. The Smart Image Resizer tool is completely free with no user registration or daily limitations.
                  </p>
                </details>
              </div>
            </section>

          </div>
        </footer>

      </div>
    </>
  )
}

export default ImageResizer