import React, { useState, useRef } from 'react'
import { Download, RotateCcw, RefreshCw, Image as ImageIcon, Sparkles, CheckCircle, FileType2, Zap, FileJson } from 'lucide-react'
import toast from 'react-hot-toast'
import SEO from './SEO'
import ImageUploader from '../components/ImageUploader'

const ImageConverter = () => {
  const [originalImage, setOriginalImage] = useState(null)
  const [convertedImage, setConvertedImage] = useState(null)
  const [format, setFormat] = useState('png')
  const [originalFormat, setOriginalFormat] = useState('')
  const [activeView, setActiveView] = useState('original') // 'original' | 'converted'
  const [isProcessing, setIsProcessing] = useState(false)
  const canvasRef = useRef(null)

  const formats = [
    { value: 'png', label: 'PNG', mime: 'image/png', extension: 'png' },
    { value: 'jpg', label: 'JPEG', mime: 'image/jpeg', extension: 'jpg' },
    { value: 'webp', label: 'WEBP', mime: 'image/webp', extension: 'webp' }
  ]

  const handleImageUpload = (image) => {
    let rawFormat = image.file.type.split('/')[1].toLowerCase()
    if (rawFormat === 'jpeg') rawFormat = 'jpg'
    
    setOriginalFormat(rawFormat.toUpperCase())
    const reader = new FileReader()
    reader.onload = (e) => {
      setOriginalImage({ preview: e.target.result, file: image.file })
      setConvertedImage(null)
      setActiveView('original')
    }
    reader.readAsDataURL(image.file)
  }

  const convertImage = () => {
    if (!originalImage) return
    setIsProcessing(true)

    const img = new Image()
    img.src = originalImage.preview
    img.onload = () => {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      
      canvas.width = img.width
      canvas.height = img.height

      const selectedFormat = formats.find(f => f.value === format)

      // Add a white background if converting a transparent image to JPG
      if (selectedFormat.value === 'jpg') {
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }

      ctx.drawImage(img, 0, 0)
      
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob)
        setConvertedImage(url)
        setActiveView('converted')
        setIsProcessing(false)
        toast.success(`Successfully converted to ${selectedFormat.label}!`, { icon: '✨' })
      }, selectedFormat.mime, 1)
    }
  }

  const downloadImage = () => {
    if (convertedImage) {
      const selectedFormat = formats.find(f => f.value === format)
      const link = document.createElement('a')
      link.download = `converted-${Date.now()}.${selectedFormat.extension}`
      link.href = convertedImage
      link.click()
      toast.success('Image downloaded successfully!', { icon: '🎉' })
    }
  }

  const handleStartOver = () => {
    setOriginalImage(null)
    setConvertedImage(null)
    setOriginalFormat('')
    setFormat('png')
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
      "name": "Image Converter",
      "item": "https://Uploadio.com/image-converter"
    }]
  }

  return (
    <>
      <SEO 
        title="Image Converter - Convert Images Online Free"
        description="Convert images between PNG, JPG, and WEBP formats instantly. Free online image converter with no registration."
        url="https://Uploadio.com/image-converter"
      />
      
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </script>

      {/* Main Container - Scrollable & Modern */}
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 relative font-sans flex flex-col pb-20 overflow-x-hidden">
        
        {/* Subtle background dotted pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none" 
          style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }} 
        />

        {/* Ambient Glowing Blobs (Sunset Theme) */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-orange-400/20 rounded-full blur-[120px] pointer-events-none -translate-y-1/2" />
        <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-rose-400/20 rounded-full blur-[120px] pointer-events-none" />

        {/* Hidden Canvas for Processing */}
        <canvas ref={canvasRef} className="hidden" />

        <div className="flex-1 flex flex-col container mx-auto px-4 pt-10 md:pt-16 relative z-10 max-w-5xl">
          
          {/* Header Section */}
          <div className="text-center mb-10 shrink-0 animate-in fade-in slide-in-from-top-4 duration-700 ease-out">
            {/* <div className="inline-flex items-center justify-center p-2 bg-orange-50 rounded-2xl mb-3 border border-orange-100 shadow-sm hover:scale-105 transition-transform">
              <FileType2 className="w-6 h-6 text-orange-600" />
            </div> */}
            <h1 className="text-3xl md:text-5xl font-extrabold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-rose-500 to-pink-600 tracking-tight">
              Universal Image Converter
            </h1>
            <p className="text-sm md:text-base text-gray-500 max-w-xl mx-auto font-medium">
              Seamlessly switch between PNG, JPG, and WEBP formats instantly. No quality loss, 100% free.
            </p>
          </div>

          <div className="flex-1 flex flex-col w-full max-w-5xl mx-auto">
            {!originalImage ? (
              // Upload Stage
              <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-700 ease-out w-full">
                
                {/* Compact Uploader Wrapper */}
                <div className="w-full max-w-md shrink-0 mb-10">
                  <ImageUploader onImageUpload={handleImageUpload} theme="orange" />
                </div>
                
                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl shrink-0 px-2">
                  <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 border border-white shadow-lg shadow-gray-200/50 flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-rose-500 rounded-xl flex items-center justify-center shrink-0 shadow-md shadow-orange-500/30 text-white">
                      <FileType2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 mb-0.5">Popular Formats</h3>
                      <p className="text-xs text-gray-500 font-medium">PNG, JPG & WEBP support.</p>
                    </div>
                  </div>
                  
                  <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 border border-white shadow-lg shadow-gray-200/50 hidden md:flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300">
                    <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-500 rounded-xl flex items-center justify-center shrink-0 shadow-md shadow-rose-500/30 text-white">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 mb-0.5">Pristine Quality</h3>
                      <p className="text-xs text-gray-500 font-medium">Maintains max clarity.</p>
                    </div>
                  </div>
                  
                  <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 border border-white shadow-lg shadow-gray-200/50 hidden md:flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300">
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl flex items-center justify-center shrink-0 shadow-md shadow-pink-500/30 text-white">
                      <Zap className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 mb-0.5">Lightning Fast</h3>
                      <p className="text-xs text-gray-500 font-medium">Instant browser processing.</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Editor Stage (Side-by-Side Layout, Fully Scrollable)
              <div className="flex flex-col lg:flex-row gap-6 animate-in fade-in zoom-in-95 duration-500 ease-out w-full">
                
                {/* Left Panel: Preview Area */}
                <div className="flex-1 flex flex-col bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-xl shadow-rose-500/5 border border-white p-5 md:p-6 min-h-[450px]">
                  
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
                      {convertedImage && (
                        <button
                          onClick={() => setActiveView('converted')}
                          className={`relative z-10 flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-bold transition-all duration-300 ${
                            activeView === 'converted' ? 'text-rose-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          Converted
                        </button>
                      )}
                      
                      {/* Animated Slider Background */}
                      <div 
                        className="absolute top-1 bottom-1 bg-white rounded-full shadow-sm transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                        style={{ 
                          width: convertedImage ? 'calc(50% - 4px)' : 'calc(100% - 8px)',
                          transform: activeView === 'original' ? 'translateX(0)' : 'translateX(100%)' 
                        }}
                      />
                    </div>
                    
                    <button onClick={handleStartOver} className="text-gray-400 hover:text-rose-500 p-2 rounded-full hover:bg-rose-50 transition-colors" title="Start Over">
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Image Display */}
                  <div className="flex-1 relative w-full h-[380px] md:h-[420px] rounded-3xl overflow-hidden bg-gray-50/50 border border-gray-100 flex items-center justify-center group">
                    {/* Checkerboard Background for transparent elements */}
                    <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ 
                      backgroundImage: 'repeating-linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), repeating-linear-gradient(45deg, #000 25%, #fff 25%, #fff 75%, #000 75%, #000)', 
                      backgroundPosition: '0 0, 10px 10px', 
                      backgroundSize: '20px 20px' 
                    }} />

                    {isProcessing ? (
                      <div className="flex flex-col items-center justify-center z-10 animate-in fade-in duration-300">
                        <div className="w-12 h-12 border-4 border-rose-100 border-t-rose-500 rounded-full animate-spin mb-3 shadow-lg" />
                        <span className="text-sm font-bold text-rose-500 animate-pulse">Converting format...</span>
                      </div>
                    ) : (
                      <img 
                        src={activeView === 'original' ? originalImage.preview : convertedImage} 
                        alt="Preview"
                        className="max-w-full max-h-full object-contain p-4 drop-shadow-2xl transition-opacity duration-500 animate-in fade-in"
                      />
                    )}

                    {/* Format Badge floating */}
                    <div className={`absolute bottom-4 right-4 backdrop-blur-md text-white text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-lg transition-colors duration-500 ${activeView === 'original' ? 'bg-gray-900/80' : 'bg-rose-500/90'}`}>
                      {activeView === 'original' ? originalFormat : format}
                    </div>
                  </div>
                </div>

                {/* Right Panel: Settings & Actions */}
                <div className="w-full lg:w-[360px] flex flex-col gap-6 shrink-0">
                  
                  {/* Settings Card */}
                  <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-xl shadow-rose-500/5 border border-white p-6 md:p-8 transition-all duration-300">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="p-2 bg-rose-50 rounded-xl text-rose-500 shadow-sm">
                        <FileType2 className="w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">Conversion Settings</h3>
                    </div>

                    <div className="space-y-6">
                      
                      <div className="flex items-center gap-3.5 p-4 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm transition-all hover:border-gray-200">
                        <div className="p-2.5 bg-white rounded-xl shadow-sm border border-gray-100">
                          <FileJson className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Current Format</p>
                          <p className="text-sm font-semibold text-gray-800">{originalFormat} Image</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">Convert To Target Format</label>
                        <div className="grid grid-cols-3 gap-2.5">
                          {formats.map((f) => (
                            <button
                              key={f.value}
                              onClick={() => setFormat(f.value)}
                              className={`
                                py-3 rounded-xl font-bold text-sm transition-all duration-300 border-2
                                ${format === f.value
                                  ? 'bg-rose-50 border-rose-500 text-rose-600 shadow-md shadow-rose-500/10 scale-[1.02]'
                                  : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200 hover:bg-gray-50 hover:text-gray-700'
                                }
                              `}
                            >
                              {f.label}
                            </button>
                          ))}
                        </div>
                      </div>

                    </div>

                    {/* Primary Action Button */}
                    <button
                      onClick={convertImage}
                      disabled={format === originalFormat?.toLowerCase() || isProcessing}
                      className="mt-8 w-full bg-gradient-to-r from-orange-500 via-rose-500 to-pink-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-rose-500/30 disabled:hover:scale-100"
                    >
                      <RefreshCw className={`w-5 h-5 ${isProcessing ? 'animate-spin' : ''}`} />
                      {format === originalFormat?.toLowerCase() 
                        ? 'Already in this format' 
                        : `Convert to ${formats.find(f => f.value === format)?.label}`
                      }
                    </button>
                  </div>

                  {/* Results & Download Card (Appears after conversion) */}
                  {convertedImage && (
                    <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-xl shadow-green-500/5 border border-white p-6 animate-in slide-in-from-bottom-4 fade-in duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]">
                      <div className="flex items-center justify-center gap-2 text-sm font-bold text-emerald-700 bg-emerald-50 py-3 rounded-xl mb-4 border border-emerald-100 shadow-sm">
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                        Converted Successfully!
                      </div>
                      <button
                        onClick={downloadImage}
                        className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold shadow-lg shadow-gray-900/20 hover:shadow-gray-900/40 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <Download className="w-5 h-5 text-gray-300" />
                        Download {format.toUpperCase()}
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

export default ImageConverter