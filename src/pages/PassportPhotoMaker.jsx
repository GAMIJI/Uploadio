import React, { useState, useRef, useEffect, useCallback, useMemo, Suspense, lazy } from 'react';
import {
  Download, RotateCcw, Crop as CropIcon, Check, Layers, Wand2, Sparkles,
  Image as ImageIcon, Loader2, Sliders, Upload, Undo2, ZoomIn, RotateCw, 
  Grid, Printer, FileImage, Palette, ArrowLeft, ArrowRight, ChevronRight, 
  ChevronLeft, Contrast, Droplet, Eye, X, Shield, Zap, Users, Sun, Eraser, 
  CheckCircle, Type, FileCheck2
} from 'lucide-react';
import toast from 'react-hot-toast';
import SEO from '../pages/SEO';

// LAZY LOAD: Heavy components
const PrintSheetGenerator = lazy(() => import('../components/PrintSheetGenerator'));
const ImageUploader = lazy(() => import('../components/ImageUploader'));

// IMPORT SEPARATED UI PRIMITIVES
import { Button } from '../components/passport/Button';
import { PanelSection } from '../components/passport/PanelSection';
import { SliderControl } from '../components/passport/SliderControl';
import { BackgroundRemovalProgress } from '../components/passport/BackgroundRemovalProgress';
import { BackgroundColorSection } from '../components/passport/BackgroundColorSection';
import { CropInfo } from '../components/passport/CropInfo';

// --- UTILS ---
const getCenteredCrop = (imageWidth, imageHeight, sizeRatio = 0.7) => {
  const size = Math.min(imageWidth, imageHeight) * sizeRatio;
  return { width: size, height: size, x: (imageWidth - size) / 2, y: (imageHeight - size) / 2 };
};

const getAspectRatioString = (width, height) => {
  const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
  const divisor = gcd(Math.round(width), Math.round(height));
  return `${Math.round(width / divisor)}:${Math.round(height / divisor)}`;
};

