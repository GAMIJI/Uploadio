import React, { useState, useCallback, memo } from 'react';
import { RefreshCw } from 'lucide-react';

export const SliderControl = memo(({
  label, value, onChange, min = 0, max = 100, step = 1, icon: Icon, format = (v) => v, resetValue = 0
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleDoubleClick = useCallback(() => {
    onChange(resetValue);
  }, [onChange, resetValue]);

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-1.5" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-xs font-medium text-gray-700">
          {Icon && <Icon className="w-3.5 h-3.5 text-gray-500" aria-hidden="true" />}
          {label}
        </label>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-gray-600 min-w-[40px] text-right bg-gray-100 px-2 py-0.5 rounded">
            {format(value)}
          </span>
          <button
            onClick={handleDoubleClick}
            className={`text-[10px] text-gray-400 hover:text-gray-600 transition-colors ${isHovered ? 'opacity-100' : 'opacity-0'} focus:opacity-100`}
            title="Reset to default"
            aria-label={`Reset ${label}`}
          >
            <RefreshCw className="w-3 h-3" aria-hidden="true" />
          </button>
        </div>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-gray-200 accent-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 touch-manipulation"
        style={{ background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)` }}
        aria-label={label}
      />
    </div>
  );
});

SliderControl.displayName = 'SliderControl';