export const PAPER_TEMPLATES = [
  {
    id: '4x6',
    name: '4 × 6 inches',
    dimensions: { width: 4, height: 6, unit: 'inch' },
    printResolution: 300,
    description: 'Standard photo paper - 4x6"',
    useCase: 'Wallet size prints'
  },
  {
    id: '5x7',
    name: '5 × 7 inches',
    dimensions: { width: 5, height: 7, unit: 'inch' },
    printResolution: 300,
    description: 'Large photo paper - 5x7"',
    useCase: 'Small photo prints'
  },
  {
    id: 'a4',
    name: 'A4',
    dimensions: { width: 8.27, height: 11.69, unit: 'inch' },
    printResolution: 300,
    description: 'Standard document paper - 210 × 297 mm',
    useCase: 'Multiple photos per sheet'
  },
  {
    id: 'letter',
    name: 'Letter',
    dimensions: { width: 8.5, height: 11, unit: 'inch' },
    printResolution: 300,
    description: 'US Letter size - 8.5 × 11"',
    useCase: 'Multiple photos per sheet'
  }
]

export const getPaperTemplateById = (id) => {
  return PAPER_TEMPLATES.find(template => template.id === id)
}

export const getPrintOptions = () => {
  return [
    { value: 2, label: '2 copies' },
    { value: 4, label: '4 copies' },
    { value: 6, label: '6 copies' },
    { value: 8, label: '8 copies' },
    { value: 12, label: '12 copies' },
    { value: 16, label: '16 copies' },
    { value: 20, label: '20 copies' },
    { value: 'auto', label: 'Auto (maximum fit)' }
  ]
}