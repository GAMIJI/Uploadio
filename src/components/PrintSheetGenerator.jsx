// src/components/PrintSheetGenerator.jsx
import React, { useState, useEffect, useRef } from 'react'
import { Download, Printer, ArrowLeft, Grid, ZoomIn, ZoomOut, Check, AlertCircle, LayoutGrid, Ruler, FileText, Printer as PrinterIcon, Settings2, Image as ImageIcon, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'
import jsPDF from 'jspdf'

const PrintSheetGenerator = ({
  passportPhoto,
  passportSize,
  onBack,
  onGenerate
}) => {
  const [paperSize, setPaperSize] = useState('4x6')
  const [copies, setCopies] = useState('auto')
  const [dpi, setDpi] = useState(300)
  const [layout, setLayout] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [showCutGuides, setShowCutGuides] = useState(true)
  const [showMargins, setShowMargins] = useState(true)
  const [spacing, setSpacing] = useState(0.125)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const previewCanvasRef = useRef(null)
  const imageRef = useRef(null)

  const dpiOptions = [
    { value: 150, label: '150 DPI (Draft)', quality: 'Low', fileSize: 'Small' },
    { value: 200, label: '200 DPI (Standard)', quality: 'Medium', fileSize: 'Medium' },
    { value: 300, label: '300 DPI (High Quality)', quality: 'High', fileSize: 'Large' },
    { value: 600, label: '600 DPI (Professional)', quality: 'Professional', fileSize: 'Very Large' },
    { value: 1200, label: '1200 DPI (Ultra HD)', quality: 'Ultra HD', fileSize: 'Extreme' }
  ]

  const paperSizes = {
    '4x6': { name: '4 × 6 inches', width: 4, height: 6, unit: 'inch', description: 'Standard photo paper' },
    '5x7': { name: '5 × 7 inches', width: 5, height: 7, unit: 'inch', description: 'Large photo paper' },
    'a4': { name: 'A4', width: 8.27, height: 11.69, unit: 'inch', description: 'Standard document paper' },
    'letter': { name: 'Letter', width: 8.5, height: 11, unit: 'inch', description: 'US Letter size' }
  }

  const copyOptions = [2, 4, 6, 8, 9, 10, 12, 16, 20, 'auto']

  // --- Core Logic (Unmodified) ---
  const getPhotoDimensionsInInches = () => {
    if (!passportSize) return { width: 1.38, height: 1.77 }
    if (passportSize.unit === 'mm') {
      return { width: passportSize.width / 25.4, height: passportSize.height / 25.4 }
    }
    return { width: passportSize.width, height: passportSize.height }
  }

  const calculateFitWithSpacing = () => {
    if (!passportSize) return { cols: 0, rows: 0, total: 0 }
    const paper = paperSizes[paperSize]
    const photo = getPhotoDimensionsInInches()
    const photoWidthWithSpacing = photo.width + spacing
    const photoHeightWithSpacing = photo.height + spacing
    const cols = Math.floor((paper.width + spacing) / photoWidthWithSpacing)
    const rows = Math.floor((paper.height + spacing) / photoHeightWithSpacing)
    return { cols, rows, total: cols * rows }
  }

  const calculateFit = () => {
    if (!passportSize) return { cols: 0, rows: 0, total: 0 }
    const paper = paperSizes[paperSize]
    const photo = getPhotoDimensionsInInches()
    const cols = Math.floor(paper.width / photo.width)
    const rows = Math.floor(paper.height / photo.height)
    return { cols, rows, total: cols * rows }
  }

  const generateLayout = () => {
    if (!passportPhoto || !passportSize) return null
    const paper = paperSizes[paperSize]
    const photo = getPhotoDimensionsInInches()
    const { cols, rows, total } = calculateFitWithSpacing()

    let actualCopies
    if (copies === 'auto') {
      actualCopies = total
    } else {
      actualCopies = Math.min(parseInt(copies), total)
    }

    if (cols === 0 || rows === 0) return null

    const totalWidth = cols * photo.width + (cols - 1) * spacing
    const totalHeight = rows * photo.height + (rows - 1) * spacing
    const marginX = (paper.width - totalWidth) / 2
    const marginY = (paper.height - totalHeight) / 2

    const layoutItems = []
    let copyCount = 0

    for (let row = 0; row < rows && copyCount < actualCopies; row++) {
      for (let col = 0; col < cols && copyCount < actualCopies; col++) {
        layoutItems.push({
          x: marginX + col * (photo.width + spacing),
          y: marginY + row * (photo.height + spacing),
          width: photo.width,
          height: photo.height,
          row,
          col,
          index: copyCount + 1
        })
        copyCount++
      }
    }

    return {
      items: layoutItems, cols, rows, totalPhotos: actualCopies, maxPhotos: total,
      marginX, marginY, paperWidth: paper.width, paperHeight: paper.height,
      photoWidth: photo.width, photoHeight: photo.height, paperName: paper.name, spacing
    }
  }

  const loadImage = () => {
    if (!passportPhoto) {
      setImageError(true)
      return
    }
    setImageLoaded(false)
    setImageError(false)
    const img = new Image()
    img.crossOrigin = 'Anonymous'
    img.onload = () => {
      imageRef.current = img
      setImageLoaded(true)
      setTimeout(() => drawPreview(), 100)
    }
    img.onerror = () => {
      setImageError(true)
      setImageLoaded(false)
    }
    img.src = passportPhoto
  }

  const drawPreview = () => {
    if (!previewCanvasRef.current || !layout || !imageRef.current) return
    const canvas = previewCanvasRef.current
    const ctx = canvas.getContext('2d')
    const img = imageRef.current
    const previewScale = 100 * zoomLevel
    canvas.width = layout.paperWidth * previewScale
    canvas.height = layout.paperHeight * previewScale

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth = 1
    ctx.setLineDash([5, 5])

    for (let i = 1; i < layout.cols; i++) {
      const x = (layout.marginX + i * layout.photoWidth + (i - 0.5) * layout.spacing) * previewScale
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
    }

    for (let i = 1; i < layout.rows; i++) {
      const y = (layout.marginY + i * layout.photoHeight + (i - 0.5) * layout.spacing) * previewScale
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }

    ctx.setLineDash([])

    layout.items.forEach((photo) => {
      const x = photo.x * previewScale
      const y = photo.y * previewScale
      const w = photo.width * previewScale
      const h = photo.height * previewScale
      ctx.drawImage(img, x, y, w, h)
      ctx.strokeStyle = '#3b82f6' // updated from #2563eb to match new UI
      ctx.lineWidth = 2
      ctx.strokeRect(x, y, w, h)

      if (showCutGuides) {
        ctx.beginPath()
        ctx.strokeStyle = '#ef4444'
        ctx.lineWidth = 1.5
        ctx.setLineDash([5, 5])
        const markLength = 8
        ctx.moveTo(x - markLength, y)
        ctx.lineTo(x + markLength, y)
        ctx.moveTo(x, y - markLength)
        ctx.lineTo(x, y + markLength)
        ctx.moveTo(x + w - markLength, y)
        ctx.lineTo(x + w + markLength, y)
        ctx.moveTo(x + w, y - markLength)
        ctx.lineTo(x + w, y + markLength)
        ctx.moveTo(x - markLength, y + h)
        ctx.lineTo(x + markLength, y + h)
        ctx.moveTo(x, y + h - markLength)
        ctx.lineTo(x, y + h + markLength)
        ctx.moveTo(x + w - markLength, y + h)
        ctx.lineTo(x + w + markLength, y + h)
        ctx.moveTo(x + w, y + h - markLength)
        ctx.lineTo(x + w, y + h + markLength)
        ctx.stroke()
        ctx.setLineDash([])
      }

      ctx.font = `bold ${14}px Arial`
      ctx.fillStyle = '#3b82f6'
      ctx.fillText(`${photo.index}`, x + 8, y + 25)
    })

    if (showMargins) {
      ctx.strokeStyle = '#cccccc'
      ctx.lineWidth = 1
      ctx.setLineDash([5, 5])
      const marginXpx = layout.marginX * previewScale
      const marginYpx = layout.marginY * previewScale
      const widthPx = (layout.paperWidth - layout.marginX * 2) * previewScale
      const heightPx = (layout.paperHeight - layout.marginY * 2) * previewScale
      ctx.strokeRect(marginXpx, marginYpx, widthPx, heightPx)
      ctx.setLineDash([])
    }
  }

  const generatePrintData = async () => {
    if (!layout || !layout.items.length) {
      toast.error('No layout generated')
      return null
    }

    const paper = paperSizes[paperSize]
    const canvas = document.createElement('canvas')
    canvas.width = paper.width * dpi
    canvas.height = paper.height * dpi

    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.src = passportPhoto

    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
    })

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    layout.items.forEach((photo) => {
      const x = photo.x * dpi
      const y = photo.y * dpi
      const w = photo.width * dpi
      const h = photo.height * dpi
      ctx.drawImage(img, x, y, w, h)

      ctx.beginPath()
      ctx.strokeStyle = '#cccccc'
      ctx.lineWidth = 3
      const markLength = 20

      ctx.moveTo(x - markLength, y)
      ctx.lineTo(x + markLength, y)
      ctx.moveTo(x, y - markLength)
      ctx.lineTo(x, y + markLength)
      ctx.moveTo(x + w - markLength, y)
      ctx.lineTo(x + w + markLength, y)
      ctx.moveTo(x + w, y - markLength)
      ctx.lineTo(x + w, y + markLength)
      ctx.moveTo(x - markLength, y + h)
      ctx.lineTo(x + markLength, y + h)
      ctx.moveTo(x, y + h - markLength)
      ctx.lineTo(x, y + h + markLength)
      ctx.moveTo(x + w - markLength, y + h)
      ctx.lineTo(x + w + markLength, y + h)
      ctx.moveTo(x + w, y + h - markLength)
      ctx.lineTo(x + w, y + h + markLength)
      ctx.stroke()
    })

    return canvas
  }

  const directPrint = async () => {
    if (!layout || !layout.items.length) {
      toast.error('No layout generated')
      return
    }

    setIsGenerating(true)
    toast.loading('Preparing print job...', { id: 'print-job' })

    try {
      const canvas = await generatePrintData()
      if (!canvas) throw new Error('Failed to generate print data')

      const iframe = document.createElement('iframe')
      iframe.style.position = 'absolute'
      iframe.style.width = '0'
      iframe.style.height = '0'
      iframe.style.border = 'none'
      document.body.appendChild(iframe)

      const iframeDoc = iframe.contentWindow.document
      iframeDoc.open()
      
      iframeDoc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Print Passport Sheet</title>
            <style>
              body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: white; }
              img { max-width: 100%; height: auto; box-shadow: 0 0 0 1px #ccc; }
              @media print {
                body { margin: 0; padding: 0; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <img src="${canvas.toDataURL('image/png')}" alt="Print Sheet" />
            <script>
              window.onload = function() {
                window.print();
                setTimeout(function() {
                  window.parent.document.body.removeChild(window.frameElement);
                }, 1000);
              };
            <\/script>
          </body>
        </html>
      `)
      
      iframeDoc.close()
      toast.success('Print dialog opened!', { id: 'print-job' })
      if (onGenerate) onGenerate(canvas.toDataURL('image/png'))

    } catch (error) {
      console.error('Direct print failed:', error)
      toast.error('Failed to open print dialog', { id: 'print-job' })
    } finally {
      setIsGenerating(false)
    }
  }

  const generatePDF = async () => {
    if (!layout || !layout.items.length) {
      toast.error('No layout generated')
      return
    }

    setIsGenerating(true)
    toast.loading(`Generating ${dpi} DPI PDF...`, { id: 'pdf-gen' })

    try {
      const paper = paperSizes[paperSize]
      const canvas = await generatePrintData()
      if (!canvas) throw new Error('Failed to generate PDF data')

      const imgData = canvas.toDataURL('image/png')

      let pdf
      if (paperSize === 'a4') {
        pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      } else if (paperSize === 'letter') {
        pdf = new jsPDF({ orientation: 'portrait', unit: 'in', format: 'letter' })
      } else {
        pdf = new jsPDF({ orientation: 'portrait', unit: 'in', format: [paper.width, paper.height] })
      }

      let imgWidth, imgHeight
      if (paperSize === 'a4') {
        imgWidth = 210
        imgHeight = 297
      } else if (paperSize === 'letter') {
        imgWidth = 8.5
        imgHeight = 11
      } else {
        imgWidth = paper.width
        imgHeight = paper.height
      }

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
      pdf.save(`passport-print-sheet-${paperSize}-${dpi}dpi-${Date.now()}.pdf`)

      toast.success(`${dpi} DPI PDF downloaded!`, { id: 'pdf-gen' })
      if (onGenerate) onGenerate(imgData)

    } catch (error) {
      console.error('PDF generation failed:', error)
      toast.error('Failed to generate PDF', { id: 'pdf-gen' })
    } finally {
      setIsGenerating(false)
    }
  }

  const generatePNG = async () => {
    if (!layout || !layout.items.length) {
      toast.error('No layout generated')
      return
    }

    setIsGenerating(true)
    toast.loading(`Generating ${dpi} DPI PNG...`, { id: 'png-gen' })

    try {
      const canvas = await generatePrintData()
      if (!canvas) throw new Error('Failed to generate PNG data')

      const dataURL = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = `passport-print-sheet-${paperSize}-${dpi}dpi-${Date.now()}.png`
      link.href = dataURL
      link.click()

      toast.success(`${dpi} DPI PNG downloaded!`, { id: 'png-gen' })
      if (onGenerate) onGenerate(dataURL)

    } catch (error) {
      console.error('PNG generation failed:', error)
      toast.error('Failed to generate PNG', { id: 'png-gen' })
    } finally {
      setIsGenerating(false)
    }
  }

  useEffect(() => {
    if (passportPhoto) loadImage()
  }, [passportPhoto])

  useEffect(() => {
    const newLayout = generateLayout()
    setLayout(newLayout)
  }, [paperSize, copies, passportPhoto, passportSize, spacing])

  useEffect(() => {
    if (layout && imageLoaded && imageRef.current) {
      const timer = setTimeout(() => drawPreview(), 100)
      return () => clearTimeout(timer)
    }
  }, [layout, zoomLevel, showCutGuides, showMargins, imageLoaded, dpi])

  const { total: maxFit, cols, rows } = calculateFit()
  const currentDpiInfo = dpiOptions.find(opt => opt.value === dpi) || dpiOptions[2]

  if (!passportPhoto) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-full">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <ImageIcon className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">No Photo Available</h3>
        <p className="text-sm text-gray-500 max-w-md mb-6">Please process and crop a passport photo first before generating a print sheet.</p>
        <button onClick={onBack} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 hover:shadow-lg transition-all">
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-t-2xl md:rounded-2xl">
      {/* HEADER */}
      <div className="flex items-center justify-between p-4 px-6 border-b border-gray-100 shrink-0">
        {/* <button 
          onClick={onBack} 
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button> */}
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Printer className="w-5 h-5 text-blue-600" />
          Print Sheet Setup
        </h2>
        <div className="w-20" /> {/* Spacer for centering */}
      </div>

      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        
        {/* LEFT SIDEBAR: CONTROLS */}
        <div className="w-full lg:w-[380px] shrink-0 border-r border-gray-100 bg-gray-50/50 flex flex-col h-[50vh] lg:h-auto overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
            
            {/* Section 1: Document Settings */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-semibold text-gray-900">Document Settings</h3>
              </div>
              
              <div className="space-y-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div>
                  <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1.5">Paper Size</label>
                  <div className="relative">
                    <select
                      value={paperSize}
                      onChange={(e) => setPaperSize(e.target.value)}
                      className="w-full pl-3 pr-10 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/50 hover:bg-gray-50 appearance-none cursor-pointer transition-colors"
                    >
                      {Object.entries(paperSizes).map(([key, size]) => (
                        <option key={key} value={key}>{size.name} ({size.description})</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1.5">Resolution (DPI)</label>
                  <div className="relative">
                    <select
                      value={dpi}
                      onChange={(e) => setDpi(parseInt(e.target.value))}
                      className="w-full pl-3 pr-10 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/50 hover:bg-gray-50 appearance-none cursor-pointer transition-colors"
                    >
                      {dpiOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Number of Copies</label>
                    <span className="text-[10px] text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full">Max: {maxFit}</span>
                  </div>
                  <div className="relative">
                    <select
                      value={copies}
                      onChange={(e) => setCopies(e.target.value)}
                      className="w-full pl-3 pr-10 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/50 hover:bg-gray-50 appearance-none cursor-pointer transition-colors"
                    >
                      {copyOptions.map(option => (
                        <option key={option} value={option}>
                          {option === 'auto' ? `Auto Fill Whole Page` : `${option} Copies`}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Layout & Guides */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <Settings2 className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-semibold text-gray-900">Layout & Guides</h3>
              </div>

              <div className="space-y-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-700">Photo Spacing</label>
                    <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-600">{(spacing * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="0.25"
                    step="0.0125"
                    value={spacing}
                    onChange={(e) => setSpacing(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>

                <div className="h-px bg-gray-100 my-2" />

                <label className="flex items-center justify-between cursor-pointer group">
                  <span className="text-sm text-gray-700 font-medium group-hover:text-gray-900 transition-colors">Show Cut Guides</span>
                  <div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${showCutGuides ? 'bg-blue-600' : 'bg-gray-200'}`}>
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${showCutGuides ? 'translate-x-4.5' : 'translate-x-1'}`} style={{ transform: `translateX(${showCutGuides ? '18px' : '2px'})` }} />
                    <input type="checkbox" className="sr-only" checked={showCutGuides} onChange={(e) => setShowCutGuides(e.target.checked)} />
                  </div>
                </label>

                <label className="flex items-center justify-between cursor-pointer group">
                  <span className="text-sm text-gray-700 font-medium group-hover:text-gray-900 transition-colors">Show Margins</span>
                  <div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${showMargins ? 'bg-blue-600' : 'bg-gray-200'}`}>
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${showMargins ? 'translate-x-4.5' : 'translate-x-1'}`} style={{ transform: `translateX(${showMargins ? '18px' : '2px'})` }} />
                    <input type="checkbox" className="sr-only" checked={showMargins} onChange={(e) => setShowMargins(e.target.checked)} />
                  </div>
                </label>
              </div>
            </div>

            {/* Layout Summary Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-2xl p-4 border border-blue-100/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-blue-100 flex items-center justify-center text-blue-600">
                  <LayoutGrid className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Printing {layout?.items?.length || 0} Photos</p>
                  <p className="text-xs text-blue-600/80 font-medium">{layout?.cols || cols} × {layout?.rows || rows} Grid layout</p>
                </div>
              </div>
            </div>

          </div>

          {/* Action Buttons (Fixed Bottom of Sidebar) */}
          <div className="p-5 border-t border-gray-100 bg-white shrink-0 space-y-3">
            <button
              onClick={directPrint}
              disabled={isGenerating || !layout?.items?.length}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl text-sm font-semibold shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/30 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
            >
              <PrinterIcon className="w-4 h-4" />
              {isGenerating ? 'Preparing...' : 'Print Now'}
            </button>
            
            <div className="flex gap-2">
              <button
                onClick={generatePDF}
                disabled={isGenerating || !layout?.items?.length}
                className="flex-1 bg-white border border-gray-200 text-gray-700 py-2.5 px-3 rounded-xl text-xs font-semibold shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <FileText className="w-4 h-4 text-red-500" />
                Save PDF
              </button>
              <button
                onClick={generatePNG}
                disabled={isGenerating || !layout?.items?.length}
                className="flex-1 bg-white border border-gray-200 text-gray-700 py-2.5 px-3 rounded-xl text-xs font-semibold shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <ImageIcon className="w-4 h-4 text-purple-500" />
                Save PNG
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT AREA: PREVIEW CANVAS */}
        <div className="flex-1 bg-[#f3f4f6] relative flex flex-col overflow-hidden">
          
          {/* subtle background pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }} />

          <div className="flex-1 overflow-auto custom-scrollbar p-6 md:p-10 flex items-center justify-center relative">
            {imageError ? (
              <div className="flex flex-col items-center text-red-500 bg-white p-6 rounded-2xl shadow-sm border border-red-100 z-10">
                <AlertCircle className="w-10 h-10 mb-3" />
                <p className="font-medium text-sm">Failed to load preview</p>
                <button onClick={loadImage} className="mt-3 px-4 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-semibold transition-colors">Retry</button>
              </div>
            ) : !imageLoaded ? (
              <div className="flex flex-col items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 z-10">
                <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                <p className="text-sm font-medium text-gray-500">Generating preview...</p>
              </div>
            ) : (
              <div className="relative z-10 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] transition-transform duration-200" style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}>
                <canvas 
                  ref={previewCanvasRef} 
                  className="bg-white border border-gray-200" 
                  style={{ maxWidth: '100%', height: 'auto', display: 'block' }} 
                />
              </div>
            )}
          </div>

          {/* Floating Zoom Controls */}
          {imageLoaded && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md border border-gray-200/50 shadow-lg rounded-full px-2 py-1.5 flex items-center gap-1 z-20">
              <button 
                onClick={() => setZoomLevel(Math.max(0.25, zoomLevel - 0.25))} 
                className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <div className="w-12 text-center text-xs font-semibold text-gray-700 select-none">
                {Math.round(zoomLevel * 100)}%
              </div>
              <button 
                onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.25))} 
                className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default PrintSheetGenerator