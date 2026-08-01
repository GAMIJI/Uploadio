export const PASSPORT_SIZES = {
  india: {
    name: 'India Passport',
    width: 35,
    height: 45,
    unit: 'mm',
    dpi: 600,
    description: 'Standard Indian passport photo size'
  },
  us: {
    name: 'US Visa',
    width: 2,
    height: 2,
    unit: 'inch',
    dpi: 600,
    description: 'US visa and passport photo size'
  },
  uk: {
    name: 'UK Passport',
    width: 35,
    height: 45,
    unit: 'mm',
    dpi: 600,
    description: 'UK passport photo requirements'
  },
  canada: {
    name: 'Canada Passport',
    width: 50,
    height: 70,
    unit: 'mm',
    dpi: 600,
    description: 'Canadian passport photo size'
  },
  australia: {
    name: 'Australia Passport',
    width: 35,
    height: 45,
    unit: 'mm',
    dpi: 600,
    description: 'Australian passport photo size'
  },
  schengen: {
    name: 'Schengen Visa',
    width: 35,
    height: 45,
    unit: 'mm',
    dpi: 600,
    description: 'Schengen visa photo requirements'
  },
  aadhaar: {
    name: 'Aadhaar Card',
    width: 25,
    height: 30,
    unit: 'mm',
    dpi: 600,
    description: 'Indian Aadhaar card photo size'
  },
  pancard: {
    name: 'PAN Card',
    width: 30,
    height: 35,
    unit: 'mm',
    dpi: 600,
    description: 'Indian PAN card photo size'
  }
}

export const getPassportSize = (key) => {
  return PASSPORT_SIZES[key] || PASSPORT_SIZES.india
}

export const getAllPassportSizes = () => {
  return Object.entries(PASSPORT_SIZES).map(([key, value]) => ({
    id: key,
    ...value
  }))
}

export const convertSize = (size, fromUnit, toUnit) => {
  const conversions = {
    mm_to_inch: size / 25.4,
    inch_to_mm: size * 25.4,
    mm_to_px: (size * 600) / 25.4, // at 600 DPI
    inch_to_px: size * 600 // at 600 DPI
  }
  
  const key = `${fromUnit}_to_${toUnit}`
  return conversions[key] || size
}

export const validatePhotoRequirements = (imageDimensions, selectedSize) => {
  const size = PASSPORT_SIZES[selectedSize]
  const errors = []
  
  if (size.unit === 'mm') {
    const requiredWidthPx = (size.width * size.dpi) / 25.4
    const requiredHeightPx = (size.height * size.dpi) / 25.4
    
    if (imageDimensions.width < requiredWidthPx) {
      errors.push(`Width too small. Required: ${requiredWidthPx.toFixed(0)}px`)
    }
    if (imageDimensions.height < requiredHeightPx) {
      errors.push(`Height too small. Required: ${requiredHeightPx.toFixed(0)}px`)
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}