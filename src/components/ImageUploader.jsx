import React, { useCallback, useState, useEffect, useRef, memo } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  Image as ImageIcon, 
  AlertCircle, 
  RefreshCw, 
  Sparkles, 
  FileType, 
  Loader2 
} from 'lucide-react';
import toast from 'react-hot-toast';

const ImageUploader = ({ onImageUpload, onError, className = '', multiple = false }) => {
  const [uploadState, setUploadState] = useState('idle'); // 'idle' | 'loading' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  
  const timerRef = useRef(null);

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
        friendlyMessage = 'Unsupported format. Please use JPG, PNG, WEBP, or HEIC.';
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

  // --- RENDER STATES ---

  if (uploadState === 'error') {
    return (
      <div className={`relative w-full max-w-xl mx-auto ${className}`}>
        <div className="relative flex flex-col items-center justify-center w-full p-8 sm:p-12 text-center bg-white/90 backdrop-blur-xl border-2 border-red-200 rounded-[2rem] shadow-xl shadow-red-500/10 animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4 border-4 border-red-100">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-extrabold text-gray-900 mb-2">Upload Failed</h3>
          <p className="text-sm font-medium text-gray-500 mb-6 max-w-xs">{errorMessage}</p>
          <button 
            onClick={resetUploader}
            className="flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-gray-800 active:scale-95 text-white rounded-xl font-semibold transition-all shadow-md focus:outline-none focus-visible:ring-4 focus-visible:ring-gray-900/30"
          >
            <RefreshCw className="w-4 h-4" /> Try Again
          </button>
        </div>
      </div>
    );
  }

  if (uploadState === 'loading') {
    return (
      <div className={`relative w-full max-w-xl mx-auto ${className}`}>
        <div className="relative flex flex-col items-center justify-center w-full p-12 sm:p-16 text-center bg-white/90 backdrop-blur-xl border-2 border-blue-100 rounded-[2rem] shadow-2xl shadow-blue-500/10 animate-in fade-in duration-300">
          <div className="relative mb-6">
            <div className="absolute -inset-4 rounded-full border-4 border-transparent border-t-blue-600 border-r-indigo-500 animate-[spin_1s_linear_infinite]" />
            <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl flex items-center justify-center shadow-inner">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          </div>
          <h3 className="text-xl font-extrabold text-gray-900 mb-1">Processing...</h3>
          <p className="text-sm font-medium text-gray-500 animate-pulse">Preparing your photo</p>
        </div>
      </div>
    );
  }

  // DEFAULT / IDLE / DRAG STATE
  return (
    <div className={`relative w-full max-w-xl mx-auto group ${className}`}>
      {/* Decorative Glow Blob */}
      <div 
        className={`absolute -inset-1 rounded-[2.5rem] blur-xl opacity-30 transition-all duration-700 ease-out bg-gradient-to-r from-blue-600 to-indigo-600
        ${isDragActive ? 'opacity-60 scale-105' : 'group-hover:opacity-40 group-hover:duration-200'}`}
      />

      <div
        {...getRootProps()}
        className={`
          relative flex flex-col items-center justify-center w-full px-6 py-12 sm:py-16 text-center
          backdrop-blur-xl transition-all duration-300 ease-out cursor-pointer
          border-2 rounded-[2rem] outline-none focus-visible:ring-4 focus-visible:ring-blue-500/50
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50/90 scale-[1.02] shadow-2xl shadow-blue-500/15' 
            : 'border-gray-200 bg-white/80 hover:border-blue-300 hover:bg-white/95 hover:shadow-xl hover:shadow-blue-500/5'
          }
        `}
      >
        <input {...getInputProps()} aria-label="Upload image file" />

        {/* Decorative Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02] pointer-events-none mix-blend-overlay rounded-[2rem]" 
          style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }} 
        />

        {/* Icon Container */}
        <div className="relative mb-6 transition-transform duration-500 ease-out group-hover:-translate-y-1">
          {isDragActive && (
            <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-20" />
          )}
          <div className={`
            relative flex items-center justify-center w-20 h-20 rounded-2xl transition-all duration-300 shadow-lg
            ${isDragActive 
              ? 'bg-blue-600 text-white shadow-blue-500/40 rotate-0 scale-110' 
              : 'bg-gradient-to-br from-white to-gray-50 text-blue-600 shadow-gray-200/50 border border-gray-100 rotate-3 group-hover:rotate-0'
            }
          `}>
            <Upload className={`w-9 h-9 transition-transform duration-300 ${isDragActive ? '-translate-y-1' : ''}`} />
          </div>
        </div>

        {/* Typography */}
        <h3 className="text-2xl sm:text-3xl font-extrabold mb-3 tracking-tight text-gray-900">
          {isDragActive ? 'Release to Upload!' : 'Upload a photo'}
        </h3>
        <p className="text-sm font-medium text-gray-500 max-w-sm mb-8 leading-relaxed">
          Drag and drop your image here, or click to browse files.
        </p>

        {/* --- COLORFUL ANIMATED BUTTON --- */}
        <div className="mb-8 pointer-events-none relative inline-block">
          {/* Pulsing glow behind the button */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl blur-md opacity-40 group-hover:opacity-75 transition-opacity duration-500 animate-pulse" />
          
          <span className="relative overflow-hidden inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-xl text-sm font-bold shadow-xl transition-transform duration-300 group-hover:scale-105">
            {/* Glossy sweep animation */}
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:animate-[shimmer_1.5s_infinite] -skew-x-12" />
            
            <ImageIcon className="w-5 h-5 group-hover:rotate-12 group-hover:scale-110 transition-all duration-300" />
            <span className="relative z-10">Select Photo</span>
          </span>
        </div>

        {/* File Specs Footer */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-6 border-t border-gray-200/60 w-full max-w-sm">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            <FileType className="w-4 h-4 text-gray-400" />
            JPG, PNG, WEBP
          </div>
          <div className="w-1 h-1 rounded-full bg-gray-300 hidden sm:block" />
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-gray-400" />
            Up to 20MB
          </div>
        </div>

      </div>
    </div>
  );
};

export default memo(ImageUploader);