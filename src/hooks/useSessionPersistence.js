import { useEffect, useRef } from 'react';

const STORAGE_KEYS = {
  CROP_SETTINGS: 'passport_crop_settings',
  EDIT_SETTINGS: 'passport_edit_settings',
  ACTIVE_TAB: 'passport_active_tab',
  SELECTED_TEMPLATE: 'passport_selected_template',
  PAPER_SIZE: 'passport_paper_size',
  COPIES: 'passport_copies',
  IS_BACKGROUND_REMOVED: 'passport_background_removed'
};

export const useSessionPersistence = (state, onRestore) => {
  const isInitialLoad = useRef(true);

  // Save to localStorage
  const saveToStorage = () => {
    try {
      localStorage.setItem(STORAGE_KEYS.CROP_SETTINGS, JSON.stringify(state.cropSettings));
      localStorage.setItem(STORAGE_KEYS.EDIT_SETTINGS, JSON.stringify(state.editSettings));
      localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, state.activeTab);
      localStorage.setItem(STORAGE_KEYS.SELECTED_TEMPLATE, state.selectedTemplate);
      localStorage.setItem(STORAGE_KEYS.PAPER_SIZE, state.paperSize);
      localStorage.setItem(STORAGE_KEYS.COPIES, String(state.copies));
      localStorage.setItem(STORAGE_KEYS.IS_BACKGROUND_REMOVED, String(state.isBackgroundRemoved));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  };

  // Load from localStorage
  const loadFromStorage = () => {
    try {
      const restoredState = {
        cropSettings: JSON.parse(localStorage.getItem(STORAGE_KEYS.CROP_SETTINGS)) || state.cropSettings,
        editSettings: JSON.parse(localStorage.getItem(STORAGE_KEYS.EDIT_SETTINGS)) || state.editSettings,
        activeTab: localStorage.getItem(STORAGE_KEYS.ACTIVE_TAB) || state.activeTab,
        selectedTemplate: localStorage.getItem(STORAGE_KEYS.SELECTED_TEMPLATE) || state.selectedTemplate,
        paperSize: localStorage.getItem(STORAGE_KEYS.PAPER_SIZE) || state.paperSize,
        copies: localStorage.getItem(STORAGE_KEYS.COPIES) === 'auto' ? 'auto' : parseInt(localStorage.getItem(STORAGE_KEYS.COPIES) || '4'),
        isBackgroundRemoved: localStorage.getItem(STORAGE_KEYS.IS_BACKGROUND_REMOVED) === 'true'
      };
      
      onRestore(restoredState);
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
    }
  };

  // Auto-save on state changes
  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      loadFromStorage();
    } else {
      saveToStorage();
    }
  }, [state.cropSettings, state.editSettings, state.activeTab, state.selectedTemplate, state.paperSize, state.copies, state.isBackgroundRemoved]);

  return { saveToStorage, loadFromStorage };
};