export default function PassportPhotoMaker() {
  // Core Image States
  const [uploadedImage, setUploadedImage] = useState(null);
  const [cropResult, setCropResult] = useState(null);
  const [bgRemovedResult, setBgRemovedResult] = useState(null);
  const [finalProcessedImage, setFinalProcessedImage] = useState(null);

  // Workflow & Processing
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPrintSheet, setShowPrintSheet] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Layout States
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
  const [isMobileBottomSheet, setIsMobileBottomSheet] = useState(false);

  // Adjustments & Styles
  const [bgColor, setBgColor] = useState('transparent');
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [sharpness, setSharpness] = useState(0);
  const [highlights, setHighlights] = useState(0);
  const [shadows, setShadows] = useState(0);
  const [exposure, setExposure] = useState(0);
  const [vibrance, setVibrance] = useState(0);

  // Eraser States
  const [isEraserMode, setIsEraserMode] = useState(false);
  const [eraserSize, setEraserSize] = useState(20);
  const [eraserZoom, setEraserZoom] = useState(100);
  const [isErasing, setIsErasing] = useState(false);
  const [eraserHistory, setEraserHistory] = useState([]);
  
  const eraserCanvasRef = useRef(null);
  const lastPos = useRef({ x: 0, y: 0 });
  const hasErasedRef = useRef(false);

  // Background Removal Progress
  const [backgroundRemoved, setBackgroundRemoved] = useState(false);
  const [removalProgress, setRemovalProgress] = useState(0);
  const [removalStage, setRemovalStage] = useState('analyzing');
  const [isRemovalComplete, setIsRemovalComplete] = useState(false);
  // Optional: keep overlay state in case you want to use it elsewhere, but disabled for BG removal
  const [showProgressOverlay, setShowProgressOverlay] = useState(false);
  const progressIntervalRef = useRef(null);

  // Overlay States
  const [enableNameDate, setEnableNameDate] = useState(false);
  const [personName, setPersonName] = useState('');
  const [photoDate, setPhotoDate] = useState('');
  const [fontSize, setFontSize] = useState(16);

  // Passport Dimensions
  const [passportWidth, setPassportWidth] = useState(35);
  const [passportHeight, setPassportHeight] = useState(45);
  const [passportUnit, setPassportUnit] = useState('mm');

  // Crop States
  const [cropPosition, setCropPosition] = useState({ x: 0, y: 0 });
  const [cropSize, setCropSize] = useState({ width: 300, height: 300 });
  const [originalImageDimensions, setOriginalImageDimensions] = useState({ width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragStartCropPos, setDragStartCropPos] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState(null);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0, posX: 0, posY: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const [cropAspectRatio, setCropAspectRatio] = useState(null);
  const [isCropMode, setIsCropMode] = useState(false);
  const [initialCropSet, setInitialCropSet] = useState(false);
  const [currentAspectRatioString, setCurrentAspectRatioString] = useState('Free');

  // Refs
  const imageRef = useRef(null);
  const abortControllerRef = useRef(null);

  const steps = useMemo(() => [
    { id: 1, label: 'Upload', icon: Upload, desc: 'Upload photo' },
    { id: 2, label: 'Crop', icon: CropIcon, desc: 'Crop to size' },
    { id: 3, label: 'Remove BG', icon: Wand2, desc: 'AI background' },
    { id: 4, label: 'Adjust', icon: Sliders, desc: 'Edit & Overlay' },
    { id: 5, label: 'Finalize', icon: FileCheck2, desc: 'Save & Print' }
  ], []);

  const handlePositions = useMemo(() => [
    { dir: 'nw', style: { top: -8, left: -8 } },
    { dir: 'n', style: { top: -8, left: '50%', transform: 'translateX(-50%)' } },
    { dir: 'ne', style: { top: -8, right: -8 } },
    { dir: 'e', style: { top: '50%', right: -8, transform: 'translateY(-50%)' } },
    { dir: 'se', style: { bottom: -8, right: -8 } },
    { dir: 's', style: { bottom: -8, left: '50%', transform: 'translateX(-50%)' } },
    { dir: 'sw', style: { bottom: -8, left: -8 } },
    { dir: 'w', style: { top: '50%', left: -8, transform: 'translateY(-50%)' } }
  ], []);

  // --- CORE LOGIC ---

  const resetAllAdjustments = useCallback(() => {
    setBrightness(0); setContrast(0); setSaturation(0); setSharpness(0);
    setHighlights(0); setShadows(0); setExposure(0); setVibrance(0);
    setRotation(0); setZoom(100); setBgColor('transparent');
    setEnableNameDate(false); setPersonName(''); setPhotoDate(''); setFontSize(16);
  }, []);

  const handleStartOver = useCallback(() => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    setUploadedImage(null); setCropResult(null); setBgRemovedResult(null); setFinalProcessedImage(null);
    setBackgroundRemoved(false); setIsProcessing(false); setShowPrintSheet(false); setCurrentStep(1);
    setIsCropMode(false); setIsEraserMode(false); setIsErasing(false); setEraserHistory([]);
    setInitialCropSet(false); resetAllAdjustments();
    toast.success('Started over.', { icon: '🔄' });
  }, [resetAllAdjustments]);

  const handleImageUpload = useCallback((image) => {
    if (!image || !image.preview) return toast.error('Invalid image. Please try again.');
    try {
      setUploadedImage(image);
      setImageLoaded(false);
      setCurrentStep(2);
      setIsCropMode(true);
      toast.success('Photo uploaded!', { icon: '📸' });
    } catch (err) {
      toast.error('Failed to process image upload.');
    }
  }, []);

  const activeSourceImage = useMemo(() => {
    if (currentStep === 1 || currentStep === 2) return uploadedImage?.preview;
    if (currentStep === 3) return bgRemovedResult || cropResult || uploadedImage?.preview;
    if (currentStep === 4) return bgRemovedResult || cropResult || uploadedImage?.preview;
    return finalProcessedImage || bgRemovedResult || cropResult || uploadedImage?.preview;
  }, [currentStep, uploadedImage, cropResult, bgRemovedResult, finalProcessedImage]);

  const imageFilterStyle = useMemo(() => {
    if (currentStep < 4) return {};
    const filters = [];
    if (brightness !== 0) filters.push(`brightness(${100 + brightness}%)`);
    if (contrast !== 0) filters.push(`contrast(${100 + contrast}%)`);
    if (saturation !== 0) filters.push(`saturate(${100 + saturation}%)`);
    if (sharpness > 0) filters.push(`contrast(${100 + sharpness * 0.5}%)`); 
    if (exposure !== 0) filters.push(`brightness(${100 + exposure * 0.5}%)`);
    return { filter: filters.join(' ') };
  }, [brightness, contrast, saturation, sharpness, exposure, currentStep]);

  const wrapperTransformStyle = useMemo(() => {
    if (currentStep < 4) return {};
    return {
      transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
      backgroundColor: bgColor !== 'transparent' ? bgColor : undefined,
      transition: 'transform 0.1s ease-out',
      transformOrigin: 'center center'
    };
  }, [zoom, rotation, bgColor, currentStep]);

  // --- CROP LOGIC ---

  useEffect(() => {
    if (isCropMode && originalImageDimensions.width > 0 && !initialCropSet) {
      const centered = getCenteredCrop(originalImageDimensions.width, originalImageDimensions.height);
      setCropSize({ width: centered.width, height: centered.height });
      setCropPosition({ x: centered.x, y: centered.y });
      setInitialCropSet(true);
    }
  }, [isCropMode, originalImageDimensions, initialCropSet]);

  const getRenderedImageMetrics = useCallback(() => {
    if (!imageRef.current || originalImageDimensions.width === 0) return null;
    const rect = imageRef.current.getBoundingClientRect();
    return {
      rect,
      scaleX: originalImageDimensions.width / rect.width,
      scaleY: originalImageDimensions.height / rect.height
    };
  }, [originalImageDimensions]);

  const getMousePositionInImage = useCallback((clientX, clientY) => {
    const metrics = getRenderedImageMetrics();
    if (!metrics) return { x: 0, y: 0 };
    const { rect, scaleX, scaleY } = metrics;
    let x = (clientX - rect.left) * scaleX;
    let y = (clientY - rect.top) * scaleY;
    x = Math.max(0, Math.min(x, originalImageDimensions.width));
    y = Math.max(0, Math.min(y, originalImageDimensions.height));
    return { x, y };
  }, [getRenderedImageMetrics, originalImageDimensions]);

  const handleCropMouseDown = useCallback((e) => {
    if (e.target.classList?.contains('resize-handle')) {
      e.stopPropagation(); e.preventDefault();
      setIsResizing(true);
      setResizeDirection(e.target.dataset.direction);
      const mousePos = getMousePositionInImage(e.clientX, e.clientY);
      setResizeStart({ x: mousePos.x, y: mousePos.y, width: cropSize.width, height: cropSize.height, posX: cropPosition.x, posY: cropPosition.y });
      return;
    }
    if (!isCropMode) return;
    e.preventDefault(); e.stopPropagation();
    setIsDragging(true);
    const mousePos = getMousePositionInImage(e.clientX, e.clientY);
    setDragStart({ x: mousePos.x, y: mousePos.y });
    setDragStartCropPos({ x: cropPosition.x, y: cropPosition.y });
  }, [isCropMode, cropPosition, cropSize, getMousePositionInImage]);

  const handleCropTouchStart = useCallback((e) => {
    if (e.target.classList?.contains('resize-handle')) {
      e.stopPropagation();
      const touch = e.touches[0];
      setIsResizing(true);
      setResizeDirection(e.target.dataset.direction);
      const mousePos = getMousePositionInImage(touch.clientX, touch.clientY);
      setResizeStart({ x: mousePos.x, y: mousePos.y, width: cropSize.width, height: cropSize.height, posX: cropPosition.x, posY: cropPosition.y });
      return;
    }
    if (!isCropMode) return;
    e.stopPropagation();
    const touch = e.touches[0];
    setIsDragging(true);
    const mousePos = getMousePositionInImage(touch.clientX, touch.clientY);
    setDragStart({ x: mousePos.x, y: mousePos.y });
    setDragStartCropPos({ x: cropPosition.x, y: cropPosition.y });
  }, [isCropMode, cropPosition, cropSize, getMousePositionInImage]);

  const processCropMove = useCallback((clientX, clientY) => {
    if (!isDragging && !isResizing) return;
    requestAnimationFrame(() => {
      const mousePos = getMousePositionInImage(clientX, clientY);
      
      if (isDragging) {
        const deltaX = mousePos.x - dragStart.x;
        const deltaY = mousePos.y - dragStart.y;
        let newX = Math.max(0, Math.min(dragStartCropPos.x + deltaX, originalImageDimensions.width - cropSize.width));
        let newY = Math.max(0, Math.min(dragStartCropPos.y + deltaY, originalImageDimensions.height - cropSize.height));
        setCropPosition({ x: newX, y: newY });
      } else if (isResizing && resizeDirection) {
        const deltaX = mousePos.x - resizeStart.x;
        const deltaY = mousePos.y - resizeStart.y;
        let newWidth = resizeStart.width;
        let newHeight = resizeStart.height;
        let newX = resizeStart.posX;
        let newY = resizeStart.posY;

        let aspectRatio = null;
        if (cropAspectRatio && cropAspectRatio !== 'Free') {
          const [w, h] = cropAspectRatio.split(':').map(Number);
          aspectRatio = w / h;
        }

        if (resizeDirection.includes('e')) newWidth = Math.max(50, resizeStart.width + deltaX);
        if (resizeDirection.includes('w')) {
          newWidth = Math.max(50, resizeStart.width - deltaX);
          newX = resizeStart.posX + resizeStart.width - newWidth;
        }
        if (resizeDirection.includes('s')) newHeight = Math.max(50, resizeStart.height + deltaY);
        if (resizeDirection.includes('n')) {
          newHeight = Math.max(50, resizeStart.height - deltaY);
          newY = resizeStart.posY + resizeStart.height - newHeight;
        }

        if (aspectRatio) {
          if (resizeDirection === 'e' || resizeDirection === 'w') {
            newHeight = newWidth / aspectRatio;
            newY = resizeStart.posY + (resizeStart.height - newHeight) / 2;
          } else if (resizeDirection === 'n' || resizeDirection === 's') {
            newWidth = newHeight * aspectRatio;
            newX = resizeStart.posX + (resizeStart.width - newWidth) / 2;
          } else {
            if (newWidth / newHeight > aspectRatio) {
              newWidth = newHeight * aspectRatio;
              if (resizeDirection.includes('w')) newX = resizeStart.posX + resizeStart.width - newWidth;
            } else {
              newHeight = newWidth / aspectRatio;
              if (resizeDirection.includes('n')) newY = resizeStart.posY + resizeStart.height - newHeight;
            }
          }
        }

        if (newX < 0) { newWidth += newX; newX = 0; if (aspectRatio) newHeight = newWidth / aspectRatio; }
        if (newY < 0) { newHeight += newY; newY = 0; if (aspectRatio) newWidth = newHeight * aspectRatio; }
        if (newX + newWidth > originalImageDimensions.width) {
          newWidth = originalImageDimensions.width - newX;
          if (aspectRatio) newHeight = newWidth / aspectRatio;
        }
        if (newY + newHeight > originalImageDimensions.height) {
          newHeight = originalImageDimensions.height - newY;
          if (aspectRatio) newWidth = newHeight * aspectRatio;
        }

        setCropSize({ width: newWidth, height: newHeight });
        setCropPosition({ x: newX, y: newY });
      }
    });
  }, [isDragging, isResizing, getMousePositionInImage, dragStart, dragStartCropPos, cropSize, originalImageDimensions, cropAspectRatio, resizeDirection, resizeStart]);

  useEffect(() => {
    if (!isDragging && !isResizing) return;
    const handleMouseMove = (e) => processCropMove(e.clientX, e.clientY);
    const handleTouchMove = (e) => processCropMove(e.touches[0].clientX, e.touches[0].clientY);
    const handleUp = () => { setIsDragging(false); setIsResizing(false); setResizeDirection(null); };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleUp);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleUp);
    };
  }, [isDragging, isResizing, processCropMove]);

  const getCropOverlayStyle = useCallback(() => {
    const metrics = getRenderedImageMetrics();
    if (!metrics || !isCropMode) return { display: 'none' };
    const { scaleX, scaleY } = metrics;
    return {
      position: 'absolute',
      left: `${cropPosition.x / scaleX}px`,
      top: `${cropPosition.y / scaleY}px`,
      width: `${cropSize.width / scaleX}px`,
      height: `${cropSize.height / scaleY}px`,
      border: '2px solid rgba(255, 255, 255, 0.9)',
      boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6), inset 0 0 30px rgba(255, 255, 255, 0.1)',
      cursor: 'move',
      zIndex: 20,
    };
  }, [getRenderedImageMetrics, isCropMode, cropPosition, cropSize]);

  const applyCrop = useCallback(() => {
    const sourceImage = uploadedImage?.preview; 
    if (!sourceImage) return toast.error('No image to crop');

    setIsProcessing(true);
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = cropSize.width;
      canvas.height = cropSize.height;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      ctx.drawImage(
        img,
        cropPosition.x, cropPosition.y, cropSize.width, cropSize.height,
        0, 0, cropSize.width, cropSize.height
      );

      const croppedImage = canvas.toDataURL('image/png', 1.0);
      setCropResult(croppedImage);
      
      setOriginalImageDimensions({ width: cropSize.width, height: cropSize.height });
      setIsProcessing(false);
      setIsCropMode(false);
      setCurrentStep(3); 
      toast.success('Cropped successfully!', { icon: '✂️' });
    };

    img.onerror = () => {
      toast.error('Failed to crop');
      setIsProcessing(false);
    };

    img.src = sourceImage;
  }, [cropPosition, cropSize, uploadedImage]);

  const resetCrop = useCallback(() => {
    if (originalImageDimensions.width === 0) return;
    const centered = getCenteredCrop(originalImageDimensions.width, originalImageDimensions.height);
    setCropSize({ width: centered.width, height: centered.height });
    setCropPosition({ x: centered.x, y: centered.y });
    setCropAspectRatio(null);
    toast.success('Crop reset');
  }, [originalImageDimensions]);

  useEffect(() => {
    if (cropSize.width > 0 && cropSize.height > 0) {
      setCurrentAspectRatioString(getAspectRatioString(cropSize.width, cropSize.height));
    }
  }, [cropSize]);

  // --- BACKGROUND REMOVAL LOGIC ---

  const simulateProgress = useCallback(() => {
    let progress = 0;
    const stages = ['Analyzing image...', 'Detecting subject...', 'Removing background...', 'Refining edges...', 'Optimizing details...'];
    let stageIndex = 0;
    
    // We intentionally disable the full-screen progress overlay 
    // to utilize the much sleeker inline scanning animation instead.
    setShowProgressOverlay(false);
    setRemovalProgress(0);
    setRemovalStage(stages[0]);
    setIsRemovalComplete(false);
    
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    progressIntervalRef.current = setInterval(() => {
      progress += Math.random() * 3 + 1;
      const newStageIndex = Math.min(Math.floor((progress / 100) * stages.length), stages.length - 1);
      
      if (newStageIndex !== stageIndex) {
        stageIndex = newStageIndex;
        setRemovalStage(stages[stageIndex]);
      }
      
      if (progress >= 100) {
        clearInterval(progressIntervalRef.current);
        setRemovalProgress(100);
        setRemovalStage('Complete');
        setIsRemovalComplete(true);
      } else {
        setRemovalProgress(progress);
      }
    }, 80);
  }, []);

  const handleBackgroundRemoval = async () => {
    const sourceImage = cropResult || uploadedImage?.preview;
    if (!sourceImage) return toast.error('No image loaded');
    
    setIsProcessing(true);
    simulateProgress();
    
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = sourceImage;
      await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; });

      const { removeBackground } = await import('../services/backgroundRemoval');
      const transparentImage = await removeBackground(img, 'auto', (p) => setRemovalProgress(Math.min(p * 100, 95)));

      if (!transparentImage) throw new Error('Background removal failed');
      
      setBgRemovedResult(transparentImage);
      setBackgroundRemoved(true);
      
      setRemovalProgress(100);
      setRemovalStage('Complete');
      setIsRemovalComplete(true);
      toast.success('Background removed!', { icon: '✨' });
    } catch (error) {
      toast.error('Failed to remove background.');
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    } finally {
      setIsProcessing(false);
    }
  };

  // --- ERASER LOGIC ---

  useEffect(() => {
    if (isEraserMode && eraserCanvasRef.current && bgRemovedResult) {
      const canvas = eraserCanvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        setEraserHistory([bgRemovedResult]);
        hasErasedRef.current = false;
      };
      img.src = bgRemovedResult;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEraserMode]);

  const getEraserMousePosition = useCallback((e) => {
    const canvas = eraserCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }, []);

  const drawErase = useCallback((x1, y1, x2, y2) => {
    const canvas = eraserCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.lineWidth = eraserSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }, [eraserSize]);

  const handleEraserStart = useCallback((e) => {
    if (!isEraserMode) return;
    e.preventDefault();
    setIsErasing(true);
    hasErasedRef.current = true;
    const pos = getEraserMousePosition(e);
    lastPos.current = pos;
    drawErase(pos.x, pos.y, pos.x, pos.y);
  }, [isEraserMode, getEraserMousePosition, drawErase]);

  const handleEraserMove = useCallback((e) => {
    if (!isErasing || !isEraserMode) return;
    e.preventDefault();
    hasErasedRef.current = true;
    const pos = getEraserMousePosition(e);
    drawErase(lastPos.current.x, lastPos.current.y, pos.x, pos.y);
    lastPos.current = pos;
  }, [isErasing, isEraserMode, getEraserMousePosition, drawErase]);

  const handleEraserEnd = useCallback(() => {
    if (!isErasing) return;
    setIsErasing(false);
    if (hasErasedRef.current && eraserCanvasRef.current) {
      const newBgRemoved = eraserCanvasRef.current.toDataURL('image/png');
      setBgRemovedResult(newBgRemoved);
      setEraserHistory(prev => [...prev, newBgRemoved]);
      hasErasedRef.current = false;
    }
  }, [isErasing]);

  const undoEraser = useCallback(() => {
    if (eraserHistory.length > 1) {
      const newHistory = [...eraserHistory];
      newHistory.pop(); 
      const previousState = newHistory[newHistory.length - 1];
      
      setEraserHistory(newHistory);
      setBgRemovedResult(previousState);
      
      const canvas = eraserCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.onload = () => {
          ctx.globalCompositeOperation = 'source-over';
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
        };
        img.src = previousState;
      }
    }
  }, [eraserHistory]);


  // --- FINAL IMAGE GENERATION ---
  
  const generateFinalImage = useCallback(async () => {
    return new Promise((resolve, reject) => {
      const sourceImage = bgRemovedResult || cropResult || uploadedImage?.preview;
      if (!sourceImage) return reject('No source image');

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;

        // Apply Background
        if (bgColor && bgColor !== 'transparent') {
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Apply Adjustments
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(zoom / 100, zoom / 100);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);

        const filters = [];
        if (brightness !== 0) filters.push(`brightness(${100 + brightness}%)`);
        if (contrast !== 0) filters.push(`contrast(${100 + contrast}%)`);
        if (saturation !== 0) filters.push(`saturate(${100 + saturation}%)`);
        if (sharpness > 0) filters.push(`contrast(${100 + sharpness * 0.5}%)`);
        if (exposure !== 0) filters.push(`brightness(${100 + exposure * 0.5}%)`);
        
        ctx.filter = filters.join(' ');
        ctx.drawImage(img, 0, 0);
        ctx.restore();

        // Apply Name/Date Overlay
        if (enableNameDate && (personName || photoDate)) {
          const boxHeight = Math.max(40, Math.round(canvas.height * 0.16));
          const boxY = canvas.height - boxHeight;

          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, boxY, canvas.width, boxHeight);
          
          ctx.strokeStyle = '#D1D5DB';
          ctx.lineWidth = Math.max(1, Math.round(canvas.width * 0.003));
          ctx.beginPath();
          ctx.moveTo(0, boxY);
          ctx.lineTo(canvas.width, boxY);
          ctx.stroke();

          const scaledFontSize = Math.round((canvas.width / 350) * fontSize);
          ctx.fillStyle = '#000000';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.font = `bold ${scaledFontSize}px sans-serif`;

          if (personName && photoDate) {
            ctx.fillText(personName.toUpperCase(), canvas.width / 2, boxY + boxHeight * 0.33);
            ctx.font = `500 ${Math.round(scaledFontSize * 0.85)}px sans-serif`;
            ctx.fillText(photoDate, canvas.width / 2, boxY + boxHeight * 0.72);
          } else if (personName) {
            ctx.fillText(personName.toUpperCase(), canvas.width / 2, boxY + boxHeight / 2);
          } else if (photoDate) {
            ctx.fillText(photoDate, canvas.width / 2, boxY + boxHeight / 2);
          }
        }

        const finalDataUrl = canvas.toDataURL('image/png', 1.0);
        setFinalProcessedImage(finalDataUrl);
        resolve(finalDataUrl);
      };
      
      img.onerror = reject;
      img.src = sourceImage;
    });
  }, [bgRemovedResult, cropResult, uploadedImage, bgColor, brightness, contrast, saturation, sharpness, exposure, zoom, rotation, enableNameDate, personName, photoDate, fontSize]);


  // --- NAVIGATION ---
  const canProceed = useCallback(() => {
    switch (currentStep) {
      case 1: return !!uploadedImage;
      case 2: return !!cropResult || !!uploadedImage;
      case 3: return true; 
      case 4: return true;
      case 5: return true;
      default: return false;
    }
  }, [currentStep, uploadedImage, cropResult]);

  const goToStep = useCallback(async (step) => {
    if (step === 1 && uploadedImage) { handleStartOver(); return; }
    if (step < 1 || step > 5) return;
    
    if (currentStep === 4 && step === 5) {
      setIsProcessing(true);
      try {
        await generateFinalImage();
      } catch (err) {
        toast.error("Failed to process final image");
      }
      setIsProcessing(false);
    }

    if (step < currentStep) {
      if (step <= 4) resetAllAdjustments();
      if (step <= 3) { setBgRemovedResult(null); setBackgroundRemoved(false); setIsEraserMode(false); }
      if (step <= 2) { setCropResult(null); setInitialCropSet(false); }
    }

    setCurrentStep(step);
    setIsCropMode(step === 2);
  }, [currentStep, uploadedImage, handleStartOver, generateFinalImage, resetAllAdjustments]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      if (currentStep - 1 === 1 && uploadedImage) return toast.info('To upload a new photo, click Upload New.');
      goToStep(currentStep - 1);
    }
  }, [currentStep, uploadedImage, goToStep]);


  // --- EXPORT & PRINT ---
  const downloadImage = useCallback(async (format = 'png') => {
    const targetImage = finalProcessedImage;
    if (!targetImage) return toast.error('No photo to download');
    
    setIsProcessing(true);
    try {
      const link = document.createElement('a');
      const quality = format === 'png' ? 1.0 : 0.92;
      let downloadUrl = targetImage;

      if (format === 'jpg') {
        const canvas = document.createElement('canvas');
        const img = new Image();
        await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = targetImage; });
        canvas.width = img.width; canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        downloadUrl = canvas.toDataURL('image/jpeg', quality);
      }

      link.download = `passport-photo-${Date.now()}.${format}`;
      link.href = downloadUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Downloaded as ${format.toUpperCase()}!`);
    } catch (error) {
      toast.error('Download failed');
    } finally {
      setIsProcessing(false);
    }
  }, [finalProcessedImage]);

  const generatePDF = useCallback(async () => {
    const targetImage = finalProcessedImage;
    if (!targetImage) return toast.error('No photo to download');
    
    setIsProcessing(true);
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const sizeInMm = passportUnit === 'mm' ? { w: passportWidth, h: passportHeight } : { w: passportWidth * 25.4, h: passportHeight * 25.4 };
      
      doc.addImage(targetImage, 'PNG', 10, 10, sizeInMm.w, sizeInMm.h);
      doc.save(`passport-photo-${Date.now()}.pdf`);
      toast.success('PDF downloaded!');
    } catch (error) {
      toast.error('Failed to generate PDF');
    } finally {
      setIsProcessing(false);
    }
  }, [finalProcessedImage, passportWidth, passportHeight, passportUnit]);


  // --- VIEW RENDERING DELEGATES ---

  const Step3Controls = () => (
    <div className="space-y-4">
      {!backgroundRemoved ? (
        <PanelSection title="AI Background" icon={Wand2} defaultOpen={true}>
          <div className="flex flex-col items-center text-center gap-3 py-2">
            <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center"><Wand2 className="w-6 h-6 text-purple-600" /></div>
            <p className="text-xs text-gray-500">Automatically remove the background with one click.</p>
            <Button 
              onClick={handleBackgroundRemoval} 
              disabled={isProcessing} 
              icon={isProcessing ? Loader2 : Wand2} 
              size="md" 
              fullWidth 
              className={`bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md transition-all ${isProcessing ? 'opacity-80 cursor-not-allowed' : ''}`}
            >
              {isProcessing ? `Removing... ${Math.round(removalProgress)}%` : 'Auto-Remove'}
            </Button>
          </div>
        </PanelSection>
      ) : isEraserMode ? (
        <PanelSection title="Eraser Tools" icon={Eraser} defaultOpen={true}>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-bold text-gray-700 mb-1"><span>Brush Size</span><span>{eraserSize}px</span></div>
              <input type="range" min="5" max="100" value={eraserSize} onChange={(e)=>setEraserSize(Number(e.target.value))} className="w-full accent-purple-600" />
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold text-gray-700 mb-1"><span>Zoom</span><span>{eraserZoom}%</span></div>
              <input type="range" min="100" max="400" value={eraserZoom} onChange={(e)=>setEraserZoom(Number(e.target.value))} className="w-full accent-blue-600" />
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button onClick={undoEraser} disabled={eraserHistory.length <= 1} variant="secondary" icon={Undo2} size="sm">Undo</Button>
              <Button onClick={() => setIsEraserMode(false)} icon={Check} size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold">Apply</Button>
            </div>
          </div>
        </PanelSection>
      ) : (
        <>
          <PanelSection title="Background Color" icon={Palette} defaultOpen={true}>
            <BackgroundColorSection bgColor={bgColor} onColorChange={setBgColor} onCustomColorChange={setBgColor} />
          </PanelSection>
          <PanelSection title="Refine Edge" icon={Eraser} defaultOpen={true}>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 py-2 px-3 rounded-xl border border-emerald-200"><CheckCircle className="w-4 h-4" /> Removed</div>
              <Button icon={Eraser} size="sm" fullWidth variant="outline" onClick={() => setIsEraserMode(true)}>Manual Touch-up</Button>
            </div>
          </PanelSection>
        </>
      )}
    </div>
  );

  const renderStepContent = () => {
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
        );

      case 2: // CROP
        return (
          <div className="relative w-full h-full flex items-center justify-center p-4">
            {activeSourceImage ? (
              <div className="relative inline-block overflow-hidden rounded-lg shadow-2xl" style={{ lineHeight: 0 }}>
                <img 
                  ref={imageRef} 
                  src={activeSourceImage} 
                  alt="Crop preview" 
                  onLoad={(e) => {
                    setOriginalImageDimensions({ width: e.target.naturalWidth, height: e.target.naturalHeight });
                    setImageLoaded(true);
                  }}
                  className="max-w-full max-h-[70vh] w-auto h-auto block object-contain select-none" 
                  draggable={false} 
                />
                {isCropMode && imageLoaded && originalImageDimensions.width > 0 && initialCropSet && (
                  <>
                    <div style={getCropOverlayStyle()} onMouseDown={handleCropMouseDown} onTouchStart={handleCropTouchStart} className="crop-overlay">
                      {showGrid && (
                        <div className="absolute inset-0 pointer-events-none opacity-40">
                          <div className="absolute top-1/3 left-0 right-0 h-px bg-white shadow-sm" />
                          <div className="absolute top-2/3 left-0 right-0 h-px bg-white shadow-sm" />
                          <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white shadow-sm" />
                          <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white shadow-sm" />
                        </div>
                      )}
                      {handlePositions.map(({ dir, style }) => (
                        <div key={dir} className="resize-handle" data-direction={dir} 
                          style={{ position: 'absolute', width: '20px', height: '20px', backgroundColor: '#FFFFFF', border: '2px solid #3B82F6', borderRadius: '50%', cursor: `${dir}-resize`, zIndex: 20, touchAction: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', ...style }} 
                        />
                      ))}
                    </div>
                    <CropInfo width={cropSize.width} height={cropSize.height} aspectRatio={cropAspectRatio} ratio={currentAspectRatioString} />
                  </>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-400">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
                <span className="text-xs font-medium">Loading image...</span>
              </div>
            )}
          </div>
        );

      case 3: // REMOVE BG
        return (
          <div className="flex flex-col h-full w-full p-2 md:p-4 overflow-hidden relative">
            <div className="flex items-center gap-3 mb-2 shrink-0 px-2 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="w-8 h-8 bg-purple-50 rounded-xl flex items-center justify-center shrink-0"><Wand2 className="w-4 h-4 text-purple-600" /></div>
              <div>
                <h3 className="text-base font-extrabold text-gray-900">Background Removal</h3>
                <p className="text-[11px] text-gray-500">AI extraction & manual touch-ups.</p>
              </div>
            </div>

            <div className="relative w-full flex-1 bg-white/80 backdrop-blur-xl rounded-2xl md:rounded-[2rem] shadow-2xl border border-white/40 flex flex-col items-center justify-center overflow-hidden">
              {isEraserMode && (
                <button onClick={() => setIsEraserMode(false)} className="absolute top-4 right-4 z-50 p-2 bg-white hover:bg-gray-100 text-gray-700 rounded-full shadow-lg border border-gray-200 transition-all">
                  <X className="w-5 h-5" />
                </button>
              )}
              
              <div className={`relative w-full h-full overflow-auto custom-scrollbar z-10 ${isEraserMode ? 'bg-slate-100 p-0 m-0 flex items-start justify-start' : 'p-4 md:p-8 flex items-center justify-center'}`}>
                {isEraserMode && bgRemovedResult ? (
                  <div style={{ transform: `scale(${eraserZoom / 100})`, transformOrigin: 'top left', minWidth: '100%', minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="relative p-8">
                     <div className="relative inline-block shadow-2xl rounded-lg overflow-hidden bg-transparent">
                       <div className="absolute inset-0 z-0 opacity-20" style={{ backgroundImage: 'repeating-conic-gradient(#cbd5e1 0% 25%, transparent 0% 50%)', backgroundSize: '20px 20px' }}></div>
                       <canvas 
                         ref={eraserCanvasRef} 
                         className="relative z-10 eraser-canvas touch-none block" 
                         style={{ maxWidth: '80vw', height: 'auto', objectFit: 'contain' }}
                         onMouseDown={handleEraserStart} 
                         onMouseMove={handleEraserMove}
                         onMouseUp={handleEraserEnd}
                         onMouseLeave={handleEraserEnd}
                         onTouchStart={handleEraserStart} 
                         onTouchMove={handleEraserMove}
                         onTouchEnd={handleEraserEnd}
                       />
                     </div>
                  </div>
                ) : activeSourceImage ? (
                  <div className="relative inline-block shadow-2xl transition-colors duration-200 rounded-lg overflow-hidden" style={{ backgroundColor: !isEraserMode && bgColor !== 'transparent' ? bgColor : undefined }}>
                     {backgroundRemoved && bgColor === 'transparent' && <div className="absolute inset-0 z-0 opacity-20" style={{ backgroundImage: 'repeating-conic-gradient(#cbd5e1 0% 25%, transparent 0% 50%)', backgroundSize: '20px 20px' }}></div>}
                     <img src={activeSourceImage} alt="Preview" className="relative z-10 max-w-full max-h-[60vh] object-contain pointer-events-none block" loading="lazy" />

                     {/* INLINE AI SCANNING ANIMATION */}
                     {isProcessing && !backgroundRemoved && (
                        <div className="absolute inset-0 z-20 overflow-hidden rounded-lg pointer-events-none">
                           {/* Darken background slightly */}
                           <div className="absolute inset-0 bg-purple-900/30 backdrop-blur-[2px] transition-all duration-300"></div>

                           {/* Scanning Laser Line */}
                           <div className="absolute top-0 left-0 w-full h-1 bg-purple-400 shadow-[0_0_20px_5px_rgba(168,85,247,0.6)] animate-[scan_2s_ease-in-out_infinite]"></div>

                           {/* Centered Progress Indicator */}
                           <div className="absolute inset-0 flex flex-col items-center justify-center text-white drop-shadow-xl">
                              <div className="bg-gray-900/80 backdrop-blur-md px-6 py-4 rounded-2xl flex flex-col items-center border border-white/10 shadow-2xl">
                                  <Wand2 className="w-8 h-8 animate-bounce mb-3 text-purple-400" />
                                  <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300 mb-1">
                                      {Math.round(removalProgress)}%
                                  </div>
                                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-300 animate-pulse">
                                      {removalStage}
                                  </span>
                              </div>
                           </div>
                        </div>
                     )}

                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-10 bg-white/50 rounded-3xl border-2 border-gray-100 border-dashed">
                    <div className="relative w-12 h-12 mb-4">
                      <div className="absolute inset-0 border-4 border-purple-100 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-purple-500 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <span className="text-sm font-bold text-gray-500">Loading photo...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 4: // ADJUSTMENTS
        return (
          <div className="flex flex-col h-full w-full p-2 md:p-4 overflow-hidden relative">
            <div className="flex items-center gap-3 mb-2 shrink-0 px-2 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center shrink-0"><Sliders className="w-4 h-4 text-blue-600" /></div>
              <div>
                <h3 className="text-base font-extrabold text-gray-900">Fine-Tune & Caption</h3>
                <p className="text-[11px] text-gray-500">Live preview. Open settings panel to adjust controls.</p>
              </div>
            </div>
            
            <div className="relative w-full flex-1 bg-white/80 backdrop-blur-xl rounded-2xl md:rounded-[2rem] shadow-2xl border border-white/40 flex items-center justify-center overflow-hidden">
              {activeSourceImage ? (
                <div className="relative flex items-center justify-center p-4 overflow-hidden w-full h-full z-10 bg-slate-50/50">
                  <div className="relative inline-block shadow-2xl rounded-lg overflow-hidden" style={wrapperTransformStyle}>
                    
                    {bgColor === 'transparent' && <div className="absolute inset-0 z-0 opacity-20" style={{ backgroundImage: 'repeating-conic-gradient(#cbd5e1 0% 25%, transparent 0% 50%)', backgroundSize: '20px 20px' }}></div>}
                    
                    <img 
                      src={activeSourceImage} 
                      alt="Edited preview" 
                      className="relative z-10 max-w-full max-h-[65vh] object-contain select-none block" 
                      style={imageFilterStyle}
                      draggable={false} 
                    />
                    
                    {enableNameDate && (personName || photoDate) && (
                       <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-300 flex flex-col items-center justify-center overflow-hidden z-30" 
                            style={{ height: '16%', minHeight: '40px' }}>
                          <span className="font-bold text-gray-900 text-center uppercase truncate w-full px-2" style={{ fontSize: `${Math.max(10, fontSize)}px`, lineHeight: 1.1 }}>
                            {personName}
                          </span>
                          {photoDate && (
                            <span className="font-medium text-gray-800 text-center truncate w-full px-2 mt-0.5" style={{ fontSize: `${Math.max(8, fontSize * 0.85)}px` }}>
                              {photoDate}
                            </span>
                          )}
                       </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" /><span className="text-xs text-gray-400">Rendering...</span></div>
              )}
            </div>
          </div>
        );

      case 5: // FINALIZE (Split Layout Full Width)
        return (
          <div className="w-full h-full p-4 md:p-8 flex flex-col lg:flex-row gap-6 lg:gap-10 items-center justify-center bg-gray-50/50 overflow-y-auto custom-scrollbar">
            
            {/* Left: Premium Preview Box */}
            <div className="flex-1 w-full max-w-2xl flex flex-col items-center justify-center animate-in fade-in slide-in-from-left-8 duration-700">
               <div className="relative p-6 md:p-10 bg-white rounded-[2rem] shadow-xl border border-gray-100 w-full flex items-center justify-center">
                  <div className="absolute inset-0 z-0 opacity-10 rounded-[2rem]" style={{ backgroundImage: 'repeating-conic-gradient(#64748b 0% 25%, transparent 0% 50%)', backgroundSize: '30px 30px' }}></div>
                  {finalProcessedImage ? (
                    <img src={finalProcessedImage} alt="Final passport preview" className="relative z-10 max-h-[55vh] object-contain drop-shadow-2xl rounded-md ring-1 ring-black/5" />
                  ) : (
                    <div className="py-20 flex flex-col items-center"><Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" /><span className="font-medium text-gray-500">Generating High-Res Image...</span></div>
                  )}
               </div>
               <div className="mt-6 inline-flex items-center gap-2.5 bg-white px-5 py-2.5 rounded-full text-sm font-bold text-gray-800 shadow-sm border border-gray-200">
                 <CheckCircle className="w-5 h-5 text-emerald-500" />
                 Final Size: {Math.round(passportWidth)} × {Math.round(passportHeight)} {passportUnit}
               </div>
            </div>

            {/* Right: Export Actions */}
            <div className="w-full lg:w-[420px] flex flex-col gap-6 animate-in fade-in slide-in-from-right-8 duration-700">
               
               <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-8">
                  <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center mb-4 border border-green-100"><Download className="w-6 h-6 text-green-600" /></div>
                  <h3 className="text-2xl font-extrabold text-gray-900 mb-2">Export Photo</h3>
                  <p className="text-sm text-gray-500 mb-6">Choose your preferred download format for digital submission.</p>
                  
                  <div className="space-y-3">
                     <Button onClick={() => downloadImage('jpg')} loading={isProcessing} icon={ImageIcon} size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 py-4 text-sm font-bold">Download High-Res JPG</Button>
                     <div className="grid grid-cols-2 gap-3">
                         <Button onClick={() => downloadImage('png')} loading={isProcessing} icon={ImageIcon} variant="outline" className="w-full bg-white hover:bg-gray-50 border-gray-200 py-3 text-sm font-semibold">PNG Format</Button>
                         <Button onClick={generatePDF} loading={isProcessing} icon={FileImage} variant="outline" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 py-3 text-sm font-semibold">PDF Format</Button>
                     </div>
                  </div>
               </div>

               <div className="bg-gradient-to-br from-indigo-900 to-blue-900 rounded-3xl shadow-xl border border-indigo-800 p-6 md:p-8 text-white relative overflow-hidden group">
                  <div className="absolute -top-6 -right-6 p-4 opacity-10 transform group-hover:scale-110 transition-transform duration-500"><Printer className="w-40 h-40" /></div>
                  <div className="relative z-10">
                    <h3 className="text-2xl font-extrabold mb-2">Print Layout</h3>
                    <p className="text-sm text-indigo-200 mb-6 leading-relaxed">Need physical copies? Generate a ready-to-print sheet for 4x6 or A4 paper instantly.</p>
                    <Button onClick={() => setShowPrintSheet(true)} icon={Layers} size="lg" className="w-full bg-white text-indigo-900 hover:bg-indigo-50 shadow-lg shadow-black/20 py-4 text-sm font-bold border-none">Generate Print Sheet</Button>
                  </div>
               </div>

            </div>
          </div>
        );

      default: return null;
    }
  };

  return (
    <>
      <SEO title="Passport Photo Maker - Professional ID Studio" description="Create compliant passport photos with AI background removal, custom cropping, and print sheets." url="https://Uploadio.com/passport-photo-maker" />
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; } 
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 20px; } 
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .touch-manipulation { touch-action: manipulation; } 
        .crop-overlay { touch-action: none; user-select: none; } 
        .resize-handle { touch-action: none; }
        
        @keyframes scan {
          0% { top: -5%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 105%; opacity: 0; }
        }
      `}</style>

      {/* Note: showProgressOverlay is now bypassed for inline UI, but kept logic intact incase needed later */}
      {showProgressOverlay && <BackgroundRemovalProgress progress={removalProgress} stage={removalStage} isComplete={isRemovalComplete} />}

      <div className="h-screen flex flex-col bg-slate-50/50 overflow-hidden font-sans">
        
        {/* Top Header */}
        <header className="h-14 bg-white/90 backdrop-blur-xl border-b border-gray-200/80 flex items-center px-3 md:px-5 gap-2 flex-shrink-0 z-30 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20">
              <span className="text-white font-black text-xs">P</span>
            </div>
            <span className="font-extrabold text-gray-900 text-sm tracking-tight hidden sm:inline">Passport Studio</span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {uploadedImage && <Button variant="outline" size="sm" icon={Upload} onClick={handleStartOver} className="text-xs px-3 py-1.5 shadow-sm bg-white"><span className="hidden sm:inline">Upload New</span></Button>}
            {uploadedImage && currentStep !== 5 && (
              <button 
                onClick={() => setIsMobileBottomSheet(!isMobileBottomSheet)} 
                className={`p-2 rounded-xl border transition-all md:hidden shadow-sm ${isMobileBottomSheet ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
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
          <div className={`bg-white/80 backdrop-blur-xl border-r border-gray-200/80 flex-shrink-0 transition-all duration-300 ease-in-out overflow-y-auto hidden md:block z-20 ${isLeftPanelCollapsed ? 'w-16' : 'w-56 lg:w-64'}`}>
            <div className="p-3">
              <button onClick={() => setIsLeftPanelCollapsed(!isLeftPanelCollapsed)} className="w-full flex items-center justify-center p-2 rounded-xl hover:bg-gray-100 transition-colors mb-4 text-gray-500 hover:text-gray-900">
                {isLeftPanelCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
              <div className="space-y-1.5">
                {steps.map((step) => {
                  const Icon = step.icon; 
                  const isCompleted = step.id < currentStep; 
                  const isCurrent = step.id === currentStep; 
                  const isLocked = (step.id === 1 && uploadedImage && currentStep > 1) || (!uploadedImage && step.id > 1) || (step.id > currentStep + 1 && !finalProcessedImage); 
                  
                  return (
                    <button key={step.id} onClick={() => !isLocked && goToStep(step.id)} disabled={isLocked} 
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${isCurrent ? 'bg-blue-50 text-blue-700 font-bold border border-blue-100 shadow-sm' : ''} ${isCompleted && !isCurrent ? 'text-emerald-600 font-medium hover:bg-emerald-50/50' : ''} ${isLocked ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-50'}`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs transition-colors ${isCurrent ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : ''} ${isCompleted && !isCurrent ? 'bg-emerald-100 text-emerald-600' : ''} ${isLocked ? 'bg-gray-100 text-gray-400' : (!isCurrent && !isCompleted ? 'bg-gray-100 text-gray-600' : '')}`}>
                        {isCompleted && !isCurrent ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                      </div>
                      {!isLeftPanelCollapsed && (
                        <div className="flex-1 text-left">
                          <span className="text-[13px] tracking-tight block">{step.label}</span>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Center Stage Workspace */}
          <div className="flex-1 flex flex-col bg-slate-50/50 overflow-hidden relative">
            <div className="flex-1 relative overflow-hidden">
              {renderStepContent()}
            </div>

            {/* Bottom Step Navigation Bar */}
            <div className="flex-shrink-0 bg-white/90 backdrop-blur-xl border-t border-gray-200/80 px-4 py-3 flex items-center justify-between z-20 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)]">
              <Button variant="secondary" size="md" icon={ArrowLeft} onClick={prevStep} disabled={currentStep === 1} className="py-2 text-sm bg-white shadow-sm hover:bg-gray-50">Back</Button>
              
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5 hidden sm:flex">
                  {steps.map(s => (
                    <div key={s.id} className={`h-1.5 rounded-full transition-all duration-300 ${s.id === currentStep ? 'w-6 bg-blue-600' : s.id < currentStep ? 'w-2 bg-blue-300' : 'w-2 bg-gray-200'}`} />
                  ))}
                </div>
                <span className="text-xs font-bold text-gray-500 sm:hidden">Step {currentStep} of 5</span>
              </div>

              <Button variant="primary" size="md" icon={currentStep === 5 ? Check : ArrowRight} 
                onClick={() => { 
                  if (currentStep === 2 && !cropResult) { applyCrop(); return; } 
                  if (currentStep === 5) { handleStartOver(); return; }
                  goToStep(currentStep + 1);
                }} 
                disabled={!canProceed() || isProcessing} 
                className="py-2 text-sm bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md shadow-blue-500/20 font-semibold px-6">
                {currentStep === 4 ? 'Save & Finalize' : currentStep === 5 ? 'Done' : 'Next'}
              </Button>
            </div>
          </div>

          {/* Desktop Right Settings Panel (Hidden on Finalize step) */}
          {uploadedImage && isRightPanelOpen && currentStep !== 5 && (
            <div className="bg-white/90 backdrop-blur-xl border-l border-gray-200/80 overflow-y-auto flex-shrink-0 p-4 custom-scrollbar hidden md:block lg:w-80 w-72 space-y-4 z-20 shadow-[-4px_0_24px_-10px_rgba(0,0,0,0.05)]">
              <div className="space-y-4 pb-10 animate-in fade-in duration-300">
                {currentStep === 3 && <Step3Controls />}
                
                {currentStep === 4 && (
                  <>
                    <PanelSection title="Name & Date Overlay" icon={Type} defaultOpen={true}>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-1">
                          <label className="text-sm font-bold text-gray-800 flex items-center gap-2">
                            <Type className="w-4 h-4 text-blue-600" /> Enable Caption
                          </label>
                          <button
                            onClick={() => setEnableNameDate(!enableNameDate)}
                            className={`relative w-11 h-6 rounded-full transition-colors touch-manipulation shadow-inner ${enableNameDate ? 'bg-blue-600' : 'bg-gray-200'}`}
                            role="switch"
                            aria-checked={enableNameDate}
                          >
                            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${enableNameDate ? 'translate-x-5' : 'translate-x-0.5'}`} />
                          </button>
                        </div>

                        {enableNameDate && (
                          <div className="space-y-4 pt-3 border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div>
                              <label className="text-xs font-bold text-gray-600 block mb-1.5 uppercase tracking-wider">Full Name</label>
                              <input
                                type="text"
                                value={personName}
                                onChange={(e) => setPersonName(e.target.value)}
                                placeholder="e.g. RAHUL SHARMA"
                                className="w-full px-3 py-2 text-sm font-semibold uppercase border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm bg-gray-50/50 focus:bg-white"
                              />
                            </div>

                            <div>
                              <div className="flex justify-between items-center mb-1.5">
                                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Date (DOP)</label>
                                <button
                                  onClick={() => {
                                    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
                                    setPhotoDate(today);
                                  }}
                                  className="text-[10px] font-bold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-md transition-colors"
                                >
                                  Today
                                </button>
                              </div>
                              <input
                                type="text"
                                value={photoDate}
                                onChange={(e) => setPhotoDate(e.target.value)}
                                placeholder="e.g. 15-08-2024"
                                className="w-full px-3 py-2 text-sm font-semibold border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm bg-gray-50/50 focus:bg-white"
                              />
                            </div>

                            <div className="pt-1">
                              <div className="flex justify-between items-center mb-2">
                                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Font Size</label>
                                <span className="text-[11px] font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{fontSize}px</span>
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

                    <PanelSection title="Image Adjustments" icon={Sliders} defaultOpen={true}>
                      <div className="space-y-4 pt-1">
                        <SliderControl label="Zoom" value={zoom} onChange={setZoom} min={50} max={200} icon={ZoomIn} format={(v) => `${v}%`} resetValue={100} />
                        <SliderControl label="Rotation" value={rotation} onChange={setRotation} min={-180} max={180} icon={RotateCw} format={(v) => `${v}°`} resetValue={0} />
                        <div className="h-px bg-gray-100 my-2" />
                        <SliderControl label="Brightness" value={brightness} onChange={setBrightness} min={-100} max={100} icon={Sun} resetValue={0} />
                        <SliderControl label="Contrast" value={contrast} onChange={setContrast} min={-100} max={100} icon={Contrast} resetValue={0} />
                        <SliderControl label="Saturation" value={saturation} onChange={setSaturation} min={-100} max={100} icon={Droplet} resetValue={0} />
                        <SliderControl label="Exposure" value={exposure} onChange={setExposure} min={-100} max={100} icon={Sun} resetValue={0} />
                        <div className="h-px bg-gray-100 my-2" />
                        <SliderControl label="Sharpness" value={sharpness} onChange={setSharpness} min={0} max={100} icon={Eye} format={(v) => `${v}%`} resetValue={0} />
                      </div>
                    </PanelSection>
                  </>
                )}

                {currentStep === 2 && (
                  <>
                    <PanelSection title="Crop Settings" icon={CropIcon} defaultOpen={true}>
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-bold text-gray-700 block mb-2 uppercase tracking-wider">Aspect Ratio</label>
                          <div className="grid grid-cols-3 xl:grid-cols-4 gap-2">
                            {['Free', '1:1', '4:3', '3:4', '16:9', '9:16', '2:3'].map((ratio) => (
                              <button
                                key={ratio}
                                onClick={() => {
                                  setCropAspectRatio(ratio === 'Free' ? null : ratio);
                                  if (ratio !== 'Free') {
                                    const [w, h] = ratio.split(':').map(Number);
                                    let newWidth = cropSize.width;
                                    let newHeight = (newWidth / w) * h;
                                    
                                    if (newHeight > originalImageDimensions.height) {
                                      newHeight = originalImageDimensions.height;
                                      newWidth = (newHeight / h) * w;
                                    }
                                    if (newWidth > originalImageDimensions.width) {
                                      newWidth = originalImageDimensions.width;
                                      newHeight = (newWidth / w) * h;
                                    }
                                    
                                    setCropSize({ width: newWidth, height: newHeight });
                                    setCropPosition(prev => ({
                                      x: Math.min(prev.x, originalImageDimensions.width - newWidth),
                                      y: Math.min(prev.y, originalImageDimensions.height - newHeight)
                                    }));
                                  }
                                }}
                                className={`px-2 py-2 text-xs font-bold rounded-xl border transition-all touch-manipulation ${
                                  cropAspectRatio === (ratio === 'Free' ? null : ratio)
                                    ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-500/20'
                                    : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 bg-white'
                                }`}
                              >
                                {ratio}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-1 bg-gray-50/50 rounded-lg">
                          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><Grid className="w-4 h-4 text-gray-500" /> Grid Overlay</label>
                          <button onClick={() => setShowGrid(!showGrid)} className={`relative w-11 h-6 rounded-full transition-colors touch-manipulation shadow-inner ${showGrid ? 'bg-blue-600' : 'bg-gray-200'}`}>
                            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${showGrid ? 'translate-x-5' : 'translate-x-0.5'}`} />
                          </button>
                        </div>

                        <div className="pt-2 flex flex-col gap-2">
                          <Button onClick={applyCrop} icon={Check} size="md" fullWidth disabled={isProcessing || !imageLoaded} className="bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md text-white font-semibold">Apply Crop</Button>
                          <Button onClick={resetCrop} variant="outline" icon={RotateCcw} size="md" fullWidth className="bg-white">Reset Position</Button>
                        </div>
                      </div>
                    </PanelSection>

                    <PanelSection title="Dimensions & Format" icon={FileImage}>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-bold text-gray-500 block mb-1 uppercase">Width</label>
                          <input type="number" value={passportWidth} onChange={(e) => setPassportWidth(Number(e.target.value))} className="w-full px-3 py-2 text-sm font-semibold border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 bg-gray-50 focus:bg-white transition-colors" min={1} max={100} />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-500 block mb-1 uppercase">Height</label>
                          <input type="number" value={passportHeight} onChange={(e) => setPassportHeight(Number(e.target.value))} className="w-full px-3 py-2 text-sm font-semibold border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 bg-gray-50 focus:bg-white transition-colors" min={1} max={100} />
                        </div>
                      </div>
                      <div className="mt-3">
                        <label className="text-xs font-bold text-gray-500 block mb-1 uppercase">Measurement Unit</label>
                        <select value={passportUnit} onChange={(e) => setPassportUnit(e.target.value)} className="w-full px-3 py-2.5 text-sm font-semibold border border-gray-200 rounded-xl bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors cursor-pointer">
                          <option value="mm">Millimeters (mm)</option>
                          <option value="in">Inches (in)</option>
                          <option value="px">Pixels (px)</option>
                        </select>
                      </div>
                    </PanelSection>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Mobile Bottom Sheet Drawer for Settings */}
          {uploadedImage && currentStep !== 5 && (
            <div className={`fixed inset-x-0 bottom-0 z-40 bg-white/95 backdrop-blur-2xl rounded-t-[2rem] border-t border-gray-200 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.1)] transition-all duration-300 ease-out md:hidden max-h-[75vh] flex flex-col ${isMobileBottomSheet ? 'translate-y-0' : 'translate-y-full pointer-events-none'}`}>
              <div className="p-3 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white/50 rounded-t-[2rem]">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-2.5" />
                <span className="text-sm font-extrabold text-gray-800 pt-3 px-2">Settings & Tools</span>
                <button onClick={() => setIsMobileBottomSheet(false)} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 mt-1"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-4 overflow-y-auto custom-scrollbar flex-1 pb-8 space-y-4">
                
                {currentStep === 3 && <Step3Controls />}

                {currentStep === 4 && (
                  <>
                    <PanelSection title="Name & Date Overlay" icon={Type} defaultOpen={true}>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-bold text-gray-800 flex items-center gap-2">
                            <Type className="w-4 h-4 text-blue-600" /> Enable Caption
                          </label>
                          <button onClick={() => setEnableNameDate(!enableNameDate)} className={`relative w-12 h-6 rounded-full transition-colors ${enableNameDate ? 'bg-blue-600' : 'bg-gray-200'}`}>
                            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${enableNameDate ? 'translate-x-6' : 'translate-x-0.5'}`} />
                          </button>
                        </div>
                        {enableNameDate && (
                          <div className="space-y-3 pt-2 border-t border-gray-100">
                            <input type="text" value={personName} onChange={(e) => setPersonName(e.target.value)} placeholder="FULL NAME" className="w-full px-3 py-2 text-sm font-bold uppercase border border-gray-200 rounded-xl bg-gray-50 focus:bg-white" />
                            <input type="text" value={photoDate} onChange={(e) => setPhotoDate(e.target.value)} placeholder="DATE (e.g. 15-08-2024)" className="w-full px-3 py-2 text-sm font-bold border border-gray-200 rounded-xl bg-gray-50 focus:bg-white" />
                            <input type="range" min="10" max="26" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-full accent-blue-600" />
                          </div>
                        )}
                      </div>
                    </PanelSection>

                    <PanelSection title="Image Adjustments" icon={Sliders} defaultOpen={true}>
                      <div className="space-y-4">
                        <SliderControl label="Zoom" value={zoom} onChange={setZoom} min={50} max={200} icon={ZoomIn} resetValue={100} />
                        <SliderControl label="Brightness" value={brightness} onChange={setBrightness} min={-100} max={100} icon={Sun} resetValue={0} />
                        <SliderControl label="Contrast" value={contrast} onChange={setContrast} min={-100} max={100} icon={Contrast} resetValue={0} />
                      </div>
                    </PanelSection>
                  </>
                )}

                {currentStep === 2 && (
                   <PanelSection title="Crop Settings" icon={CropIcon} defaultOpen={true}>
                     <div className="grid grid-cols-3 gap-2 mb-4">
                        {['Free', '1:1', '4:3', '3:4', '16:9'].map((ratio) => (
                          <button key={ratio} 
                            onClick={() => {
                              setCropAspectRatio(ratio === 'Free' ? null : ratio);
                              if (ratio !== 'Free') {
                                const [w, h] = ratio.split(':').map(Number);
                                let newWidth = cropSize.width;
                                let newHeight = (newWidth / w) * h;
                                if (newHeight > originalImageDimensions.height) {
                                  newHeight = originalImageDimensions.height;
                                  newWidth = (newHeight / h) * w;
                                }
                                if (newWidth > originalImageDimensions.width) {
                                  newWidth = originalImageDimensions.width;
                                  newHeight = (newWidth / w) * h;
                                }
                                setCropSize({ width: newWidth, height: newHeight });
                                setCropPosition(prev => ({
                                  x: Math.min(prev.x, originalImageDimensions.width - newWidth),
                                  y: Math.min(prev.y, originalImageDimensions.height - newHeight)
                                }));
                              }
                            }}
                            className={`px-2 py-2 text-xs font-bold rounded-xl border ${cropAspectRatio === (ratio === 'Free' ? null : ratio) ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white'}`}>{ratio}</button>
                        ))}
                     </div>
                     <Button onClick={applyCrop} icon={Check} size="md" fullWidth disabled={isProcessing || !imageLoaded} className="bg-blue-600 text-white font-bold mb-2">Apply Crop</Button>
                   </PanelSection>
                )}
                
              </div>
            </div>
          )}
        </div>

        {/* Print Sheet Modal (Now max-w-7xl) */}
        {showPrintSheet && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl max-w-7xl w-[95vw] h-[95vh] overflow-hidden flex flex-col border border-white/20">
              <div className="p-0 md:p-4 overflow-hidden flex-1 bg-gray-50/30">
                <Suspense fallback={<div className="p-12 text-center flex flex-col items-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" /><span className="text-sm font-semibold text-gray-500">Preparing layout engine...</span></div>}>
                  <PrintSheetGenerator passportPhoto={finalProcessedImage || cropResult} passportSize={{ width: passportWidth, height: passportHeight, unit: passportUnit }} onBack={() => setShowPrintSheet(false)} />
                </Suspense>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}