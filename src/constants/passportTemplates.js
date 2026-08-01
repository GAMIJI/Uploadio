export const PASSPORT_TEMPLATES = [
  {
    id: 'india',
    name: 'India Passport',
    country: 'India',
    dimensions: { width: 35, height: 45, unit: 'mm' },
    requirements: {
      background: 'White or off-white',
      expression: 'Neutral',
      headPosition: 'Centered, face occupying 70-80% of frame',
      eyeLevel: 'Between 1/3 and 1/2 from bottom',
      printQuality: '600 DPI minimum'
    },
    headSize: {
      fromChinToTop: '32-36mm',
      eyeLevel: '28-35mm from bottom'
    }
  },
  {
    id: 'us',
    name: 'US Visa',
    country: 'USA',
    dimensions: { width: 2, height: 2, unit: 'inch' },
    requirements: {
      background: 'White or off-white',
      expression: 'Neutral, mouth closed',
      headPosition: '1 - 1 3/8 inches from chin to top',
      eyeLevel: '1 1/8 to 1 3/8 inches from bottom',
      printQuality: '600 DPI minimum'
    },
    headSize: {
      fromChinToTop: '1 - 1.375 inches',
      eyeLevel: '1.125 - 1.375 inches from bottom'
    }
  },
  {
    id: 'uk',
    name: 'UK Passport',
    country: 'UK',
    dimensions: { width: 35, height: 45, unit: 'mm' },
    requirements: {
      background: 'Cream or light grey',
      expression: 'Neutral, mouth closed',
      headPosition: '29-34mm from chin to crown',
      eyeLevel: 'Not specified',
      printQuality: '600 DPI minimum'
    }
  },
  {
    id: 'aadhaar',
    name: 'Aadhaar Card',
    country: 'India',
    dimensions: { width: 25, height: 30, unit: 'mm' },
    requirements: {
      background: 'White',
      expression: 'Neutral',
      headPosition: 'Centered',
      printQuality: '300 DPI minimum'
    }
  },
  {
    id: 'pancard',
    name: 'PAN Card',
    country: 'India',
    dimensions: { width: 30, height: 35, unit: 'mm' },
    requirements: {
      background: 'White',
      expression: 'Neutral',
      headPosition: 'Centered',
      printQuality: '300 DPI minimum'
    }
  }
]

export const getTemplateById = (id) => {
  return PASSPORT_TEMPLATES.find(template => template.id === id)
}

export const getTemplatesByCountry = (country) => {
  return PASSPORT_TEMPLATES.filter(template => template.country === country)
}