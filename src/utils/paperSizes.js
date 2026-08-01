export const PAPER_SIZES = {
  '4x6': {
    name: '4 × 6 inches',
    width: 4,
    height: 6,
    unit: 'inch',
    dpi: 300,
    description: 'Standard photo paper'
  },
  '5x7': {
    name: '5 × 7 inches',
    width: 5,
    height: 7,
    unit: 'inch',
    dpi: 300,
    description: 'Large photo paper'
  },
  'a4': {
    name: 'A4',
    width: 8.27,
    height: 11.69,
    unit: 'inch',
    dpi: 300,
    description: 'Standard document paper'
  },
  'letter': {
    name: 'Letter',
    width: 8.5,
    height: 11,
    unit: 'inch',
    dpi: 300,
    description: 'US letter size'
  }
}

export const getPaperSize = (key) => {
  return PAPER_SIZES[key] || PAPER_SIZES['4x6']
}

export const getAllPaperSizes = () => {
  return Object.entries(PAPER_SIZES).map(([key, value]) => ({
    id: key,
    ...value
  }))
}

export const calculatePhotoGrid = (photoSize, paperSize, margin = 0.25) => {
  const usableWidth = paperSize.width - (margin * 2)
  const usableHeight = paperSize.height - (margin * 2)
  
  const cols = Math.floor(usableWidth / photoSize.width)
  const rows = Math.floor(usableHeight / photoSize.height)
  
  const totalPhotos = cols * rows
  const spacingX = (usableWidth - (cols * photoSize.width)) / (cols + 1)
  const spacingY = (usableHeight - (rows * photoSize.height)) / (rows + 1)
  
  return {
    cols,
    rows,
    totalPhotos,
    spacingX,
    spacingY,
    margin
  }
}

export const generatePrintLayout = (photoSize, paperSize, numberOfCopies) => {
  const grid = calculatePhotoGrid(photoSize, paperSize)
  const actualCopies = Math.min(numberOfCopies, grid.totalPhotos)
  
  const layout = []
  let copyCount = 0
  
  for (let row = 0; row < grid.rows && copyCount < actualCopies; row++) {
    for (let col = 0; col < grid.cols && copyCount < actualCopies; col++) {
      const x = grid.margin + (col + 1) * grid.spacingX + col * photoSize.width
      const y = grid.margin + (row + 1) * grid.spacingY + row * photoSize.height
      
      layout.push({
        x,
        y,
        width: photoSize.width,
        height: photoSize.height,
        row,
        col,
        index: copyCount + 1
      })
      
      copyCount++
    }
  }
  
  return layout
}