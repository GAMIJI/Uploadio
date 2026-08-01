// src/hooks/useBackgroundRemoval.js
import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { removeBackground, getModelStatus, preloadAIModel } from '../services/backgroundRemoval'

export const useBackgroundRemoval = () => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState(null)
  const [modelStatus, setModelStatus] = useState(getModelStatus())

  // Preload model on hook initialization
  useState(() => {
    preloadAIModel((progress) => {
      console.log(`Model preload: ${Math.round(progress * 100)}%`);
      setModelStatus(getModelStatus());
    });
  }, []);

  const removeBackgroundHandler = useCallback(async (imageElement, onProgress) => {
    setIsProcessing(true)
    toast.loading('AI is analyzing your photo...', { id: 'bg-removal' })
    
    try {
      const transparentImage = await removeBackground(imageElement, 'auto', onProgress)
      
      setResult(transparentImage)
      toast.success('Background removed successfully!', { id: 'bg-removal' })
      return transparentImage
      
    } catch (error) {
      console.error('Background removal failed:', error)
      toast.error('Failed to remove background', { id: 'bg-removal' })
      return null
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const reset = useCallback(() => {
    setResult(null)
  }, [])

  return {
    isProcessing,
    result,
    modelStatus,
    removeBackground: removeBackgroundHandler,
    reset
  }
}