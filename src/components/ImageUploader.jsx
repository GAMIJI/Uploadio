import React, { useCallback, useState, useEffect, useRef, memo } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  Image as ImageIcon, 
  AlertCircle, 
  RefreshCw, 
  Sparkles, 
  FileType, 
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Zap,
  ArrowUpRight
} from 'lucide-react';
import toast from 'react-hot-toast';

// Theme configuration mapping for multi-page tool consistency
const THEME_STYLES = {
  blue: {
    glow: 'from-blue-600 via-indigo-600 to-purple-600',
    borderActive: 'border-blue-500 bg-blue-50/80 shadow-blue-500/15',
    button: 'from-blue-600 via-indigo-600 to-purple-600',
    iconBgActive: 'bg-blue-600 text-white shadow-blue-500/40',
    accentText: 'text-blue-600',
    ring: 'border-blue-600'
  },
  orange: {
    glow: 'from-orange-500 via-rose-500 to-pink-600',
    borderActive: 'border-rose-500 bg-rose-50/80 shadow-rose-500/15',
    button: 'from-orange-500 via-rose-500 to-pink-600',
    iconBgActive: 'bg-rose-500 text-white shadow-rose-500/40',
    accentText: 'text-rose-600',
    ring: 'border-rose-500'
  },
  emerald: {
    glow: 'from-emerald-500 via-teal-600 to-cyan-600',
    borderActive: 'border-emerald-500 bg-emerald-50/80 shadow-emerald-500/15',
    button: 'from-emerald-500 via-teal-600 to-cyan-600',
    iconBgActive: 'bg-emerald-600 text-white shadow-emerald-500/40',
    accentText: 'text-emerald-600',
    ring: 'border-emerald-500'
  }
};

