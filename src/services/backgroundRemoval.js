// src/services/backgroundRemoval.js
import {
  FilesetResolver,
  ImageSegmenter,
} from "@mediapipe/tasks-vision";

let segmenter = null;
let isModelLoading = false;
let modelLoadingProgress = 0;

// Initialize AI model
const initAIModel = async (onProgress) => {
  if (segmenter) return segmenter;

  if (isModelLoading) {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (segmenter) {
          clearInterval(interval);
          resolve(segmenter);
        }
      }, 200);
    });
  }

  try {
    isModelLoading = true;

    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );

    segmenter = await ImageSegmenter.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_multiclass_256x256/float32/latest/selfie_multiclass_256x256.tflite",
      },
      runningMode: "IMAGE",
      outputCategoryMask: true,
    });

    modelLoadingProgress = 1;
    if (onProgress) onProgress(1);
    return segmenter;
  } catch (error) {
    console.error('Failed to load AI model:', error);
    throw error;
  } finally {
    isModelLoading = false;
  }
};

// AI-based background removal
const aiBackgroundRemoval = async (imageElement, onProgress) => {
  try {
    const segmenter = await initAIModel(onProgress);
    
    // Segment the image
    const result = segmenter.segment(imageElement);
    const mask = result.categoryMask;
    
    // Create canvas for output
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    
    canvas.width = imageElement.width;
    canvas.height = imageElement.height;
    
    // Draw original image
    ctx.drawImage(imageElement, 0, 0);
    
    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    const maskData = mask.getAsUint8Array();
    
    // Apply mask: category 0 = background, make transparent
    for (let i = 0; i < maskData.length; i++) {
      if (maskData[i] === 0) {
        pixels[i * 4 + 3] = 0;
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    // Clean up
    result.close();
    
    return canvas.toDataURL("image/png");
  } catch (error) {
    console.error('AI background removal failed:', error);
    throw error;
  }
};

// Simple canvas-based background removal (fallback)
export const simpleBackgroundRemoval = (imageElement) => {
  return new Promise((resolve, reject) => {
    try {
      let img = imageElement;
      
      if (!(img instanceof HTMLImageElement)) {
        img = new Image();
        img.src = imageElement.src || imageElement;
        img.crossOrigin = 'Anonymous';
      }
      
      const processImage = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          
          // Detect background color from edges
          let bgR = 0, bgG = 0, bgB = 0;
          let sampleCount = 0;
          const sampleSize = Math.min(50, canvas.width, canvas.height);
          
          // Sample from edges
          for (let x = 0; x < sampleSize; x++) {
            const idx = x * 4;
            bgR += data[idx];
            bgG += data[idx + 1];
            bgB += data[idx + 2];
            sampleCount++;
          }
          
          for (let x = 0; x < sampleSize; x++) {
            const idx = ((canvas.height - 1) * canvas.width + x) * 4;
            bgR += data[idx];
            bgG += data[idx + 1];
            bgB += data[idx + 2];
            sampleCount++;
          }
          
          for (let y = 0; y < sampleSize; y++) {
            const idx = (y * canvas.width) * 4;
            bgR += data[idx];
            bgG += data[idx + 1];
            bgB += data[idx + 2];
            sampleCount++;
          }
          
          for (let y = 0; y < sampleSize; y++) {
            const idx = (y * canvas.width + (canvas.width - 1)) * 4;
            bgR += data[idx];
            bgG += data[idx + 1];
            bgB += data[idx + 2];
            sampleCount++;
          }
          
          bgR /= sampleCount;
          bgG /= sampleCount;
          bgB /= sampleCount;
          
          // Remove background pixels
          const edges = detectEdges(data, canvas.width, canvas.height);
          const tolerance = 60;
          let removedCount = 0;
          
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const pixelIndex = i / 4;
            const x = (pixelIndex % canvas.width);
            const y = Math.floor(pixelIndex / canvas.width);
            
            const colorDiff = Math.abs(r - bgR) + Math.abs(g - bgG) + Math.abs(b - bgB);
            
            if (colorDiff < tolerance && !edges[y * canvas.width + x]) {
              const distFromCenter = Math.sqrt(
                Math.pow(x - canvas.width / 2, 2) + 
                Math.pow(y - canvas.height / 2, 2)
              );
              
              if (distFromCenter > canvas.width * 0.3 || colorDiff < 30) {
                data[i + 3] = 0;
                removedCount++;
              }
            }
          }
          
          ctx.putImageData(imageData, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        } catch (error) {
          reject(error);
        }
      };
      
      if (img.complete && img.naturalHeight !== 0) {
        processImage();
      } else {
        img.onload = processImage;
        img.onerror = () => reject(new Error('Failed to load image'));
      }
    } catch (error) {
      reject(error);
    }
  });
};

