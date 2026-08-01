import { useState, useCallback } from 'react';

export const PASSPORT_TEMPLATES = {
  india: { name: 'India Passport', width: 35, height: 45, unit: 'mm', aspectRatio: 35/45 },
  us: { name: 'US Visa', width: 51, height: 51, unit: 'mm', aspectRatio: 1 },
  aadhaar: { name: 'Aadhaar Card', width: 25, height: 30, unit: 'mm', aspectRatio: 25/30 },
  pancard: { name: 'PAN Card', width: 30, height: 35, unit: 'mm', aspectRatio: 30/35 },
  custom: { name: 'Custom Size', width: 0, height: 0, unit: 'px', aspectRatio: null }
};

export const usePassportTemplates = (initialTemplate = 'india') => {
  const [selectedTemplate, setSelectedTemplate] = useState(initialTemplate);
  const [customDimensions, setCustomDimensions] = useState({ width: 35, height: 45 });

  const getCurrentDimensions = useCallback(() => {
    const template = PASSPORT_TEMPLATES[selectedTemplate];
    if (selectedTemplate === 'custom') {
      return customDimensions;
    }
    return { width: template.width, height: template.height, unit: template.unit };
  }, [selectedTemplate, customDimensions]);

  const updateCustomDimensions = useCallback((width, height) => {
    setCustomDimensions({ width, height });
  }, []);

  return {
    selectedTemplate,
    setSelectedTemplate,
    currentDimensions: getCurrentDimensions(),
    customDimensions,
    updateCustomDimensions,
    templates: PASSPORT_TEMPLATES
  };
};