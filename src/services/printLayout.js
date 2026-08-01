// src/services/printLayout.js
export const calculatePrintLayout = (photoSize, paperSize, copyCount = 'auto') => {
  const margin = 10 // mm
  const spacing = 5 // mm
  
  const availableWidth = paperSize.width - (margin * 2)
  const availableHeight = paperSize.height - (margin * 2)
  
  const cols = Math.floor(availableWidth / (photoSize.width + spacing))
  const rows = Math.floor(availableHeight / (photoSize.height + spacing))
  
  const totalFit = cols * rows
  
  let targetCount = totalFit
  if (copyCount !== 'auto') {
    targetCount = Math.min(parseInt(copyCount), totalFit)
  }
  
  const actualCols = Math.ceil(Math.sqrt(targetCount * (cols / rows)))
  const actualRows = Math.ceil(targetCount / actualCols)
  
  return {
    cols: Math.min(actualCols, cols),
    rows: Math.min(actualRows, rows),
    total: Math.min(actualCols * actualRows, totalFit),
    stepX: availableWidth / cols,
    stepY: availableHeight / rows,
    margin,
    spacing
  }
}

export const generatePrintGrid = (canvas, photoCount, photoWidth, photoHeight, paperWidth, paperHeight) => {
  const layout = calculatePrintLayout(
    { width: photoWidth, height: photoHeight },
    { width: paperWidth, height: paperHeight },
    photoCount
  )
  
  return layout
}