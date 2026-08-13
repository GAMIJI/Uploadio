// src/components/PhotoEditor.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  ZoomIn, ZoomOut, RotateCw, RotateCcw, Sun, Contrast, Droplet, 
  RefreshCw, Check, X, Sliders, Crop as CropIcon, Sparkles, 
  FlipHorizontal, FlipVertical, Thermometer, Eye, Wand2, Sharpness
} from 'lucide-react';
import toast from 'react-hot-toast';

const DEFAULT_SETTINGS = {
  zoom: 100,
  rotation: 0,
  brightness: 0,
  contrast: 0,
  saturation: 0,
  exposure: 0,
  highlights: 0,
  shadows: 0,
  temperature: 0,
  blur: 0,
  flipH: false,
  flipV: false,
  filter: 'none'
};

const FILTER_PRESETS = [
  { id: 'none', label: 'Original' },
  { id: 'grayscale', label: 'Grayscale' },
  { id: 'sepia', label: 'Sepia' },
  { id: 'vintage', label: 'Vintage' },
  { id: 'cool', label: 'Cool' },
  { id: 'warm', label: 'Warm' },
  { id: 'contrast', label: 'High Contrast' },
  { id: 'soft', label: 'Soft' }
];

const ASPECT_RATIOS = [
  { label: 'Free', value: null },
  { label: '1:1', value: 1 },
  { label: '4:3', value: 4 / 3 },
  { label: '3:4', value: 3 / 4 },
  { label: '16:9', value: 16 / 9 },
  { label: '9:16', value: 9 / 16 }
];

