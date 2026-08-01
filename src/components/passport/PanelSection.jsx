import React, { useState, memo } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

export const PanelSection = memo(({ title, icon: Icon, children, className = '', defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/60 shadow-sm overflow-hidden ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50/50 hover:bg-gray-100/50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-expanded={isOpen}
      >
        {Icon && <Icon className="w-4 h-4 text-blue-600" aria-hidden="true" />}
        <h3 className="text-sm font-semibold text-gray-800 flex-1 text-left">{title}</h3>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-gray-400" aria-hidden="true" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" aria-hidden="true" />
        )}
      </button>
      {isOpen && <div className="p-4 space-y-3">{children}</div>}
    </div>
  );
});

PanelSection.displayName = 'PanelSection';