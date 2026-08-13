import React, { useState, useRef } from 'react'
import { 
  Download, RotateCcw, RefreshCw, Image as ImageIcon, Sparkles, 
  CheckCircle, FileType2, Zap, FileJson, HelpCircle, ShieldCheck, 
  Layers, Check
} from 'lucide-react'
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
    { value: 'png', label: 'PNG', mime: 'image/png', extension: 'png', badge: 'Lossless' },
    { value: 'jpg', label: 'JPEG', mime: 'image/jpeg', extension: 'jpg', badge: 'Popular' },
    { value: 'webp', label: 'WEBP', mime: 'image/webp', extension: 'webp', badge: 'Modern' }
  ]

  const handleImageUpload = (image) => {
    let rawFormat = image.file.type.split('/')[1]?.toLowerCase() || 'jpg'
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
    if (!originalImage || isProcessing) return
    setIsProcessing(true)

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = originalImage.preview
    img.onload = () => {
      const canvas = canvasRef.current
      if (!canvas) {
        setIsProcessing(false)
        return
      }
      const ctx = canvas.getContext('2d')
      
      canvas.width = img.width
      canvas.height = img.height

      const selectedFormat = formats.find(f => f.value === format)

      // Add a white background if converting a transparent image to JPG
      if (selectedFormat.value === 'jpg') {
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }

      ctx.drawImage(img, 0, 0)
      
      canvas.toBlob((blob) => {
        setIsProcessing(false)
        if (!blob) {
          toast.error('Failed to convert image format.')
          return;
        }
        const url = URL.createObjectURL(blob)
        setConvertedImage(url)
        setActiveView('converted')
        toast.success(`Successfully converted to ${selectedFormat.label}!`, { icon: '✨' })
      }, selectedFormat.mime, 1)
    }

    img.onerror = () => {
      setIsProcessing(false)
      toast.error('Failed to load image for conversion.')
    }
  }

  const downloadImage = () => {
    if (convertedImage) {
      const selectedFormat = formats.find(f => f.value === format)
      const link = document.createElement('a')
      link.download = `converted-${Date.now()}.${selectedFormat.extension}`
      link.href = convertedImage
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success('Image downloaded successfully!', { icon: '🎉' })
    }
  }

  const handleStartOver = () => {
    if (convertedImage) {
      URL.revokeObjectURL(convertedImage)
    }
    setOriginalImage(null)
    setConvertedImage(null)
    setOriginalFormat('')
    setFormat('png')
    setActiveView('original')
  }

  // Structured Data Schemas for SEO
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

  const webApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Online Image Converter - Uploadio",
    "url": "https://Uploadio.com/image-converter",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "All",
    "browserRequirements": "Requires JavaScript. Requires HTML5 Canvas.",
    "description": "Free web-based tool to convert images between PNG, JPG, and WEBP formats online in your browser without uploading to external servers.",
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
        "name": "How do I convert an image online?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Upload your file, select your desired target format (PNG, JPG, or WEBP), and click 'Convert Image'. Once processing is complete, download your converted file instantly."
        }
      },
      {
        "@type": "Question",
        "name": "Can I convert JPG images to PNG?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. You can convert JPG images to PNG format instantly using our browser-based conversion tool."
        }
      },
      {
        "@type": "Question",
        "name": "Can I convert PNG images to JPG?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. Converting PNG to JPG is fully supported. If your PNG contains transparency, transparent areas will automatically be filled with a solid white background."
        }
      },
      {
        "@type": "Question",
        "name": "Can I convert WEBP images to JPG or PNG?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. WEBP images can easily be converted to either PNG or JPG formats."
        }
      },
      {
        "@type": "Question",
        "name": "Will converting an image change its resolution or dimensions?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No. The converter preserves your image's exact original pixel dimensions and aspect ratio during format conversion."
        }
      },
      {
        "@type": "Question",
        "name": "Are my images safe and private?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. All format conversions take place locally inside your web browser memory using HTML5 canvas. Your files are never uploaded to remote servers."
        }
      },
      {
        "@type": "Question",
        "name": "Is this online image converter free?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. The Image Converter tool is 100% free with no registration or usage limits required."
        }
      }
    ]
  }

  return (
    <>
      <SEO 
        title="Image Converter – Convert JPG, PNG & WEBP Online Free | Uploadio"
        description="Convert JPG, PNG and WEBP images online for free. Upload your image, choose the format, preview the result and download your converted file instantly."
        url="https://Uploadio.com/image-converter"
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

      {/* Main Container - Scrollable & Modern */}
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 relative font-sans flex flex-col pb-16 md:pb-20 overflow-x-hidden">
        
        {/* Subtle background dotted pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none" 
          style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }} 
        />

        {/* Ambient Glowing Blobs */}
        <div className="absolute top-0 left-1/4 w-[350px] md:w-[500px] h-[350px] md:h-[500px] bg-orange-400/20 rounded-full blur-[90px] md:blur-[120px] pointer-events-none -translate-y-1/2" />
        <div className="absolute bottom-1/3 right-1/4 w-[350px] md:w-[500px] h-[350px] md:h-[500px] bg-rose-400/20 rounded-full blur-[90px] md:blur-[120px] pointer-events-none" />

        {/* Hidden Canvas for Processing */}
        <canvas ref={canvasRef} className="hidden" />

        <div className="flex-1 flex flex-col container mx-auto px-4 pt-8 md:pt-14 relative z-10 max-w-5xl">
          
          {/* Hero Section */}
          <header className="text-center mb-8 md:mb-10 shrink-0 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-4 duration-700">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 border border-orange-100 rounded-full text-orange-600 font-bold text-xs mb-3 shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Universal Image Utility</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-rose-500 to-pink-600 tracking-tight">
              Universal Image Converter
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-gray-500 max-w-xl mx-auto font-medium leading-relaxed">
              Seamlessly switch between PNG, JPG, and WEBP formats instantly. No quality loss, 100% free.
            </p>
          </header>

          <div className="flex-1 flex flex-col w-full max-w-5xl mx-auto">
            {!originalImage ? (
              // Upload Stage
              <div className="flex flex-col items-center motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 duration-500 w-full">
                
                {/* Compact Uploader Wrapper */}
                <div className="w-full max-w-md shrink-0 mb-8 md:mb-10">
                  <ImageUploader onImageUpload={handleImageUpload} theme="orange" />
                </div>
                
                {/* Features Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 w-full max-w-3xl shrink-0 px-2">
                  <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 md:p-5 border border-white shadow-lg shadow-gray-200/50 flex items-center gap-4 hover:-translate-y-0.5 transition-transform duration-200">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-orange-400 to-rose-500 rounded-xl flex items-center justify-center shrink-0 shadow-md shadow-orange-500/30 text-white">
                      <FileType2 className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div>
                      <h3 className="text-xs md:text-sm font-bold text-gray-900 mb-0.5">Popular Formats</h3>
                      <p className="text-[11px] md:text-xs text-gray-500 font-medium">PNG, JPG & WEBP support.</p>
                    </div>
                  </div>
                  
                  <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 md:p-5 border border-white shadow-lg shadow-gray-200/50 flex items-center gap-4 hover:-translate-y-0.5 transition-transform duration-200">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-rose-500 to-pink-500 rounded-xl flex items-center justify-center shrink-0 shadow-md shadow-rose-500/30 text-white">
                      <Sparkles className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div>
                      <h3 className="text-xs md:text-sm font-bold text-gray-900 mb-0.5">Pristine Quality</h3>
                      <p className="text-[11px] md:text-xs text-gray-500 font-medium">Maintains max clarity.</p>
                    </div>
                  </div>
                  
                  <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 md:p-5 border border-white shadow-lg shadow-gray-200/50 sm:col-span-2 md:col-span-1 flex items-center gap-4 hover:-translate-y-0.5 transition-transform duration-200">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl flex items-center justify-center shrink-0 shadow-md shadow-pink-500/30 text-white">
                      <Zap className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div>
                      <h3 className="text-xs md:text-sm font-bold text-gray-900 mb-0.5">Lightning Fast</h3>
                      <p className="text-[11px] md:text-xs text-gray-500 font-medium">Instant browser processing.</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Editor Stage (Side-by-Side Layout)
              <div className="flex flex-col lg:flex-row gap-6 motion-safe:animate-in motion-safe:fade-in duration-300 w-full">
                
                {/* Left Panel: Preview Area */}
                <div className="flex-1 flex flex-col bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-xl shadow-rose-500/5 border border-white p-4 md:p-6 min-h-[380px] md:min-h-[450px]">
                  
                  {/* Segmented Toggle for Preview */}
                  <div className="shrink-0 flex justify-between items-center mb-4">
                    <div className="bg-gray-100/80 backdrop-blur-md p-1 rounded-full inline-flex relative shadow-inner">
                      <button
                        type="button"
                        onClick={() => setActiveView('original')}
                        aria-pressed={activeView === 'original'}
                        className={`relative z-10 flex items-center gap-1.5 px-4 md:px-5 py-2 rounded-full text-xs font-bold transition-colors duration-200 ${
                          activeView === 'original' ? 'text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        Original
                      </button>
                      {convertedImage && (
                        <button
                          type="button"
                          onClick={() => setActiveView('converted')}
                          aria-pressed={activeView === 'converted'}
                          className={`relative z-10 flex items-center gap-1.5 px-4 md:px-5 py-2 rounded-full text-xs font-bold transition-colors duration-200 ${
                            activeView === 'converted' ? 'text-rose-700 shadow-xs' : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          Converted
                        </button>
                      )}
                      
                      {/* Animated Slider Background */}
                      <div 
                        className="absolute top-1 bottom-1 bg-white rounded-full shadow-xs transition-transform duration-300 ease-out"
                        style={{ 
                          width: convertedImage ? 'calc(50% - 4px)' : 'calc(100% - 8px)',
                          transform: activeView === 'original' ? 'translateX(0)' : 'translateX(100%)' 
                        }}
                      />
                    </div>
                    
                    <button 
                      type="button"
                      onClick={handleStartOver} 
                      className="text-gray-400 hover:text-rose-500 p-2 rounded-full hover:bg-rose-50 transition-colors" 
                      title="Start Over"
                      aria-label="Start over with a new image"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Image Display */}
                  <div className="flex-1 relative w-full h-[320px] sm:h-[380px] md:h-[420px] rounded-3xl overflow-hidden bg-gray-50/50 border border-gray-100 flex items-center justify-center group">
                    {/* Checkerboard Background for transparent elements */}
                    <div 
                      className="absolute inset-0 opacity-[0.04] pointer-events-none" 
                      style={{ 
                        backgroundImage: 'repeating-linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), repeating-linear-gradient(45deg, #000 25%, #fff 25%, #fff 75%, #000 75%, #000)', 
                        backgroundPosition: '0 0, 10px 10px', 
                        backgroundSize: '20px 20px' 
                      }} 
                    />

                    {isProcessing ? (
                      <div className="flex flex-col items-center justify-center z-10">
                        <div className="w-10 h-10 md:w-12 md:h-12 border-4 border-rose-100 border-t-rose-500 rounded-full animate-spin mb-3 shadow-sm" />
                        <span className="text-xs md:text-sm font-bold text-rose-500 animate-pulse">Converting format...</span>
                      </div>
                    ) : (
                      <img 
                        src={activeView === 'original' ? originalImage.preview : convertedImage} 
                        alt={activeView === 'original' ? "Original uploaded image preview" : "Converted image preview"}
                        className="max-w-full max-h-full object-contain p-3 md:p-4 drop-shadow-xl transition-opacity duration-300"
                      />
                    )}

                    {/* Format Badge floating */}
                    <div className={`absolute bottom-3 right-3 md:bottom-4 md:right-4 backdrop-blur-md text-white text-[10px] md:text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 md:px-3 md:py-1.5 rounded-lg shadow-lg transition-colors duration-300 ${activeView === 'original' ? 'bg-gray-900/80' : 'bg-rose-500/90'}`}>
                      {activeView === 'original' ? originalFormat : format}
                    </div>
                  </div>
                </div>

                {/* Right Panel: Settings & Actions */}
                <div className="w-full lg:w-[360px] flex flex-col gap-4 md:gap-6 shrink-0">
                  
                  {/* Settings Card */}
                  <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-xl shadow-rose-500/5 border border-white p-5 md:p-8">
                    <div className="flex items-center gap-2 mb-5 md:mb-6">
                      <div className="p-2 bg-rose-50 rounded-xl text-rose-500 shadow-xs">
                        <FileType2 className="w-5 h-5" />
                      </div>
                      <h2 className="text-base md:text-lg font-bold text-gray-900">Conversion Settings</h2>
                    </div>

                    <div className="space-y-5 md:space-y-6">
                      
                      {/* Current Format Readout */}
                      <div className="flex items-center gap-3.5 p-3.5 md:p-4 bg-gray-50 rounded-2xl border border-gray-100 shadow-xs">
                        <div className="p-2.5 bg-white rounded-xl shadow-xs border border-gray-100">
                          <FileJson className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Current Format</p>
                          <p className="text-xs md:text-sm font-semibold text-gray-800">{originalFormat} Image</p>
                        </div>
                      </div>

                      {/* Format Selector Grid */}
                      <div className="space-y-2.5">
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">
                          Convert To Target Format
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {formats.map((f) => {
                            const isSelected = format === f.value
                            return (
                              <button
                                key={f.value}
                                type="button"
                                onClick={() => setFormat(f.value)}
                                aria-pressed={isSelected}
                                className={`
                                  relative py-3 px-2 rounded-xl font-bold text-xs transition-all duration-200 border-2 flex flex-col items-center justify-center gap-0.5
                                  ${isSelected
                                    ? 'bg-rose-50 border-rose-500 text-rose-600 shadow-xs scale-[1.02]'
                                    : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200 hover:bg-gray-50 hover:text-gray-700'
                                  }
                                `}
                              >
                                {isSelected && (
                                  <span className="absolute top-1 right-1 text-rose-500">
                                    <Check className="w-3 h-3" />
                                  </span>
                                )}
                                <span className="text-sm">{f.label}</span>
                                <span className={`text-[9px] font-medium ${isSelected ? 'text-rose-500' : 'text-gray-400'}`}>
                                  {f.badge}
                                </span>
                              </button>
                            )
                          })}
                        </div>
                      </div>

                    </div>

                    {/* Primary Action Button */}
                    <button
                      type="button"
                      onClick={convertImage}
                      disabled={format === originalFormat?.toLowerCase() || isProcessing}
                      className="mt-6 md:mt-8 w-full bg-gradient-to-r from-orange-500 via-rose-500 to-pink-600 text-white py-3.5 md:py-4 rounded-xl font-bold text-xs md:text-sm shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-rose-500/30 cursor-pointer disabled:cursor-not-allowed"
                    >
                      <RefreshCw className={`w-4 h-4 md:w-5 md:h-5 ${isProcessing ? 'animate-spin' : ''}`} />
                      <span>
                        {format === originalFormat?.toLowerCase() 
                          ? 'Already in this format' 
                          : `Convert to ${formats.find(f => f.value === format)?.label}`
                        }
                      </span>
                    </button>
                  </div>

                  {/* Results & Download Card */}
                  {convertedImage && (
                    <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-xl shadow-green-500/5 border border-white p-5 md:p-6 motion-safe:animate-in motion-safe:slide-in-from-bottom-3 duration-300">
                      <div className="flex items-center justify-center gap-2 text-xs md:text-sm font-bold text-emerald-700 bg-emerald-50 py-2.5 md:py-3 rounded-xl mb-3 md:mb-4 border border-emerald-100 shadow-xs">
                        <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-emerald-500" />
                        <span>Converted Successfully!</span>
                      </div>
                      <button
                        type="button"
                        onClick={downloadImage}
                        className="w-full bg-gray-900 text-white py-3.5 md:py-4 rounded-xl font-bold text-xs md:text-sm shadow-lg shadow-gray-900/20 hover:shadow-gray-900/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        <Download className="w-4 h-4 md:w-5 md:h-5 text-gray-300" />
                        <span>Download {format.toUpperCase()}</span>
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
        <footer className="w-full bg-white/70 backdrop-blur-md border-t border-gray-200/80 mt-12 md:mt-16 py-12 md:py-16 text-gray-800">
          <div className="container mx-auto px-4 max-w-5xl space-y-12 md:space-y-16">
            
            {/* SECTION 1: HOW TO CONVERT IMAGES ONLINE */}
            <section className="space-y-6">
              <div className="text-center max-w-2xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                  How to Convert Images Online
                </h2>
                <p className="text-xs md:text-sm text-gray-500 mt-2 font-medium">
                  Convert image formats in four straightforward steps without installing desktop software.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-md shadow-gray-100/80 flex flex-col relative group">
                  <span className="text-3xl font-black text-rose-100 group-hover:text-rose-500/20 transition-colors mb-2">01</span>
                  <h3 className="text-sm font-bold text-gray-900 mb-1">Upload Image</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Select or drag and drop your JPG, PNG, or WEBP file into the upload canvas.
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-md shadow-gray-100/80 flex flex-col relative group">
                  <span className="text-3xl font-black text-rose-100 group-hover:text-rose-500/20 transition-colors mb-2">02</span>
                  <h3 className="text-sm font-bold text-gray-900 mb-1">Select Target Format</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Choose your target output format: PNG, JPEG, or WEBP.
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-md shadow-gray-100/80 flex flex-col relative group">
                  <span className="text-3xl font-black text-rose-100 group-hover:text-rose-500/20 transition-colors mb-2">03</span>
                  <h3 className="text-sm font-bold text-gray-900 mb-1">Convert Image</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Click 'Convert Image' to re-encode the file instantly in your browser memory.
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-md shadow-gray-100/80 flex flex-col relative group">
                  <span className="text-3xl font-black text-rose-100 group-hover:text-rose-500/20 transition-colors mb-2">04</span>
                  <h3 className="text-sm font-bold text-gray-900 mb-1">Download File</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Preview your converted graphic and download the file to your local device.
                  </p>
                </div>
              </div>
            </section>

            {/* SECTION 2: FORMAT DIFFERENCES */}
            <section className="space-y-6">
              <div className="text-center max-w-2xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                  Convert JPG, PNG and WEBP Images
                </h2>
                <p className="text-xs md:text-sm text-gray-500 mt-2 font-medium">
                  Choose the optimal image format tailored to your specific website or publishing needs.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col">
                  <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mb-4 font-bold text-sm">
                    JPG
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-1.5">JPEG / JPG Format</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Best for complex photography and general web imagery where small file size is prioritized over lossless sharpness.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col">
                  <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center mb-4 font-bold text-sm">
                    PNG
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-1.5">PNG Format</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Ideal for logos, vector graphics, screenshots, and illustrations requiring background alpha transparency.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col">
                  <div className="w-10 h-10 bg-pink-50 text-pink-600 rounded-xl flex items-center justify-center mb-4 font-bold text-sm">
                    WEBP
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-1.5">WEBP Format</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    A modern web image format developed by Google offering superior lossy and lossless compression efficiency for web pages.
                  </p>
                </div>
              </div>
            </section>

            {/* SECTION 3: WHY USE AN ONLINE CONVERTER */}
            <section className="space-y-6">
              <div className="text-center max-w-2xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                  Why Use Our Online Image Converter?
                </h2>
                <p className="text-xs md:text-sm text-gray-500 mt-2 font-medium">
                  Designed for speed, privacy, and simplicity directly inside your browser.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-start gap-4">
                  <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-1">Local Browser Processing</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Image conversions are processed locally using HTML5 client-side canvas rendering. Your original images never leave your computer.
                    </p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-start gap-4">
                  <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl shrink-0">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-1">No Installation Required</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Convert graphics across desktop and mobile browsers instantly without installing additional software plugins or apps.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 4: ACCESSIBLE FAQ SECTION */}
            <section className="space-y-6">
              <div className="text-center max-w-2xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center justify-center gap-2">
                  <HelpCircle className="w-6 h-6 text-rose-500" />
                  <span>Frequently Asked Questions</span>
                </h2>
                <p className="text-xs md:text-sm text-gray-500 mt-2 font-medium">
                  Find quick answers to common questions about online image format conversions.
                </p>
              </div>

              <div className="space-y-3 max-w-3xl mx-auto">
                <details className="group bg-white rounded-2xl border border-gray-200/80 shadow-xs p-4 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex items-center justify-between font-bold text-gray-900 text-xs md:text-sm cursor-pointer select-none">
                    <span>How do I convert an image online?</span>
                    <span className="ml-2 text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="mt-3 text-xs md:text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-3">
                    Upload your file, select your desired target format (PNG, JPG, or WEBP), and click 'Convert Image'. Once processing is complete, download your converted file instantly.
                  </p>
                </details>

                <details className="group bg-white rounded-2xl border border-gray-200/80 shadow-xs p-4 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex items-center justify-between font-bold text-gray-900 text-xs md:text-sm cursor-pointer select-none">
                    <span>Can I convert JPG images to PNG?</span>
                    <span className="ml-2 text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="mt-3 text-xs md:text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-3">
                    Yes. You can convert JPG images to PNG format instantly using our browser-based conversion tool.
                  </p>
                </details>

                <details className="group bg-white rounded-2xl border border-gray-200/80 shadow-xs p-4 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex items-center justify-between font-bold text-gray-900 text-xs md:text-sm cursor-pointer select-none">
                    <span>Can I convert PNG images to JPG?</span>
                    <span className="ml-2 text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="mt-3 text-xs md:text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-3">
                    Yes. Converting PNG to JPG is fully supported. If your PNG contains transparency, transparent areas will automatically be filled with a solid white background.
                  </p>
                </details>

                <details className="group bg-white rounded-2xl border border-gray-200/80 shadow-xs p-4 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex items-center justify-between font-bold text-gray-900 text-xs md:text-sm cursor-pointer select-none">
                    <span>Can I convert WEBP images to JPG or PNG?</span>
                    <span className="ml-2 text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="mt-3 text-xs md:text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-3">
                    Yes. WEBP images can easily be converted to either PNG or JPG formats.
                  </p>
                </details>

                <details className="group bg-white rounded-2xl border border-gray-200/80 shadow-xs p-4 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex items-center justify-between font-bold text-gray-900 text-xs md:text-sm cursor-pointer select-none">
                    <span>Will converting an image change its resolution or dimensions?</span>
                    <span className="ml-2 text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="mt-3 text-xs md:text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-3">
                    No. The converter preserves your image's exact original pixel dimensions and aspect ratio during format conversion.
                  </p>
                </details>

                <details className="group bg-white rounded-2xl border border-gray-200/80 shadow-xs p-4 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex items-center justify-between font-bold text-gray-900 text-xs md:text-sm cursor-pointer select-none">
                    <span>Are my images safe and private?</span>
                    <span className="ml-2 text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="mt-3 text-xs md:text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-3">
                    Yes. All format conversions take place locally inside your web browser memory using HTML5 canvas. Your files are never uploaded to remote servers.
                  </p>
                </details>

                <details className="group bg-white rounded-2xl border border-gray-200/80 shadow-xs p-4 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex items-center justify-between font-bold text-gray-900 text-xs md:text-sm cursor-pointer select-none">
                    <span>Is this online image converter free?</span>
                    <span className="ml-2 text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="mt-3 text-xs md:text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-3">
                    Yes. The Image Converter tool is 100% free with no registration or usage limits required.
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

export default ImageConverter