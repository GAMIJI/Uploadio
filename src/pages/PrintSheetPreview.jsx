import React, { useState, useEffect, useRef } from 'react'
import { 
  Download, 
  Printer, 
  ArrowLeft, 
  Grid, 
  ZoomIn,
  ZoomOut,
  Check,
  AlertCircle,
  LayoutGrid,
  Crop,
  Ruler
} from 'lucide-react'
import toast from 'react-hot-toast'

const PrintSheetPreview = ({ 
  passportPhoto, 
  passportSize, 
  onBack, 
  onGenerate,
  paperSize: initialPaperSize = '4x6',
  copies: initialCopies = 4
}) => {
  const [paperSize, setPaperSize] = useState(initialPaperSize)
  const [copies, setCopies] = useState(initialCopies)
  const [layout, setLayout] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [showCutGuides, setShowCutGuides] = useState(true)
  const [imageLoaded, setImageLoaded] = useState(false)
  
  const previewCanvasRef = useRef(null)

  // Paper size configurations
  const paperSizes = {
    '4x6': { 
      name: '4 × 6 inches', 
      width: 4, 
      height: 6, 
      unit: 'inch', 
      dpi: 300,
      description: 'Standard photo paper'
    },
    '5x7': { 
      name: '5 × 7 inches', 
      width: 5, 
      height: 7, 
      unit: 'inch', 
      dpi: 300,
      description: 'Large photo paper'
    },
    'a4': { 
      name: 'A4', 
      width: 8.27, 
      height: 11.69, 
      unit: 'inch', 
      dpi: 300,
      description: 'Standard document paper'
    },
    'letter': { 
      name: 'Letter', 
      width: 8.5, 
      height: 11, 
      unit: 'inch', 
      dpi: 300,
      description: 'US Letter size'
    }
  }

  const copyOptions = [2, 4, 6, 8, 12, 16, 20, 'auto']

  // Convert mm to inches
  const mmToInches = (mm) => mm / 25.4

  // Calculate how many photos fit on the paper
  const calculateFit = () => {
    if (!passportSize) return { cols: 0, rows: 0, total: 0 }
    
    const paper = paperSizes[paperSize]
    const photoWidth = passportSize.unit === 'mm' ? mmToInches(passportSize.width) : passportSize.width
    const photoHeight = passportSize.unit === 'mm' ? mmToInches(passportSize.height) : passportSize.height
    
    const cols = Math.floor(paper.width / photoWidth)
    const rows = Math.floor(paper.height / photoHeight)
    
    return { cols, rows, total: cols * rows }
  }

  // Generate layout grid
  const generateLayout = () => {
    if (!passportPhoto || !passportSize) return null
    
    const paper = paperSizes[paperSize]
    const photoWidth = passportSize.unit === 'mm' ? mmToInches(passportSize.width) : passportSize.width
    const photoHeight = passportSize.unit === 'mm' ? mmToInches(passportSize.height) : passportSize.height
    
    const { cols, rows, total } = calculateFit()
    const actualCopies = copies === 'auto' ? total : Math.min(copies, total)
    
    if (cols === 0 || rows === 0) return null
    
    // Calculate margins for perfect centering
    const totalWidth = cols * photoWidth
    const totalHeight = rows * photoHeight
    const marginX = (paper.width - totalWidth) / 2
    const marginY = (paper.height - totalHeight) / 2
    
    const layoutItems = []
    let copyCount = 0
    
    for (let row = 0; row < rows && copyCount < actualCopies; row++) {
      for (let col = 0; col < cols && copyCount < actualCopies; col++) {
        layoutItems.push({
          x: marginX + col * photoWidth,
          y: marginY + row * photoHeight,
          width: photoWidth,
          height: photoHeight,
          row,
          col,
          index: copyCount + 1
        })
        copyCount++
      }
    }
    
    return {
      items: layoutItems,
      cols,
      rows,
      totalPhotos: actualCopies,
      marginX,
      marginY,
      paperWidth: paper.width,
      paperHeight: paper.height,
      photoWidth,
      photoHeight
    }
  }

  // Draw preview on canvas
  const drawPreview = () => {
    if (!previewCanvasRef.current || !layout || !passportPhoto) return
    
    const canvas = previewCanvasRef.current
    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.src = passportPhoto
    
    img.onload = () => {
      setImageLoaded(true)
      
      // Set canvas size for preview
      const previewScale = 100 * zoomLevel // Scale for display (pixels per inch)
      canvas.width = layout.paperWidth * previewScale
      canvas.height = layout.paperHeight * previewScale
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Draw paper background
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Draw grid lines (light gray)
      ctx.strokeStyle = '#e5e7eb'
      ctx.lineWidth = 1
      
      // Draw vertical grid lines
      for (let i = 1; i < layout.cols; i++) {
        const x = (layout.marginX + i * layout.photoWidth) * previewScale
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }
      
      // Draw horizontal grid lines
      for (let i = 1; i < layout.rows; i++) {
        const y = (layout.marginY + i * layout.photoHeight) * previewScale
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }
      
      // Draw each photo
      layout.items.forEach((photo) => {
        const x = photo.x * previewScale
        const y = photo.y * previewScale
        const w = photo.width * previewScale
        const h = photo.height * previewScale
        
        // Draw photo
        ctx.drawImage(img, x, y, w, h)
        
        // Draw border
        ctx.strokeStyle = '#2563eb'
        ctx.lineWidth = 2
        ctx.strokeRect(x, y, w, h)
        
        // Draw cut guides if enabled
        if (showCutGuides) {
          ctx.beginPath()
          ctx.strokeStyle = '#ef4444'
          ctx.lineWidth = 1.5
          ctx.setLineDash([5, 5])
          
          // Cut marks at corners
          const markLength = 10
          
          // Top-left
          ctx.moveTo(x - markLength, y)
          ctx.lineTo(x + markLength, y)
          ctx.moveTo(x, y - markLength)
          ctx.lineTo(x, y + markLength)
          
          // Top-right
          ctx.moveTo(x + w - markLength, y)
          ctx.lineTo(x + w + markLength, y)
          ctx.moveTo(x + w, y - markLength)
          ctx.lineTo(x + w, y + markLength)
          
          // Bottom-left
          ctx.moveTo(x - markLength, y + h)
          ctx.lineTo(x + markLength, y + h)
          ctx.moveTo(x, y + h - markLength)
          ctx.lineTo(x, y + h + markLength)
          
          // Bottom-right
          ctx.moveTo(x + w - markLength, y + h)
          ctx.lineTo(x + w + markLength, y + h)
          ctx.moveTo(x + w, y + h - markLength)
          ctx.lineTo(x + w, y + h + markLength)
          
          ctx.stroke()
          ctx.setLineDash([])
        }
        
        // Add photo number
        ctx.font = `bold ${14}px Arial`
        ctx.fillStyle = '#2563eb'
        ctx.shadowBlur = 0
        ctx.fillText(`${photo.index}`, x + 8, y + 25)
      })
      
      // Draw paper border
      ctx.strokeStyle = '#000000'
      ctx.lineWidth = 3
      ctx.setLineDash([])
      ctx.strokeRect(0, 0, canvas.width, canvas.height)
      
      // Add info text
      ctx.font = `${12}px Arial`
      ctx.fillStyle = '#6b7280'
      ctx.fillText(
        `${layout.items.length} photos • ${paperSizes[paperSize].name} • ${passportSize.width}×${passportSize.height} ${passportSize.unit}`,
        10,
        canvas.height - 10
      )
    }
    
    img.onerror = () => {
      console.error('Failed to load passport photo')
      setImageLoaded(false)
    }
  }

  // Generate print-ready sheet
  const generatePrintReadySheet = async () => {
    if (!layout || !layout.items.length) {
      toast.error('No layout generated')
      return
    }
    
    setIsGenerating(true)
    toast.loading('Generating print-ready sheet...', { id: 'print-gen' })
    
    try {
      const paper = paperSizes[paperSize]
      const dpi = paper.dpi
      
      // Create high-resolution canvas
      const canvas = document.createElement('canvas')
      canvas.width = paper.width * dpi
      canvas.height = paper.height * dpi
      
      const ctx = canvas.getContext('2d')
      const img = new Image()
      img.src = passportPhoto
      
      await new Promise((resolve) => { 
        img.onload = resolve 
      })
      
      // Draw white background
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Draw each photo in high resolution
      layout.items.forEach((photo) => {
        const x = photo.x * dpi
        const y = photo.y * dpi
        const w = photo.width * dpi
        const h = photo.height * dpi
        
        ctx.drawImage(img, x, y, w, h)
        
        // Draw cut lines for printing
        ctx.beginPath()
        ctx.strokeStyle = '#cccccc'
        ctx.lineWidth = 2
        
        const markLength = 15
        
        // Cut marks at corners
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
      
      // Download as PNG
      const dataURL = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = `passport-print-sheet-${Date.now()}.png`
      link.href = dataURL
      link.click()
      
      toast.success('Print sheet downloaded!', { id: 'print-gen' })
      onGenerate?.(dataURL)
      
    } catch (error) {
      console.error('Print sheet generation failed:', error)
      toast.error('Failed to generate print sheet', { id: 'print-gen' })
    } finally {
      setIsGenerating(false)
    }
  }

  // Update layout when dependencies change
  useEffect(() => {
    const newLayout = generateLayout()
    setLayout(newLayout)
  }, [paperSize, copies, passportPhoto, passportSize])

  // Draw preview when layout or zoom changes
  useEffect(() => {
    if (layout && passportPhoto) {
      drawPreview()
    }
  }, [layout, zoomLevel, showCutGuides])

  const { total: maxFit, cols, rows } = calculateFit()

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05)',
      border: '1px solid #f0f0f0',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)'
      }}>
        <button
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#6b7280',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          <ArrowLeft style={{ width: '18px', height: '18px' }} />
          Back to Editor
        </button>
        <h2 style={{
          fontSize: '20px',
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Print Sheet Generator
        </h2>
        <div style={{ width: '100px' }} />
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 1fr)',
        gap: '20px',
        padding: '24px'
      }}>
        {/* Left Controls */}
        <div style={{ gridColumn: 'span 4 / span 4' }}>
          {/* Paper Size */}
          <div style={{
            backgroundColor: '#f9fafb',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '16px'
          }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 600,
              marginBottom: '8px',
              color: '#374151'
            }}>
              Paper Size
            </label>
            <select
              value={paperSize}
              onChange={(e) => setPaperSize(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                backgroundColor: 'white',
                fontSize: '14px'
              }}
            >
              {Object.entries(paperSizes).map(([key, size]) => (
                <option key={key} value={key}>
                  {size.name} - {size.description}
                </option>
              ))}
            </select>
          </div>

          {/* Copies */}
          <div style={{
            backgroundColor: '#f9fafb',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '16px'
          }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 600,
              marginBottom: '8px',
              color: '#374151'
            }}>
              Number of Copies
            </label>
            <select
              value={copies}
              onChange={(e) => setCopies(e.target.value === 'auto' ? 'auto' : parseInt(e.target.value))}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                backgroundColor: 'white',
                fontSize: '14px'
              }}
            >
              {copyOptions.map(option => (
                <option key={option} value={option}>
                  {option === 'auto' ? `Auto Fit (${maxFit} max)` : `${option} copies`}
                </option>
              ))}
            </select>
            <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '6px' }}>
              Max {maxFit} photos fit on this paper
            </p>
          </div>

          {/* Layout Info */}
          <div style={{
            backgroundColor: '#eef2ff',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '16px'
          }}>
            <h4 style={{
              fontWeight: 600,
              fontSize: '13px',
              marginBottom: '10px',
              color: '#1e40af',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <LayoutGrid style={{ width: '16px', height: '16px' }} />
              Layout Information
            </h4>
            <div style={{ fontSize: '13px', color: '#1e3a8a' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span>Photos per sheet:</span>
                <span style={{ fontWeight: 'bold' }}>{layout?.items?.length || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span>Grid size:</span>
                <span>{cols} × {rows}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span>Photo size:</span>
                <span>{passportSize?.width}×{passportSize?.height}{passportSize?.unit === 'mm' ? 'mm' : '"'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Resolution:</span>
                <span>{paperSizes[paperSize]?.dpi} DPI</span>
              </div>
            </div>
          </div>

          {/* View Options */}
          <div style={{
            backgroundColor: '#f9fafb',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '16px'
          }}>
            <h4 style={{
              fontWeight: 600,
              fontSize: '13px',
              marginBottom: '10px',
              color: '#374151',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Ruler style={{ width: '16px', height: '16px' }} />
              View Options
            </h4>
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '13px' }}>Show Cut Guides</span>
              <input
                type="checkbox"
                checked={showCutGuides}
                onChange={(e) => setShowCutGuides(e.target.checked)}
                style={{ width: '16px', height: '16px' }}
              />
            </label>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px' }}>Zoom</span>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))}
                  style={{
                    padding: '4px',
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <ZoomOut style={{ width: '14px', height: '14px' }} />
                </button>
                <span style={{ fontSize: '13px', width: '45px', textAlign: 'center' }}>{Math.round(zoomLevel * 100)}%</span>
                <button
                  onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.25))}
                  style={{
                    padding: '4px',
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <ZoomIn style={{ width: '14px', height: '14px' }} />
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <button
            onClick={generatePrintReadySheet}
            disabled={isGenerating || !layout?.items?.length}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
              color: 'white',
              padding: '12px 16px',
              borderRadius: '12px',
              border: 'none',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              opacity: (isGenerating || !layout?.items?.length) ? 0.5 : 1,
              marginBottom: '12px'
            }}
          >
            <Printer style={{ width: '18px', height: '18px' }} />
            {isGenerating ? 'Generating...' : 'Download Print-Ready Sheet'}
          </button>

          {/* Print Tips */}
          <div style={{
            backgroundColor: '#fefce8',
            borderRadius: '12px',
            padding: '14px',
            border: '1px solid #fef08a'
          }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <AlertCircle style={{ width: '18px', height: '18px', color: '#ca8a04', flexShrink: 0 }} />
              <div style={{ fontSize: '11px', color: '#854d0e' }}>
                <p style={{ fontWeight: 600, marginBottom: '6px' }}>Printing Tips:</p>
                <ul style={{ margin: 0, paddingLeft: '16px' }}>
                  <li>Use high-quality photo paper</li>
                  <li>Select "Actual Size" when printing</li>
                  <li>Disable "Fit to Frame" in printer settings</li>
                  <li>Cut along the red dotted lines</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Right Preview */}
        <div style={{ gridColumn: 'span 8 / span 8' }}>
          <div style={{
            border: '2px solid #e5e7eb',
            borderRadius: '12px',
            padding: '16px',
            backgroundColor: '#f3f4f6'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <h3 style={{ fontWeight: 600, color: '#374151' }}>Print Preview</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#6b7280' }}>
                <Grid style={{ width: '14px', height: '14px' }} />
                <span>{cols} × {rows} grid</span>
                <span>•</span>
                <span>{layout?.items?.length || 0} photos</span>
              </div>
            </div>
            
            <div style={{
              overflow: 'auto',
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '16px',
              display: 'flex',
              justifyContent: 'center',
              minHeight: '500px'
            }}>
              {!passportPhoto ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '400px',
                  color: '#9ca3af'
                }}>
                  No photo loaded
                </div>
              ) : !imageLoaded ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '400px'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      border: '3px solid #e5e7eb',
                      borderTopColor: '#2563eb',
                      borderRadius: '50%',
                      margin: '0 auto 12px',
                      animation: 'spin 1s linear infinite'
                    }} />
                    <p style={{ color: '#6b7280' }}>Loading preview...</p>
                  </div>
                </div>
              ) : (
                <canvas
                  ref={previewCanvasRef}
                  style={{
                    maxWidth: '100%',
                    height: 'auto',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
              )}
            </div>
            
            <div style={{
              marginTop: '16px',
              backgroundColor: '#ecfdf5',
              borderRadius: '8px',
              padding: '12px',
              textAlign: 'center'
            }}>
              <p style={{ fontSize: '13px', color: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <Check style={{ width: '16px', height: '16px' }} />
                Print-ready at {paperSizes[paperSize]?.dpi} DPI • Includes cut guides
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default PrintSheetPreview