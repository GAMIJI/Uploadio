// src/pages/PassportPhotoMaker.jsx
import React, { useState, useRef, useEffect, useCallback, useMemo, Suspense, lazy } from 'react';
import {
  Download, RotateCcw, Crop as CropIcon, Check, Layers, Wand2, Sparkles,
  Image as ImageIcon, Loader2, Sliders, Upload, Undo2, Maximize2,
  Minimize2, ZoomIn, RotateCw, Grid, Printer, FileImage, Palette,
  ArrowLeft, ArrowRight, ChevronRight, ChevronLeft, Contrast, Droplet, Eye,
  X, AlertCircle, Shield, Thermometer, Zap, Users, Target, Sun, Eraser, CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import SEO from '../pages/SEO';

// LAZY LOAD: Heavy print sheet generator to remove it from initial JS payload
const PrintSheetGenerator = lazy(() => import('../components/PrintSheetGenerator'));
// LAZY LOAD: Uploader to improve Initial Paint speed
const ImageUploader = lazy(() => import('../components/ImageUploader'));

// IMPORT SEPARATED UI PRIMITIVES
import { Button } from '../components/passport/Button';
import { PanelSection } from '../components/passport/PanelSection';
import { SliderControl } from '../components/passport/SliderControl';
import { StatusBar } from '../components/passport/StatusBar';
import { BackgroundRemovalProgress } from '../components/passport/BackgroundRemovalProgress';
import { BackgroundColorSection } from '../components/passport/BackgroundColorSection';
import { CropInfo } from '../components/passport/CropInfo';

// --- UTILS ---
const getCenteredCrop = (imageWidth, imageHeight, sizeRatio = 0.7) => {
  const size = Math.min(imageWidth, imageHeight) * sizeRatio
  return { width: size, height: size, x: (imageWidth - size) / 2, y: (imageHeight - size) / 2 }
}

const getAspectRatioString = (width, height) => {
  const gcd = (a, b) => b === 0 ? a : gcd(b, a % b)
  const divisor = gcd(Math.round(width), Math.round(height))
  return `${Math.round(width / divisor)}:${Math.round(height / divisor)}`
}

export default function PassportPhotoMaker() {
  // REMOVED JS MEDIA QUERIES (isMobile, isTablet) TO FIX CLS

  const [uploadedImage, setUploadedImage] = useState(null)
  const [bgRemovedResult, setBgRemovedResult] = useState(null)
  const [cropResult, setCropResult] = useState(null)
  const [editedImage, setEditedImage] = useState(null)

  const [backgroundRemoved, setBackgroundRemoved] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showPrintSheet, setShowPrintSheet] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [imageLoaded, setImageLoaded] = useState(false)

  // Default to true. We will use CSS to hide/show on mobile to prevent CLS
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true)
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false)
  const [bgColor, setBgColor] = useState('#ffffff')
  const [error, setError] = useState(null)
  const [isMobileBottomSheet, setIsMobileBottomSheet] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)

  const [isEraserMode, setIsEraserMode] = useState(false)
  const [eraserSize, setEraserSize] = useState(20)
  const [eraserZoom, setEraserZoom] = useState(100)
  const [isErasing, setIsErasing] = useState(false)
  const [eraserHistory, setEraserHistory] = useState([])
  const eraserCanvasRef = useRef(null)
  const lastPos = useRef({ x: 0, y: 0 })

  const [removalProgress, setRemovalProgress] = useState(0)
  const [removalStage, setRemovalStage] = useState('analyzing')
  const [isRemovalComplete, setIsRemovalComplete] = useState(false)
  const [showProgressOverlay, setShowProgressOverlay] = useState(false)

  const [zoom, setZoom] = useState(100)
  const [rotation, setRotation] = useState(0)
  const [brightness, setBrightness] = useState(0)
  const [contrast, setContrast] = useState(0)
  const [saturation, setSaturation] = useState(0)
  const [sharpness, setSharpness] = useState(0)
  const [highlights, setHighlights] = useState(0)
  const [shadows, setShadows] = useState(0)
  const [exposure, setExposure] = useState(0)
  const [vibrance, setVibrance] = useState(0)

  const [passportWidth, setPassportWidth] = useState(35)
  const [passportHeight, setPassportHeight] = useState(45)
  const [passportUnit, setPassportUnit] = useState('mm')

  const [cropPosition, setCropPosition] = useState({ x: 0, y: 0 })
  const [cropSize, setCropSize] = useState({ width: 300, height: 300 })
  const [originalImageDimensions, setOriginalImageDimensions] = useState({ width: 0, height: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [dragStartCropPos, setDragStartCropPos] = useState({ x: 0, y: 0 })
  const [isResizing, setIsResizing] = useState(false)
  const [resizeDirection, setResizeDirection] = useState(null)
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0, posX: 0, posY: 0 })
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 })
  const [showGrid, setShowGrid] = useState(true)
  const [cropAspectRatio, setCropAspectRatio] = useState(null)
  const [isCropMode, setIsCropMode] = useState(false)
  const [showFaceGuide, setShowFaceGuide] = useState(false)
  const [initialCropSet, setInitialCropSet] = useState(false)
  const [currentAspectRatioString, setCurrentAspectRatioString] = useState('Free')

  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const displayImageRef = useRef(null)
  const animationFrameRef = useRef(null)
  const abortControllerRef = useRef(null)
  const canvasInitializedRef = useRef(false)
  const progressIntervalRef = useRef(null)

  const passportSize = useMemo(() => ({ width: passportWidth, height: passportHeight, unit: passportUnit }), [passportWidth, passportHeight, passportUnit])

  const steps = useMemo(() => [
    { id: 1, label: 'Upload', icon: Upload, desc: 'Upload photo' },
    { id: 2, label: 'Remove BG', icon: Wand2, desc: 'AI background' },
    { id: 3, label: 'Crop', icon: CropIcon, desc: 'Crop to size' },
    { id: 4, label: 'Adjust', icon: Sliders, desc: 'Edit photo' },
    { id: 5, label: 'Download', icon: Download, desc: 'Save photo' },
    { id: 6, label: 'Print', icon: Layers, desc: 'Print sheet' }
  ], [])

  const cleanup = useCallback(() => {
    if (abortControllerRef.current) abortControllerRef.current.abort()
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
    displayImageRef.current = null
  }, [])

  const resetAllAdjustments = useCallback(() => {
    setBrightness(0); setContrast(0); setSaturation(0); setSharpness(0);
    setHighlights(0); setShadows(0); setExposure(0); setVibrance(0);
    setRotation(0); setZoom(100); setError(null);
  }, [])

  const handleStartOver = useCallback(() => {
    cleanup()
    setUploadedImage(null); setBgRemovedResult(null); setCropResult(null);
    setEditedImage(null); setPreviewUrl(null); setBackgroundRemoved(false);
    setBgColor('#ffffff'); setCurrentStep(1); setIsCropMode(false);
    setInitialCropSet(false); setIsEraserMode(false); setIsErasing(false);
    setEraserHistory([]); resetAllAdjustments();
    if (canvasRef.current) canvasRef.current.getContext('2d').clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    toast.success('Started over. Please upload a new photo.', { icon: '🔄' })
  }, [cleanup, resetAllAdjustments])

  const initCanvas = useCallback(() => {
    if (!canvasRef.current) return false
    const canvas = canvasRef.current; const ctx = canvas.getContext('2d'); const dpr = window.devicePixelRatio || 1
    canvas.width = 800 * dpr; canvas.height = 600 * dpr; canvas.style.width = '800px'; canvas.style.height = '600px'
    ctx.scale(dpr, dpr); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'
    canvasInitializedRef.current = true
    return true
  }, [])

  const updateCanvas = useCallback(() => {
    if (!canvasRef.current) return
    if (!displayImageRef.current) { setImageLoaded(false); return }
    const canvas = canvasRef.current; const ctx = canvas.getContext('2d'); const img = displayImageRef.current; const dpr = window.devicePixelRatio || 1
    canvas.width = img.width * dpr; canvas.height = img.height * dpr; canvas.style.width = `${img.width}px`; canvas.style.height = `${img.height}px`
    ctx.scale(dpr, dpr); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.clearRect(0, 0, img.width, img.height)
    ctx.save()
    if (rotation !== 0 && currentStep >= 4) {
      ctx.translate(img.width / 2, img.height / 2); ctx.rotate(rotation * Math.PI / 180); ctx.translate(-img.width / 2, -img.height / 2)
    }
    if (currentStep >= 4) {
      const filters = []
      if (brightness !== 0) filters.push(`brightness(${100 + brightness}%)`)
      if (contrast !== 0) filters.push(`contrast(${100 + contrast}%)`)
      if (saturation !== 0) filters.push(`saturate(${100 + saturation}%)`)
      if (sharpness > 0) filters.push(`contrast(${100 + sharpness * 0.5}%)`)
      if (highlights !== 0) filters.push(`brightness(${100 + highlights * 0.3}%)`)
      if (shadows !== 0) filters.push(`brightness(${100 - shadows * 0.3}%)`)
      if (exposure !== 0) filters.push(`brightness(${100 + exposure * 0.5}%)`)
      if (vibrance !== 0) filters.push(`saturate(${100 + vibrance * 0.3}%)`)
      ctx.filter = filters.join(' ')
    }
    ctx.drawImage(img, 0, 0)
    if (backgroundRemoved && bgColor && !isEraserMode) {
      ctx.globalCompositeOperation = 'destination-over'; ctx.fillStyle = bgColor; ctx.fillRect(0, 0, img.width, img.height); ctx.globalCompositeOperation = 'source-over'
    }
    ctx.restore()
    try { setPreviewUrl(canvas.toDataURL('image/png', 1.0)); setImageLoaded(true); setError(null) } catch (err) { setImageLoaded(false) }
  }, [rotation, brightness, contrast, saturation, sharpness, highlights, shadows, exposure, vibrance, backgroundRemoved, bgColor, currentStep, isEraserMode])

  useEffect(() => {
    if (currentStep >= 4 && displayImageRef.current) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = requestAnimationFrame(() => updateCanvas())
    }
  }, [rotation, brightness, contrast, saturation, sharpness, highlights, shadows, exposure, vibrance, currentStep, updateCanvas])

  const renderImageToCanvas = useCallback((imageSrc) => {
    if (!canvasRef.current || !imageSrc) return
    if (!canvasInitializedRef.current) initCanvas()
    cleanup(); abortControllerRef.current = new AbortController(); setImageLoaded(false); setInitialCropSet(false)
    const img = new Image(); img.crossOrigin = 'anonymous'
    img.onload = () => {
      if (abortControllerRef.current?.signal.aborted) return
      displayImageRef.current = img; setOriginalImageDimensions({ width: img.width, height: img.height })
      const centered = getCenteredCrop(img.width, img.height)
      setCropSize({ width: centered.width, height: centered.height }); setCropPosition({ x: centered.x, y: centered.y }); setInitialCropSet(true)
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = requestAnimationFrame(() => updateCanvas())
    }
    img.onerror = () => { toast.error('Failed to load image'); setImageLoaded(false) }
    img.src = imageSrc
  }, [updateCanvas, cleanup, initCanvas])

  const handleImageUpload = useCallback((image) => {
    if (!image || !image.preview) return toast.error('Invalid image')
    setUploadedImage(image); setBgRemovedResult(null); setCropResult(null); setBackgroundRemoved(false); setShowPrintSheet(false); setImageLoaded(false); setCurrentStep(2); setIsCropMode(false); setIsEraserMode(false); setEditedImage(null)
    renderImageToCanvas(image.preview); toast.success('Photo uploaded successfully!', { icon: '📸' })
  }, [renderImageToCanvas])

  const goToStep = useCallback((step) => {
    if (step === 1) { if (uploadedImage) handleStartOver(); return }
    if (step >= 1 && step <= 6) {
      if (step < currentStep) {
        if (step <= 3) resetAllAdjustments()
        if (step <= 2) { setCropResult(null); setInitialCropSet(false); setIsEraserMode(false) }
      }
      setCurrentStep(step); setIsCropMode(step === 3)
      let source = null
      if (step === 2 || step === 3) source = bgRemovedResult || uploadedImage?.preview
      else if (step === 4) source = cropResult || bgRemovedResult || uploadedImage?.preview
      else if (step >= 5) source = editedImage || previewUrl || cropResult || bgRemovedResult || uploadedImage?.preview
      if (source) setTimeout(() => renderImageToCanvas(source), 0)
    }
  }, [currentStep, uploadedImage, handleStartOver, resetAllAdjustments, bgRemovedResult, cropResult, editedImage, previewUrl, renderImageToCanvas])

  const simulateProgress = useCallback(() => {
    let progress = 0; const stages = ['analyzing', 'detecting', 'removing', 'refining', 'optimizing', 'preparing']; let stageIndex = 0
    setShowProgressOverlay(true); setRemovalProgress(0); setRemovalStage(stages[0]); setIsRemovalComplete(false)
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
    progressIntervalRef.current = setInterval(() => {
      progress += Math.random() * 3 + 1
      const newStageIndex = Math.min(Math.floor((progress / 100) * stages.length), stages.length - 1)
      if (newStageIndex !== stageIndex) { stageIndex = newStageIndex; setRemovalStage(stages[stageIndex]) }
      if (progress >= 100) {
        clearInterval(progressIntervalRef.current); progressIntervalRef.current = null; setRemovalProgress(100); setRemovalStage('complete'); setIsRemovalComplete(true)
        setTimeout(() => setShowProgressOverlay(false), 1000)
      }
      setRemovalProgress(progress)
    }, 80)
  }, [])

  const handleBackgroundRemoval = async () => {
    if (!uploadedImage) return toast.error('No image loaded')
    setError(null); setIsProcessing(true); simulateProgress()
    try {
      const img = new Image(); img.crossOrigin = 'anonymous'; img.src = uploadedImage.preview
      await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; if (img.complete) resolve() })

      const { removeBackground } = await import('../services/backgroundRemoval');
      const transparentImage = await removeBackground(img, 'auto', (progress) => { setRemovalProgress(Math.min(progress * 100, 95)) });

      if (!transparentImage) throw new Error('Background removal returned no result')
      setBgRemovedResult(transparentImage); setBackgroundRemoved(true); renderImageToCanvas(transparentImage)
      setRemovalProgress(100); setRemovalStage('complete'); setIsRemovalComplete(true)
      setTimeout(() => setShowProgressOverlay(false), 1000); toast.success('Background removed successfully!', { icon: '✨' })
    } catch (error) {
      toast.error('Failed to remove background. Please try again.'); setShowProgressOverlay(false)
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleContinueToCrop = useCallback(() => { if (backgroundRemoved) { setIsEraserMode(false); goToStep(3) } }, [backgroundRemoved, goToStep])

  // ERASER LOGIC...
  useEffect(() => {
    if (isEraserMode && eraserCanvasRef.current && bgRemovedResult) {
      const canvas = eraserCanvasRef.current; const ctx = canvas.getContext('2d'); const img = new Image(); img.crossOrigin = 'anonymous';
      img.onload = () => {
        canvas.width = img.width; canvas.height = img.height; ctx.globalCompositeOperation = 'source-over'; ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.drawImage(img, 0, 0);
        setEraserHistory([bgRemovedResult]); setEraserZoom(100)
      }; img.src = bgRemovedResult
    }
  }, [isEraserMode, bgRemovedResult]);

  const getEraserMousePosition = useCallback((clientX, clientY) => {
    const canvas = eraserCanvasRef.current; if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect(); const scaleX = canvas.width / rect.width; const scaleY = canvas.height / rect.height;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY }
  }, [])

  const drawErase = useCallback((x1, y1, x2, y2) => {
    const canvas = eraserCanvasRef.current; if (!canvas) return; const ctx = canvas.getContext('2d');
    ctx.globalCompositeOperation = 'destination-out'; ctx.beginPath(); ctx.lineWidth = eraserSize; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
  }, [eraserSize])

  const handleEraserStart = useCallback((e) => {
    if (!isEraserMode) return; e.preventDefault(); setIsErasing(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX; const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const pos = getEraserMousePosition(clientX, clientY); lastPos.current = pos; drawErase(pos.x, pos.y, pos.x, pos.y)
  }, [isEraserMode, getEraserMousePosition, drawErase])

  const handleEraserMove = useCallback((e) => {
    if (!isErasing || !isEraserMode) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX; const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const pos = getEraserMousePosition(clientX, clientY); drawErase(lastPos.current.x, lastPos.current.y, pos.x, pos.y); lastPos.current = pos
  }, [isErasing, isEraserMode, getEraserMousePosition, drawErase])

  const handleEraserEnd = useCallback(() => {
    if (!isErasing) return; setIsErasing(false);
    if (eraserCanvasRef.current) {
      const newBgRemoved = eraserCanvasRef.current.toDataURL('image/png'); setBgRemovedResult(newBgRemoved); setEraserHistory(prev => [...prev, newBgRemoved]);
      const img = new Image(); img.onload = () => { displayImageRef.current = img; updateCanvas() }; img.src = newBgRemoved
    }
  }, [isErasing, updateCanvas])

  const undoEraser = useCallback(() => {
    if (eraserHistory.length > 1) {
      const newHistory = [...eraserHistory]; newHistory.pop(); const previousState = newHistory[newHistory.length - 1];
      setEraserHistory(newHistory); setBgRemovedResult(previousState);
      const canvas = eraserCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d'); const img = new Image();
        img.onload = () => { ctx.globalCompositeOperation = 'source-over'; ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.drawImage(img, 0, 0); displayImageRef.current = img; updateCanvas() }
        img.src = previousState
      }
    }
  }, [eraserHistory, updateCanvas])

  const handleSetBackgroundColor = useCallback((color) => { setBgColor(color); requestAnimationFrame(() => updateCanvas()) }, [updateCanvas])

  const updateContainerDimensions = useCallback(() => {
    if (containerRef.current) { const rect = containerRef.current.getBoundingClientRect(); setContainerDimensions({ width: rect.width, height: rect.height }) }
  }, [])

  useEffect(() => { updateContainerDimensions(); window.addEventListener('resize', updateContainerDimensions); return () => window.removeEventListener('resize', updateContainerDimensions) }, [updateContainerDimensions])

  useEffect(() => { if (cropSize.width > 0 && cropSize.height > 0) setCurrentAspectRatioString(getAspectRatioString(cropSize.width, cropSize.height)) }, [cropSize])

  const getRenderedImageMetrics = useCallback(() => {
    if (!containerRef.current || originalImageDimensions.width === 0) return null
    const rect = containerRef.current.getBoundingClientRect(); const imgRatio = originalImageDimensions.width / originalImageDimensions.height; const containerRatio = rect.width / rect.height
    let renderedWidth, renderedHeight, offsetX = 0, offsetY = 0
    if (containerRatio > imgRatio) { renderedHeight = rect.height; renderedWidth = renderedHeight * imgRatio; offsetX = (rect.width - renderedWidth) / 2 }
    else { renderedWidth = rect.width; renderedHeight = renderedWidth / imgRatio; offsetY = (rect.height - renderedHeight) / 2 }
    return { rect, offsetX, offsetY, scaleX: originalImageDimensions.width / renderedWidth, scaleY: originalImageDimensions.height / renderedHeight }
  }, [originalImageDimensions])

  const getMousePositionInImage = useCallback((clientX, clientY) => {
    const metrics = getRenderedImageMetrics(); if (!metrics) return { x: 0, y: 0 }
    const { rect, offsetX, offsetY, scaleX, scaleY } = metrics
    let x = (clientX - rect.left - offsetX) * scaleX; let y = (clientY - rect.top - offsetY) * scaleY
    x = Math.max(0, Math.min(x, originalImageDimensions.width)); y = Math.max(0, Math.min(y, originalImageDimensions.height))
    return { x, y }
  }, [getRenderedImageMetrics, originalImageDimensions])

  const processMove = useCallback((clientX, clientY) => {
    if ((!isDragging && !isResizing) || !isCropMode) return
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
    animationFrameRef.current = requestAnimationFrame(() => {
      const mousePos = getMousePositionInImage(clientX, clientY)
      if (isDragging) {
        const deltaX = mousePos.x - dragStart.x; const deltaY = mousePos.y - dragStart.y
        let newX = dragStartCropPos.x + deltaX; let newY = dragStartCropPos.y + deltaY
        newX = Math.max(0, Math.min(newX, originalImageDimensions.width - cropSize.width)); newY = Math.max(0, Math.min(newY, originalImageDimensions.height - cropSize.height))
        setCropPosition({ x: newX, y: newY })
      } else if (isResizing && resizeDirection) {
        const deltaX = mousePos.x - resizeStart.x; const deltaY = mousePos.y - resizeStart.y
        let newWidth = resizeStart.width; let newHeight = resizeStart.height; let newX = resizeStart.posX; let newY = resizeStart.posY
        let aspectRatio = null; if (cropAspectRatio === '1:1') aspectRatio = 1; else if (cropAspectRatio === '4:3') aspectRatio = 4 / 3; else if (cropAspectRatio === '3:4') aspectRatio = 3 / 4; else if (cropAspectRatio === '16:9') aspectRatio = 16 / 9; else if (cropAspectRatio === '9:16') aspectRatio = 9 / 16; else if (cropAspectRatio === '2:3') aspectRatio = 2 / 3
        if (resizeDirection.includes('e')) newWidth = Math.max(50, resizeStart.width + deltaX)
        if (resizeDirection.includes('w')) { newWidth = Math.max(50, resizeStart.width - deltaX); newX = resizeStart.posX + resizeStart.width - newWidth }
        if (resizeDirection.includes('s')) newHeight = Math.max(50, resizeStart.height + deltaY)
        if (resizeDirection.includes('n')) { newHeight = Math.max(50, resizeStart.height - deltaY); newY = resizeStart.posY + resizeStart.height - newHeight }
        if (aspectRatio) {
          if (resizeDirection === 'e' || resizeDirection === 'w') { newHeight = newWidth / aspectRatio; newY = resizeStart.posY + (resizeStart.height - newHeight) / 2 }
          else if (resizeDirection === 'n' || resizeDirection === 's') { newWidth = newHeight * aspectRatio; newX = resizeStart.posX + (resizeStart.width - newWidth) / 2 }
          else {
            if (newWidth / newHeight > aspectRatio) { newWidth = newHeight * aspectRatio; if (resizeDirection.includes('w')) newX = resizeStart.posX + resizeStart.width - newWidth }
            else { newHeight = newWidth / aspectRatio; if (resizeDirection.includes('n')) newY = resizeStart.posY + resizeStart.height - newHeight }
          }
        }
        newWidth = Math.max(50, newWidth); newHeight = Math.max(50, newHeight)
        if (newX < 0) { newWidth += newX; newX = 0 }
        if (newY < 0) { newHeight += newY; newY = 0 }
        if (newX + newWidth > originalImageDimensions.width) newWidth = originalImageDimensions.width - newX
        if (newY + newHeight > originalImageDimensions.height) newHeight = originalImageDimensions.height - newY
        setCropSize({ width: newWidth, height: newHeight }); setCropPosition({ x: newX, y: newY })
      }
    })
  }, [isDragging, isResizing, isCropMode, getMousePositionInImage, dragStart, dragStartCropPos, cropSize, originalImageDimensions, cropAspectRatio, resizeDirection, resizeStart])

  useEffect(() => {
    if (!isDragging && !isResizing && !isErasing) return;
    const handleMouseMove = (e) => { if (isErasing) handleEraserMove(e); else processMove(e.clientX, e.clientY) }
    const handleTouchMove = (e) => { if (isErasing) handleEraserMove(e); else processMove(e.touches[0].clientX, e.touches[0].clientY) }
    const handleUp = () => { if (isErasing) handleEraserEnd(); else { setIsDragging(false); setIsResizing(false); setResizeDirection(null); if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current) } }
    window.addEventListener('mousemove', handleMouseMove); window.addEventListener('mouseup', handleUp); window.addEventListener('touchmove', handleTouchMove, { passive: false }); window.addEventListener('touchend', handleUp)
    return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleUp); window.removeEventListener('touchmove', handleTouchMove); window.removeEventListener('touchend', handleUp) }
  }, [isDragging, isResizing, isErasing, processMove, handleEraserMove, handleEraserEnd])

  const handleCropMouseDown = useCallback((e) => {
    if (e.target.classList?.contains('resize-handle')) {
      e.stopPropagation(); e.preventDefault(); setIsResizing(true); setResizeDirection(e.target.dataset.direction); const mousePos = getMousePositionInImage(e.clientX, e.clientY); setResizeStart({ x: mousePos.x, y: mousePos.y, width: cropSize.width, height: cropSize.height, posX: cropPosition.x, posY: cropPosition.y }); return
    }
    if (!isCropMode) return
    e.preventDefault(); e.stopPropagation(); setIsDragging(true); const mousePos = getMousePositionInImage(e.clientX, e.clientY); setDragStart({ x: mousePos.x, y: mousePos.y }); setDragStartCropPos({ x: cropPosition.x, y: cropPosition.y })
  }, [isCropMode, cropPosition, cropSize, getMousePositionInImage])

  const handleCropTouchStart = useCallback((e) => {
    if (e.target.classList?.contains('resize-handle')) {
      e.stopPropagation(); const touch = e.touches[0]; setIsResizing(true); setResizeDirection(e.target.dataset.direction); const mousePos = getMousePositionInImage(touch.clientX, touch.clientY); setResizeStart({ x: mousePos.x, y: mousePos.y, width: cropSize.width, height: cropSize.height, posX: cropPosition.x, posY: cropPosition.y }); return
    }
    if (!isCropMode) return
    e.stopPropagation(); const touch = e.touches[0]; setIsDragging(true); const mousePos = getMousePositionInImage(touch.clientX, touch.clientY); setDragStart({ x: mousePos.x, y: mousePos.y }); setDragStartCropPos({ x: cropPosition.x, y: cropPosition.y })
  }, [isCropMode, cropPosition, cropSize, getMousePositionInImage])

  const applyCrop = useCallback(() => {
    const sourceImage = bgRemovedResult || uploadedImage?.preview; if (!sourceImage) return toast.error('No image to crop')
    setIsProcessing(true); const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d'); const img = new Image()
    img.onload = () => {
      const cropW = Math.round(cropSize.width); const cropH = Math.round(cropSize.height)
      canvas.width = cropW; canvas.height = cropH; ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(img, Math.round(cropPosition.x), Math.round(cropPosition.y), cropW, cropH, 0, 0, cropW, cropH)
      const croppedImage = canvas.toDataURL('image/png', 1.0); setCropResult(croppedImage); setOriginalImageDimensions({ width: cropW, height: cropH }); setCropSize({ width: cropW, height: cropH }); setCropPosition({ x: 0, y: 0 }); renderImageToCanvas(croppedImage); setIsProcessing(false); setCurrentStep(4); setIsCropMode(false); toast.success('Cropped successfully!', { icon: '✂️' })
    }
    img.onerror = () => { toast.error('Failed to crop'); setIsProcessing(false) }; img.src = sourceImage
  }, [cropPosition, cropSize, renderImageToCanvas, bgRemovedResult, uploadedImage])

  const resetCrop = useCallback(() => {
    if (originalImageDimensions.width === 0) return toast.error('No image to reset crop')
    const centered = getCenteredCrop(originalImageDimensions.width, originalImageDimensions.height); setCropSize({ width: centered.width, height: centered.height }); setCropPosition({ x: centered.x, y: centered.y }); setCropAspectRatio(null); setIsDragging(false); setIsResizing(false); setResizeDirection(null); toast.success('Crop reset to center')
  }, [originalImageDimensions])

  const resetAll = useCallback(() => { resetAllAdjustments(); toast.success('All settings reset to default'); if (displayImageRef.current) requestAnimationFrame(() => updateCanvas()) }, [resetAllAdjustments, updateCanvas])

  const downloadImage = useCallback((format = 'png') => {
    const imageToDownload = editedImage || previewUrl || cropResult; if (!imageToDownload) return toast.error('No photo to download')
    setIsProcessing(true); try {
      const link = document.createElement('a'); const quality = format === 'png' ? 1.0 : 0.92; let downloadUrl = imageToDownload
      if (format === 'jpg') {
        const canvas = document.createElement('canvas'); const img = new Image(); const dpr = window.devicePixelRatio || 1
        img.onload = () => {
          canvas.width = img.width * dpr; canvas.height = img.height * dpr; const ctx = canvas.getContext('2d'); ctx.scale(dpr, dpr); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, img.width, img.height); ctx.drawImage(img, 0, 0); downloadUrl = canvas.toDataURL('image/jpeg', quality); link.download = `passport-photo-${Date.now()}.jpg`; link.href = downloadUrl; document.body.appendChild(link); link.click(); document.body.removeChild(link); setIsProcessing(false); toast.success(`Photo downloaded as JPG!`)
        }; img.onerror = () => { setIsProcessing(false); toast.error('Failed to convert to JPG') }; img.src = imageToDownload; return
      }
      link.download = `passport-photo-${Date.now()}.${format}`; link.href = downloadUrl; document.body.appendChild(link); link.click(); document.body.removeChild(link); setIsProcessing(false); toast.success(`Photo downloaded as ${format.toUpperCase()}!`)
    } catch (error) { setIsProcessing(false); toast.error('Failed to download photo') }
  }, [cropResult, editedImage, previewUrl])

  const generatePDF = useCallback(async () => {
    const imageToDownload = editedImage || previewUrl || cropResult; if (!imageToDownload) return toast.error('No photo to download')
    setIsProcessing(true)
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const sizeInMm = passportUnit === 'mm' ? { w: passportWidth, h: passportHeight } : { w: passportWidth * 25.4, h: passportHeight * 25.4 }
      doc.addImage(imageToDownload, 'PNG', 10, 10, sizeInMm.w, sizeInMm.h); doc.save(`passport-photo-${Date.now()}.pdf`); setIsProcessing(false); toast.success('PDF downloaded! ✓')
    } catch (error) { setIsProcessing(false); toast.error('Failed to generate PDF') }
  }, [cropResult, editedImage, previewUrl, passportWidth, passportHeight, passportUnit])

  const prevStep = useCallback(() => { if (currentStep > 1) { if (currentStep - 1 === 1 && uploadedImage) return toast.info('Image already uploaded.'); goToStep(currentStep - 1) } }, [currentStep, uploadedImage, goToStep])

  const canProceed = useCallback(() => { switch (currentStep) { case 1: return !!uploadedImage; case 2: return backgroundRemoved; case 3: return true; case 4: return true; case 5: return true; case 6: return true; default: return false } }, [currentStep, uploadedImage, backgroundRemoved])

  const getCropOverlayStyle = useCallback(() => {
    const metrics = getRenderedImageMetrics(); if (!metrics || !isCropMode) return {}
    const { offsetX, offsetY, scaleX, scaleY } = metrics
    return { position: 'absolute', left: `${offsetX + cropPosition.x / scaleX}px`, top: `${offsetY + cropPosition.y / scaleY}px`, width: `${cropSize.width / scaleX}px`, height: `${cropSize.height / scaleY}px`, border: '2px solid rgba(255, 255, 255, 0.9)', boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5), inset 0 0 30px rgba(255, 255, 255, 0.05)', cursor: 'move', borderRadius: '2px', pointerEvents: 'auto', zIndex: 10, backgroundColor: 'transparent', transition: 'none' }
  }, [getRenderedImageMetrics, isCropMode, cropPosition, cropSize])

  const handlePositions = useMemo(() => [{ dir: 'nw', style: { top: -8, left: -8 } }, { dir: 'n', style: { top: -8, left: '50%', transform: 'translateX(-50%)' } }, { dir: 'ne', style: { top: -8, right: -8 } }, { dir: 'e', style: { top: '50%', right: -8, transform: 'translateY(-50%)' } }, { dir: 'se', style: { bottom: -8, right: -8 } }, { dir: 's', style: { bottom: -8, left: '50%', transform: 'translateX(-50%)' } }, { dir: 'sw', style: { bottom: -8, left: -8 } }, { dir: 'w', style: { top: '50%', left: -8, transform: 'translateY(-50%)' } }], [])

  const renderStepContent = useCallback(() => {
    switch (currentStep) {
      case 1:
        return (
          <div className="flex flex-col h-full w-full overflow-y-auto custom-scrollbar relative">
            <div className="m-auto w-full max-w-md p-4 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
              <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>}>
                <ImageUploader onImageUpload={handleImageUpload} theme="orange" />
              </Suspense>
            </div>
          </div>
        )
      case 2:
        return (
          <div className="flex flex-col h-full w-full p-2 md:p-4 overflow-hidden relative">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
            <div className="flex items-center gap-3 mb-3 z-10 animate-in fade-in slide-in-from-top-4 duration-500 px-2 shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center shadow-sm border border-white shrink-0"><Wand2 className="w-5 h-5 text-purple-600" aria-hidden="true" /></div>
              <div>
                <h3 className="text-lg md:text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">{isEraserMode ? 'Manual Magic Eraser' : 'AI Background Removal'}</h3>
                <p className="text-xs md:text-sm text-gray-500 truncate max-w-[250px] sm:max-w-full">{isEraserMode ? 'Brush over areas to remove leftover background.' : 'Instantly extract the subject for a compliant passport background.'}</p>
              </div>
            </div>
            <div className={`flex-1 flex gap-4 min-h-0 overflow-hidden ${isEraserMode ? 'flex-col md:flex-row' : 'flex-col'}`}>
              <div className="relative w-full flex-1 bg-white/80 backdrop-blur-md rounded-[1.5rem] md:rounded-[2rem] shadow-xl shadow-purple-500/5 border border-white flex flex-col group z-10 animate-in fade-in zoom-in-95 duration-500 overflow-hidden">
                <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-purple-400/40 rounded-tl-xl transition-all group-hover:-translate-x-1 group-hover:-translate-y-1 z-20 pointer-events-none" />
                <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-purple-400/40 rounded-tr-xl transition-all group-hover:translate-x-1 group-hover:-translate-y-1 z-20 pointer-events-none" />
                <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-purple-400/40 rounded-bl-xl transition-all group-hover:-translate-x-1 group-hover:translate-y-1 z-20 pointer-events-none" />
                <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-purple-400/40 rounded-br-xl transition-all group-hover:translate-x-1 group-hover:translate-y-1 z-20 pointer-events-none" />
                {isEraserMode && (<style>{`.eraser-canvas { cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="${eraserSize}" height="${eraserSize}" viewBox="0 0 ${eraserSize} ${eraserSize}"><circle cx="${eraserSize / 2}" cy="${eraserSize / 2}" r="${eraserSize / 2 - 1}" fill="rgba(239, 68, 68, 0.4)" stroke="red" stroke-width="1"/></svg>') ${eraserSize / 2} ${eraserSize / 2}, crosshair !important; }`}</style>)}
                <div className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ${backgroundRemoved ? 'opacity-[0.05]' : 'opacity-0'}`} style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), repeating-linear-gradient(45deg, #000 25%, #fff 25%, #fff 75%, #000 75%, #000)', backgroundPosition: '0 0, 10px 10px', backgroundSize: '20px 20px' }} />
                <div className={`relative w-full h-full p-2 md:p-8 flex items-center justify-center overflow-auto custom-scrollbar z-10 ${isEraserMode && eraserZoom > 100 ? 'items-start justify-start' : ''}`}>
                  {isEraserMode ? (
                    <canvas ref={eraserCanvasRef} className="drop-shadow-2xl eraser-canvas touch-none" style={{ width: `${eraserZoom}%`, height: 'auto', maxWidth: eraserZoom === 100 ? '100%' : 'none', maxHeight: eraserZoom === 100 ? '100%' : 'none', transition: 'width 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)' }} onMouseDown={handleEraserStart} onTouchStart={handleEraserStart} />
                  ) : previewUrl && imageLoaded ? (
                    <img src={previewUrl} alt="Current photo preview" className="max-w-full max-h-full object-contain drop-shadow-2xl transition-all duration-700 pointer-events-none" loading="lazy" />
                  ) : (
                    <div className="flex flex-col items-center justify-center"><div className="relative mb-4"><div className="w-12 h-12 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin" /></div><span className="text-sm font-semibold text-gray-500 animate-pulse">Loading image...</span></div>
                  )}
                </div>
              </div>
              <div className={`${isEraserMode ? 'w-full md:w-[320px] flex flex-col justify-center' : 'w-full max-w-lg mx-auto pb-1'} z-10 shrink-0 flex flex-col gap-3`}>
                {!backgroundRemoved ? (
                  <Button onClick={handleBackgroundRemoval} loading={isProcessing} icon={Wand2} size="lg" fullWidth className="bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 border-none shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.02] text-white font-bold transition-all py-3.5 md:py-4">
                    {isProcessing ? 'Applying AI Magic...' : 'Auto-Remove Background'}
                  </Button>
                ) : isEraserMode ? (
                  <div className="animate-in slide-in-from-right-4 fade-in duration-500 bg-white/90 backdrop-blur-sm p-5 rounded-2xl border border-gray-100 shadow-lg flex flex-col gap-6 w-full h-full md:h-auto justify-center">
                    <div className="flex flex-col gap-2"><div className="flex justify-between items-center"><span className="text-sm font-bold text-gray-700">Brush Size</span><span className="text-xs font-mono font-medium text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md">{eraserSize}px</span></div><input type="range" min="5" max="100" value={eraserSize} onChange={(e) => setEraserSize(Number(e.target.value))} className="w-full h-2.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600" /></div>
                    <div className="flex flex-col gap-2"><div className="flex justify-between items-center"><span className="text-sm font-bold text-gray-700">Canvas Zoom</span><span className="text-xs font-mono font-medium text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">{eraserZoom}%</span></div><input type="range" min="100" max="400" value={eraserZoom} onChange={(e) => setEraserZoom(Number(e.target.value))} className="w-full h-2.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" /></div>
                    <div className="flex flex-col gap-3 pt-4 border-t border-gray-100 mt-2">
                      <Button onClick={undoEraser} disabled={eraserHistory.length <= 1} variant="secondary" icon={Undo2} fullWidth className="bg-gray-50 hover:bg-gray-100 text-gray-700 py-3 rounded-xl border border-gray-200 transition-colors">Undo Last Stroke</Button>
                      <Button onClick={() => setIsEraserMode(false)} icon={Check} fullWidth className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold border-none shadow-md shadow-purple-500/20 py-3 rounded-xl transition-all hover:scale-[1.02]">Done Erasing</Button>
                    </div>
                  </div>
                ) : (
                  <div className="animate-in slide-in-from-bottom-4 fade-in duration-500 flex flex-col gap-3 w-full max-w-lg mx-auto">
                    <div className="flex items-center justify-center gap-2 text-sm font-bold text-emerald-700 bg-emerald-50/80 backdrop-blur-sm py-3 px-4 rounded-xl border border-emerald-200/60 shadow-sm mb-1"><CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" /><span className="truncate">Background Removed Successfully!</span></div>
                    <div className="flex flex-col gap-3">
                      <Button icon={Eraser} size="lg" fullWidth className="bg-white border-2 border-purple-100 text-purple-700 hover:bg-purple-50 hover:border-purple-200 font-bold transition-all py-3 md:py-3.5 rounded-xl shadow-sm" onClick={() => setIsEraserMode(true)}>Touch-up (Eraser Tool)</Button>
                      <Button icon={ArrowRight} size="lg" fullWidth className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-blue-500/30 hover:scale-[1.02] text-white font-bold border-none transition-all py-3 md:py-3.5 rounded-xl" onClick={handleContinueToCrop}>Continue to Crop</Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      case 3:
        return (
          <div className="relative w-full h-full flex items-center justify-center">
            {previewUrl && imageLoaded ? (
              <img src={previewUrl} alt="Crop preview" className="max-w-full max-h-full object-contain select-none" style={{ transform: `scale(${zoom / 100})`, transition: 'transform 0.2s ease' }} draggable={false} />
            ) : (
              <div className="flex items-center justify-center text-gray-400"><Loader2 className="w-8 h-8 animate-spin" aria-hidden="true" /><span className="ml-2">Loading image...</span></div>
            )}
            {isCropMode && originalImageDimensions.width > 0 && initialCropSet && (
              <>
                <div style={getCropOverlayStyle()} onMouseDown={handleCropMouseDown} onTouchStart={handleCropTouchStart} className="crop-overlay" role="button" tabIndex={0} aria-label="Crop area - drag to reposition">
                  {showGrid && (<div className="absolute inset-0 pointer-events-none opacity-30"><div className="absolute top-1/3 left-0 right-0 h-px bg-white" /><div className="absolute top-2/3 left-0 right-0 h-px bg-white" /><div className="absolute left-1/3 top-0 bottom-0 w-px bg-white" /><div className="absolute left-2/3 top-0 bottom-0 w-px bg-white" /></div>)}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-40"><div className="w-8 h-8 rounded-full border border-white/60" /><div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-px h-3 bg-white/60" /><div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-px w-3 bg-white/60" /></div>
                  {showFaceGuide && (<div className="absolute inset-0 pointer-events-none opacity-30"><div className="absolute top-[20%] left-[25%] right-[25%] bottom-[45%] border-2 border-yellow-400/60 rounded-full" /></div>)}
                  {handlePositions.map(({ dir, style }) => (<div key={dir} className="resize-handle group" data-direction={dir} style={{ position: 'absolute', width: '18px', height: '18px', backgroundColor: '#FFFFFF', border: '2px solid #3B82F6', borderRadius: '50%', cursor: `${dir}-resize`, zIndex: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.3)', touchAction: 'none', ...style }} />))}
                </div>
                <CropInfo width={cropSize.width} height={cropSize.height} aspectRatio={cropAspectRatio} ratio={currentAspectRatioString} />
              </>
            )}
          </div>
        )
      case 4:
        return (
          <div className="flex flex-col h-full w-full p-2 md:p-4 overflow-hidden relative">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
            <div className="flex items-center gap-3 mb-3 md:mb-4 z-10 animate-in fade-in slide-in-from-top-4 duration-500 px-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-xl flex items-center justify-center shadow-sm border border-white shrink-0"><Sliders className="w-5 h-5 text-blue-600" aria-hidden="true" /></div>
              <div>
                <h3 className="text-lg md:text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Fine-Tune Your Photo</h3>
                <p className="text-xs md:text-sm text-gray-500">Real-time preview. Adjust lighting and color from the right panel.</p>
              </div>
            </div>
            <div className="relative w-full flex-1 bg-white/80 backdrop-blur-md rounded-[1.5rem] md:rounded-[2rem] shadow-xl shadow-blue-500/5 border border-white flex items-center justify-center group z-10 animate-in fade-in zoom-in-95 duration-500 overflow-hidden">
              <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-blue-400/40 rounded-tl-xl transition-all group-hover:-translate-x-1 group-hover:-translate-y-1 z-20 pointer-events-none" />
              <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-blue-400/40 rounded-tr-xl transition-all group-hover:translate-x-1 group-hover:-translate-y-1 z-20 pointer-events-none" />
              <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-blue-400/40 rounded-bl-xl transition-all group-hover:-translate-x-1 group-hover:translate-y-1 z-20 pointer-events-none" />
              <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-blue-400/40 rounded-br-xl transition-all group-hover:translate-x-1 group-hover:translate-y-1 z-20 pointer-events-none" />
              <div className="absolute top-4 right-14 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm border border-gray-100 flex items-center gap-2 z-20 pointer-events-none transition-opacity group-hover:opacity-100">
                <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span></span>
                <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider hidden sm:inline-block">Live Preview</span>
              </div>
              <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), repeating-linear-gradient(45deg, #000 25%, #fff 25%, #fff 75%, #000 75%, #000)', backgroundPosition: '0 0, 10px 10px', backgroundSize: '20px 20px' }} />
              {previewUrl && imageLoaded ? (
                <div className="relative w-full h-full flex items-center justify-center p-4 md:p-8 overflow-hidden z-10"><img src={previewUrl} alt="Edited preview" className="max-w-full max-h-full object-contain select-none drop-shadow-2xl" style={{ transform: `scale(${zoom / 100})`, transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)' }} draggable={false} /></div>
              ) : (
                <div className="flex flex-col items-center justify-center z-10"><div className="relative mb-4"><div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" /></div><span className="text-sm font-semibold text-gray-500 animate-pulse">Rendering Adjustments...</span></div>
              )}
            </div>
          </div>
        )
      case 5:
        const imageToDownload = editedImage || previewUrl || cropResult;
        return (
          <div className="flex flex-col items-center justify-center h-full w-full p-4 overflow-y-auto custom-scrollbar relative">
            <div className="m-auto text-center max-w-lg w-full animate-in fade-in slide-in-from-bottom-4 duration-500 py-8">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-white"><Download className="w-8 h-8 text-green-600" aria-hidden="true" /></div>
              <h3 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600 mb-2">Save Your Photo</h3>
              <p className="text-sm text-gray-500 mb-8 max-w-sm mx-auto">Download your finalized passport photo to your device in high resolution.</p>
              <div className="bg-white/80 backdrop-blur-sm p-6 md:p-8 rounded-[2rem] shadow-xl shadow-green-500/5 border border-white mb-8 relative group hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300">
                <div className="absolute top-5 left-5 w-6 h-6 border-t-2 border-l-2 border-green-400/40 rounded-tl-xl transition-all group-hover:-translate-x-1 group-hover:-translate-y-1" />
                <div className="absolute top-5 right-5 w-6 h-6 border-t-2 border-r-2 border-green-400/40 rounded-tr-xl transition-all group-hover:translate-x-1 group-hover:-translate-y-1" />
                <div className="absolute bottom-5 left-5 w-6 h-6 border-b-2 border-l-2 border-green-400/40 rounded-bl-xl transition-all group-hover:-translate-x-1 group-hover:translate-y-1" />
                <div className="absolute bottom-5 right-5 w-6 h-6 border-b-2 border-r-2 border-green-400/40 rounded-br-xl transition-all group-hover:translate-x-1 group-hover:translate-y-1" />
                <div className="flex justify-center mb-6 relative z-10">
                  {imageToDownload ? (
                    <img src={imageToDownload} alt="Final passport preview" className="rounded-xl shadow-lg border-[6px] border-white object-contain bg-gray-50" style={{ width: passportUnit === 'mm' ? `${Math.min(passportWidth * 4.5, 260)}px` : `${Math.min(passportWidth * 85, 260)}px`, height: passportUnit === 'mm' ? `${Math.min(passportHeight * 4.5, 320)}px` : `${Math.min(passportHeight * 85, 320)}px`, maxHeight: '35vh' }} loading="lazy" />
                  ) : (
                    <div className="w-32 h-40 bg-gray-50 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-200"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
                  )}
                </div>
                <div className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 px-5 py-2.5 rounded-full border border-green-100/50 shadow-sm"><CheckCircle className="w-4 h-4 text-green-500" /><span className="text-sm font-bold text-green-700 tracking-tight">{Math.round(passportWidth)} × {Math.round(passportHeight)} {passportUnit}</span></div>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-6">
                <Button onClick={() => downloadImage('png')} icon={ImageIcon} variant="primary" fullWidth loading={isProcessing} aria-label="Download as PNG" className="bg-gradient-to-r from-blue-600 to-indigo-600 border-none shadow-md shadow-blue-500/20 hover:shadow-blue-500/40">PNG</Button>
                <Button onClick={() => downloadImage('jpg')} icon={ImageIcon} variant="primary" fullWidth loading={isProcessing} aria-label="Download as JPG" className="bg-gradient-to-r from-purple-600 to-pink-600 border-none shadow-md shadow-purple-500/20 hover:shadow-purple-500/40">JPG</Button>
                <Button onClick={generatePDF} icon={FileImage} variant="danger" fullWidth loading={isProcessing} aria-label="Download as PDF" className="bg-gradient-to-r from-red-500 to-rose-600 border-none shadow-md shadow-red-500/20 hover:shadow-red-500/40">PDF</Button>
              </div>
              <Button variant="secondary" icon={ArrowRight} size="lg" fullWidth onClick={() => goToStep(6)} aria-label="Continue to print" className="bg-white border-2 border-gray-100 hover:border-blue-200 hover:bg-blue-50 text-gray-700 hover:text-blue-700 shadow-sm transition-all">Skip to Print Layout</Button>
            </div>
          </div>
        )
      case 6:
        const finalImageToPrint = editedImage || previewUrl || cropResult;
        return (
          <div className="flex flex-col items-center justify-center h-full w-full p-4 overflow-y-auto custom-scrollbar relative">
            <div className="m-auto text-center max-w-lg w-full animate-in fade-in slide-in-from-bottom-4 duration-500 py-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-white"><Printer className="w-8 h-8 text-blue-600" aria-hidden="true" /></div>
              <h3 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">Ready to Print</h3>
              <p className="text-sm text-gray-500 mb-8 max-w-sm mx-auto">Review your final passport photo before generating a layout sheet with multiple copies.</p>
              <div className="bg-white/80 backdrop-blur-sm p-6 md:p-8 rounded-[2rem] shadow-xl shadow-blue-500/5 border border-white mb-8 relative group hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300">
                <div className="absolute top-5 left-5 w-6 h-6 border-t-2 border-l-2 border-blue-400/40 rounded-tl-xl transition-all group-hover:-translate-x-1 group-hover:-translate-y-1" />
                <div className="absolute top-5 right-5 w-6 h-6 border-t-2 border-r-2 border-blue-400/40 rounded-tr-xl transition-all group-hover:translate-x-1 group-hover:-translate-y-1" />
                <div className="absolute bottom-5 left-5 w-6 h-6 border-b-2 border-l-2 border-blue-400/40 rounded-bl-xl transition-all group-hover:-translate-x-1 group-hover:translate-y-1" />
                <div className="absolute bottom-5 right-5 w-6 h-6 border-b-2 border-r-2 border-blue-400/40 rounded-br-xl transition-all group-hover:translate-x-1 group-hover:translate-y-1" />
                <div className="flex justify-center mb-6 relative z-10">
                  {finalImageToPrint ? (
                    <img src={finalImageToPrint} alt="Final passport preview" className="rounded-xl shadow-lg border-[6px] border-white object-contain bg-gray-50" style={{ width: passportUnit === 'mm' ? `${Math.min(passportWidth * 4.5, 260)}px` : `${Math.min(passportWidth * 85, 260)}px`, height: passportUnit === 'mm' ? `${Math.min(passportHeight * 4.5, 320)}px` : `${Math.min(passportHeight * 85, 320)}px`, maxHeight: '40vh' }} loading="lazy" />
                  ) : (
                    <div className="w-32 h-40 bg-gray-50 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-200"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
                  )}
                </div>
                <div className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-2.5 rounded-full border border-blue-100/50 shadow-sm"><Target className="w-4 h-4 text-blue-500" /><span className="text-sm font-bold text-blue-700 tracking-tight">Output Size: {Math.round(passportWidth)} × {Math.round(passportHeight)} {passportUnit}</span></div>
              </div>
              <Button onClick={() => setShowPrintSheet(true)} icon={Layers} size="xl" fullWidth className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 border-none shadow-lg shadow-blue-500/30 hover:shadow-purple-500/40 text-white font-bold" aria-label="Open print layout generator">Generate Layout Sheet</Button>
            </div>
          </div>
        )
      default: return null
    }
  }, [currentStep, uploadedImage, previewUrl, bgRemovedResult, cropResult, imageLoaded, backgroundRemoved, isProcessing, zoom, isCropMode, originalImageDimensions, cropSize, cropPosition, showGrid, showFaceGuide, handlePositions, passportWidth, passportHeight, passportUnit, handleImageUpload, handleBackgroundRemoval, getCropOverlayStyle, handleCropMouseDown, handleCropTouchStart, downloadImage, generatePDF, editedImage, setCurrentStep, setIsCropMode, handleContinueToCrop, initialCropSet, currentAspectRatioString, goToStep, isEraserMode, eraserSize, eraserZoom, handleEraserStart, handleEraserMove, handleEraserEnd, undoEraser, eraserHistory, eraserCanvasRef, setIsEraserMode])

  return (
    <>
      <SEO title="Passport Photo Maker - Create Professional ID Photos" description="Create compliant passport photos with AI background removal, easy cropping, photo editing, and print-ready sheets." url="https://Uploadio.com/passport-photo-maker" />
      <style>{`.custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 20px; } .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #9ca3af; } .step-transition { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); } .resize-handle { transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease; } .resize-handle:hover { transform: scale(1.25); border-color: #1D4ED8; box-shadow: 0 2px 12px rgba(59, 130, 246, 0.6); } .no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; } .touch-manipulation { touch-action: manipulation; } .crop-overlay { touch-action: none; user-select: none; -webkit-user-select: none; } .resize-handle { touch-action: none; } .crop-dimensions { pointer-events: none; }`}</style>

      {showProgressOverlay && <BackgroundRemovalProgress progress={removalProgress} stage={removalStage} isComplete={isRemovalComplete} />}
      {error && <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 animate-in fade-in slide-in-from-top-2 max-w-[90vw]" role="alert" aria-live="polite"><p className="flex items-center gap-2 text-sm"><AlertCircle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />{error}</p></div>}

      <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        <header className="h-14 bg-white/95 backdrop-blur-sm border-b border-gray-200/80 flex items-center px-3 md:px-4 gap-2 flex-shrink-0 z-20 shadow-sm">
          <div className="flex items-center gap-2 md:gap-3"><div className="flex items-center gap-2"><div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-md shadow-blue-500/30"><span className="text-white font-bold text-sm">P</span></div><span className="font-bold text-gray-800 text-sm hidden sm:inline">Passport Studio</span></div></div>
          <div className="flex items-center gap-1 ml-2 md:ml-4"><Button variant="ghost" size="sm" icon={RotateCcw} onClick={resetAll} aria-label="Reset all settings"><span className="hidden xs:inline">Reset</span></Button></div>
          <div className="ml-auto flex items-center gap-1 md:gap-1.5">
            {uploadedImage && <Button variant="outline" size="sm" icon={Upload} onClick={handleStartOver} aria-label="Upload new photo" className="text-xs"><span className="hidden sm:inline">Upload New</span></Button>}
            {uploadedImage && <button onClick={() => setIsRightPanelOpen(!isRightPanelOpen)} className={`p-2 rounded-lg hover:bg-gray-100 transition-colors touch-manipulation hidden md:block`} aria-label={isRightPanelOpen ? 'Close panel' : 'Open panel'}>{isRightPanelOpen ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}</button>}
            {uploadedImage && <button onClick={() => setIsMobileBottomSheet(!isMobileBottomSheet)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors touch-manipulation block md:hidden" aria-label="Toggle controls"><Sliders className="w-4 h-4" /></button>}
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden relative">
          <div className={`bg-white/95 backdrop-blur-sm border-r border-gray-200/80 flex-shrink-0 transition-all duration-300 overflow-y-auto hidden md:block ${isLeftPanelCollapsed ? 'w-14' : 'w-48 lg:w-56'}`}>
            <div className="p-3">
              <button onClick={() => setIsLeftPanelCollapsed(!isLeftPanelCollapsed)} className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 transition-colors mb-3 touch-manipulation" aria-label={isLeftPanelCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>{isLeftPanelCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}</button>
              <div className="space-y-1">
                {steps.map((step) => {
                  const Icon = step.icon; const isCompleted = step.id < currentStep; const isCurrent = step.id === currentStep; const isLocked = (step.id === 1 && uploadedImage && currentStep > 1) || step.id > currentStep
                  return (
                    <button key={step.id} onClick={() => !isLocked && goToStep(step.id)} disabled={isLocked} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all step-transition touch-manipulation ${isCurrent ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200/50 shadow-sm' : ''} ${isCompleted ? 'text-green-600' : ''} ${isLocked ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-50'}`} aria-current={isCurrent ? 'step' : undefined}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium ${isCurrent ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md' : ''} ${isCompleted ? 'bg-green-100 text-green-600' : ''} ${isLocked ? 'bg-gray-100 text-gray-400' : ''}`}>{isCompleted ? <Check className="w-3.5 h-3.5" aria-hidden="true" /> : <Icon className="w-3.5 h-3.5" aria-hidden="true" />}</div>
                      {!isLeftPanelCollapsed && (<div className="flex-1 text-left"><span className={`text-sm font-medium block ${isCurrent ? 'text-blue-700' : isCompleted ? 'text-green-600' : 'text-gray-600'}`}>{step.label}</span><span className="text-[10px] text-gray-400">{step.desc}</span></div>)}
                      {isCurrent && !isLeftPanelCollapsed && <div className="w-1.5 h-8 bg-blue-600 rounded-full" aria-hidden="true" />}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col bg-gray-50/30 overflow-hidden">
            <div className="flex-1 relative overflow-hidden p-2 sm:p-3 md:p-4">
              <div ref={containerRef} className="relative w-full h-full bg-transparent flex items-center justify-center overflow-hidden" style={{ touchAction: 'none' }} role="img" aria-label="Image preview area">
                <canvas ref={canvasRef} className="hidden" />
                {renderStepContent()}
                {isProcessing && !error && !showProgressOverlay && (<div className="absolute inset-0 bg-black/50 rounded-xl md:rounded-2xl flex items-center justify-center backdrop-blur-sm z-50"><div className="bg-white rounded-2xl p-6 md:p-8 text-center shadow-2xl max-w-[90%]"><div className="w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" aria-hidden="true" /><p className="text-sm font-semibold text-gray-700">Processing...</p><p className="text-xs text-gray-400 mt-1">Please wait</p></div></div>)}
              </div>
            </div>
            <div className="flex-shrink-0">
              <div className="bg-white/95 backdrop-blur-sm border-t border-gray-200/80 flex items-center justify-between px-3 md:px-4 py-2">
                <div className="flex items-center gap-2 md:gap-3"><Button variant="secondary" size="sm" icon={ArrowLeft} onClick={prevStep} disabled={currentStep === 1 || (currentStep === 2 && uploadedImage)} aria-label="Go back to previous step"><span className="hidden xs:inline">Back</span></Button><span className="text-xs text-gray-500 font-medium">Step {currentStep} of 6</span></div>
                <div className="flex items-center gap-2 md:gap-3"><span className="text-xs text-gray-400 hidden sm:inline">{steps.find(s => s.id === currentStep)?.desc}</span><Button variant="primary" size="sm" icon={currentStep === 6 ? Check : ArrowRight} onClick={() => { if (currentStep === 3 && !cropResult) { applyCrop(); return; } if (currentStep === 4 && previewUrl) { setEditedImage(previewUrl); toast.success('Photo saved! 🎨') } goToStep(currentStep + 1) }} disabled={!canProceed() || currentStep === 6} aria-label={currentStep === 6 ? 'Complete' : 'Continue to next step'}>{currentStep === 4 ? 'Save & Continue' : currentStep === 5 ? 'Continue to Print' : currentStep === 6 ? 'Done' : 'Continue'}</Button></div>
              </div>
              <StatusBar imageSize={originalImageDimensions} passportSize={passportSize} zoom={zoom} isProcessing={isProcessing} isReady={!!(previewUrl && imageLoaded)} step={currentStep} />
            </div>
          </div>

          {uploadedImage && isRightPanelOpen && (
            <div className={`bg-white/95 backdrop-blur-sm border-l border-gray-200/80 overflow-y-auto flex-shrink-0 p-4 space-y-4 custom-scrollbar hidden md:block lg:w-72 w-64`}>
              {currentStep === 2 && backgroundRemoved && !isEraserMode && (<PanelSection title="Background Color" icon={Palette} defaultOpen={true}><BackgroundColorSection bgColor={bgColor} onColorChange={handleSetBackgroundColor} onCustomColorChange={handleSetBackgroundColor} onContinue={handleContinueToCrop} showContinue={true} /></PanelSection>)}
              {currentStep === 4 && (<PanelSection title="Image Properties" icon={Sliders}><div className="space-y-3"><SliderControl label="Zoom" value={zoom} onChange={setZoom} min={50} max={200} icon={ZoomIn} format={(v) => `${v}%`} resetValue={100} /><SliderControl label="Rotation" value={rotation} onChange={setRotation} min={-180} max={180} icon={RotateCw} format={(v) => `${v}°`} resetValue={0} /><SliderControl label="Brightness" value={brightness} onChange={setBrightness} min={-100} max={100} icon={Sun} resetValue={0} /><SliderControl label="Contrast" value={contrast} onChange={setContrast} min={-100} max={100} icon={Contrast} resetValue={0} /><SliderControl label="Saturation" value={saturation} onChange={setSaturation} min={-100} max={100} icon={Droplet} resetValue={0} /><SliderControl label="Sharpness" value={sharpness} onChange={setSharpness} min={0} max={100} icon={Eye} format={(v) => `${v}%`} resetValue={0} /><SliderControl label="Highlights" value={highlights} onChange={setHighlights} min={-100} max={100} icon={Zap} resetValue={0} /><SliderControl label="Shadows" value={shadows} onChange={setShadows} min={-100} max={100} icon={Shield} resetValue={0} /><SliderControl label="Exposure" value={exposure} onChange={setExposure} min={-50} max={50} icon={Thermometer} resetValue={0} /><SliderControl label="Vibrance" value={vibrance} onChange={setVibrance} min={-100} max={100} icon={Sparkles} resetValue={0} /></div></PanelSection>)}
              {currentStep === 3 && (
                <>
                  <PanelSection title="Crop Settings" icon={CropIcon}>
                    <div className="space-y-3">
                      <div><label className="text-xs font-medium text-gray-700 block mb-1.5">Aspect Ratio</label><div className="grid grid-cols-4 gap-1.5">{['Free', '1:1', '4:3', '3:4', '16:9', '9:16', '2:3'].map((ratio) => (<button key={ratio} onClick={() => { setCropAspectRatio(ratio === 'Free' ? null : ratio); if (ratio !== 'Free') { const [w, h] = ratio.split(':').map(Number); const currentSize = cropSize.width; const newHeight = (currentSize / w) * h; setCropSize({ width: currentSize, height: newHeight }) } }} className={`px-2 py-1.5 text-xs font-medium rounded-lg border transition-all touch-manipulation ${cropAspectRatio === (ratio === 'Free' ? null : ratio) ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-sm' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`} aria-label={`Set aspect ratio to ${ratio}`}>{ratio}</button>))}</div></div>
                      <div className="flex items-center justify-between"><label className="text-xs font-medium text-gray-700 flex items-center gap-1.5"><Grid className="w-3.5 h-3.5" aria-hidden="true" /> Grid</label><button onClick={() => setShowGrid(!showGrid)} className={`relative w-10 h-5 rounded-full transition-colors touch-manipulation ${showGrid ? 'bg-blue-600' : 'bg-gray-300'}`} role="switch" aria-checked={showGrid} aria-label="Toggle grid"><div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${showGrid ? 'translate-x-5' : 'translate-x-0.5'}`} aria-hidden="true" /></button></div>
                      <div className="flex items-center justify-between"><label className="text-xs font-medium text-gray-700 flex items-center gap-1.5"><Users className="w-3.5 h-3.5" aria-hidden="true" /> Face Guide</label><button onClick={() => setShowFaceGuide(!showFaceGuide)} className={`relative w-10 h-5 rounded-full transition-colors touch-manipulation ${showFaceGuide ? 'bg-blue-600' : 'bg-gray-300'}`} role="switch" aria-checked={showFaceGuide} aria-label="Toggle face guide"><div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${showFaceGuide ? 'translate-x-5' : 'translate-x-0.5'}`} aria-hidden="true" /></button></div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 bg-gray-50 p-2 rounded-lg"><div>Width: <span className="font-mono font-medium text-gray-700">{Math.round(cropSize.width)}px</span></div><div>Height: <span className="font-mono font-medium text-gray-700">{Math.round(cropSize.height)}px</span></div></div>
                      <Button onClick={applyCrop} icon={Check} size="sm" fullWidth disabled={isProcessing || !imageLoaded} aria-label="Apply crop">Apply Crop</Button>
                      <Button onClick={resetCrop} variant="secondary" icon={RotateCcw} size="sm" fullWidth aria-label="Reset crop">Reset Crop</Button>
                    </div>
                  </PanelSection>
                  <PanelSection title="Passport Settings" icon={FileImage}>
                    <div className="grid grid-cols-2 gap-2">
                      <div><label className="text-xs text-gray-500 block mb-0.5">Width</label><input type="number" value={passportWidth} onChange={(e) => setPassportWidth(Number(e.target.value))} className="w-full px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none touch-manipulation" min={1} max={100} aria-label="Passport width" /></div>
                      <div><label className="text-xs text-gray-500 block mb-0.5">Height</label><input type="number" value={passportHeight} onChange={(e) => setPassportHeight(Number(e.target.value))} className="w-full px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none touch-manipulation" min={1} max={100} aria-label="Passport height" /></div>
                    </div>
                    <div><label className="text-xs text-gray-500 block mb-0.5">Unit</label><select value={passportUnit} onChange={(e) => setPassportUnit(e.target.value)} className="w-full px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white touch-manipulation" aria-label="Passport unit"><option value="mm">Millimeters (mm)</option><option value="in">Inches (in)</option><option value="px">Pixels (px)</option></select></div>
                    <div className="text-xs text-gray-500 text-center bg-gray-50 p-2 rounded-lg">{passportWidth}×{passportHeight} {passportUnit}</div>
                  </PanelSection>
                </>
              )}
              <PanelSection title="Quick Actions" icon={Sparkles}><Button onClick={() => goToStep(5)} icon={Download} variant="success" size="sm" fullWidth aria-label="Finalize and download">Finalize & Download</Button><Button onClick={() => setShowPrintSheet(true)} icon={Printer} variant="secondary" size="sm" fullWidth aria-label="Print sheet">Print Sheet</Button></PanelSection>
            </div>
          )}
        </div>

        {/* LAZY LOADED: Print Sheet Generator Modal */}
        {showPrintSheet && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200" role="dialog" aria-label="Print sheet generator">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white/95 backdrop-blur-sm z-10">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2"><Printer className="w-5 h-5 text-blue-600" aria-hidden="true" /> Print Sheet Generator</h3>
                <button onClick={() => setShowPrintSheet(false)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors touch-manipulation" aria-label="Close print sheet"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-4 md:p-6">
                <Suspense fallback={<div className="flex flex-col items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" /><p className="text-gray-500">Loading print generator...</p></div>}>
                  <PrintSheetGenerator passportPhoto={editedImage || previewUrl || cropResult} passportSize={{ width: passportWidth, height: passportHeight, unit: passportUnit }} onBack={() => setShowPrintSheet(false)} />
                </Suspense>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}