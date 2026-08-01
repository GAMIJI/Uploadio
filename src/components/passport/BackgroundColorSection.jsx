import React, { useState, memo } from 'react';
import { Palette, ArrowRight } from 'lucide-react';
import { Button } from './Button';

export const BackgroundColorSection = memo(({ bgColor, onColorChange, onCustomColorChange, onContinue, showContinue }) => {
  const [customColor, setCustomColor] = useState('#ffffff');
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [recentColors, setRecentColors] = useState([]);

  const professionalColors = [
    { name: 'White', color: '#FFFFFF', recommended: true, badge: '✓ Recommended' },
    { name: 'Off White', color: '#FAFAFA', recommended: false, badge: 'Studio' },
    { name: 'Light Gray', color: '#F3F4F6', recommended: false, badge: 'Professional' },
    { name: 'Official White', color: '#FEFEFE', recommended: true, badge: 'Passport' },
    { name: 'Visa White', color: '#FCFCFC', recommended: false, badge: 'Visa' },
    { name: 'Light Blue', color: '#DBEAFE', recommended: false, badge: 'Soft' },
    { name: 'Passport Blue', color: '#1E40AF', recommended: true, badge: 'Official' },
    { name: 'Embassy Blue', color: '#1E3A5F', recommended: false, badge: 'Embassy' },
    { name: 'Neutral Gray', color: '#9CA3AF', recommended: false, badge: 'Neutral' },
    { name: 'Studio Gray', color: '#6B7280', recommended: false, badge: 'Studio' },
    { name: 'Dark Gray', color: '#374151', recommended: false, badge: 'Dark' },
    { name: 'Black', color: '#000000', recommended: false, badge: 'Creative' },
  ];

  const handleColorSelect = (color) => {
    onColorChange(color);
    setRecentColors(prev => {
      const filtered = prev.filter(c => c !== color);
      return [color, ...filtered].slice(0, 6);
    });
  };

  const handleCustomColorChange = (e) => {
    const color = e.target.value;
    setCustomColor(color);
    onCustomColorChange(color);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-2">
        {professionalColors.map(({ name, color, recommended, badge }) => (
          <button
            key={color} onClick={() => handleColorSelect(color)}
            className={`group relative p-2 rounded-lg border-2 transition-all hover:scale-105 ${bgColor === color ? 'border-blue-600 ring-2 ring-blue-600/30 shadow-md' : 'border-gray-200 hover:border-blue-300'}`}
            aria-label={`Select ${name} background`}
          >
            <div className="w-full h-10 rounded-md shadow-sm" style={{ backgroundColor: color }} />
            <span className="text-[10px] font-medium text-gray-600 block mt-1 truncate">{name}</span>
            {recommended && <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[8px] px-1.5 py-0.5 rounded-full">✓</span>}
            {badge && <span className="text-[8px] text-gray-400 block truncate">{badge}</span>}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <button onClick={() => setShowCustomPicker(!showCustomPicker)} className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
          <Palette className="w-4 h-4" /> Custom Color
        </button>
        <div className="flex-1 flex items-center gap-2">
          <input type="color" value={customColor} onChange={handleCustomColorChange} className="w-10 h-10 rounded-lg border-2 border-gray-200 cursor-pointer" aria-label="Custom color picker" />
          <input
            type="text" value={customColor}
            onChange={(e) => {
              const val = e.target.value;
              if (val.match(/^#[0-9A-Fa-f]{6}$/)) { setCustomColor(val); onCustomColorChange(val); }
            }}
            className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
            placeholder="#000000"
          />
        </div>
      </div>

      {recentColors.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Recent:</span>
          <div className="flex gap-1.5">
            {recentColors.map((color) => (
              <button key={color} onClick={() => handleColorSelect(color)} className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 ${bgColor === color ? 'border-blue-600 ring-2 ring-blue-600/30' : 'border-gray-200'}`} style={{ backgroundColor: color }} />
            ))}
          </div>
        </div>
      )}

      {showContinue && (
        <Button variant="success" icon={ArrowRight} size="lg" fullWidth onClick={onContinue} className="mt-4">
          Continue to Crop
        </Button>
      )}
    </div>
  );
});

BackgroundColorSection.displayName = 'BackgroundColorSection';