// Edge detection helper function
const detectEdges = (imageData, width, height) => {
  const edges = new Array(width * height).fill(false);
  
  const getLuminance = (idx) => {
    return (imageData[idx] + imageData[idx + 1] + imageData[idx + 2]) / 3;
  };
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      const center = getLuminance(idx);
      
      const top = getLuminance(idx - width * 4);
      const bottom = getLuminance(idx + width * 4);
      const left = getLuminance(idx - 4);
      const right = getLuminance(idx + 4);
      
      const diff = Math.abs(center - top) + Math.abs(center - bottom) + 
                   Math.abs(center - left) + Math.abs(center - right);
      
      if (diff > 60) {
        edges[y * width + x] = true;
      }
    }
  }
  
  return edges;
};

// Advanced flood fill background removal
export const floodFillBackgroundRemoval = (imageElement) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = imageElement.width;
    canvas.height = imageElement.height;
    ctx.drawImage(imageElement, 0, 0);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const visited = new Array(canvas.width * canvas.height).fill(false);
    const queue = [];
    
    // Add corners
    queue.push(0);
    queue.push(canvas.width - 1);
    queue.push((canvas.height - 1) * canvas.width);
    queue.push((canvas.height - 1) * canvas.width + canvas.width - 1);
    
    // Get background color from corners
    let bgR = 0, bgG = 0, bgB = 0;
    let bgCount = 0;
    const corners = [0, canvas.width - 1, (canvas.height - 1) * canvas.width, (canvas.height - 1) * canvas.width + canvas.width - 1];
    
    corners.forEach(pos => {
      const idx = pos * 4;
      bgR += data[idx];
      bgG += data[idx + 1];
      bgB += data[idx + 2];
      bgCount++;
    });
    
    bgR /= bgCount;
    bgG /= bgCount;
    bgB /= bgCount;
    
    const tolerance = 50;
    while (queue.length > 0) {
      const pos = queue.shift();
      if (visited[pos]) continue;
      
      visited[pos] = true;
      const x = pos % canvas.width;
      const y = Math.floor(pos / canvas.width);
      const idx = pos * 4;
      
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const colorDiff = Math.abs(r - bgR) + Math.abs(g - bgG) + Math.abs(b - bgB);
      
      if (colorDiff < tolerance) {
        data[idx + 3] = 0;
        
        if (x > 0) queue.push(pos - 1);
        if (x < canvas.width - 1) queue.push(pos + 1);
        if (y > 0) queue.push(pos - canvas.width);
        if (y < canvas.height - 1) queue.push(pos + canvas.width);
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    resolve(canvas.toDataURL());
  });
};

// Main background removal function
export const removeBackground = async (imageElement, strategy = 'auto', onProgress = null) => {
  try {
    // Ensure we have a valid image element
    let img = imageElement;
    
    if (typeof img === 'string') {
      img = new Image();
      img.src = imageElement;
      img.crossOrigin = 'Anonymous';
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
    }
    
    if (!(img instanceof HTMLImageElement)) {
      const tempImg = new Image();
      tempImg.src = img.src || img;
      tempImg.crossOrigin = 'Anonymous';
      await new Promise((resolve, reject) => {
        tempImg.onload = resolve;
        tempImg.onerror = reject;
      });
      img = tempImg;
    }
    
    if (!img.complete || img.naturalHeight === 0) {
      await new Promise((resolve) => {
        img.onload = resolve;
      });
    }
    
    let result;
    
    // Try AI removal
    try {
      if (onProgress) onProgress(0.3);
      result = await aiBackgroundRemoval(img, onProgress);
      if (onProgress) onProgress(1);
      return result;
    } catch (aiError) {
      console.warn('AI removal failed, falling back to traditional methods');
      if (onProgress) onProgress(0.5);
      
      if (strategy === 'floodfill') {
        result = await floodFillBackgroundRemoval(img);
      } else if (strategy === 'simple') {
        result = await simpleBackgroundRemoval(img);
      } else {
        result = await simpleBackgroundRemoval(img);
        
        // Check if result is acceptable
        const testCanvas = document.createElement('canvas');
        const testCtx = testCanvas.getContext('2d');
        const testImg = new Image();
        testImg.src = result;
        await new Promise((resolve) => { testImg.onload = resolve; });
        testCanvas.width = testImg.width;
        testCanvas.height = testImg.height;
        testCtx.drawImage(testImg, 0, 0);
        const testData = testCtx.getImageData(0, 0, testCanvas.width, testCanvas.height).data;
        
        let transparentPixels = 0;
        for (let i = 3; i < testData.length; i += 4) {
          if (testData[i] === 0) transparentPixels++;
        }
        const transparencyRatio = transparentPixels / (testData.length / 4);
        
        if (transparencyRatio < 0.2) {
          result = await floodFillBackgroundRemoval(img);
        }
      }
      if (onProgress) onProgress(1);
    }
    
    return result;
  } catch (error) {
    console.error('Background removal failed:', error);
    return imageElement.src || imageElement;
  }
};

// Export model status
export const getModelStatus = () => {
  return {
    isLoaded: segmenter !== null,
    isLoading: isModelLoading,
    progress: modelLoadingProgress
  };
};

// Preload AI model
export const preloadAIModel = async (onProgress) => {
  try {
    await initAIModel(onProgress);
    return true;
  } catch (error) {
    console.error('Failed to preload AI model:', error);
    return false;
  }
};