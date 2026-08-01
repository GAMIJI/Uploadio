import { useState, useCallback, useEffect } from 'react'

export const usePrintLayout = (passportSize, paperSizeConfig) => {
  const [layout, setLayout] = useState([])
  const [copies, setCopies] = useState(4)
  const [paperSize, setPaperSize] = useState('4x6')
  
  const paperSizes = {
    '4x6': { width: 4, height: 6, unit: 'inch' },
    '5x7': { width: 5, height: 7, unit: 'inch' },
    'a4': { width: 8.27, height: 11.69, unit: 'inch' }
  }

  const mmToInches = (mm) => mm / 25.4

  const calculateLayout = useCallback(() => {
    if (!passportSize) return []
    
    const paper = paperSizes[paperSize]
    const photoWidth = passportSize.unit === 'mm' ? mmToInches(passportSize.width) : passportSize.width
    const photoHeight = passportSize.unit === 'mm' ? mmToInches(passportSize.height) : passportSize.height
    
    const cols = Math.floor(paper.width / photoWidth)
    const rows = Math.floor(paper.height / photoHeight)
    
    const maxCopies = cols * rows
    const actualCopies = copies === 'auto' ? maxCopies : Math.min(copies, maxCopies)
    
    const layoutItems = []
    const marginX = (paper.width - (cols * photoWidth)) / 2
    const marginY = (paper.height - (rows * photoHeight)) / 2
    
    for (let row = 0; row < rows && layoutItems.length < actualCopies; row++) {
      for (let col = 0; col < cols && layoutItems.length < actualCopies; col++) {
        layoutItems.push({
          x: marginX + col * photoWidth,
          y: marginY + row * photoHeight,
          width: photoWidth,
          height: photoHeight,
          row,
          col
        })
      }
    }
    
    return layoutItems
  }, [passportSize, paperSize, copies])

  const getMaxCopies = useCallback(() => {
    if (!passportSize) return 0
    
    const paper = paperSizes[paperSize]
    const photoWidth = passportSize.unit === 'mm' ? mmToInches(passportSize.width) : passportSize.width
    const photoHeight = passportSize.unit === 'mm' ? mmToInches(passportSize.height) : passportSize.height
    
    const cols = Math.floor(paper.width / photoWidth)
    const rows = Math.floor(paper.height / photoHeight)
    
    return cols * rows
  }, [passportSize, paperSize])

  useEffect(() => {
    const newLayout = calculateLayout()
    setLayout(newLayout)
  }, [calculateLayout])

  return {
    layout,
    copies,
    paperSize,
    setCopies,
    setPaperSize,
    getMaxCopies,
    paperSizes
  }
}