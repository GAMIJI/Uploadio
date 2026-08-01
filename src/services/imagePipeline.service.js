// Image processing pipeline - generates final preview from source state
export class ImagePipelineService {
  constructor() {
    this.processingQueue = [];
    this.isProcessing = false;
  }

  async generatePreview(sourceImage, cropSettings, editSettings) {
    return new Promise((resolve, reject) => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
          // Apply crop
          const cropWidth = cropSettings.width;
          const cropHeight = cropSettings.height;
          const cropX = cropSettings.x;
          const cropY = cropSettings.y;
          
          // Set canvas to crop dimensions
          canvas.width = cropWidth;
          canvas.height = cropHeight;
          
          // Draw cropped image
          ctx.drawImage(img, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
          
          // Apply edit filters
          const brightnessValue = 100 + editSettings.brightness;
          const contrastValue = 100 + editSettings.contrast;
          const saturationValue = 100 + editSettings.saturation;
          
          ctx.filter = `brightness(${brightnessValue}%) contrast(${contrastValue}%) saturate(${saturationValue}%)`;
          
          // Re-draw with filters
          ctx.drawImage(canvas, 0, 0);
          
          // Apply temperature
          if (editSettings.temperature !== 0) {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            
            for (let i = 0; i < data.length; i += 4) {
              let r = data[i];
              let b = data[i + 2];
              
              r += editSettings.temperature;
              b -= editSettings.temperature;
              
              data[i] = Math.min(255, Math.max(0, r));
              data[i + 2] = Math.min(255, Math.max(0, b));
            }
            
            ctx.putImageData(imageData, 0, 0);
          }
          
          resolve(canvas.toDataURL('image/png'));
        };
        
        img.onerror = reject;
        img.src = sourceImage;
      } catch (error) {
        reject(error);
      }
    });
  }

  async applyBackgroundRemoval(image, onProgress) {
    // Import dynamically to avoid circular dependencies
    const { removeBackground } = await import('./backgroundRemoval');
    return await removeBackground(image, 'auto', onProgress);
  }

  async applyCrop(image, cropSettings) {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = cropSettings.width;
        canvas.height = cropSettings.height;
        ctx.drawImage(img, cropSettings.x, cropSettings.y, cropSettings.width, cropSettings.height, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/png'));
      };
      
      img.onerror = reject;
      img.src = image;
    });
  }

  getActiveSourceImage(originalImage, backgroundRemovedImage, isBackgroundRemoved) {
    if (isBackgroundRemoved && backgroundRemovedImage) {
      return backgroundRemovedImage;
    }
    return originalImage;
  }
}

export const imagePipeline = new ImagePipelineService();