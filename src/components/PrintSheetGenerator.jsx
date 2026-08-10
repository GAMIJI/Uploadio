import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Download, Printer as PrinterIcon, ArrowLeft, Grid, ZoomIn, ZoomOut, 
  Check, AlertCircle, LayoutGrid, FileText, Settings2, Image as ImageIcon, 
  ChevronDown, Maximize, Square, FlipVertical, Loader2, Crop, Link2, Unlink, AlignLeft, AlignCenter
} from 'lucide-react';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';

// Reusable Collapsible Section for the Sidebar
const CollapsibleSection = ({ title, icon: Icon, iconColor = "text-blue-500", defaultOpen = true, children }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="mb-1">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full flex items-center justify-between py-2.5 text-left outline-none group"
      >
        <h3 className="text-xs font-extrabold text-gray-500 group-hover:text-gray-800 uppercase tracking-wider flex items-center gap-2 transition-colors">
          <Icon className={`w-4 h-4 ${iconColor}`} /> {title}
        </h3>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="space-y-4 bg-gray-50 p-4 rounded-2xl border border-gray-100 mt-1 animate-in fade-in slide-in-from-top-1 duration-200">
          {children}
        </div>
      )}
    </div>
  );
};

const PrintSheetGenerator = ({
  passportPhoto,
  passportSize,
  onBack,
  onGenerate
}) => {
  // Document States
  const [paperSize, setPaperSize] = useState('4x6');
  const [customWidth, setCustomWidth] = useState(4);
  const [customHeight, setCustomHeight] = useState(6);
  const [orientation, setOrientation] = useState('portrait');
  const [copies, setCopies] = useState('auto');
  const [dpi, setDpi] = useState(300);
  
  // Photo Dimension States & Aspect Ratio Lock
  const [photoWidth, setPhotoWidth] = useState(passportSize?.width || 35);
  const [photoHeight, setPhotoHeight] = useState(passportSize?.height || 45);
  const [photoUnit, setPhotoUnit] = useState(passportSize?.unit || 'mm');
  const [lockRatio, setLockRatio] = useState(true);
  
  const aspectRatio = useRef((passportSize?.width || 35) / (passportSize?.height || 45));

  // Layout Customization States
  const [pageMargin, setPageMargin] = useState(0.15);
  const [spacing, setSpacing] = useState(0.125);
  const [layoutAlign, setLayoutAlign] = useState('center'); // 'top-left' | 'center'
  const [showCutGuides, setShowCutGuides] = useState(true);
  const [photoBorder, setPhotoBorder] = useState(1);
  const [rotatePhotos, setRotatePhotos] = useState(false);

  // Core States
  const [layout, setLayout] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const previewCanvasRef = useRef(null);
  const previewContainerRef = useRef(null);
  const imageRef = useRef(null);

  const dpiOptions = [
    { value: 150, label: '150 DPI (Draft)' },
    { value: 300, label: '300 DPI (Standard)' },
    { value: 600, label: '600 DPI (High Quality)' }
  ];

  const basePaperSizes = {
    '4x6': { name: '4 × 6 in', w: 4, h: 6, desc: 'Photo paper' },
    '5x7': { name: '5 × 7 in', w: 5, h: 7, desc: 'Large photo' },
    'a4': { name: 'A4', w: 8.27, h: 11.69, desc: 'Standard doc' },
    'letter': { name: 'Letter', w: 8.5, h: 11, desc: 'US Letter' },
    'custom': { name: 'Custom Size', w: customWidth, h: customHeight, desc: 'Your dimensions' }
  };

  const copyOptions = [1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 30, 40, 50, 60, 'auto'];

  // Sync initial sizes
  useEffect(() => {
    if (passportSize) {
      setPhotoWidth(passportSize.width);
      setPhotoHeight(passportSize.height);
      setPhotoUnit(passportSize.unit);
    }
  }, [passportSize]);

  // --- SMART DIMENSION HANDLING ---

  const handleWidthChange = (val) => {
    setPhotoWidth(val);
    if (lockRatio) setPhotoHeight(Number((val / aspectRatio.current).toFixed(2)));
  };

  const handleHeightChange = (val) => {
    setPhotoHeight(val);
    if (lockRatio) setPhotoWidth(Number((val * aspectRatio.current).toFixed(2)));
  };

  const handleUnitChange = (newUnit) => {
    if (newUnit === photoUnit) return;
    let newW = photoWidth;
    let newH = photoHeight;

    if (photoUnit === 'mm' && newUnit === 'in') { newW = newW / 25.4; newH = newH / 25.4; } 
    else if (photoUnit === 'in' && newUnit === 'mm') { newW = newW * 25.4; newH = newH * 25.4; }
    
    setPhotoWidth(Number(newW.toFixed(2)));
    setPhotoHeight(Number(newH.toFixed(2)));
    setPhotoUnit(newUnit);
  };

  // --- MATH & LAYOUT LOGIC ---

  const getPaperDimensions = useCallback(() => {
    let w, h, name;
    if (paperSize === 'custom') {
      w = customWidth || 4; h = customHeight || 6; name = 'Custom Size';
    } else {
      const base = basePaperSizes[paperSize]; w = base.w; h = base.h; name = base.name;
    }
    return orientation === 'landscape' ? { width: h, height: w, name } : { width: w, height: h, name };
  }, [paperSize, customWidth, customHeight, orientation]);

  const getPhotoDimensionsInInches = useCallback(() => {
    let w = photoWidth || 1.38; let h = photoHeight || 1.77; 
    if (photoUnit === 'mm') { w = w / 25.4; h = h / 25.4; } 
    else if (photoUnit === 'px') { w = w / 300; h = h / 300; }
    return rotatePhotos ? { width: h, height: w } : { width: w, height: h };
  }, [photoWidth, photoHeight, photoUnit, rotatePhotos]);

  const calculateFit = useCallback(() => {
    const paper = getPaperDimensions();
    const photo = getPhotoDimensionsInInches();
    const availableWidth = paper.width - (pageMargin * 2);
    const availableHeight = paper.height - (pageMargin * 2);

    if (availableWidth <= 0 || availableHeight <= 0) return { cols: 0, rows: 0, total: 0 };

    const photoWidthWithSpacing = photo.width + spacing;
    const photoHeightWithSpacing = photo.height + spacing;
    
    const cols = Math.floor((availableWidth + spacing) / photoWidthWithSpacing);
    const rows = Math.floor((availableHeight + spacing) / photoHeightWithSpacing);
    
    return { cols: Math.max(0, cols), rows: Math.max(0, rows), total: cols * rows };
  }, [getPaperDimensions, getPhotoDimensionsInInches, pageMargin, spacing]);

  const generateLayout = useCallback(() => {
    if (!passportPhoto) return null;
    const paper = getPaperDimensions();
    const photo = getPhotoDimensionsInInches();
    const { cols, rows, total } = calculateFit();

    if (cols === 0 || rows === 0) return null;

    const actualCopies = copies === 'auto' ? total : Math.min(parseInt(copies), total);
    
    // Calculate ACTUAL rows and columns used to fix the top-margin ghosting bug
    const actualCols = Math.min(cols, actualCopies);
    const actualRows = Math.ceil(actualCopies / cols);

    const totalContentWidth = (actualCols * photo.width) + (Math.max(0, actualCols - 1) * spacing);
    const totalContentHeight = (actualRows * photo.height) + (Math.max(0, actualRows - 1) * spacing);
    
    // Position photos based on selected alignment
    const startX = layoutAlign === 'center' ? (paper.width - totalContentWidth) / 2 : pageMargin;
    const startY = layoutAlign === 'center' ? (paper.height - totalContentHeight) / 2 : pageMargin;

    const layoutItems = [];
    let copyCount = 0;

    for (let row = 0; row < rows && copyCount < actualCopies; row++) {
      for (let col = 0; col < cols && copyCount < actualCopies; col++) {
        layoutItems.push({
          x: startX + col * (photo.width + spacing),
          y: startY + row * (photo.height + spacing),
          width: photo.width,
          height: photo.height,
          index: copyCount + 1
        });
        copyCount++;
      }
    }

    return {
      items: layoutItems, cols, rows, totalPhotos: actualCopies, maxPhotos: total,
      marginX: startX, marginY: startY, paperWidth: paper.width, paperHeight: paper.height,
      photoWidth: photo.width, photoHeight: photo.height, paperName: paper.name
    };
  }, [passportPhoto, getPaperDimensions, getPhotoDimensionsInInches, calculateFit, copies, spacing, layoutAlign, pageMargin]);

  // --- CANVAS RENDERING (OPTIMIZED) ---

  const drawCanvas = useCallback((canvas, ctx, scale, isExport = false) => {
    if (!layout || !imageRef.current) return;
    const img = imageRef.current;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (!isExport) {
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      ctx.strokeRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = '#eff6ff';
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(pageMargin * scale, pageMargin * scale, (layout.paperWidth - pageMargin * 2) * scale, (layout.paperHeight - pageMargin * 2) * scale);
      ctx.setLineDash([]);
    }

    layout.items.forEach((photo) => {
      const x = photo.x * scale; const y = photo.y * scale;
      const w = photo.width * scale; const h = photo.height * scale;

      if (rotatePhotos) {
        ctx.save();
        ctx.translate(x + w / 2, y + h / 2);
        ctx.rotate((90 * Math.PI) / 180);
        ctx.drawImage(img, -h / 2, -w / 2, h, w);
        ctx.restore();
      } else {
        ctx.drawImage(img, x, y, w, h);
      }

      if (photoBorder > 0) {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = photoBorder === 1 ? 1 : Math.max(2, 4 * (scale / 300));
        ctx.strokeRect(x, y, w, h);
      }

      if (showCutGuides) {
        ctx.beginPath();
        ctx.strokeStyle = isExport ? '#000000' : '#ef4444';
        ctx.lineWidth = isExport ? 1 : 1.5;
        if (!isExport) ctx.setLineDash([4, 4]);
        
        const mark = isExport ? 15 * (scale / 300) : 8;
        ctx.moveTo(x - mark, y); ctx.lineTo(x, y);
        ctx.moveTo(x, y - mark); ctx.lineTo(x, y);
        ctx.moveTo(x + w + mark, y); ctx.lineTo(x + w, y);
        ctx.moveTo(x + w, y - mark); ctx.lineTo(x + w, y);
        ctx.moveTo(x - mark, y + h); ctx.lineTo(x, y + h);
        ctx.moveTo(x, y + h + mark); ctx.lineTo(x, y + h);
        ctx.moveTo(x + w + mark, y + h); ctx.lineTo(x + w, y + h);
        ctx.moveTo(x + w, y + h - mark); ctx.lineTo(x + w, y + h + mark);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      if (!isExport) {
        ctx.font = `bold 14px Arial`;
        ctx.fillStyle = '#3b82f6';
        ctx.fillText(`${photo.index}`, x + 8, y + 25);
      }
    });
  }, [layout, showCutGuides, photoBorder, pageMargin, rotatePhotos]);

  const drawPreview = useCallback(() => {
    if (!previewCanvasRef.current || !layout) return;
    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const internalScale = 150; 
    canvas.width = layout.paperWidth * internalScale;
    canvas.height = layout.paperHeight * internalScale;
    drawCanvas(canvas, ctx, internalScale, false);
  }, [layout, drawCanvas]);

  const generatePrintData = async () => {
    if (!layout || !layout.items.length) { toast.error('No layout generated'); return null; }
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = layout.paperWidth * dpi;
    canvas.height = layout.paperHeight * dpi;
    drawCanvas(canvas, ctx, dpi, true);
    return canvas;
  };

  // --- AUTO-FIT TO SCREEN LOGIC ---
  const fitToScreen = useCallback(() => {
    if (!previewContainerRef.current || !layout) return;
    const container = previewContainerRef.current;
    const padding = 80; 
    
    const availableWidth = container.clientWidth - padding;
    const availableHeight = container.clientHeight - padding;
    
    const baseWidth = layout.paperWidth * 100; 
    const baseHeight = layout.paperHeight * 100;
    
    const widthRatio = availableWidth / baseWidth;
    const heightRatio = availableHeight / baseHeight;
    
    setZoomLevel(Math.min(widthRatio, heightRatio, 1.5)); 
  }, [layout]);

  // --- EFFECTS ---

  useEffect(() => {
    if (!passportPhoto) { setImageError(true); return; }
    setImageLoaded(false); setImageError(false);
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => { imageRef.current = img; setImageLoaded(true); };
    img.onerror = () => { setImageError(true); setImageLoaded(false); };
    img.src = passportPhoto;
  }, [passportPhoto]);

  useEffect(() => {
    setLayout(generateLayout());
  }, [paperSize, customWidth, customHeight, orientation, copies, passportPhoto, photoWidth, photoHeight, photoUnit, spacing, pageMargin, rotatePhotos, layoutAlign, generateLayout]);

  useEffect(() => {
    if (layout && imageLoaded && imageRef.current) {
      const timer = requestAnimationFrame(() => {
        drawPreview();
        fitToScreen();
      });
      return () => cancelAnimationFrame(timer);
    }
  }, [layout, showCutGuides, photoBorder, imageLoaded, drawPreview, fitToScreen]);

  useEffect(() => {
    window.addEventListener('resize', fitToScreen);
    return () => window.removeEventListener('resize', fitToScreen);
  }, [fitToScreen]);

  // --- ACTIONS ---

  const handlePrint = async () => {
    setIsGenerating(true);
    toast.loading('Preparing print job...', { id: 'print' });
    try {
      const canvas = await generatePrintData();
      if (!canvas) throw new Error('Generation failed');

      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
      
      const iframeDoc = iframe.contentWindow.document;
      iframeDoc.write(`
        <!DOCTYPE html><html><head><title>Print Layout</title>
        <style>
          @page { size: ${orientation}; margin: 0; }
          body { margin: 0; display: flex; justify-content: center; align-items: center; background: white; }
          img { width: 100vw; height: 100vh; object-fit: contain; }
        </style>
        </head><body>
          <img src="${canvas.toDataURL('image/png', 1.0)}" />
          <script>
            window.onload = () => { window.print(); setTimeout(() => window.parent.document.body.removeChild(window.frameElement), 1000); };
          </script>
        </body></html>
      `);
      iframeDoc.close();
      toast.success('Print dialog opened!', { id: 'print' });
    } catch (e) {
      toast.error('Print failed.', { id: 'print' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = async (format) => {
    setIsGenerating(true);
    toast.loading(`Generating ${format.toUpperCase()}...`, { id: 'export' });
    try {
      const canvas = await generatePrintData();
      if (!canvas) throw new Error('Generation failed');
      const dataUrl = canvas.toDataURL('image/png', 1.0);

      if (format === 'pdf') {
        const pdf = new jsPDF({ orientation, unit: 'in', format: [layout.paperWidth, layout.paperHeight] });
        pdf.addImage(dataUrl, 'PNG', 0, 0, layout.paperWidth, layout.paperHeight);
        pdf.save(`passport-sheet-${Date.now()}.pdf`);
      } else {
        const link = document.createElement('a');
        link.download = `passport-sheet-${Date.now()}.${format}`;
        link.href = dataUrl;
        link.click();
      }
      toast.success('Export complete!', { id: 'export' });
    } catch (e) {
      toast.error('Export failed.', { id: 'export' });
    } finally {
      setIsGenerating(false);
    }
  };

  // --- UI RENDERING ---

  if (!passportPhoto) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-full">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4"><ImageIcon className="w-8 h-8 text-gray-400" /></div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Photo Available</h3>
        <p className="text-sm text-gray-500 mb-6">Process a photo first before creating a print sheet.</p>
        <button onClick={onBack} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors">Go Back</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white md:rounded-[2rem] overflow-hidden">
      
      {/* HEADER */}
      <div className="flex items-center justify-between p-4 px-6 border-b border-gray-100 bg-white z-20 shrink-0">
        <button onClick={onBack} className="flex items-center gap-2 px-3 py-1.5 text-sm font-bold text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h2 className="text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center gap-2">
          Layout Generator
        </h2>
        <div className="w-20" /> {/* Spacer */}
      </div>

      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden bg-slate-50/50">
        
        {/* LEFT SIDEBAR: CONTROLS */}
        <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 border-r border-gray-200/60 bg-white flex flex-col h-[50vh] lg:h-auto z-20 shadow-xl lg:shadow-none">
          <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
            
            {/* COLLAPSIBLE ACCORDIONS */}
            
            <CollapsibleSection title="Paper Setup" icon={FileText} iconColor="text-blue-500">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Paper Size</label>
                  <div className="relative">
                    <select value={paperSize} onChange={(e) => setPaperSize(e.target.value)} className="w-full pl-3 pr-8 py-2 text-sm font-semibold border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 bg-white outline-none appearance-none cursor-pointer">
                      {Object.entries(basePaperSizes).map(([k, s]) => <option key={k} value={k}>{s.name}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div className="w-1/3">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Copies</label>
                  <div className="relative">
                    <select value={copies} onChange={(e) => setCopies(e.target.value)} className="w-full pl-3 pr-8 py-2 text-sm font-semibold border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 bg-white outline-none appearance-none cursor-pointer text-blue-700">
                      {copyOptions.map(opt => <option key={opt} value={opt}>{opt === 'auto' ? `Auto (Max)` : `${opt}`}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {paperSize === 'custom' && (
                <div className="grid grid-cols-2 gap-3 animate-in fade-in zoom-in-95 duration-200">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Width (in)</label>
                    <input type="number" min="1" max="40" step="0.1" value={customWidth} onChange={e => setCustomWidth(Number(e.target.value))} className="w-full px-3 py-2 text-sm font-semibold border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 bg-white" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Height (in)</label>
                    <input type="number" min="1" max="40" step="0.1" value={customHeight} onChange={e => setCustomHeight(Number(e.target.value))} className="w-full px-3 py-2 text-sm font-semibold border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 bg-white" />
                  </div>
                </div>
              )}

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Orientation</label>
                <div className="flex bg-gray-200/50 p-1 rounded-xl">
                  <button onClick={() => setOrientation('portrait')} className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-bold rounded-lg transition-all ${orientation === 'portrait' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                    <Square className="w-4 h-4" /> Portrait
                  </button>
                  <button onClick={() => setOrientation('landscape')} className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-bold rounded-lg transition-all ${orientation === 'landscape' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                    <Square className="w-4 h-4 rotate-90" /> Landscape
                  </button>
                </div>
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Photo Dimensions" icon={Crop} iconColor="text-emerald-500">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Width</label>
                  <input type="number" min="0.1" max="1000" step="0.1" value={photoWidth} onChange={e => handleWidthChange(Number(e.target.value))} className="w-full px-3 py-2 text-sm font-semibold border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white" />
                </div>
                <div className="flex-shrink-0 mb-1">
                  <button onClick={() => setLockRatio(!lockRatio)} className={`p-1.5 rounded-lg transition-colors ${lockRatio ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200 text-gray-400 hover:bg-gray-300'}`} title={lockRatio ? "Aspect Ratio Locked" : "Aspect Ratio Unlocked"}>
                    {lockRatio ? <Link2 className="w-4 h-4" /> : <Unlink className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Height</label>
                  <input type="number" min="0.1" max="1000" step="0.1" value={photoHeight} onChange={e => handleHeightChange(Number(e.target.value))} className="w-full px-3 py-2 text-sm font-semibold border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Measurement Unit</label>
                <div className="relative">
                  <select value={photoUnit} onChange={(e) => handleUnitChange(e.target.value)} className="w-full pl-3 pr-10 py-2.5 text-sm font-semibold border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 bg-white outline-none appearance-none cursor-pointer">
                    <option value="mm">Millimeters (mm)</option>
                    <option value="in">Inches (in)</option>
                    <option value="px">Pixels (px)</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Layout & Spacing" icon={LayoutGrid} iconColor="text-purple-500">
              
              {/* ALIGNMENT TOGGLE */}
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Grid Alignment</label>
                <div className="flex bg-gray-200/50 p-1 rounded-xl mb-4">
                  <button onClick={() => setLayoutAlign('top-left')} className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-bold rounded-lg transition-all ${layoutAlign === 'top-left' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                    <AlignLeft className="w-4 h-4" /> Top Left
                  </button>
                  <button onClick={() => setLayoutAlign('center')} className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-bold rounded-lg transition-all ${layoutAlign === 'center' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                    <AlignCenter className="w-4 h-4" /> Center
                  </button>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-gray-700 mb-1.5"><span>Page Margins</span><span>{pageMargin}"</span></div>
                <input type="range" min="0" max="1" step="0.05" value={pageMargin} onChange={(e) => setPageMargin(Number(e.target.value))} className="w-full accent-purple-600 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
              </div>
              <div>
                <div className="flex justify-between text-xs font-bold text-gray-700 mb-1.5"><span>Photo Spacing</span><span>{spacing}"</span></div>
                <input type="range" min="0" max="0.5" step="0.025" value={spacing} onChange={(e) => setSpacing(Number(e.target.value))} className="w-full accent-blue-600 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
              </div>
              <div className="h-px bg-gray-200/60 w-full my-2" />
              <label className="flex items-center justify-between cursor-pointer group">
                <div className="flex flex-col">
                  <span className="text-sm text-gray-700 font-bold group-hover:text-gray-900 transition-colors">Rotate Photos 90°</span>
                  <span className="text-[10px] font-semibold text-gray-500 mt-0.5">Maximizes fit & reduces margins</span>
                </div>
                <div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${rotatePhotos ? 'bg-purple-600' : 'bg-gray-300'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${rotatePhotos ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                  <input type="checkbox" className="sr-only" checked={rotatePhotos} onChange={(e) => setRotatePhotos(e.target.checked)} />
                </div>
              </label>
            </CollapsibleSection>

            <CollapsibleSection title="Borders & Quality" icon={Settings2} iconColor="text-pink-500">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Photo Border</label>
                <div className="flex bg-gray-200/50 p-1 rounded-xl">
                  <button onClick={() => setPhotoBorder(0)} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${photoBorder === 0 ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>None</button>
                  <button onClick={() => setPhotoBorder(1)} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${photoBorder === 1 ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>Thin</button>
                  <button onClick={() => setPhotoBorder(2)} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${photoBorder === 2 ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>Thick</button>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-700 font-bold">Print Cut Guides</span>
                <button onClick={() => setShowCutGuides(!showCutGuides)} className={`relative w-11 h-6 rounded-full transition-colors ${showCutGuides ? 'bg-blue-600' : 'bg-gray-300'}`}>
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${showCutGuides ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
              <div className="pt-2 border-t border-gray-200 mt-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Export Quality</label>
                <div className="relative">
                  <select value={dpi} onChange={(e) => setDpi(Number(e.target.value))} className="w-full pl-3 pr-10 py-2.5 text-sm font-semibold border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500/20 bg-white outline-none appearance-none cursor-pointer">
                    {dpiOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </CollapsibleSection>

          </div>

          {/* Action Buttons */}
          <div className="p-4 border-t border-gray-100 bg-white shrink-0 space-y-3 z-20">
            <button
              onClick={handlePrint}
              disabled={isGenerating || !layout?.items?.length}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 px-4 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
            >
              <PrinterIcon className="w-5 h-5" />
              {isGenerating ? 'Preparing...' : 'Print Sheet'}
            </button>
            
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => handleExport('pdf')} disabled={isGenerating || !layout?.items?.length} className="bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2">
                <FileText className="w-4 h-4 text-red-500" /> Save PDF
              </button>
              <button onClick={() => handleExport('png')} disabled={isGenerating || !layout?.items?.length} className="bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2">
                <ImageIcon className="w-4 h-4 text-purple-500" /> Save PNG
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT AREA: PREVIEW CANVAS (STATIC & AUTO-FITTING) */}
        <div 
          ref={previewContainerRef}
          className="flex-1 relative flex flex-col overflow-hidden bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAADxJREFUeNpi/P//PwM1ARMDlcGogWEwDIFowP///xmqG8PZIBkO4zAMh1E1MFAM1ARMDtQEjDqAEGAAe/MXX282Z4QAAAAASUVORK5CYII=')] bg-repeat"
        >
          <div className="flex-1 overflow-auto custom-scrollbar p-6 md:p-10 flex items-center justify-center relative">
            {imageError ? (
              <div className="flex flex-col items-center text-red-500 bg-white/90 backdrop-blur p-6 rounded-2xl shadow-sm border border-red-100 z-10">
                <AlertCircle className="w-10 h-10 mb-3" />
                <p className="font-bold text-sm">Failed to load image</p>
              </div>
            ) : !imageLoaded ? (
              <div className="flex flex-col items-center bg-white/90 backdrop-blur p-6 rounded-2xl shadow-sm border border-gray-100 z-10">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
                <p className="font-bold text-sm text-gray-600">Generating preview...</p>
              </div>
            ) : (
              <div 
                className="relative z-10 shadow-2xl transition-all duration-200" 
                style={{ 
                  width: `${(layout?.paperWidth || 0) * 100 * zoomLevel}px`, 
                  height: `${(layout?.paperHeight || 0) * 100 * zoomLevel}px` 
                }}
              >
                <canvas 
                  ref={previewCanvasRef} 
                  className="bg-white w-full h-full block" 
                />
              </div>
            )}
          </div>

          {/* Floating Zoom Controls & Layout Stats */}
          {imageLoaded && layout && (
            <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row items-end sm:items-center justify-between pointer-events-none gap-4">
              
              <div className="bg-white/90 backdrop-blur-md border border-gray-200/50 shadow-xl rounded-2xl p-3 pointer-events-auto flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-black text-lg">
                  {layout.items.length}
                </div>
                <div>
                  <div className="text-xs font-extrabold text-gray-900 uppercase">Photos Total</div>
                  <div className="text-[10px] font-bold text-gray-500">{layout.cols} × {layout.rows} Grid Fit</div>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-md border border-gray-200/50 shadow-xl rounded-full px-2 py-1.5 flex items-center gap-1 pointer-events-auto">
                <button onClick={() => setZoomLevel(Math.max(0.2, zoomLevel - 0.1))} className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors outline-none" title="Zoom Out">
                  <ZoomOut className="w-4 h-4" />
                </button>
                <div className="w-12 text-center text-xs font-bold text-gray-700 select-none">
                  {Math.round(zoomLevel * 100)}%
                </div>
                <button onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.1))} className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors outline-none" title="Zoom In">
                  <ZoomIn className="w-4 h-4" />
                </button>
                <div className="w-px h-4 bg-gray-300 mx-1" />
                <button onClick={fitToScreen} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors outline-none" title="Fit to Screen">
                  <Maximize className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default PrintSheetGenerator;