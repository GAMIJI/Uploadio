import React, { memo } from 'react';
import { Image as ImageIcon, ZoomIn, Loader2, Check } from 'lucide-react';

export const StatusBar = memo(({ imageSize, passportSize, zoom, isProcessing, isReady, step }) => (
  <div className="h-10 bg-white/90 backdrop-blur-sm border-t border-gray-200 flex items-center px-4 md:px-6 text-xs text-gray-600 gap-4 md:gap-6 flex-shrink-0 overflow-x-auto no-scrollbar">
    <span className="flex items-center gap-1.5 whitespace-nowrap">
      <ImageIcon className="w-3.5 h-3.5" aria-hidden="true" />
      {imageSize?.width ? `${Math.round(imageSize.width)}×${Math.round(imageSize.height)}` : 'No image'}
    </span>
    <span className="flex items-center gap-1.5 whitespace-nowrap">
      <span className="w-3 h-3 border border-gray-400 rounded-sm" aria-hidden="true" />
      Passport: {passportSize?.width || 35}×{passportSize?.height || 45}mm
    </span>
    <span className="flex items-center gap-1.5 whitespace-nowrap">
      <ZoomIn className="w-3.5 h-3.5" aria-hidden="true" />
      {zoom || 100}%
    </span>
    <span className="flex items-center gap-1.5 whitespace-nowrap">
      <span className="w-3 h-3 rounded-full bg-gray-300" aria-hidden="true" />
      Step {step}/6
    </span>
    {isProcessing && (
      <span className="flex items-center gap-1.5 text-amber-600 whitespace-nowrap">
        <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
        Processing...
      </span>
    )}
    {isReady && !isProcessing && (
      <span className="flex items-center gap-1.5 text-green-600 whitespace-nowrap">
        <Check className="w-3.5 h-3.5" aria-hidden="true" />
        Ready
      </span>
    )}
  </div>
));

StatusBar.displayName = 'StatusBar';