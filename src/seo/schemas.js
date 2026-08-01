export const generateOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Pixora AI",
  "url": "https://pixora.ai",
  "logo": "https://pixora.ai/favicon.svg",
  "sameAs": [
    "https://twitter.com/pixoraai",
    "https://github.com/pixoraai"
  ]
});

export const generateWebsiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Pixora AI",
  "url": "https://pixora.ai"
});

export const generateWebApplicationSchema = (appName, appUrl, description) => ({
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": appName,
  "url": `https://pixora.ai${appUrl}`,
  "applicationCategory": "MultimediaApplication",
  "operatingSystem": "All",
  "description": description,
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  }
});

export const generateBreadcrumbSchema = (items) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": `https://pixora.ai${item.url}`
  }))
});

export const generateFAQSchema = (faqs) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
});