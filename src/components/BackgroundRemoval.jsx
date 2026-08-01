import React, { useState } from 'react'
import { Sparkles, Loader2, Palette, Check, Eraser } from 'lucide-react'

const BackgroundRemoval = ({ 
  onRemove, 
  isProcessing, 
  isRemoved = false, 
  onColorChange, 
  selectedColor = 'transparent' 
}) => {
  const [customColor, setCustomColor] = useState('#8B5CF6') // Default custom color (purple)

  // Pre-defined professional background colors
  const presetColors = [
    { id: 'transparent', hex: 'transparent', label: 'Transparent' },
    { id: 'white', hex: '#FFFFFF', label: 'White' },
    { id: 'passport-blue', hex: '#1E40AF', label: 'Passport Blue' },
    { id: 'light-blue', hex: '#DBEAFE', label: 'Light Blue' },
    { id: 'gray', hex: '#F3F4F6', label: 'Light Gray' },
    { id: 'dark', hex: '#374151', label: 'Dark Gray' },
  ]

  return (
    <div className="bg-gradient-to-br from-purple-50/80 to-pink-50/80 backdrop-blur-sm rounded-[1.5rem] p-5 md:p-6 border border-purple-100 shadow-sm">
      
      {/* 1. AI Background Removal Section */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-extrabold text-gray-900">AI Background</h3>
        </div>
        <p className="text-sm text-gray-500 font-medium mb-4">
          Automatically extract the subject and apply a new background color.
        </p>
        
        <button
          onClick={onRemove}
          disabled={isProcessing || isRemoved}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold shadow-md shadow-purple-500/20 hover:shadow-purple-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Extracting Subject...
            </>
          ) : isRemoved ? (
            <>
              <Check className="w-5 h-5" />
              Background Removed
            </>
          ) : (
            <>
              <Eraser className="w-5 h-5" />
              Auto-Remove Background
            </>
          )}
        </button>
        <p className="text-[11px] font-semibold text-purple-600/70 mt-3 text-center uppercase tracking-wider">
          Processed locally in your browser
        </p>
      </div>

      <div className="w-full h-px bg-purple-200/50 mb-5" />

      {/* 2. Background Color Section */}
      <div className={`transition-opacity duration-300 ${!isRemoved && onColorChange ? 'opacity-50 hover:opacity-100' : ''}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-bold text-gray-900">Background Color</h3>
          </div>
        </div>
        
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2.5">
          {/* Presets */}
          {presetColors.map((c) => (
            <button
              key={c.id}
              onClick={() => onColorChange?.(c.hex)}
              title={c.label}
              className={`
                relative w-full aspect-square rounded-xl border-2 transition-all duration-200 hover:scale-110 shadow-sm
                ${selectedColor === c.hex ? 'border-purple-600 scale-110 shadow-md ring-2 ring-purple-600/20' : 'border-gray-200/80 hover:border-purple-300'}
              `}
              style={
                c.hex === 'transparent' 
                  ? { 
                      backgroundImage: 'repeating-linear-gradient(45deg, #e5e7eb 25%, transparent 25%, transparent 75%, #e5e7eb 75%, #e5e7eb), repeating-linear-gradient(45deg, #e5e7eb 25%, #ffffff 25%, #ffffff 75%, #e5e7eb 75%, #e5e7eb)', 
                      backgroundPosition: '0 0, 5px 5px', 
                      backgroundSize: '10px 10px' 
                    }
                  : { backgroundColor: c.hex }
              }
            />
          ))}
          
          {/* Custom Color Picker */}
          <div 
            title="Custom Color"
            className={`
              relative w-full aspect-square rounded-xl border-2 border-dashed transition-all duration-200 overflow-hidden flex items-center justify-center group shadow-sm
              ${selectedColor === customColor ? 'border-purple-600 scale-110 shadow-md ring-2 ring-purple-600/20' : 'border-gray-300 hover:border-purple-400 hover:scale-110'}
            `}
          >
            <input
              type="color"
              value={customColor}
              onChange={(e) => {
                setCustomColor(e.target.value)
                onColorChange?.(e.target.value)
              }}
              className="absolute inset-0 w-[200%] h-[200%] -top-[50%] -left-[50%] cursor-pointer opacity-0 z-10"
            />
            {/* Display the current custom color inside the button */}
            <div 
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ backgroundColor: customColor }}
            />
            {/* Icon overlaid on top */}
            <Palette className={`w-4 h-4 z-0 pointer-events-none mix-blend-difference ${selectedColor === customColor ? 'text-white' : 'text-gray-400'}`} />
          </div>
        </div>
      </div>

    </div>
  )
}

export default BackgroundRemoval