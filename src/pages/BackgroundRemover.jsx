import React, { useState } from 'react'
import { Download, RotateCcw, Sparkles, Eye, Wand2, CheckCircle, Image as ImageIcon, Palette } from 'lucide-react'
import toast from 'react-hot-toast'
import SEO from './SEO'
import ImageUploader from '../components/ImageUploader'
import { removeBackground } from '../services/backgroundRemoval'

const BackgroundRemover = () => {
  const [originalImage, setOriginalImage] = useState(null)
  const [processedImage, setProcessedImage] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeView, setActiveView] = useState('original') // 'original' | 'removed'
  const [bgColor, setBgColor] = useState('transparent')
  const [customColor, setCustomColor] = useState('#8B5CF6')

  const presetColors = [
    { id: 'transparent', hex: 'transparent', label: 'Transparent' },
    { id: 'white', hex: '#FFFFFF', label: 'White' },
    { id: 'gray', hex: '#F3F4F6', label: 'Light Gray' },
    { id: 'black', hex: '#000000', label: 'Black' },
    { id: 'blue', hex: '#3B82F6', label: 'Blue' },
    { id: 'pink', hex: '#EC4899', label: 'Pink' },
  ]

  const handleImageUpload = (image) => {
    setOriginalImage(image)
    setProcessedImage(null)
    setActiveView('original')
    setBgColor('transparent')
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
      
      toast.success('Background removed successfully!', { icon: '✨' })
    } catch (error) {
      console.error('Background removal failed:', error)
      toast.error('Failed to remove background. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadImage = () => {
    if (!processedImage) return

    if (bgColor === 'transparent') {
      // Download as transparent PNG
      const link = document.createElement('a')
      link.download = `removed-bg-${Date.now()}.png`
      link.href = processedImage
      link.click()
      toast.success('Transparent PNG downloaded successfully!', { icon: '🎉' })
      return
    }

    // Composite solid color background
    const toastId = toast.loading('Applying background color...')
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')

      // Draw background color
      ctx.fillStyle = bgColor
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Draw image on top
      ctx.drawImage(img, 0, 0)

      const link = document.createElement('a')
      link.download = `colored-bg-${Date.now()}.jpg`
      link.href = canvas.toDataURL('image/jpeg', 0.95)
      link.click()
      toast.success('Image downloaded successfully!', { id: toastId, icon: '🎉' })
    }
    img.onerror = () => toast.error('Failed to apply background color', { id: toastId })
    img.src = processedImage
  }

  const resetUploader = () => {
    setOriginalImage(null)
    setProcessedImage(null)
    setActiveView('original')
    setBgColor('transparent')
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
        title="Background Remover - Remove Image Background with AI"
        description="Remove background from any image instantly with AI. Get transparent PNG results in seconds. Free and easy to use."
        url="https://Uploadio.com/background-remover"
      />
      
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </script>

      {/* Main Container - Fixed Height avoiding overlap */}
      <div className="min-h-[calc(100vh-4rem)] lg:min-h-[calc(100vh-5rem)] bg-gradient-to-br from-gray-50 to-gray-100 relative font-sans flex flex-col pb-12 overflow-x-hidden">
        
        {/* Subtle background dotted pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none" 
          style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }} 
        />

        {/* Ambient Glowing Blobs */}
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-purple-400/20 rounded-full blur-[100px] pointer-events-none -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-pink-400/20 rounded-full blur-[100px] pointer-events-none translate-y-1/2" />

        <div className="flex-1 flex flex-col container mx-auto px-4 pt-8 md:pt-12 relative z-10 w-full max-w-6xl">
            
          {/* Header Section */}
          <div className="text-center mb-8 md:mb-10 shrink-0 animate-in fade-in slide-in-from-top-4 duration-700">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 tracking-tight">
              AI Background Remover
            </h1>
            <p className="text-sm text-gray-500 max-w-xl mx-auto font-medium">
              Extract subjects instantly with pixel-perfect AI precision. 100% automatic.
            </p>
          </div>

          <div className="flex-1 flex flex-col w-full mx-auto">
            
            {!originalImage ? (
              // Upload Stage
              <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-500 w-full">
                
                {/* Uploader Wrapper */}
                <div className="w-full max-w-lg shrink-0 mb-8">
                  <ImageUploader onImageUpload={handleImageUpload} theme="purple" />
                </div>
                
                {/* Features Grid (Ultra Compact Horizontal Layout) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full max-w-3xl shrink-0 px-2">
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-3 border border-white shadow-lg shadow-gray-200/50 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shrink-0 shadow-md shadow-purple-500/30">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xs font-bold text-gray-900">AI Precision</h3>
                      <p className="text-[10px] text-gray-500 font-medium">Detects fine edges perfectly.</p>
                    </div>
                  </div>
                  
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-3 border border-white shadow-lg shadow-gray-200/50 hidden md:flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shrink-0 shadow-md shadow-blue-500/30">
                      <Eye className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xs font-bold text-gray-900">Live Preview</h3>
                      <p className="text-[10px] text-gray-500 font-medium">Compare instantly.</p>
                    </div>
                  </div>
                  
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-3 border border-white shadow-lg shadow-gray-200/50 hidden md:flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/30">
                      <Palette className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xs font-bold text-gray-900">Custom Colors</h3>
                      <p className="text-[10px] text-gray-500 font-medium">Add solid backgrounds.</p>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              // Editor Stage (Side-by-Side Layout)
              <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0 animate-in fade-in zoom-in-95 duration-500">
                
                {/* Left Panel: Preview Area */}
                <div className="flex-1 flex flex-col bg-white/80 backdrop-blur-xl rounded-[1.5rem] md:rounded-[2rem] shadow-xl shadow-purple-500/5 border border-white p-3 md:p-5 min-h-[400px]">
                  
                  {/* Segmented Toggle for Preview */}
                  <div className="shrink-0 flex justify-between items-center mb-3">
                    <div className="bg-gray-100/80 backdrop-blur-md p-1 rounded-full inline-flex relative shadow-inner">
                      <button
                        onClick={() => setActiveView('original')}
                        className={`relative z-10 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
                          activeView === 'original' ? 'text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        Original
                      </button>
                      {processedImage && (
                        <button
                          onClick={() => setActiveView('removed')}
                          className={`relative z-10 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
                            activeView === 'removed' ? 'text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          Result
                        </button>
                      )}
                      {/* Animated Slider Background */}
                      <div 
                        className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-full shadow-sm transition-transform duration-300 ease-out"
                        style={{ transform: activeView === 'original' ? 'translateX(0)' : 'translateX(100%)' }}
                      />
                    </div>

                    <button onClick={resetUploader} className="text-gray-400 hover:text-purple-600 p-2 rounded-full hover:bg-purple-50 transition-colors" title="Start Over">
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Image Preview Container */}
                  <div 
                    className="flex-1 min-h-0 relative w-full rounded-2xl md:rounded-3xl overflow-hidden border border-gray-100 flex items-center justify-center group transition-colors duration-300"
                    style={{ backgroundColor: activeView === 'removed' && bgColor !== 'transparent' ? bgColor : '#f9fafb' }}
                  >
                    
                    {/* Dynamic Checkerboard Background */}
                    <div className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${activeView === 'removed' && bgColor === 'transparent' ? 'opacity-[0.06]' : 'opacity-0'}`} style={{ 
                      backgroundImage: 'repeating-linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), repeating-linear-gradient(45deg, #000 25%, #fff 25%, #fff 75%, #000 75%, #000)', 
                      backgroundPosition: '0 0, 10px 10px', 
                      backgroundSize: '20px 20px' 
                    }} />

                    {activeView === 'original' || !processedImage ? (
                      <img 
                        src={originalImage.preview} 
                        alt="Original"
                        className="max-w-full max-h-full object-contain p-2 md:p-4 drop-shadow-2xl transition-all duration-500"
                      />
                    ) : (
                      <img 
                        src={processedImage} 
                        alt="Processed"
                        className="max-w-full max-h-full object-contain p-2 md:p-4 drop-shadow-2xl transition-all duration-500 animate-in zoom-in-95"
                      />
                    )}
                    
                    {/* Glassmorphic Loading Overlay */}
                    {isProcessing && (
                      <div className="absolute inset-0 bg-white/60 backdrop-blur-md flex flex-col items-center justify-center z-20 transition-all duration-300">
                        <div className="relative mb-4">
                          <div className="absolute -inset-3 rounded-full border-4 border-transparent border-t-purple-600 border-r-pink-500 animate-[spin_1.5s_linear_infinite]" />
                          <div className="absolute -inset-3 rounded-full border-4 border-transparent border-b-blue-500 border-l-indigo-600 animate-[spin_2s_linear_infinite_reverse]" />
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/40 animate-pulse">
                            <Wand2 className="w-5 h-5 text-white" />
                          </div>
                        </div>
                        <h4 className="text-sm font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600 mb-1">
                          Extracting Subject...
                        </h4>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Panel: Settings & Actions */}
                <div className="w-full lg:w-[360px] flex flex-col gap-4 shrink-0">
                  
                  {/* Settings Card */}
                  <div className="bg-white/80 backdrop-blur-xl rounded-[1.5rem] md:rounded-[2rem] shadow-xl shadow-purple-500/5 border border-white p-5 md:p-6 transition-all duration-300">
                    <div className="flex items-center gap-2 mb-5">
                      <div className="p-1.5 bg-purple-50 rounded-lg text-purple-600">
                        <Palette className="w-4 h-4" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">Background Settings</h3>
                    </div>

                    <div className="space-y-6">
                      
                      {/* Color Picker Grid */}
                      <div className={`transition-opacity duration-300 ${!processedImage ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">Add Solid Color</label>
                        <div className="grid grid-cols-4 gap-2.5">
                          {/* Presets */}
                          {presetColors.map((c) => (
                            <button
                              key={c.id}
                              onClick={() => setBgColor(c.hex)}
                              title={c.label}
                              className={`
                                relative w-full aspect-square rounded-xl border-2 transition-all duration-200 hover:scale-105 shadow-sm
                                ${bgColor === c.hex ? 'border-purple-600 scale-105 shadow-md ring-2 ring-purple-600/20' : 'border-gray-200/80 hover:border-purple-300'}
                              `}
                              style={
                                c.hex === 'transparent' 
                                  ? { 
                                      backgroundImage: 'repeating-linear-gradient(45deg, #e5e7eb 25%, transparent 25%, transparent 75%, #e5e7eb 75%, #e5e7eb), repeating-linear-gradient(45deg, #e5e7eb 25%, #ffffff 25%, #ffffff 75%, #e5e7eb 75%, #e5e7eb)', 
                                      backgroundPosition: '0 0, 5px 5px', 
                                      backgroundSize: '10px 10px' 
                                    }
                                  : { backgroundColor: c.hex }
                              }
                            />
                          ))}
                          
                          {/* Custom Color Picker */}
                          <div 
                            title="Custom Color"
                            className={`
                              relative col-span-2 w-full h-full rounded-xl border-2 transition-all duration-200 overflow-hidden flex items-center justify-center group shadow-sm
                              ${bgColor === customColor ? 'border-purple-600 shadow-md ring-2 ring-purple-600/20' : 'border-gray-300 hover:border-purple-400'}
                            `}
                          >
                            <input
                              type="color"
                              value={customColor}
                              onChange={(e) => {
                                setCustomColor(e.target.value)
                                setBgColor(e.target.value)
                              }}
                              className="absolute inset-0 w-[200%] h-[200%] -top-[50%] -left-[50%] cursor-pointer opacity-0 z-10"
                            />
                            <div className="absolute inset-0 w-full h-full pointer-events-none" style={{ backgroundColor: customColor }} />
                            <span className={`z-0 font-bold text-xs pointer-events-none mix-blend-difference ${bgColor === customColor ? 'text-white' : 'text-gray-400'}`}>
                              Custom
                            </span>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Primary Action Button */}
                    <button
                      onClick={handleRemoveBackground}
                      disabled={isProcessing || !!processedImage}
                      className="mt-8 w-full bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-purple-500/30 disabled:hover:scale-100"
                    >
                      <Wand2 className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
                      {isProcessing ? 'Processing Magic...' : processedImage ? 'Background Removed' : 'Remove Background Now'}
                    </button>
                  </div>

                  {/* Results & Download Card (Appears after conversion) */}
                  {processedImage && (
                    <div className="bg-white/80 backdrop-blur-xl rounded-[1.5rem] md:rounded-[2rem] shadow-xl shadow-green-500/5 border border-white p-5 animate-in slide-in-from-bottom-4 fade-in duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]">
                      <div className="flex items-center justify-center gap-2 text-sm font-bold text-emerald-700 bg-emerald-50 py-2.5 rounded-xl mb-3 border border-emerald-100">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        Ready to Download!
                      </div>
                      <button
                        onClick={downloadImage}
                        className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-gray-900/20 hover:shadow-gray-900/40 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <Download className="w-4 h-4 text-gray-300" />
                        Download {bgColor === 'transparent' ? 'PNG' : 'JPG'}
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

export default BackgroundRemover