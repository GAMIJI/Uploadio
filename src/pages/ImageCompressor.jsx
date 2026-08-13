import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Download, RotateCcw, Sliders, Image as ImageIcon, Sparkles, CheckCircle, ArrowDownToLine, Zap, FileJson, Loader2, HelpCircle, ShieldCheck, Layers, FileCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import SEO from './SEO'
import ImageUploader from '../components/ImageUploader'

const ImageCompressor = () => {
  const [originalImage, setOriginalImage] = useState(null)
  const [compressedImage, setCompressedImage] = useState(null)
  const [quality, setQuality] = useState(80)
  const [originalSize, setOriginalSize] = useState(0)
  const [compressedSize, setCompressedSize] = useState(0)
  const [activeView, setActiveView] = useState('original') // 'original' | 'compressed'
  const [isCompressing, setIsCompressing] = useState(false)
  const [outputFormat, setOutputFormat] = useState('image/jpeg') // 'image/jpeg' | 'image/png' | 'image/webp'
  
  const canvasRef = useRef(null)
  const compressedUrlRef = useRef(null)

  // Clean up object URLs to prevent memory leaks
  const revokeCompressedUrl = useCallback(() => {
    if (compressedUrlRef.current) {
      URL.revokeObjectURL(compressedUrlRef.current)
      compressedUrlRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => {
      revokeCompressedUrl()
    }
  }, [revokeCompressedUrl])

  const handleImageUpload = (image) => {
    if (!image || !image.file) {
      toast.error('Invalid image file. Please try again.')
      return
    }

    revokeCompressedUrl()
    setOriginalSize(image.file.size)

    // Detect format and retain PNG/WebP if transparent format uploaded
    const fileType = image.file.type || 'image/jpeg'
    if (fileType === 'image/png' || fileType === 'image/webp') {
      setOutputFormat(fileType)
    } else {
      setOutputFormat('image/jpeg')
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      setOriginalImage({ preview: e.target.result, file: image.file })
      setCompressedImage(null)
      setCompressedSize(0)
      setActiveView('original')
    }
    reader.onerror = () => {
      toast.error('Failed to read uploaded image.')
    }
    reader.readAsDataURL(image.file)
  }

  const compressImage = useCallback(() => {
    if (!originalImage || !originalImage.preview || isCompressing) return

    setIsCompressing(true)
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = originalImage.preview

    img.onload = () => {
      const canvas = canvasRef.current
      if (!canvas) {
        setIsCompressing(false)
        toast.error('Canvas element uninitialized.')
        return
      }

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        setIsCompressing(false)
        toast.error('Failed to get 2D canvas context.')
        return
      }
      
      canvas.width = img.width
      canvas.height = img.height

      // Handle PNG background transparency when exporting as JPEG
      if (outputFormat === 'image/jpeg') {
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }

      ctx.drawImage(img, 0, 0)
      
      const qualityFactor = quality / 100

      canvas.toBlob(
        (blob) => {
          setIsCompressing(false)

          if (!blob) {
            toast.error('Compression failed. Please try a different image.')
            return
          }

          revokeCompressedUrl()

          const url = URL.createObjectURL(blob)
          compressedUrlRef.current = url

          setCompressedImage(url)
          setCompressedSize(blob.size)
          setActiveView('compressed')

          if (blob.size < originalSize) {
            const reduction = ((1 - blob.size / originalSize) * 100).toFixed(1)
            toast.success(`Compressed by ${reduction}%!`, { icon: '🚀' })
          } else {
            toast.info('Image is already optimal. Compression yielded no size reduction.', { icon: 'ℹ️' })
          }
        },
        outputFormat,
        qualityFactor
      )
    }

    img.onerror = () => {
      setIsCompressing(false)
      toast.error('Failed to load image for compression.')
    }
  }, [originalImage, isCompressing, quality, outputFormat, originalSize, revokeCompressedUrl])

  const getFileExtension = (mimeType) => {
    switch (mimeType) {
      case 'image/png': return 'png'
      case 'image/webp': return 'webp'
      case 'image/jpeg':
      default: return 'jpg'
    }
  }

  const downloadImage = () => {
    if (compressedImage) {
      const ext = getFileExtension(outputFormat)
      const link = document.createElement('a')
      link.download = `compressed-${Date.now()}.${ext}`
      link.href = compressedImage
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success('Image downloaded successfully!', { icon: '🎉' })
    }
  }

  const handleStartOver = () => {
    revokeCompressedUrl()
    setOriginalImage(null)
    setCompressedImage(null)
    setQuality(80)
    setOriginalSize(0)
    setCompressedSize(0)
    setActiveView('original')
    setOutputFormat('image/jpeg')
  }

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const calculateReduction = () => {
    if (!originalSize || !compressedSize || originalSize === 0) return 0
    const rawReduction = ((1 - compressedSize / originalSize) * 100).toFixed(1)
    return parseFloat(rawReduction)
  }

  const reductionValue = calculateReduction()
  const isSizeReduced = reductionValue > 0

  // SEO & Technical Schemas
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
      "name": "Image Compressor",
      "item": "https://Uploadio.com/image-compressor"
    }]
  }

  const webApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Smart Image Compressor - Uploadio",
    "url": "https://Uploadio.com/image-compressor",
    "applicationCategory": "MultimediaApplication",
    "operatingSystem": "All",
    "browserRequirements": "Requires JavaScript. Requires HTML5 Canvas.",
    "description": "Free web-based tool to compress JPG, PNG, and WebP images online without losing quality. Browser-side local compression.",
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
        "name": "How do I compress an image online?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Upload your JPG, PNG, or WebP photo, adjust the compression quality slider to your preference, and click 'Compress Image' to optimize and download your file."
        }
      },
      {
        "@type": "Question",
        "name": "Does image compression reduce visual quality?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Moderate compression reduces file size significantly while keeping visual quality virtually indistinguishable from the original. Lowering quality below 50% may introduce visible artifacts."
        }
      },
      {
        "@type": "Question",
        "name": "Are my images uploaded to remote servers?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No. All canvas image compression processing takes place completely inside your web browser memory. Your files are never uploaded or stored remotely."
        }
      },
      {
        "@type": "Question",
        "name": "What image formats are supported?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Our compressor supports JPG, PNG, and WebP files, preserving transparency for PNG and WebP formats when desired."
        }
      },
      {
        "@type": "Question",
        "name": "Why is my compressed image larger than the original?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "If an uploaded photo is already heavily compressed or converted to a different format with high quality settings, canvas re-encoding may yield a slightly larger file size."
        }
      },
      {
        "@type": "Question",
        "name": "Is this online image compressor free?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, our image compressor tool is 100% free with no file limits, registration, or hidden fees."
        }
      }
    ]
  }

  return (
    <>
      <SEO 
        title="Image Compressor – Compress Images Online Free | Uploadio"
        description="Compress JPG, PNG, and WebP images online for free. Reduce file size efficiently with customizable quality controls and instant client-side downloads."
        url="https://Uploadio.com/image-compressor"
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
        
        {/* Background dotted pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none" 
          style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }} 
        />

        {/* Ambient Glowing Blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl pointer-events-none translate-y-1/2" />

        {/* Hidden Canvas for Processing */}
        <canvas ref={canvasRef} className="hidden" />

        <div className="flex-1 flex flex-col container mx-auto px-4 py-8 md:py-12 relative z-10 min-h-0">
          
          {/* Header Section */}
          <div className="text-center mb-8 shrink-0 animate-in fade-in slide-in-from-top-4 duration-700">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 tracking-tight">
              Smart Image Compressor
            </h1>
            <p className="text-sm md:text-base text-gray-500 max-w-xl mx-auto font-medium">
              Reduce image file sizes efficiently without sacrificing visual clarity. Perfect for web optimization and fast loading.
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
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-3 shadow-md shadow-emerald-500/30">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-sm font-bold mb-1 text-gray-900">Optimized File Size</h3>
                    <p className="text-xs text-gray-500 font-medium">Drastic size reduction on demand.</p>
                  </div>
                  
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white shadow-lg shadow-gray-200/50 flex flex-col items-center text-center hover:-translate-y-1 transition-transform hidden md:flex">
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center mb-3 shadow-md shadow-teal-500/30">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-sm font-bold mb-1 text-gray-900">Quality Control</h3>
                    <p className="text-xs text-gray-500 font-medium">Maintains sharp visual clarity.</p>
                  </div>
                  
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white shadow-lg shadow-gray-200/50 flex flex-col items-center text-center hover:-translate-y-1 transition-transform hidden md:flex">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center mb-3 shadow-md shadow-cyan-500/30">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-sm font-bold mb-1 text-gray-900">100% Browser Local</h3>
                    <p className="text-xs text-gray-500 font-medium">Safe client-side execution.</p>
                  </div>
                </div>
              </div>
            ) : (
              // Editor Stage (Side-by-Side Layout)
              <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0 animate-in fade-in zoom-in-95 duration-500">
                
                {/* Left Panel: Preview Area */}
                <div className="flex-1 flex flex-col bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-xl shadow-emerald-500/5 border border-white p-4 md:p-6 min-h-[400px]">
                  
                  {/* Segmented Toggle for Preview */}
                  <div className="shrink-0 flex justify-between items-center mb-4">
                    <div className="bg-gray-100/80 backdrop-blur-md p-1 rounded-full inline-flex relative shadow-inner">
                      <button
                        type="button"
                        onClick={() => setActiveView('original')}
                        className={`relative z-10 flex items-center gap-1.5 px-4 md:px-5 py-2 rounded-full text-xs font-bold transition-all duration-300 ${
                          activeView === 'original' ? 'text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        Original
                      </button>
                      {compressedImage && (
                        <button
                          type="button"
                          onClick={() => setActiveView('compressed')}
                          className={`relative z-10 flex items-center gap-1.5 px-4 md:px-5 py-2 rounded-full text-xs font-bold transition-all duration-300 ${
                            activeView === 'compressed' ? 'text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          <Zap className="w-3.5 h-3.5" />
                          Compressed Result
                        </button>
                      )}
                      
                      {/* Animated Slider Background */}
                      <div 
                        className="absolute top-1 bottom-1 bg-white rounded-full shadow-sm transition-all duration-300 ease-out"
                        style={{ 
                          width: compressedImage ? 'calc(50% - 4px)' : 'calc(100% - 8px)',
                          transform: activeView === 'original' ? 'translateX(0)' : 'translateX(100%)' 
                        }}
                      />
                    </div>
                    
                    <button 
                      type="button"
                      onClick={handleStartOver} 
                      className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors" 
                      title="Start Over"
                      aria-label="Start over with a new image"
                    >
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
                      src={activeView === 'original' ? originalImage.preview : compressedImage} 
                      alt={activeView === 'original' ? "Original uploaded image preview" : "Compressed image preview"}
                      className="max-w-full max-h-[50vh] md:max-h-full object-contain p-2 md:p-4 drop-shadow-2xl transition-all duration-300"
                    />

                    {/* Dynamic File Size Badge floating */}
                    <div className={`absolute bottom-4 right-4 backdrop-blur-md text-white text-[11px] font-mono font-medium px-3 py-1.5 rounded-lg shadow-lg transition-colors duration-300 ${activeView === 'original' ? 'bg-gray-900/80' : 'bg-emerald-600/90'}`}>
                      {activeView === 'original' 
                        ? `File Size: ${formatBytes(originalSize)}` 
                        : `File Size: ${formatBytes(compressedSize)}`
                      }
                    </div>
                  </div>
                </div>

                {/* Right Panel: Settings & Actions */}
                <div className="w-full lg:w-[360px] flex flex-col gap-4 shrink-0">
                  
                  {/* Settings Card */}
                  <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-xl shadow-emerald-500/5 border border-white p-6 md:p-8">
                    <div className="flex items-center gap-2 mb-6">
                      <Sliders className="w-5 h-5 text-emerald-600" />
                      <h3 className="text-lg font-bold text-gray-900">Compression Settings</h3>
                    </div>

                    <div className="space-y-6">
                      
                      {/* Quality Slider */}
                      <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-end">
                          <label htmlFor="quality-slider" className="text-sm font-bold text-gray-700">Quality Output</label>
                          <span className="text-xs font-mono font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">{quality}%</span>
                        </div>
                        <input
                          id="quality-slider"
                          type="range"
                          min="1"
                          max="100"
                          value={quality}
                          onChange={(e) => setQuality(parseInt(e.target.value, 10))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                          aria-label="Adjust image compression quality percentage"
                        />
                        <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          <span>Smaller File</span>
                          <span>Better Quality</span>
                        </div>
                      </div>

                      {/* Format Output Selection */}
                      <div className="flex flex-col gap-2 pt-2">
                        <label htmlFor="output-format-select" className="text-xs font-bold text-gray-600 uppercase tracking-wider">Export Format</label>
                        <select
                          id="output-format-select"
                          value={outputFormat}
                          onChange={(e) => setOutputFormat(e.target.value)}
                          className="w-full px-3 py-2 text-xs font-semibold border border-gray-200 rounded-xl bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer"
                        >
                          <option value="image/jpeg">JPG (Best for photos)</option>
                          <option value="image/png">PNG (Preserves transparency)</option>
                          <option value="image/webp">WebP (Modern web format)</option>
                        </select>
                      </div>

                      <div className="h-px bg-gray-100 my-2" />
                      
                      {/* Readonly Original Size Info */}
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <FileJson className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Original Size</p>
                          <p className="text-sm font-semibold text-gray-800">{formatBytes(originalSize)}</p>
                        </div>
                      </div>

                    </div>

                    {/* Primary Action Button */}
                    <button
                      type="button"
                      onClick={compressImage}
                      disabled={isCompressing}
                      className={`mt-6 w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 ${
                        isCompressing ? 'opacity-80 cursor-not-allowed' : ''
                      }`}
                    >
                      {isCompressing ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Compressing...</span>
                        </>
                      ) : (
                        <>
                          <ArrowDownToLine className="w-5 h-5" />
                          <span>Compress Image</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Results & Download Card */}
                  {compressedImage && (
                    <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-xl shadow-green-500/5 border border-white p-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
                      
                      <div className="flex flex-col gap-1.5 mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-gray-500">New File Size</span>
                          <span className="text-sm font-bold text-gray-900">{formatBytes(compressedSize)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-gray-500">Space Reduction</span>
                          <span className={`text-sm font-bold ${isSizeReduced ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {isSizeReduced ? `${reductionValue}%` : 'Already Optimal'}
                          </span>
                        </div>
                      </div>

                      <div className="w-full bg-gray-100 rounded-full h-1.5 mb-5 overflow-hidden">
                        <div 
                          className={`h-1.5 rounded-full transition-all duration-300 ${isSizeReduced ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                          style={{ width: `${Math.min(100, Math.max(5, 100 - reductionValue))}%` }}
                        />
                      </div>

                      <button
                        type="button"
                        onClick={downloadImage}
                        className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold shadow-lg shadow-gray-900/20 hover:shadow-gray-900/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                      >
                        <Download className="w-5 h-5 text-gray-300" />
                        <span>Download {getFileExtension(outputFormat).toUpperCase()}</span>
                      </button>
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        </div>

        {/* ==================================================== */}
        {/*           TECHNICAL SEO CONTENT SECTIONS            */}
        {/* ==================================================== */}
        <footer className="w-full bg-white/70 backdrop-blur-md border-t border-gray-200/80 mt-12 py-12 md:py-16 text-gray-800">
          <div className="container mx-auto px-4 max-w-5xl space-y-16">
            
            {/* SECTION 1: HOW TO COMPRESS AN IMAGE ONLINE */}
            <section className="space-y-6">
              <div className="text-center max-w-2xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                  How to Compress an Image Online
                </h2>
                <p className="text-xs md:text-sm text-gray-500 mt-2 font-medium">
                  Follow these four simple steps to reduce photo file sizes in seconds without installing complex desktop software.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-md shadow-gray-100/80 flex flex-col relative group">
                  <span className="text-3xl font-black text-emerald-100 group-hover:text-emerald-500/20 transition-colors mb-2">01</span>
                  <h3 className="text-sm font-bold text-gray-900 mb-1">Upload Your Photo</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Select or drag and drop your JPG, PNG, or WebP image directly into the uploader area.
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-md shadow-gray-100/80 flex flex-col relative group">
                  <span className="text-3xl font-black text-emerald-100 group-hover:text-emerald-500/20 transition-colors mb-2">02</span>
                  <h3 className="text-sm font-bold text-gray-900 mb-1">Adjust Quality</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Use the interactive quality slider to balance lower file size with crisp visual detail.
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-md shadow-gray-100/80 flex flex-col relative group">
                  <span className="text-3xl font-black text-emerald-100 group-hover:text-emerald-500/20 transition-colors mb-2">03</span>
                  <h3 className="text-sm font-bold text-gray-900 mb-1">Compress File</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Click 'Compress Image' to trigger instant browser canvas rendering and re-encoding.
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-md shadow-gray-100/80 flex flex-col relative group">
                  <span className="text-3xl font-black text-emerald-100 group-hover:text-emerald-500/20 transition-colors mb-2">04</span>
                  <h3 className="text-sm font-bold text-gray-900 mb-1">Download Image</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Preview your compressed image, compare the file size savings, and download the output file.
                  </p>
                </div>
              </div>
            </section>

            {/* SECTION 2: WHY USE OUR IMAGE COMPRESSOR */}
            <section className="space-y-6">
              <div className="text-center max-w-2xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                  Why Use Our Image Compressor
                </h2>
                <p className="text-xs md:text-sm text-gray-500 mt-2 font-medium">
                  Built for modern web developers, content creators, and marketers who demand speed, security, and quality control.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
                    <Zap className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-1.5">Precise Quality Control</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Fine-tune target quality factors in real time to reach optimal file size reduction without visible compression artifacts.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                  <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center mb-4">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-1.5">Browser-Side Processing</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    All re-encoding executes locally using browser canvas memory. Your graphics are never uploaded or stored remotely.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                  <div className="w-10 h-10 bg-cyan-50 text-cyan-600 rounded-xl flex items-center justify-center mb-4">
                    <Layers className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-1.5">Multiple Export Formats</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Seamlessly switch output encodings between JPG, PNG, and WebP formats to fit specific platform requirements.
                  </p>
                </div>
              </div>
            </section>

            {/* SECTION 3: IMAGE COMPRESSION & QUALITY */}
            <section className="bg-gradient-to-br from-emerald-900 to-teal-900 rounded-3xl p-6 md:p-10 text-white relative overflow-hidden shadow-xl">
              <div className="relative z-10 max-w-3xl space-y-4">
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                  Understanding Image Compression & Quality
                </h2>
                <p className="text-xs md:text-sm text-emerald-100 leading-relaxed">
                  Image compression decreases raw file size by stripping redundant image metadata and applying mathematical encoding algorithms. Depending on your choice of format and quality settings, compression uses lossy or lossless techniques to balance fidelity against storage consumption.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10">
                    <h3 className="text-xs font-bold text-emerald-200 uppercase tracking-wider mb-1">Lossy Encoding (JPG / WebP)</h3>
                    <p className="text-xs text-gray-200">
                      Removes subtle color variations difficult for the human eye to perceive, yielding maximum file size reduction.
                    </p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10">
                    <h3 className="text-xs font-bold text-emerald-200 uppercase tracking-wider mb-1">Transparency Support (PNG / WebP)</h3>
                    <p className="text-xs text-gray-200">
                      Preserves essential alpha channels for graphics with transparent backgrounds while optimizing palette bit depths.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 4: WHEN SHOULD YOU COMPRESS IMAGES */}
            <section className="space-y-6">
              <div className="text-center max-w-2xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                  When Should You Compress Images?
                </h2>
                <p className="text-xs md:text-sm text-gray-500 mt-2 font-medium">
                  Optimizing images benefits core website web vitals, digital marketing campaigns, and storage efficiency.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm flex items-start gap-4">
                  <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-1">Website Speed & SEO Performance</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Lighter images reduce Largest Contentful Paint (LCP) times, helping pages load faster and rank better on search engines.
                    </p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm flex items-start gap-4">
                  <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-1">Email Attachments & Online Applications</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Meets strict upload file size limits on job portals, visa applications, and email attachments without sacrificing clarity.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 5: ACCESSIBLE FAQ SECTION */}
            <section className="space-y-6">
              <div className="text-center max-w-2xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center justify-center gap-2">
                  <HelpCircle className="w-6 h-6 text-emerald-600" />
                  Frequently Asked Questions
                </h2>
                <p className="text-xs md:text-sm text-gray-500 mt-2 font-medium">
                  Common questions regarding image compression, quality settings, privacy, and file formats.
                </p>
              </div>

              <div className="space-y-3 max-w-3xl mx-auto">
                <details className="group bg-white rounded-2xl border border-gray-200/80 shadow-sm p-4 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex items-center justify-between font-bold text-gray-900 text-xs md:text-sm cursor-pointer select-none">
                    <span>How do I compress an image online?</span>
                    <span className="ml-2 text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="mt-3 text-xs md:text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-3">
                    Upload your photo, adjust the quality slider to your desired percentage, and click 'Compress Image' to generate a downloadable compressed result.
                  </p>
                </details>

                <details className="group bg-white rounded-2xl border border-gray-200/80 shadow-sm p-4 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex items-center justify-between font-bold text-gray-900 text-xs md:text-sm cursor-pointer select-none">
                    <span>Does image compression reduce visual quality?</span>
                    <span className="ml-2 text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="mt-3 text-xs md:text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-3">
                    Moderate quality levels (70%–85%) deliver huge file size reductions with almost zero noticeable loss in visual quality.
                  </p>
                </details>

                <details className="group bg-white rounded-2xl border border-gray-200/80 shadow-sm p-4 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex items-center justify-between font-bold text-gray-900 text-xs md:text-sm cursor-pointer select-none">
                    <span>Are my uploaded photos secure and private?</span>
                    <span className="ml-2 text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="mt-3 text-xs md:text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-3">
                    Yes. All compression logic executes locally inside your web browser. Your files never touch external servers or cloud storage.
                  </p>
                </details>

                <details className="group bg-white rounded-2xl border border-gray-200/80 shadow-sm p-4 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex items-center justify-between font-bold text-gray-900 text-xs md:text-sm cursor-pointer select-none">
                    <span>Which image formats are supported?</span>
                    <span className="ml-2 text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="mt-3 text-xs md:text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-3">
                    Our compressor supports JPG, PNG, and WebP formats. You can also select your preferred target export encoding.
                  </p>
                </details>

                <details className="group bg-white rounded-2xl border border-gray-200/80 shadow-sm p-4 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex items-center justify-between font-bold text-gray-900 text-xs md:text-sm cursor-pointer select-none">
                    <span>Why is my compressed image larger than the original?</span>
                    <span className="ml-2 text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="mt-3 text-xs md:text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-3">
                    If an image is already heavily compressed, re-encoding it at high quality settings can occasionally increase the file size slightly.
                  </p>
                </details>

                <details className="group bg-white rounded-2xl border border-gray-200/80 shadow-sm p-4 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex items-center justify-between font-bold text-gray-900 text-xs md:text-sm cursor-pointer select-none">
                    <span>Is this image compressor free?</span>
                    <span className="ml-2 text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="mt-3 text-xs md:text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-3">
                    Yes, our image compression tool is 100% free with no daily limits or sign-up required.
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

export default ImageCompressor