const ImageUploader = ({ 
  onImageUpload, 
  onError, 
  className = '', 
  multiple = false,
  theme = 'blue' // 'blue' | 'orange' | 'emerald'
}) => {
  const [uploadState, setUploadState] = useState('idle'); // 'idle' | 'loading' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  
  const timerRef = useRef(null);
  const currentTheme = THEME_STYLES[theme] || THEME_STYLES.blue;

  // Cleanup timers on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const resetUploader = useCallback((e) => {
    if (e) e.stopPropagation();
    setUploadState('idle');
    setErrorMessage('');
  }, []);

  const onDrop = useCallback(async (acceptedFiles, rejectedFiles) => {
    // 1. Handle Errors
    if (rejectedFiles.length > 0) {
      const error = rejectedFiles[0].errors[0];
      setUploadState('error');
      
      let friendlyMessage = error.message;
      if (error.code === 'file-too-large') {
        friendlyMessage = 'File size must be less than 20MB.';
      } else if (error.code === 'file-invalid-type') {
        friendlyMessage = 'Unsupported format. Please use JPG, PNG, WEBP, HEIC, or AVIF.';
      }
      
      setErrorMessage(friendlyMessage);
      toast.error(friendlyMessage);
      onError?.(friendlyMessage);
      return;
    }

    // 2. Handle Success
    if (acceptedFiles.length > 0) {
      setUploadState('loading');
      
      // Short, non-blocking visual feedback before passing data to parent
      timerRef.current = setTimeout(() => {
        try {
          const filesWithPreviews = acceptedFiles.map(file => ({
            file,
            preview: URL.createObjectURL(file)
          }));
          
          onImageUpload(multiple ? filesWithPreviews : filesWithPreviews[0]);
          toast.success('Photo uploaded successfully!');
          
          // Reset state silently in case parent doesn't unmount this component
          setUploadState('idle');
        } catch (err) {
          setUploadState('error');
          setErrorMessage('Failed to process the image. Please try again.');
          onError?.('Failed to process image.');
        }
      }, 600);
    }
  }, [onImageUpload, onError, multiple]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'image/heic': ['.heic'],
      'image/avif': ['.avif']
    },
    maxSize: 20 * 1024 * 1024, // 20MB
    multiple,
    disabled: uploadState === 'loading'
  });

  // --- ERROR STATE RENDER ---
  if (uploadState === 'error') {
    return (
      <div className={`relative w-full max-w-xl mx-auto ${className}`}>
        <div className="relative flex flex-col items-center justify-center w-full p-8 sm:p-12 text-center bg-white/90 backdrop-blur-2xl border-2 border-rose-200/80 rounded-[2.5rem] shadow-2xl shadow-rose-500/10 motion-safe:animate-in motion-safe:zoom-in-95 motion-safe:fade-in duration-300">
          <div className="relative mb-5">
            <div className="absolute -inset-2 rounded-full bg-rose-500/20 animate-ping opacity-75" />
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-rose-50 rounded-2xl flex items-center justify-center border-2 border-rose-100 shadow-inner">
              <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-rose-500" />
            </div>
          </div>
          
          <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-2 tracking-tight">Upload Failed</h3>
          <p className="text-xs sm:text-sm font-medium text-gray-500 mb-6 max-w-xs leading-relaxed">{errorMessage}</p>
          
          <button 
            type="button"
            onClick={resetUploader}
            className="group relative inline-flex items-center gap-2.5 px-7 py-3.5 bg-gray-900 hover:bg-gray-800 active:scale-95 text-white text-xs sm:text-sm rounded-xl font-bold transition-all duration-200 shadow-xl shadow-gray-900/20 focus:outline-none focus-visible:ring-4 focus-visible:ring-gray-900/30 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 transition-transform duration-500 group-hover:rotate-180" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  // --- LOADING STATE RENDER ---
  if (uploadState === 'loading') {
    return (
      <div className={`relative w-full max-w-xl mx-auto ${className}`}>
        <div className="relative flex flex-col items-center justify-center w-full p-10 sm:p-16 text-center bg-white/90 backdrop-blur-2xl border-2 border-gray-100 rounded-[2.5rem] shadow-2xl shadow-gray-200/50 motion-safe:animate-in motion-safe:fade-in duration-300">
          <div className="relative mb-6">
            <div className={`absolute -inset-4 rounded-full border-4 border-transparent border-t-current border-r-current ${currentTheme.accentText} animate-[spin_1.2s_linear_infinite]`} />
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-50/80 rounded-2xl flex items-center justify-center shadow-inner border border-gray-100">
              <Loader2 className={`w-8 h-8 sm:w-10 sm:h-10 ${currentTheme.accentText} animate-spin`} />
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-1.5 tracking-tight">Processing Photo</h3>
          <p className="text-xs sm:text-sm font-medium text-gray-400 animate-pulse">Preparing local preview and canvas buffers...</p>
        </div>
      </div>
    );
  }

  // --- DEFAULT / IDLE / DRAG STATE RENDER ---
  return (
    <div className={`relative w-full max-w-xl mx-auto group ${className}`}>
      {/* Decorative Gradient Glow Ring */}
      <div 
        className={`absolute -inset-1 rounded-[2.75rem] blur-xl opacity-30 transition-all duration-500 ease-out bg-gradient-to-r ${currentTheme.glow}
        ${isDragActive ? 'opacity-70 scale-[1.02]' : 'group-hover:opacity-50'}`}
      />

      <div
        {...getRootProps()}
        className={`
          relative flex flex-col items-center justify-center w-full px-6 py-10 sm:py-14 text-center
          backdrop-blur-2xl transition-all duration-300 ease-out cursor-pointer
          border-2 border-dashed rounded-[2.5rem] outline-none focus-visible:ring-4 focus-visible:ring-blue-500/50
          ${isDragActive 
            ? `${currentTheme.borderActive} scale-[1.02] border-solid` 
            : 'border-gray-200/80 bg-white/80 hover:border-gray-300 hover:bg-white/95 hover:shadow-2xl hover:shadow-gray-200/50'
          }
        `}
      >
        <input {...getInputProps()} aria-label="Upload image file" />

        {/* Subtle Backdrop Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.025] pointer-events-none rounded-[2.5rem]" 
          style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }} 
        />

        {/* Upload Icon Container */}
        <div className="relative mb-5 transition-transform duration-300 ease-out group-hover:-translate-y-1">
          {isDragActive && (
            <div className={`absolute inset-0 rounded-full animate-ping opacity-25 bg-current ${currentTheme.accentText}`} />
          )}
          <div className={`
            relative flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl transition-all duration-300 shadow-xl
            ${isDragActive 
              ? `${currentTheme.iconBgActive} scale-110 rotate-0` 
              : 'bg-white text-gray-700 shadow-gray-200/80 border border-gray-100/80 rotate-2 group-hover:rotate-0 group-hover:text-gray-900'
            }
          `}>
            <Upload className={`w-8 h-8 sm:w-9 sm:h-9 transition-transform duration-300 ${isDragActive ? '-translate-y-1' : ''}`} />
          </div>
        </div>

        {/* Text Headers */}
        <h3 className="text-xl sm:text-2xl md:text-3xl font-black mb-2 tracking-tight text-gray-900">
          {isDragActive ? 'Drop your photo here!' : 'Upload a photo'}
        </h3>
        <p className="text-xs sm:text-sm font-medium text-gray-500 max-w-xs sm:max-w-sm mb-6 leading-relaxed">
          Drag and drop your file here, or click anywhere to open your browser storage.
        </p>

        {/* Action Button */}
        <div className="mb-6 pointer-events-none relative inline-block">
          {/* Animated Glow behind main CTA */}
          <div className={`absolute inset-0 bg-gradient-to-r ${currentTheme.button} rounded-xl blur-md opacity-40 group-hover:opacity-75 transition-opacity duration-300 animate-pulse`} />
          
          <span className={`relative overflow-hidden inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 bg-gradient-to-r ${currentTheme.button} text-white rounded-xl text-xs sm:text-sm font-extrabold shadow-lg transition-transform duration-300 group-hover:scale-[1.03]`}>
            {/* Glossy Shimmer Animation */}
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:animate-[shimmer_1.5s_infinite] -skew-x-12" />
            
            <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:rotate-6" />
            <span className="relative z-10 tracking-wide">Select Photo</span>
            <ArrowUpRight className="w-4 h-4 opacity-75 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </span>
        </div>

        {/* File Format Specifications Badge Bar */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-5 border-t border-gray-100 w-full max-w-xs sm:max-w-sm">
          <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">
            <FileType className="w-3.5 h-3.5 text-gray-400" />
            <span>JPG, PNG, WEBP, HEIC</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-gray-300 hidden sm:block" />
          <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 text-gray-400" />
            <span>Max 20MB</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default memo(ImageUploader);