import React, { memo } from 'react';

export const CropInfo = memo(({ width, height, aspectRatio, ratio }) => (
  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md text-white px-4 py-2 rounded-xl shadow-2xl flex items-center gap-4 text-xs font-mono z-30 border border-white/10">
    <div className="flex items-center gap-1.5">
      <span className="text-white/50">W</span>
      <span className="font-medium">{Math.round(width)}px</span>
    </div>
    <div className="w-px h-4 bg-white/20" />
    <div className="flex items-center gap-1.5">
      <span className="text-white/50">H</span>
      <span className="font-medium">{Math.round(height)}px</span>
    </div>
    <div className="w-px h-4 bg-white/20" />
    <div className="flex items-center gap-1.5">
      <span className="text-white/50">Ratio</span>
      <span className="font-medium">{ratio || 'Free'}</span>
    </div>
    {aspectRatio && (
      <>
        <div className="w-px h-4 bg-white/20" />
        <div className="flex items-center gap-1.5">
          <span className="text-white/50">Aspect</span>
          <span className="font-medium">{aspectRatio}</span>
        </div>
      </>
    )}
  </div>
));

CropInfo.displayName = 'CropInfo';