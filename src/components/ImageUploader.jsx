import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Camera, Image as ImageIcon, Sparkles, CheckCircle, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'

const ImageUploader = ({ onImageUpload, onError, className = '', multiple = false }) => {
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback(async (acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      rejectedFiles.forEach((file) => {
        if (file.errors[0].code === 'file-too-large') {
          toast.error('File size must be less than 10MB')
          onError?.('File size must be less than 10MB')
        } else if (file.errors[0].code === 'file-invalid-type') {
          toast.error('Only JPG, PNG, and WEBP files are supported')
          onError?.('Only JPG, PNG, and WEBP files are supported')
        } else {
          toast.error(file.errors[0].message)
          onError?.(file.errors[0].message)
        }
      })
    }

    if (acceptedFiles.length > 0) {
      setIsUploading(true)
      
      // Simulate processing delay for better UX
      setTimeout(() => {
        const files = acceptedFiles.map(file => ({
          file,
          preview: URL.createObjectURL(file)
        }))
        onImageUpload(multiple ? files : files[0])
        toast.success(`${acceptedFiles.length} file${acceptedFiles.length > 1 ? 's' : ''} uploaded successfully!`)
        setIsUploading(false)
      }, 500)
    }
  }, [onImageUpload, onError, multiple])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp']
    },
    maxSize: 10 * 1024 * 1024,
    multiple,
    disabled: isUploading
  })

  return (
    <div className={`relative w-full max-w-2xl mx-auto group ${className}`}>
      
      {/* Animated Glowing Background Blob */}
      <div 
        className={`
          absolute -inset-1 rounded-[2.5rem] blur-xl opacity-30 transition duration-1000 
          bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600
          ${isDragActive ? 'opacity-60 scale-105 duration-300' : 'group-hover:opacity-50 group-hover:duration-200'}
        `}
      />

      <div
        {...getRootProps()}
        className={`
          relative overflow-hidden cursor-pointer flex flex-col items-center justify-center
          w-full px-6 py-12 md:py-16 transition-all duration-300 ease-out
          border-2 rounded-[2rem] backdrop-blur-xl
          ${isDragActive 
            ? 'border-purple-400 bg-white/90 scale-[0.99] shadow-2xl' 
            : 'border-white/60 bg-white/80 hover:border-purple-300 hover:bg-white/95 hover:shadow-2xl hover:shadow-purple-500/10'
          }
        `}
      >
        <input {...getInputProps()} />

        {/* Decorative subtle pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" 
          style={{ backgroundImage: 'radial-gradient(#8b5cf6 1px, transparent 1px)', backgroundSize: '24px 24px' }} 
        />
        
        <div className={`relative flex flex-col items-center justify-center z-10 transition-opacity duration-300 ${isUploading ? 'opacity-0' : 'opacity-100'}`}>
          
          {/* Vibrant Floating Icon Graphic */}
          <div className="relative mb-6 group-hover:-translate-y-2 transition-transform duration-500">
            {isDragActive && (
              <div className="absolute inset-0 bg-purple-400 rounded-full animate-ping opacity-30" />
            )}
            <div className={`
              relative flex items-center justify-center w-20 h-20 rounded-2xl rotate-3
              shadow-lg transition-all duration-300
              ${isDragActive 
                ? 'bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white shadow-purple-500/40 rotate-0 scale-110' 
                : 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white shadow-purple-500/30 group-hover:rotate-0'
              }
            `}>
              <Upload className={`w-9 h-9 transition-transform duration-300 ${isDragActive ? '-translate-y-1' : ''}`} />
            </div>
            {/* Small decorative corner icon */}
            <div className="absolute -bottom-2 -left-2 bg-white p-2 rounded-xl shadow-lg border border-purple-100 -rotate-6">
              <Camera className="w-4 h-4 text-pink-500" />
            </div>
          </div>

          {/* Gradient Typography */}
          <h3 className="text-2xl md:text-3xl font-extrabold mb-2 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
            {isDragActive ? 'Release to Upload!' : 'Drop your photo here'}
          </h3>
          <p className="text-sm font-medium text-gray-500 max-w-sm text-center mb-8">
            Drag and drop your file here, or click to browse. We'll handle the rest with magic.
          </p>

          {/* Colorful Action Button (Visual Only - Dropzone handles the click) */}
          <div className="mb-10 pointer-events-none">
            <span className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-purple-500/30 transition-all group-hover:shadow-purple-500/50 group-hover:scale-105">
              <ImageIcon className="w-5 h-5" />
              Browse Files
            </span>
          </div>

          {/* Trust & Specs Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 pt-6 border-t border-purple-100 w-full max-w-md">
            <div className="flex items-center gap-1.5 text-[12px] font-semibold text-gray-500 bg-purple-50/50 px-3 py-1.5 rounded-full">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span>JPG, PNG, WEBP (Max 10MB)</span>
            </div>
            <div className="flex items-center gap-1.5 text-[12px] font-semibold text-gray-500 bg-blue-50/50 px-3 py-1.5 rounded-full">
              <ShieldCheck className="w-4 h-4 text-blue-500" />
              <span>Secure & Auto-deleted</span>
            </div>
          </div>
        </div>

        {/* Vibrant Loading Overlay */}
        {isUploading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/60 backdrop-blur-md transition-all duration-300">
            <div className="relative mb-6">
              {/* Outer rotating colorful ring */}
              <div className="absolute -inset-4 rounded-full border-4 border-transparent border-t-purple-600 border-r-pink-500 animate-[spin_1.5s_linear_infinite]" />
              <div className="absolute -inset-4 rounded-full border-4 border-transparent border-b-blue-500 border-l-indigo-600 animate-[spin_2s_linear_infinite_reverse]" />
              
              {/* Inner floating icon */}
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/40 animate-pulse">
                <ImageIcon className="w-6 h-6 text-white" />
              </div>
            </div>
            <h4 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600 mb-1">
              Processing Magic...
            </h4>
            <p className="text-sm font-bold text-gray-500 animate-pulse">Preparing your workspace</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ImageUploader