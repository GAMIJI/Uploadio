import React from 'react';
import { Users, Wand2, Sparkles, Sliders, Image as ImageIcon, CheckCircle } from 'lucide-react';

const Search = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>

export const BackgroundRemovalProgress = ({ progress, stage, isComplete }) => {
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (progress / 100) * circumference;

  const stages = [
    
    { id: 'analyzing', label: 'Analyzing Image...', icon: Search },
    { id: 'detecting', label: 'Detecting Person...', icon: Users },
    { id: 'removing', label: 'Removing Background...', icon: Wand2 },
    { id: 'refining', label: 'Refining Hair...', icon: Sparkles },
    { id: 'optimizing', label: 'Optimizing Edges...', icon: Sliders },
    { id: 'preparing', label: 'Preparing Preview...', icon: ImageIcon },
    { id: 'complete', label: 'Complete! ✨', icon: CheckCircle }
  ];

  const currentStageIndex = Math.min(Math.floor((progress / 100) * stages.length), stages.length - 1);
  const currentStage = stages[currentStageIndex];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="text-center">
          <div className="relative w-32 h-32 mx-auto mb-6">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle cx="64" cy="64" r="45" stroke="#E5E7EB" strokeWidth="8" fill="none" />
              <circle
                cx="64" cy="64" r="45" stroke="#3B82F6" strokeWidth="8" fill="none" strokeLinecap="round"
                style={{ strokeDasharray: circumference, strokeDashoffset: offset, transition: 'stroke-dashoffset 0.5s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-800">{Math.round(progress)}%</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              {currentStage && (
                <>
                  <currentStage.icon className="w-5 h-5 text-blue-600 animate-pulse" />
                  <p className="text-lg font-semibold text-gray-800">{currentStage.label}</p>
                </>
              )}
            </div>
            <div className="flex justify-center gap-2 mt-4">
              {stages.map((s, index) => (
                <div key={s.id} className={`w-2 h-2 rounded-full transition-all duration-300 ${index <= currentStageIndex ? 'bg-blue-600' : 'bg-gray-200'} ${index === currentStageIndex ? 'scale-125' : ''}`} />
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-2">{isComplete ? 'Processing complete!' : 'Please wait...'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};