const PhotoEditor = ({ image, onSave, passportSize }) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [activeTab, setActiveTab] = useState('adjust'); // 'adjust' | 'crop' | 'filters' | 'transform'
  const [originalImage, setOriginalImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0, width: 100, height: 100 }); // Percentages
  const [cropAspectRatio, setCropAspectRatio] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const cropDragRef = useRef(null);

  // Load Image Object on Mount
  useEffect(() => {
    if (!image) return;

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = image;

    img.onload = () => {
      setOriginalImage(img);
      setCrop({ x: 0, y: 0, width: 100, height: 100 });
      setSettings(DEFAULT_SETTINGS);
    };

    img.onerror = () => {
      console.error('Failed to load image in editor');
      toast.error('Failed to load image');
    };
  }, [image]);

  // Construct CSS Filter String
  const buildFilterString = useCallback((s) => {
    const brightnessVal = 100 + s.brightness + s.exposure;
    const contrastVal = 100 + s.contrast;
    const saturateVal = 100 + s.saturation;
    let filterStr = `brightness(${brightnessVal}%) contrast(${contrastVal}%) saturate(${saturateVal}%)`;

    if (s.blur > 0) {
      filterStr += ` blur(${s.blur}px)`;
    }

    // Apply Filter Presets
    switch (s.filter) {
      case 'grayscale':
        filterStr += ' grayscale(100%)';
        break;
      case 'sepia':
        filterStr += ' sepia(100%)';
        break;
      case 'vintage':
        filterStr += ' sepia(50%) contrast(120%) brightness(90%)';
        break;
      case 'cool':
        filterStr += ' hue-rotate(30deg) saturate(110%)';
        break;
      case 'warm':
        filterStr += ' sepia(30%) saturate(130%)';
        break;
      case 'contrast':
        filterStr += ' contrast(150%) saturate(120%)';
        break;
      case 'soft':
        filterStr += ' brightness(105%) contrast(90%) blur(0.5px)';
        break;
      default:
        break;
    }

    return filterStr;
  }, []);

  // Universal Render Function (Preview or Export Canvas)
  const renderToCanvas = useCallback((targetCanvas, isExport = false) => {
    if (!originalImage || !targetCanvas) return;

    const ctx = targetCanvas.getContext('2d');
    if (!ctx) return;

    // Source Cropping Calculations
    const sourceX = (crop.x / 100) * originalImage.width;
    const sourceY = (crop.y / 100) * originalImage.height;
    const sourceWidth = (crop.width / 100) * originalImage.width;
    const sourceHeight = (crop.height / 100) * originalImage.height;

    // Target Dimensions
    let renderWidth = sourceWidth;
    let renderHeight = sourceHeight;

    if (!isExport) {
      const maxPreviewSize = 500;
      const scale = Math.min(maxPreviewSize / sourceWidth, maxPreviewSize / sourceHeight, 1);
      renderWidth = sourceWidth * scale;
      renderHeight = sourceHeight * scale;
    }

    targetCanvas.width = renderWidth;
    targetCanvas.height = renderHeight;

    ctx.clearRect(0, 0, renderWidth, renderHeight);
    ctx.save();

    // Center Transformations
    const centerX = renderWidth / 2;
    const centerY = renderHeight / 2;
    ctx.translate(centerX, centerY);

    // Apply Rotation & Flips
    ctx.rotate((settings.rotation * Math.PI) / 180);
    ctx.scale(settings.flipH ? -1 : 1, settings.flipV ? -1 : 1);

    // Apply Zoom
    const zoomFactor = settings.zoom / 100;
    const drawW = renderWidth * zoomFactor;
    const drawH = renderHeight * zoomFactor;

    // Apply Filter Matrix
    ctx.filter = buildFilterString(settings);

    // Render Source Crop Region
    ctx.drawImage(
      originalImage,
      sourceX, sourceY, sourceWidth, sourceHeight,
      -drawW / 2, -drawH / 2, drawW, drawH
    );

    // Apply Temperature Tint Overlay
    if (settings.temperature !== 0) {
      ctx.save();
      ctx.globalCompositeOperation = settings.temperature > 0 ? 'overlay' : 'color-dodge';
      ctx.fillStyle = settings.temperature > 0 
        ? `rgba(255, 140, 0, ${Math.abs(settings.temperature) / 200})`
        : `rgba(0, 150, 255, ${Math.abs(settings.temperature) / 200})`;
      ctx.fillRect(-drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();
    }

    ctx.restore();
  }, [originalImage, crop, settings, buildFilterString]);

  // Request Animation Frame Canvas Update Loop
  useEffect(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(() => {
      renderToCanvas(canvasRef.current, false);
    });

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [renderToCanvas]);

  // Settings Updater
  const updateSettings = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    setCrop({ x: 0, y: 0, width: 100, height: 100 });
    setCropAspectRatio(null);
    toast.success('All settings reset');
  };

  const handleRotateStep = (delta) => {
    setSettings((prev) => ({
      ...prev,
      rotation: (prev.rotation + delta) % 360
    }));
  };

  // Crop Preset Selection
  const applyAspectPreset = (ratio) => {
    setCropAspectRatio(ratio);
    if (!ratio) {
      setCrop({ x: 0, y: 0, width: 100, height: 100 });
      return;
    }

    let newW = 90;
    let newH = 90 / ratio;
    if (newH > 90) {
      newH = 90;
      newW = 90 * ratio;
    }

    const newX = (100 - newW) / 2;
    const newY = (100 - newH) / 2;
    setCrop({ x: newX, y: newY, width: newW, height: newH });
  };

  // Save Final Output
  const saveChanges = () => {
    if (!originalImage) return;

    try {
      const exportCanvas = document.createElement('canvas');
      renderToCanvas(exportCanvas, true);

      const dataURL = exportCanvas.toDataURL('image/png', 1.0);

      if (typeof onSave === 'function') {
        onSave(dataURL, settings);
        toast.success('Changes saved successfully!');
      } else {
        console.error('onSave prop is not a function', onSave);
        toast.error('Failed to save changes');
      }
    } catch (error) {
      console.error('Failed to export image:', error);
      toast.error('Failed to save image');
    }
  };

  const cancelChanges = () => {
    if (typeof onSave === 'function') {
      onSave(image, settings);
    } else {
      console.error('onSave prop is not a function', onSave);
    }
  };

  if (!image) {
    return (
      <div className="bg-white rounded-2xl p-10 text-center text-gray-500 border border-gray-100 shadow-sm">
        No image loaded
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden font-sans text-gray-800 flex flex-col">
      
      {/* Editor Top Navigation Header */}
      <div className="bg-gradient-to-r from-gray-900 via-indigo-950 to-gray-900 text-white px-5 py-4 flex items-center justify-between border-b border-gray-800 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-500/20 rounded-lg text-indigo-400">
            <Wand2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">Photo Studio Editor</h3>
            {passportSize && passportSize.width && (
              <p className="text-[10px] text-indigo-300 font-mono">
                Target Output: {passportSize.width} × {passportSize.height} {passportSize.unit || 'mm'}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={resetSettings}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-indigo-200 rounded-xl text-xs font-semibold transition-all active:scale-95 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset All</span>
        </button>
      </div>

      {/* Main Studio Workspace Grid Layout */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 bg-gray-50/50">
        
        {/* Left Toolbar Tabs (Desktop: Vertical / Mobile: Horizontal Header) */}
        <div className="w-full lg:w-20 bg-white border-b lg:border-b-0 lg:border-r border-gray-200/80 flex lg:flex-col justify-around lg:justify-start gap-1 p-2 shrink-0">
          {[
            { id: 'adjust', label: 'Adjust', icon: Sliders },
            { id: 'crop', label: 'Crop', icon: CropIcon },
            { id: 'filters', label: 'Filters', icon: Sparkles },
            { id: 'transform', label: 'Transform', icon: RotateCw }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center py-2.5 px-3 rounded-2xl transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 font-bold'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 font-medium'
                }`}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-[10px] tracking-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Center Canvas Preview Stage */}
        <div className="flex-1 p-4 sm:p-6 flex flex-col items-center justify-center min-h-[350px] sm:min-h-[420px] bg-gray-100/60 relative overflow-hidden">
          <div className="relative max-w-full max-h-full flex items-center justify-center p-2 rounded-2xl bg-white shadow-xl border border-gray-200/80">
            
            {/* Checkerboard Transparent Pattern */}
            <div 
              className="absolute inset-0 opacity-10 rounded-xl pointer-events-none" 
              style={{ 
                backgroundImage: 'repeating-linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), repeating-linear-gradient(45deg, #000 25%, #fff 25%, #fff 75%, #000 75%, #000)', 
                backgroundPosition: '0 0, 10px 10px', 
                backgroundSize: '20px 20px' 
              }} 
            />

            <canvas
              ref={canvasRef}
              className="max-w-full max-h-[50vh] sm:max-h-[60vh] object-contain rounded-lg shadow-sm relative z-10"
            />
          </div>

          <p className="mt-3 text-[11px] font-medium text-gray-400">
            Real-time preview • Changes apply dynamically
          </p>
        </div>

        {/* Right Settings Controls Panel */}
        <div className="w-full lg:w-80 bg-white border-t lg:border-t-0 lg:border-l border-gray-200/80 p-5 shrink-0 flex flex-col justify-between space-y-6">
          <div className="space-y-5 overflow-y-auto max-h-[50vh] lg:max-h-none pr-1">
            
            {/* TAB 1: ADJUSTMENTS */}
            {activeTab === 'adjust' && (
              <div className="space-y-4">
                <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-2">Color & Light</h4>

                {/* Zoom */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-bold text-gray-700">
                    <span className="flex items-center gap-1.5"><ZoomIn className="w-3.5 h-3.5 text-indigo-500" /> Zoom</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-indigo-600">{settings.zoom}%</span>
                      <button onClick={() => updateSettings('zoom', 100)} className="text-[10px] text-gray-400 hover:text-gray-600">Reset</button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateSettings('zoom', Math.max(50, settings.zoom - 10))} className="p-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600"><ZoomOut className="w-3.5 h-3.5" /></button>
                    <input
                      type="range" min="50" max="200" value={settings.zoom}
                      onChange={(e) => updateSettings('zoom', parseInt(e.target.value, 10))}
                      className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none accent-indigo-600 cursor-pointer"
                    />
                    <button onClick={() => updateSettings('zoom', Math.min(200, settings.zoom + 10))} className="p-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600"><ZoomIn className="w-3.5 h-3.5" /></button>
                  </div>
                </div>

                {/* Brightness */}
                <div className="space-y-1.5 pt-1 border-t border-gray-100">
                  <div className="flex justify-between items-center text-xs font-bold text-gray-700">
                    <span className="flex items-center gap-1.5"><Sun className="w-3.5 h-3.5 text-indigo-500" /> Brightness</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-indigo-600">{settings.brightness > 0 ? `+${settings.brightness}` : settings.brightness}%</span>
                      <button onClick={() => updateSettings('brightness', 0)} className="text-[10px] text-gray-400 hover:text-gray-600">Reset</button>
                    </div>
                  </div>
                  <input
                    type="range" min="-100" max="100" value={settings.brightness}
                    onChange={(e) => updateSettings('brightness', parseInt(e.target.value, 10))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none accent-indigo-600 cursor-pointer"
                  />
                </div>

                {/* Contrast */}
                <div className="space-y-1.5 pt-1 border-t border-gray-100">
                  <div className="flex justify-between items-center text-xs font-bold text-gray-700">
                    <span className="flex items-center gap-1.5"><Contrast className="w-3.5 h-3.5 text-indigo-500" /> Contrast</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-indigo-600">{settings.contrast > 0 ? `+${settings.contrast}` : settings.contrast}%</span>
                      <button onClick={() => updateSettings('contrast', 0)} className="text-[10px] text-gray-400 hover:text-gray-600">Reset</button>
                    </div>
                  </div>
                  <input
                    type="range" min="-100" max="100" value={settings.contrast}
                    onChange={(e) => updateSettings('contrast', parseInt(e.target.value, 10))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none accent-indigo-600 cursor-pointer"
                  />
                </div>

                {/* Saturation */}
                <div className="space-y-1.5 pt-1 border-t border-gray-100">
                  <div className="flex justify-between items-center text-xs font-bold text-gray-700">
                    <span className="flex items-center gap-1.5"><Droplet className="w-3.5 h-3.5 text-indigo-500" /> Saturation</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-indigo-600">{settings.saturation > 0 ? `+${settings.saturation}` : settings.saturation}%</span>
                      <button onClick={() => updateSettings('saturation', 0)} className="text-[10px] text-gray-400 hover:text-gray-600">Reset</button>
                    </div>
                  </div>
                  <input
                    type="range" min="-100" max="100" value={settings.saturation}
                    onChange={(e) => updateSettings('saturation', parseInt(e.target.value, 10))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none accent-indigo-600 cursor-pointer"
                  />
                </div>

                {/* Exposure */}
                <div className="space-y-1.5 pt-1 border-t border-gray-100">
                  <div className="flex justify-between items-center text-xs font-bold text-gray-700">
                    <span className="flex items-center gap-1.5"><Sun className="w-3.5 h-3.5 text-indigo-500" /> Exposure</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-indigo-600">{settings.exposure > 0 ? `+${settings.exposure}` : settings.exposure}</span>
                      <button onClick={() => updateSettings('exposure', 0)} className="text-[10px] text-gray-400 hover:text-gray-600">Reset</button>
                    </div>
                  </div>
                  <input
                    type="range" min="-50" max="50" value={settings.exposure}
                    onChange={(e) => updateSettings('exposure', parseInt(e.target.value, 10))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none accent-indigo-600 cursor-pointer"
                  />
                </div>

                {/* Temperature / Warmth */}
                <div className="space-y-1.5 pt-1 border-t border-gray-100">
                  <div className="flex justify-between items-center text-xs font-bold text-gray-700">
                    <span className="flex items-center gap-1.5"><Thermometer className="w-3.5 h-3.5 text-indigo-500" /> Temperature</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-indigo-600">{settings.temperature > 0 ? `+${settings.temperature}` : settings.temperature}</span>
                      <button onClick={() => updateSettings('temperature', 0)} className="text-[10px] text-gray-400 hover:text-gray-600">Reset</button>
                    </div>
                  </div>
                  <input
                    type="range" min="-50" max="50" value={settings.temperature}
                    onChange={(e) => updateSettings('temperature', parseInt(e.target.value, 10))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none accent-indigo-600 cursor-pointer"
                  />
                </div>

                {/* Blur */}
                <div className="space-y-1.5 pt-1 border-t border-gray-100">
                  <div className="flex justify-between items-center text-xs font-bold text-gray-700">
                    <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5 text-indigo-500" /> Soft Blur</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-indigo-600">{settings.blur}px</span>
                      <button onClick={() => updateSettings('blur', 0)} className="text-[10px] text-gray-400 hover:text-gray-600">Reset</button>
                    </div>
                  </div>
                  <input
                    type="range" min="0" max="10" value={settings.blur}
                    onChange={(e) => updateSettings('blur', parseInt(e.target.value, 10))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none accent-indigo-600 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* TAB 2: CROP */}
            {activeTab === 'crop' && (
              <div className="space-y-4">
                <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-2">Aspect Ratio Presets</h4>
                <div className="grid grid-cols-3 gap-2">
                  {ASPECT_RATIOS.map((r) => (
                    <button
                      key={r.label}
                      onClick={() => applyAspectPreset(r.value)}
                      className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                        cropAspectRatio === r.value
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-600 shadow-sm'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCrop({ x: 0, y: 0, width: 100, height: 100 })}
                  className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all"
                >
                  Reset Crop Box
                </button>
              </div>
            )}

            {/* TAB 3: FILTERS */}
            {activeTab === 'filters' && (
              <div className="space-y-4">
                <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-2">Filter Styles</h4>
                <div className="grid grid-cols-2 gap-2">
                  {FILTER_PRESETS.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => updateSettings('filter', f.id)}
                      className={`py-3 px-3 text-xs font-bold rounded-xl border text-center transition-all ${
                        settings.filter === f.id
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/20'
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: TRANSFORM */}
            {activeTab === 'transform' && (
              <div className="space-y-4">
                <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-2">Orientation & Flips</h4>
                
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleRotateStep(-90)}
                    className="p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-4 h-4" /> Rotate -90°
                  </button>
                  <button
                    onClick={() => handleRotateStep(90)}
                    className="p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 flex items-center justify-center gap-1.5"
                  >
                    <RotateCw className="w-4 h-4" /> Rotate +90°
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => updateSettings('flipH', !settings.flipH)}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      settings.flipH ? 'bg-indigo-50 border-indigo-500 text-indigo-600' : 'bg-gray-50 border-gray-200 text-gray-700'
                    }`}
                  >
                    <FlipHorizontal className="w-4 h-4" /> Flip Horizontal
                  </button>
                  <button
                    onClick={() => updateSettings('flipV', !settings.flipV)}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      settings.flipV ? 'bg-indigo-50 border-indigo-500 text-indigo-600' : 'bg-gray-50 border-gray-200 text-gray-700'
                    }`}
                  >
                    <FlipVertical className="w-4 h-4" /> Flip Vertical
                  </button>
                </div>

                {/* Continuous Rotation Slider */}
                <div className="space-y-1.5 pt-2 border-t border-gray-100">
                  <div className="flex justify-between items-center text-xs font-bold text-gray-700">
                    <span>Fine Rotation</span>
                    <span className="font-mono text-indigo-600">{settings.rotation}°</span>
                  </div>
                  <input
                    type="range" min="-180" max="180" value={settings.rotation}
                    onChange={(e) => updateSettings('rotation', parseInt(e.target.value, 10))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none accent-indigo-600 cursor-pointer"
                  />
                </div>
              </div>
            )}

          </div>

          {/* Primary Bottom Action Buttons */}
          <div className="pt-4 border-t border-gray-100 flex gap-2">
            <button
              onClick={saveChanges}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-3 px-4 rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Apply & Continue</span>
            </button>
            <button
              onClick={cancelChanges}
              className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl font-bold text-xs sm:text-sm active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default PhotoEditor;