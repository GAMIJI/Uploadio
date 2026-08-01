import React, { useState, useRef } from 'react'
import { Download, RotateCcw, Sliders, Image as ImageIcon, Sparkles, CheckCircle, ArrowDownToLine, Zap, FileJson } from 'lucide-react'
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
  const canvasRef = useRef(null)

  const handleImageUpload = (image) => {
    setOriginalSize(image.file.size)
    const reader = new FileReader()
    reader.onload = (e) => {
      setOriginalImage({ preview: e.target.result, file: image.file })
      setCompressedImage(null)
      setActiveView('original')
    }
    reader.readAsDataURL(image.file)
  }

  const compressImage = () => {
    if (!originalImage) return

    const img = new Image()
    img.src = originalImage.preview
    img.onload = () => {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob)
        setCompressedImage(url)
        setCompressedSize(blob.size)
        setActiveView('compressed')
        
        const reduction = ((1 - blob.size / originalSize) * 100).toFixed(1)
        toast.success(`Compressed by ${reduction}%!`, { icon: '🚀' })
      }, 'image/jpeg', quality / 100)
    }
  }

  const downloadImage = () => {
    if (compressedImage) {
      const link = document.createElement('a')
      link.download = `compressed-${Date.now()}.jpg`
      link.href = compressedImage
      link.click()
      toast.success('Image downloaded successfully!', { icon: '🎉' })
    }
  }

  const handleStartOver = () => {
    setOriginalImage(null)
    setCompressedImage(null)
    setQuality(80)
    setOriginalSize(0)
    setCompressedSize(0)
    setActiveView('original')
  }

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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
      "name": "Image Compressor",
      "item": "https://Uploadio.com/image-compressor"
    }]
  }

  const calculateReduction = () => {
    if (!originalSize || !compressedSize) return 0;
    return ((1 - compressedSize / originalSize) * 100).toFixed(1);
  }

  return (
    <>
      <SEO 
        title="Image Compressor - Compress Images Online Free"
        description="Compress your images without losing quality. Reduce file size up to 80% while maintaining visual quality."
        url="https://Uploadio.com/image-compressor"
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
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl pointer-events-none translate-y-1/2" />

        {/* Hidden Canvas for Processing */}
        <canvas ref={canvasRef} className="hidden" />

        <div className="flex-1 flex flex-col container mx-auto px-4 py-8 md:py-12 relative z-10 min-h-0">
          
          {/* Header Section */}
          <div className="text-center mb-8 shrink-0 animate-in fade-in slide-in-from-top-4 duration-700">
            {/* <div className="inline-flex items-center justify-center p-2 bg-emerald-50 rounded-2xl mb-3 border border-emerald-100 shadow-sm">
              <ArrowDownToLine className="w-6 h-6 text-emerald-600" />
            </div> */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 tracking-tight">
              Smart Image Compressor
            </h1>
            <p className="text-sm md:text-base text-gray-500 max-w-xl mx-auto font-medium">
              Drastically reduce image file sizes without sacrificing visual fidelity. Perfect for web optimization.
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
                    <h3 className="text-sm font-bold mb-1 text-gray-900">Up to 80% Smaller</h3>
                    <p className="text-xs text-gray-500 font-medium">Massive file size reduction.</p>
                  </div>
                  
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white shadow-lg shadow-gray-200/50 flex flex-col items-center text-center hover:-translate-y-1 transition-transform hidden md:flex">
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center mb-3 shadow-md shadow-teal-500/30">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-sm font-bold mb-1 text-gray-900">Lossless Feel</h3>
                    <p className="text-xs text-gray-500 font-medium">Maintains high visual quality.</p>
                  </div>
                  
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white shadow-lg shadow-gray-200/50 flex flex-col items-center text-center hover:-translate-y-1 transition-transform hidden md:flex">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center mb-3 shadow-md shadow-cyan-500/30">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-sm font-bold mb-1 text-gray-900">Web Optimized</h3>
                    <p className="text-xs text-gray-500 font-medium">Faster loading, better SEO.</p>
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
                        onClick={() => setActiveView('original')}
                        className={`relative z-10 flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-bold transition-all duration-300 ${
                          activeView === 'original' ? 'text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        Original
                      </button>
                      {compressedImage && (
                        <button
                          onClick={() => setActiveView('compressed')}
                          className={`relative z-10 flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-bold transition-all duration-300 ${
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
                      src={activeView === 'original' ? originalImage.preview : compressedImage} 
                      alt="Preview"
                      className="max-w-full max-h-full object-contain p-4 drop-shadow-2xl transition-all duration-300"
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
                      
                      <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-end">
                          <label className="text-sm font-bold text-gray-700">Quality Output</label>
                          <span className="text-xs font-mono font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">{quality}%</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="100"
                          value={quality}
                          onChange={(e) => setQuality(parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />
                        <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          <span>Smaller File</span>
                          <span>Better Quality</span>
                        </div>
                      </div>

                      <div className="h-px bg-gray-100 my-2" />
                      
                      {/* Readonly Original Size info for context */}
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
                      onClick={compressImage}
                      className="mt-6 w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                    >
                      <ArrowDownToLine className="w-5 h-5" />
                      Compress Image
                    </button>
                  </div>

                  {/* Results & Download Card (Appears after compression) */}
                  {compressedImage && (
                    <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-xl shadow-green-500/5 border border-white p-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
                      
                      <div className="flex flex-col gap-1 mb-5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-gray-500">New File Size</span>
                          <span className="text-sm font-bold text-gray-900">{formatBytes(compressedSize)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-gray-500">Space Saved</span>
                          <span className="text-sm font-bold text-emerald-600">{calculateReduction()}%</span>
                        </div>
                      </div>

                      <div className="w-full bg-gray-100 rounded-full h-1.5 mb-5 overflow-hidden">
                        <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${100 - calculateReduction()}%` }}></div>
                      </div>

                      <button
                        onClick={downloadImage}
                        className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold shadow-lg shadow-gray-900/20 hover:shadow-gray-900/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                      >
                        <Download className="w-5 h-5 text-gray-300" />
                        Download JPG
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

export default ImageCompressor