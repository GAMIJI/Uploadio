// src/services/faceDetection.js
export const detectFace = async (image) => {
  try {
    // Create a canvas to draw the image
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    // Set canvas size to image size
    canvas.width = image.width
    canvas.height = image.height
    
    // Draw image
    ctx.drawImage(image, 0, 0)
    
    // Simple face detection heuristic (center region)
    // In production, use a proper ML library like face-api.js or TensorFlow.js
    const faceWidth = image.width * 0.5
    const faceHeight = image.height * 0.6
    
    return {
      x: (image.width - faceWidth) / 2,
      y: (image.height - faceHeight) / 3,
      width: faceWidth,
      height: faceHeight
    }
  } catch (error) {
    console.error('Face detection error:', error)
    return null
  }
}

export const getOptimalCrop = async (image, targetSize) => {
  try {
    const aspectRatio = targetSize.width / targetSize.height
    
    let cropWidth, cropHeight, cropX, cropY
    
    if (image.width / image.height > aspectRatio) {
      // Image is wider than target aspect ratio
      cropHeight = image.height * 0.6
      cropWidth = cropHeight * aspectRatio
      cropX = (image.width - cropWidth) / 2
      cropY = (image.height - cropHeight) / 2.5
    } else {
      // Image is taller than target aspect ratio
      cropWidth = image.width * 0.5
      cropHeight = cropWidth / aspectRatio
      cropX = (image.width - cropWidth) / 2
      cropY = (image.height - cropHeight) / 2.5
    }
    
    return {
      x: cropX,
      y: cropY,
      width: cropWidth,
      height: cropHeight
    }
  } catch (error) {
    console.error('Get optimal crop error:', error)
    return null
  }
}