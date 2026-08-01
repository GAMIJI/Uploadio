// Centralized state store for photo processing pipeline
export const createPhotoStore = () => {
  let listeners = [];
  let state = {
    // Core images
    originalImage: null,
    backgroundRemovedImage: null,
    
    // Processing flags
    isBackgroundRemoved: false,
    isProcessing: false,
    processingError: null,
    
    // Crop settings
    cropSettings: {
      x: 0,
      y: 0,
      width: 300,
      height: 300,
      originalImageWidth: 0,
      originalImageHeight: 0
    },
    
    // Edit settings
    editSettings: {
      zoom: 100,
      rotation: 0,
      brightness: 0,
      contrast: 0,
      saturation: 0,
      sharpness: 0,
      temperature: 0,
      background: '#FFFFFF'
    },
    
    // UI state
    activeTab: 'crop',
    showPrintSheet: false,
    
    // Template settings
    selectedTemplate: 'india',
    paperSize: '4x6',
    copies: 'auto',
    
    // Preview
    previewImage: null,
    previewError: null
  };

  const subscribe = (listener) => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  };

  const notify = () => {
    listeners.forEach(listener => listener(state));
  };

  const setState = (updater) => {
    const newState = typeof updater === 'function' ? updater(state) : updater;
    state = { ...state, ...newState };
    notify();
    return state;
  };

  const getState = () => state;

  return { subscribe, getState, setState };
};

export const photoStore = createPhotoStore();
