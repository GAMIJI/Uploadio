// src/pages/PassportPhotoMaker.jsx
import React, { useState, useRef, useEffect, useCallback, useMemo, Suspense, lazy } from 'react';
import {
  Download, RotateCcw, Crop as CropIcon, Check, Layers, Wand2, Sparkles,
  Image as ImageIcon, Loader2, Sliders, Upload, Undo2, Maximize2,
  Minimize2, ZoomIn, RotateCw, Grid, Printer, FileImage, Palette,
  ArrowLeft, ArrowRight, ChevronRight, ChevronLeft, Contrast, Droplet, Eye,
  X, AlertCircle, Shield, Thermometer, Zap, Users, Target, Sun, Eraser, CheckCircle, Type, ChevronUp
} from 'lucide-react';
import toast from 'react-hot-toast';
import SEO from '../pages/SEO';

// LAZY LOAD: Heavy print sheet generator
const PrintSheetGenerator = lazy(() => import('../components/PrintSheetGenerator'));
// LAZY LOAD: Uploader
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
  const [uploadedImage, setUploadedImage] = useState(null)
  const [bgRemovedResult, setBgRemovedResult] = useState(null)
  const [cropResult, setCropResult] = useState(null)
  const [editedImage, setEditedImage] = useState(null)

  const [backgroundRemoved, setBackgroundRemoved] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showPrintSheet, setShowPrintSheet] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [imageLoaded, setImageLoaded] = useState(false)

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

  // --- NAME & DATE OVERLAY STATE ---
  const [enableNameDate, setEnableNameDate] = useState(false)
  const [personName, setPersonName] = useState('')
  const [photoDate, setPhotoDate] = useState('')
  const [fontSize, setFontSize] = useState(16)

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
    { id: 4, label: 'Adjust', icon: Sliders, desc: 'Edit & Overlay' },
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
    setEnableNameDate(false); setPersonName(''); setPhotoDate(''); setFontSize(16);
  }, [])

  const handleStartOver = useCallback(() => {
    cleanup()
    setUploadedImage(null); setBgRemovedResult(null); setCropResult(null);
    setEditedImage(null); setPreviewUrl(null); setBackgroundRemoved(false);
    setBgColor('#ffffff'); setCurrentStep(1); setIsCropMode(false);
    setInitialCropSet(false); setIsEraserMode(false); setIsErasing(false);
    setEraserHistory([]); resetAllAdjustments();
    if (canvasRef.current) canvasRef.current.getContext('2d').clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    toast.success('Started over.', { icon: '🔄' })
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

    // --- RENDER NAME & DATE OVERLAY IF ENABLED ---
    if (enableNameDate && (personName || photoDate) && currentStep >= 4) {
      ctx.restore()
      ctx.save()

      const boxHeight = Math.max(40, Math.round(img.height * 0.16))
      const boxY = img.height - boxHeight

      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, boxY, img.width, boxHeight)

      ctx.strokeStyle = '#D1D5DB'
      ctx.lineWidth = Math.max(1, Math.round(img.width * 0.003))
      ctx.beginPath()
      ctx.moveTo(0, boxY)
      ctx.lineTo(img.width, boxY)
      ctx.stroke()

      const scaledFontSize = Math.round((img.width / 350) * fontSize)
      ctx.fillStyle = '#000000'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.font = `bold ${scaledFontSize}px sans-serif`

      if (personName && photoDate) {
        ctx.fillText(personName.toUpperCase(), img.width / 2, boxY + boxHeight * 0.33)
        ctx.font = `500 ${Math.round(scaledFontSize * 0.85)}px sans-serif`
        ctx.fillText(photoDate, img.width / 2, boxY + boxHeight * 0.72)
      } else if (personName) {
        ctx.fillText(personName.toUpperCase(), img.width / 2, boxY + boxHeight / 2)
      } else if (photoDate) {
        ctx.fillText(photoDate, img.width / 2, boxY + boxHeight / 2)
      }
    }

    ctx.restore()
    try { setPreviewUrl(canvas.toDataURL('image/png', 1.0)); setImageLoaded(true); setError(null) } catch (err) { setImageLoaded(false) }
  }, [rotation, brightness, contrast, saturation, sharpness, highlights, shadows, exposure, vibrance, backgroundRemoved, bgColor, currentStep, isEraserMode, enableNameDate, personName, photoDate, fontSize])

  useEffect(() => {
    if (currentStep >= 4 && displayImageRef.current) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = requestAnimationFrame(() => updateCanvas())
    }
  }, [rotation, brightness, contrast, saturation, sharpness, highlights, shadows, exposure, vibrance, enableNameDate, personName, photoDate, fontSize, currentStep, updateCanvas])

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
    renderImageToCanvas(image.preview); toast.success('Photo uploaded!', { icon: '📸' })
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
      setTimeout(() => setShowProgressOverlay(false), 1000); toast.success('Background removed!', { icon: '✨' })
    } catch (error) {
      toast.error('Failed to remove background.'); setShowProgressOverlay(false)
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleContinueToCrop = useCallback(() => { if (backgroundRemoved) { setIsEraserMode(false); goToStep(3) } }, [backgroundRemoved, goToStep])

  // ERASER LOGIC
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
    const sourceImage = bgRemovedResult || uploadedImage?.preview; 
    if (!sourceImage) return toast.error('No image to crop');

    setIsProcessing(true);
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const scaleX = img.width / originalImageDimensions.width;
      const scaleY = img.height / originalImageDimensions.height;

      const realCropX = Math.round(cropPosition.x * scaleX);
      const realCropY = Math.round(cropPosition.y * scaleY);
      const realCropWidth = Math.round(cropSize.width * scaleX);
      const realCropHeight = Math.round(cropSize.height * scaleY);

      const safeX = Math.max(0, realCropX);
      const safeY = Math.max(0, realCropY);
      const safeWidth = Math.min(img.width - safeX, realCropWidth);
      const safeHeight = Math.min(img.height - safeY, realCropHeight);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = safeWidth;
      canvas.height = safeHeight;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      ctx.drawImage(
        img,
        safeX, safeY, safeWidth, safeHeight,
        0, 0, safeWidth, safeHeight
      );

      const croppedImage = canvas.toDataURL('image/png', 1.0);

      setCropResult(croppedImage);
      setOriginalImageDimensions({ width: safeWidth, height: safeHeight });
      setCropSize({ width: safeWidth, height: safeHeight });
      setCropPosition({ x: 0, y: 0 });

      renderImageToCanvas(croppedImage);
      setIsProcessing(false);
      setCurrentStep(4);
      setIsCropMode(false);
      toast.success('Cropped successfully!', { icon: '✂️' });
    };

    img.onerror = () => {
      toast.error('Failed to crop');
      setIsProcessing(false);
    };

    img.src = sourceImage;
  }, [cropPosition, cropSize, originalImageDimensions, renderImageToCanvas, bgRemovedResult, uploadedImage]);

  const resetCrop = useCallback(() => {
    if (originalImageDimensions.width === 0) return toast.error('No image to reset crop')
    const centered = getCenteredCrop(originalImageDimensions.width, originalImageDimensions.height); setCropSize({ width: centered.width, height: centered.height }); setCropPosition({ x: centered.x, y: centered.y }); setCropAspectRatio(null); setIsDragging(false); setIsResizing(false); setResizeDirection(null); toast.success('Crop reset')
  }, [originalImageDimensions])

  const resetAll = useCallback(() => { resetAllAdjustments(); toast.success('Reset to default'); if (displayImageRef.current) requestAnimationFrame(() => updateCanvas()) }, [resetAllAdjustments, updateCanvas])

  const downloadImage = useCallback((format = 'png') => {
    const imageToDownload = editedImage || previewUrl || cropResult; if (!imageToDownload) return toast.error('No photo to download')
    setIsProcessing(true); try {
      const link = document.createElement('a'); const quality = format === 'png' ? 1.0 : 0.92; let downloadUrl = imageToDownload
      if (format === 'jpg') {
        const canvas = document.createElement('canvas'); const img = new Image(); const dpr = window.devicePixelRatio || 1
        img.onload = () => {
          canvas.width = img.width * dpr; canvas.height = img.height * dpr; const ctx = canvas.getContext('2d'); ctx.scale(dpr, dpr); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, img.width, img.height); ctx.drawImage(img, 0, 0); downloadUrl = canvas.toDataURL('image/jpeg', quality); link.download = `passport-photo-${Date.now()}.jpg`; link.href = downloadUrl; document.body.appendChild(link); link.click(); document.body.removeChild(link); setIsProcessing(false); toast.success(`Downloaded as JPG!`)
        }; img.onerror = () => { setIsProcessing(false); toast.error('Failed to convert') }; img.src = imageToDownload; return
      }
      link.download = `passport-photo-${Date.now()}.${format}`; link.href = downloadUrl; document.body.appendChild(link); link.click(); document.body.removeChild(link); setIsProcessing(false); toast.success(`Downloaded as ${format.toUpperCase()}!`)
    } catch (error) { setIsProcessing(false); toast.error('Download failed') }
  }, [cropResult, editedImage, previewUrl])

  const generatePDF = useCallback(async () => {
    const imageToDownload = editedImage || previewUrl || cropResult; if (!imageToDownload) return toast.error('No photo to download')
    setIsProcessing(true)
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const sizeInMm = passportUnit === 'mm' ? { w: passportWidth, h: passportHeight } : { w: passportWidth * 25.4, h: passportHeight * 25.4 }
      doc.addImage(imageToDownload, 'PNG', 10, 10, sizeInMm.w, sizeInMm.h); doc.save(`passport-photo-${Date.now()}.pdf`); setIsProcessing(false); toast.success('PDF downloaded!')
    } catch (error) { setIsProcessing(false); toast.error('Failed to generate PDF') }
  }, [cropResult, editedImage, previewUrl, passportWidth, passportHeight, passportUnit])

  const prevStep = useCallback(() => { if (currentStep > 1) { if (currentStep - 1 === 1 && uploadedImage) return toast.info('Photo already uploaded.'); goToStep(currentStep - 1) } }, [currentStep, uploadedImage, goToStep])

  const canProceed = useCallback(() => { switch (currentStep) { case 1: return !!uploadedImage; case 2: return backgroundRemoved; case 3: return true; case 4: return true; case 5: return true; case 6: return true; default: return false } }, [currentStep, uploadedImage, backgroundRemoved])

  const getCropOverlayStyle = useCallback(() => {
    const metrics = getRenderedImageMetrics(); if (!metrics || !isCropMode) return {}
    const { offsetX, offsetY, scaleX, scaleY } = metrics
    return { position: 'absolute', left: `${offsetX + cropPosition.x / scaleX}px`, top: `${offsetY + cropPosition.y / scaleY}px`, width: `${cropSize.width / scaleX}px`, height: `${cropSize.height / scaleY}px`, border: '2px solid rgba(255, 255, 255, 0.9)', boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5), inset 0 0 30px rgba(255, 255, 255, 0.05)', cursor: 'move', borderRadius: '2px', pointerEvents: 'auto', zIndex: 10, backgroundColor: 'transparent', transition: 'none' }
  }, [getRenderedImageMetrics, isCropMode, cropPosition, cropSize])

  const handlePositions = useMemo(() => [{ dir: 'nw', style: { top: -8, left: -8 } }, { dir: 'n', style: { top: -8, left: '50%', transform: 'translateX(-50%)' } }, { dir: 'ne', style: { top: -8, right: -8 } }, { dir: 'e', style: { top: '50%', right: -8, transform: 'translateY(-50%)' } }, { dir: 'se', style: { bottom: -8, right: -8 } }, { dir: 's', style: { bottom: -8, left: '50%', transform: 'translateX(-50%)' } }, { dir: 'sw', style: { bottom: -8, left: -8 } }, { dir: 'w', style: { top: '50%', left: -8, transform: 'translateY(-50%)' } }], [])

  // Side Panel Content Primitive (Reusable for Desktop Sidebar + Mobile Drawer)
  const PanelControls = () => (
    <div className="space-y-4">
      {currentStep === 2 && backgroundRemoved && !isEraserMode && (
        <PanelSection title="Background Color" icon={Palette} defaultOpen={true}>
          <BackgroundColorSection bgColor={bgColor} onColorChange={handleSetBackgroundColor} onCustomColorChange={handleSetBackgroundColor} onContinue={handleContinueToCrop} showContinue={true} />
        </PanelSection>
      )}

      {currentStep === 4 && (
        <>
          <PanelSection title="Name & Date Overlay" icon={Type} defaultOpen={true}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5 text-blue-600" /> Enable Caption Box
                </label>
                <button
                  onClick={() => setEnableNameDate(!enableNameDate)}
                  className={`relative w-10 h-5 rounded-full transition-colors touch-manipulation ${enableNameDate ? 'bg-blue-600' : 'bg-gray-300'}`}
                  role="switch"
                  aria-checked={enableNameDate}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${enableNameDate ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>

              {enableNameDate && (
                <div className="space-y-3 pt-2 border-t border-gray-100 animate-in fade-in duration-300">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Full Name</label>
                    <input
                      type="text"
                      value={personName}
                      onChange={(e) => setPersonName(e.target.value)}
                      placeholder="e.g. RAHUL SHARMA"
                      className="w-full px-2.5 py-1.5 text-xs font-semibold uppercase border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-semibold text-gray-600">Date of Photo (DOP)</label>
                      <button
                        onClick={() => {
                          const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')
                          setPhotoDate(today)
                        }}
                        className="text-[10px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded"
                      >
                        Insert Today
                      </button>
                    </div>
                    <input
                      type="text"
                      value={photoDate}
                      onChange={(e) => setPhotoDate(e.target.value)}
                      placeholder="e.g. 15-08-2024"
                      className="w-full px-2.5 py-1.5 text-xs font-semibold border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-semibold text-gray-600">Font Size</label>
                      <span className="text-[10px] font-mono text-gray-500">{fontSize}px</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="26"
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>
                </div>
              )}
            </div>
          </PanelSection>

          <PanelSection title="Image Adjustments" icon={Sliders}>
            <div className="space-y-3">
              <SliderControl label="Zoom" value={zoom} onChange={setZoom} min={50} max={200} icon={ZoomIn} format={(v) => `${v}%`} resetValue={100} />
              <SliderControl label="Rotation" value={rotation} onChange={setRotation} min={-180} max={180} icon={RotateCw} format={(v) => `${v}°`} resetValue={0} />
              <SliderControl label="Brightness" value={brightness} onChange={setBrightness} min={-100} max={100} icon={Sun} resetValue={0} />
              <SliderControl label="Contrast" value={contrast} onChange={setContrast} min={-100} max={100} icon={Contrast} resetValue={0} />
              <SliderControl label="Saturation" value={saturation} onChange={setSaturation} min={-100} max={100} icon={Droplet} resetValue={0} />
              <SliderControl label="Sharpness" value={sharpness} onChange={setSharpness} min={0} max={100} icon={Eye} format={(v) => `${v}%`} resetValue={0} />
              <SliderControl label="Highlights" value={highlights} onChange={setHighlights} min={-100} max={100} icon={Zap} resetValue={0} />
              <SliderControl label="Shadows" value={shadows} onChange={setShadows} min={-100} max={100} icon={Shield} resetValue={0} />
            </div>
          </PanelSection>
        </>
      )}

      {currentStep === 3 && (
        <>
          <PanelSection title="Crop Settings" icon={CropIcon}>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1.5">Aspect Ratio</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {['Free', '1:1', '4:3', '3:4', '16:9', '9:16', '2:3'].map((ratio) => (
                    <button
                      key={ratio}
                      onClick={() => {
                        setCropAspectRatio(ratio === 'Free' ? null : ratio);
                        if (ratio !== 'Free') {
                          const [w, h] = ratio.split(':').map(Number);
                          const currentSize = cropSize.width;
                          const newHeight = (currentSize / w) * h;
                          setCropSize({ width: currentSize, height: newHeight })
                        }
                      }}
                      className={`px-2 py-1.5 text-xs font-medium rounded-lg border transition-all touch-manipulation ${
                        cropAspectRatio === (ratio === 'Free' ? null : ratio)
                          ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-gray-700 flex items-center gap-1.5"><Grid className="w-3.5 h-3.5" /> Grid</label>
                <button onClick={() => setShowGrid(!showGrid)} className={`relative w-10 h-5 rounded-full transition-colors touch-manipulation ${showGrid ? 'bg-blue-600' : 'bg-gray-300'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${showGrid ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-gray-700 flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Face Guide</label>
                <button onClick={() => setShowFaceGuide(!showFaceGuide)} className={`relative w-10 h-5 rounded-full transition-colors touch-manipulation ${showFaceGuide ? 'bg-blue-600' : 'bg-gray-300'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${showFaceGuide ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>

              <Button onClick={applyCrop} icon={Check} size="sm" fullWidth disabled={isProcessing || !imageLoaded}>Apply Crop</Button>
              <Button onClick={resetCrop} variant="secondary" icon={RotateCcw} size="sm" fullWidth>Reset Crop</Button>
            </div>
          </PanelSection>

          <PanelSection title="Passport Dimensions" icon={FileImage}>
            <div className="grid grid-cols-2 gap-2">
              <div><label className="text-xs text-gray-500 block mb-0.5">Width</label><input type="number" value={passportWidth} onChange={(e) => setPassportWidth(Number(e.target.value))} className="w-full px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg outline-none" min={1} max={100} /></div>
              <div><label className="text-xs text-gray-500 block mb-0.5">Height</label><input type="number" value={passportHeight} onChange={(e) => setPassportHeight(Number(e.target.value))} className="w-full px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg outline-none" min={1} max={100} /></div>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-0.5 mt-2">Unit</label>
              <select value={passportUnit} onChange={(e) => setPassportUnit(e.target.value)} className="w-full px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg bg-white outline-none">
                <option value="mm">Millimeters (mm)</option>
                <option value="in">Inches (in)</option>
                <option value="px">Pixels (px)</option>
              </select>
            </div>
          </PanelSection>
        </>
      )}

      <PanelSection title="Quick Actions" icon={Sparkles}>
        <Button onClick={() => { setIsMobileBottomSheet(false); goToStep(5); }} icon={Download} variant="success" size="sm" fullWidth>Finalize & Download</Button>
        <Button onClick={() => { setIsMobileBottomSheet(false); setShowPrintSheet(true); }} icon={Printer} variant="secondary" size="sm" fullWidth>Print Sheet</Button>
      </PanelSection>
    </div>
  )

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
            <div className="flex items-center gap-3 mb-3 z-10 animate-in fade-in slide-in-from-top-4 duration-500 px-2 shrink-0">
              <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center shrink-0"><Wand2 className="w-4 h-4 text-purple-600" /></div>
              <div>
                <h3 className="text-base md:text-xl font-extrabold text-gray-900">{isEraserMode ? 'Manual Eraser' : 'AI Background Removal'}</h3>
                <p className="text-xs text-gray-500 hidden sm:block">{isEraserMode ? 'Brush over areas to remove leftover background.' : 'Instantly extract the subject for a compliant background.'}</p>
              </div>
            </div>

            <div className={`flex-1 flex gap-4 min-h-0 overflow-hidden ${isEraserMode ? 'flex-col md:flex-row' : 'flex-col'}`}>
              <div className="relative w-full flex-1 bg-white/80 backdrop-blur-md rounded-2xl md:rounded-[2rem] shadow-xl shadow-purple-500/5 border border-white flex flex-col group z-10 overflow-hidden">
                {isEraserMode && (<style>{`.eraser-canvas { cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="${eraserSize}" height="${eraserSize}" viewBox="0 0 ${eraserSize} ${eraserSize}"><circle cx="${eraserSize / 2}" cy="${eraserSize / 2}" r="${eraserSize / 2 - 1}" fill="rgba(239, 68, 68, 0.4)" stroke="red" stroke-width="1"/></svg>') ${eraserSize / 2} ${eraserSize / 2}, crosshair !important; }`}</style>)}
                <div className={`relative w-full h-full p-2 md:p-8 flex items-center justify-center overflow-auto custom-scrollbar z-10 ${isEraserMode && eraserZoom > 100 ? 'items-start justify-start' : ''}`}>
                  {isEraserMode ? (
                    <canvas ref={eraserCanvasRef} className="drop-shadow-2xl eraser-canvas touch-none" style={{ width: `${eraserZoom}%`, height: 'auto', maxWidth: eraserZoom === 100 ? '100%' : 'none', maxHeight: eraserZoom === 100 ? '100%' : 'none' }} onMouseDown={handleEraserStart} onTouchStart={handleEraserStart} />
                  ) : previewUrl && imageLoaded ? (
                    <img src={previewUrl} alt="Current photo preview" className="max-w-full max-h-full object-contain drop-shadow-2xl pointer-events-none" loading="lazy" />
                  ) : (
                    <div className="flex flex-col items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-purple-600 mb-2" /><span className="text-xs font-semibold text-gray-400">Loading photo...</span></div>
                  )}
                </div>
              </div>

              <div className={`${isEraserMode ? 'w-full md:w-[320px] flex flex-col justify-center' : 'w-full max-w-lg mx-auto pb-1'} z-10 shrink-0 flex flex-col gap-2.5`}>
                {!backgroundRemoved ? (
                  <Button onClick={handleBackgroundRemoval} loading={isProcessing} icon={Wand2} size="lg" fullWidth className="bg-gradient-to-r from-purple-600 to-pink-600 border-none shadow-lg shadow-purple-500/30 text-white font-bold py-3.5">
                    {isProcessing ? 'Removing...' : 'Auto-Remove Background'}
                  </Button>
                ) : isEraserMode ? (
                  <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl border border-gray-100 shadow-lg flex flex-col gap-4 w-full">
                    <div className="flex flex-col gap-1.5"><div className="flex justify-between text-xs font-bold text-gray-700"><span>Brush Size</span><span>{eraserSize}px</span></div><input type="range" min="5" max="100" value={eraserSize} onChange={(e) => setEraserSize(Number(e.target.value))} className="w-full accent-purple-600" /></div>
                    <div className="flex flex-col gap-1.5"><div className="flex justify-between text-xs font-bold text-gray-700"><span>Canvas Zoom</span><span>{eraserZoom}%</span></div><input type="range" min="100" max="400" value={eraserZoom} onChange={(e) => setEraserZoom(Number(e.target.value))} className="w-full accent-blue-600" /></div>
                    <div className="flex gap-2 pt-2 border-t border-gray-100">
                      <Button onClick={undoEraser} disabled={eraserHistory.length <= 1} variant="secondary" icon={Undo2} fullWidth className="py-2.5 text-xs">Undo</Button>
                      <Button onClick={() => setIsEraserMode(false)} icon={Check} fullWidth className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-2.5 text-xs">Done</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 w-full max-w-lg mx-auto">
                    <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50/90 py-2 px-3 rounded-xl border border-emerald-200/60"><CheckCircle className="w-4 h-4 text-emerald-500" /><span>Background Removed</span></div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button icon={Eraser} size="md" fullWidth className="bg-white border border-purple-200 text-purple-700 font-bold py-2.5 text-xs" onClick={() => setIsEraserMode(true)}>Touch-up</Button>
                      <Button icon={ArrowRight} size="md" fullWidth className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-2.5 text-xs" onClick={handleContinueToCrop}>To Crop</Button>
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
              <img src={previewUrl} alt="Crop preview" className="max-w-full max-h-full object-contain select-none" style={{ transform: `scale(${zoom / 100})` }} draggable={false} />
            ) : (
              <div className="flex items-center justify-center text-gray-400"><Loader2 className="w-6 h-6 animate-spin mr-2" /><span className="text-xs">Loading image...</span></div>
            )}
            {isCropMode && originalImageDimensions.width > 0 && initialCropSet && (
              <>
                <div style={getCropOverlayStyle()} onMouseDown={handleCropMouseDown} onTouchStart={handleCropTouchStart} className="crop-overlay">
                  {showGrid && (<div className="absolute inset-0 pointer-events-none opacity-30"><div className="absolute top-1/3 left-0 right-0 h-px bg-white" /><div className="absolute top-2/3 left-0 right-0 h-px bg-white" /><div className="absolute left-1/3 top-0 bottom-0 w-px bg-white" /><div className="absolute left-2/3 top-0 bottom-0 w-px bg-white" /></div>)}
                  {handlePositions.map(({ dir, style }) => (<div key={dir} className="resize-handle" data-direction={dir} style={{ position: 'absolute', width: '18px', height: '18px', backgroundColor: '#FFFFFF', border: '2px solid #3B82F6', borderRadius: '50%', cursor: `${dir}-resize`, zIndex: 20, touchAction: 'none', ...style }} />))}
                </div>
                <CropInfo width={cropSize.width} height={cropSize.height} aspectRatio={cropAspectRatio} ratio={currentAspectRatioString} />
              </>
            )}
          </div>
        )
      case 4:
        return (
          <div className="flex flex-col h-full w-full p-2 md:p-4 overflow-hidden relative">
            <div className="flex items-center gap-3 mb-2 shrink-0 px-2">
              <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center shrink-0"><Sliders className="w-4 h-4 text-blue-600" /></div>
              <div>
                <h3 className="text-base font-extrabold text-gray-900">Fine-Tune & Caption</h3>
                <p className="text-[11px] text-gray-500">Live preview. Open settings below to adjust controls.</p>
              </div>
            </div>
            <div className="relative w-full flex-1 bg-white/80 backdrop-blur-md rounded-2xl md:rounded-[2rem] shadow-xl border border-white flex items-center justify-center overflow-hidden">
              {previewUrl && imageLoaded ? (
                <div className="relative w-full h-full flex items-center justify-center p-4 overflow-hidden z-10">
                  <img src={previewUrl} alt="Edited preview" className="max-w-full max-h-full object-contain select-none drop-shadow-xl" style={{ transform: `scale(${zoom / 100})` }} draggable={false} />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" /><span className="text-xs text-gray-400">Rendering...</span></div>
              )}
            </div>
          </div>
        )
      case 5:
        const imageToDownload = editedImage || previewUrl || cropResult;
        return (
          <div className="flex flex-col items-center justify-center h-full w-full p-4 overflow-y-auto custom-scrollbar relative">
            <div className="m-auto text-center max-w-sm w-full py-4">
              <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-green-100"><Download className="w-6 h-6 text-green-600" /></div>
              <h3 className="text-2xl font-extrabold text-gray-900 mb-1">Save Photo</h3>
              <p className="text-xs text-gray-500 mb-6">High resolution export ready.</p>
              <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100 mb-6 relative">
                <div className="flex justify-center mb-3">
                  {imageToDownload ? (
                    <img src={imageToDownload} alt="Final passport preview" className="rounded-lg shadow border-4 border-white object-contain bg-gray-50 max-h-[30vh]" loading="lazy" />
                  ) : (
                    <div className="w-32 h-40 bg-gray-50 rounded-xl flex items-center justify-center border border-dashed border-gray-200"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
                  )}
                </div>
                <div className="inline-flex items-center gap-1.5 bg-green-50 px-3 py-1 rounded-full text-xs font-bold text-green-700">{Math.round(passportWidth)} × {Math.round(passportHeight)} {passportUnit}</div>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-4">
                <Button onClick={() => downloadImage('png')} icon={ImageIcon} variant="primary" fullWidth loading={isProcessing} className="py-2.5 text-xs">PNG</Button>
                <Button onClick={() => downloadImage('jpg')} icon={ImageIcon} variant="primary" fullWidth loading={isProcessing} className="py-2.5 text-xs bg-purple-600">JPG</Button>
                <Button onClick={generatePDF} icon={FileImage} variant="danger" fullWidth loading={isProcessing} className="py-2.5 text-xs">PDF</Button>
              </div>
              <Button variant="secondary" icon={ArrowRight} size="md" fullWidth onClick={() => goToStep(6)} className="py-2.5 text-xs">Print Layout Sheet</Button>
            </div>
          </div>
        )
      case 6:
        const finalImageToPrint = editedImage || previewUrl || cropResult;
        return (
          <div className="flex flex-col items-center justify-center h-full w-full p-4 overflow-y-auto custom-scrollbar relative">
            <div className="m-auto text-center max-w-sm w-full py-4">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-blue-100"><Printer className="w-6 h-6 text-blue-600" /></div>
              <h3 className="text-2xl font-extrabold text-gray-900 mb-1">Print Layout Sheet</h3>
              <p className="text-xs text-gray-500 mb-6">Generate multiple copies on A4 or 4x6 paper.</p>
              <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100 mb-6">
                <div className="flex justify-center mb-3">
                  {finalImageToPrint ? (
                    <img src={finalImageToPrint} alt="Final preview" className="rounded-lg shadow border-4 border-white object-contain max-h-[30vh]" loading="lazy" />
                  ) : (
                    <div className="w-32 h-40 bg-gray-50 rounded-xl flex items-center justify-center border border-dashed border-gray-200"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
                  )}
                </div>
              </div>
              <Button onClick={() => setShowPrintSheet(true)} icon={Layers} size="lg" fullWidth className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 text-sm">Generate Layout Sheet</Button>
            </div>
          </div>
        )
      default: return null
    }
  }, [currentStep, uploadedImage, previewUrl, bgRemovedResult, cropResult, imageLoaded, backgroundRemoved, isProcessing, zoom, isCropMode, originalImageDimensions, cropSize, cropPosition, showGrid, showFaceGuide, handlePositions, passportWidth, passportHeight, passportUnit, handleImageUpload, handleBackgroundRemoval, getCropOverlayStyle, handleCropMouseDown, handleCropTouchStart, downloadImage, generatePDF, editedImage, setCurrentStep, setIsCropMode, handleContinueToCrop, initialCropSet, currentAspectRatioString, goToStep, isEraserMode, eraserSize, eraserZoom, handleEraserStart, handleEraserMove, handleEraserEnd, undoEraser, eraserHistory, eraserCanvasRef, setIsEraserMode])

  return (
    <>
      <SEO title="Passport Photo Maker - Professional ID Studio" description="Create compliant passport photos with AI background removal, custom cropping, and print sheets." url="https://Uploadio.com/passport-photo-maker" />
      <style>{`.custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 20px; } .touch-manipulation { touch-action: manipulation; } .crop-overlay { touch-action: none; user-select: none; } .resize-handle { touch-action: none; }`}</style>

      {showProgressOverlay && <BackgroundRemovalProgress progress={removalProgress} stage={removalStage} isComplete={isRemovalComplete} />}

      <div className="h-screen flex flex-col bg-gray-50/60 overflow-hidden font-sans">
        
        {/* Top Header */}
        <header className="h-14 bg-white/90 backdrop-blur-md border-b border-gray-200/80 flex items-center px-3 md:px-4 gap-2 flex-shrink-0 z-20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20">
              <span className="text-white font-black text-xs">P</span>
            </div>
            <span className="font-extrabold text-gray-900 text-sm hidden sm:inline">Passport Studio</span>
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            {/* <Button variant="ghost" size="sm" icon={RotateCcw} onClick={resetAll} className="text-xs px-2.5 py-1.5">Reset</Button> */}
            {uploadedImage && <Button variant="outline" size="sm" icon={Upload} onClick={handleStartOver} className="text-xs px-2.5 py-1.5"><span className="hidden sm:inline">Upload New</span></Button>}
            {uploadedImage && (
              <button 
                onClick={() => setIsMobileBottomSheet(!isMobileBottomSheet)} 
                className={`p-2 rounded-xl border transition-all md:hidden ${isMobileBottomSheet ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-200 text-gray-600'}`}
                aria-label="Toggle Controls"
              >
                <Sliders className="w-4 h-4" />
              </button>
            )}
          </div>
        </header>

        {/* Main Editor Layout */}
        <div className="flex-1 flex overflow-hidden relative">
          
          {/* Desktop Left Stepper Sidebar */}
          <div className={`bg-white/90 backdrop-blur-md border-r border-gray-200/80 flex-shrink-0 transition-all duration-300 overflow-y-auto hidden md:block ${isLeftPanelCollapsed ? 'w-14' : 'w-48 lg:w-56'}`}>
            <div className="p-3">
              <button onClick={() => setIsLeftPanelCollapsed(!isLeftPanelCollapsed)} className="w-full flex items-center justify-center p-2 rounded-xl hover:bg-gray-100 transition-colors mb-3">
                {isLeftPanelCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
              <div className="space-y-1">
                {steps.map((step) => {
                  const Icon = step.icon; const isCompleted = step.id < currentStep; const isCurrent = step.id === currentStep; const isLocked = (step.id === 1 && uploadedImage && currentStep > 1) || step.id > currentStep
                  return (
                    <button key={step.id} onClick={() => !isLocked && goToStep(step.id)} disabled={isLocked} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${isCurrent ? 'bg-blue-50 text-blue-700 font-bold border border-blue-100' : ''} ${isCompleted ? 'text-emerald-600 font-medium' : ''} ${isLocked ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-50'}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs ${isCurrent ? 'bg-blue-600 text-white' : ''} ${isCompleted ? 'bg-emerald-100 text-emerald-600' : ''} ${isLocked ? 'bg-gray-100 text-gray-400' : ''}`}>
                        {isCompleted ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                      </div>
                      {!isLeftPanelCollapsed && (
                        <div className="flex-1 text-left">
                          <span className="text-xs font-semibold block">{step.label}</span>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Center Stage Workspace */}
          <div className="flex-1 flex flex-col bg-gray-100/50 overflow-hidden relative">
            <div className="flex-1 relative overflow-hidden p-2 sm:p-4">
              <div ref={containerRef} className="relative w-full h-full flex items-center justify-center overflow-hidden" style={{ touchAction: 'none' }}>
                <canvas ref={canvasRef} className="hidden" />
                {renderStepContent()}
              </div>
            </div>

            {/* Bottom Step Navigation Bar */}
            <div className="flex-shrink-0 bg-white/90 backdrop-blur-md border-t border-gray-200/80 px-3 md:px-4 py-2.5 flex items-center justify-between z-10">
              <Button variant="secondary" size="sm" icon={ArrowLeft} onClick={prevStep} disabled={currentStep === 1} className="py-2 text-xs">Back</Button>
              <div className="text-xs font-bold text-gray-500">Step {currentStep} of 6</div>
              <Button variant="primary" size="sm" icon={currentStep === 6 ? Check : ArrowRight} onClick={() => { if (currentStep === 3 && !cropResult) { applyCrop(); return; } if (currentStep === 4 && previewUrl) { setEditedImage(previewUrl); toast.success('Saved!') } goToStep(currentStep + 1) }} disabled={!canProceed() || currentStep === 6} className="py-2 text-xs bg-gradient-to-r from-blue-600 to-indigo-600">
                {currentStep === 4 ? 'Save' : currentStep === 5 ? 'Print Sheet' : currentStep === 6 ? 'Done' : 'Next'}
              </Button>
            </div>
          </div>

          {/* Desktop Right Settings Panel */}
          {uploadedImage && isRightPanelOpen && (
            <div className="bg-white/95 backdrop-blur-md border-l border-gray-200/80 overflow-y-auto flex-shrink-0 p-4 custom-scrollbar hidden md:block lg:w-72 w-64 space-y-4">
              <PanelControls />
            </div>
          )}

          {/* Mobile Bottom Sheet Drawer for Settings */}
          {uploadedImage && (
            <div className={`fixed inset-x-0 bottom-0 z-40 bg-white/95 backdrop-blur-2xl rounded-t-[2rem] border-t border-gray-200 shadow-2xl transition-all duration-300 ease-out md:hidden max-h-[70vh] flex flex-col ${isMobileBottomSheet ? 'translate-y-0' : 'translate-y-full pointer-events-none'}`}>
              <div className="p-3 border-b border-gray-100 flex items-center justify-between shrink-0">
                <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-2" />
                <span className="text-xs font-extrabold text-gray-800 pt-2">Step {currentStep} Settings</span>
                <button onClick={() => setIsMobileBottomSheet(false)} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-4 overflow-y-auto custom-scrollbar flex-1">
                <PanelControls />
              </div>
            </div>
          )}

        </div>

        {/* Print Sheet Modal */}
        {showPrintSheet && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-3 md:p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
                <h3 className="text-sm md:text-base font-bold text-gray-900 flex items-center gap-2"><Printer className="w-4 h-4 text-blue-600" /> Print Sheet Generator</h3>
                <button onClick={() => setShowPrintSheet(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-3 md:p-6">
                <Suspense fallback={<div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto" /></div>}>
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