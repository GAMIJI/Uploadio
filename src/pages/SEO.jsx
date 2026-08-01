import React from 'react'
import { Helmet } from 'react-helmet-async'

const SEO = ({ 
  title, 
  description, 
  url, 
  image = '/og-image.jpg',
  type = 'website',
  publishedTime,
  author = 'Pixora AI'
}) => {
  const siteTitle = 'Pixora AI'
  const fullTitle = title === siteTitle ? title : `${title} | ${siteTitle}`

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="author" content={author} />
      <link rel="canonical" href={url} />

      {/* Open Graph Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={siteTitle} />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Article Specific */}
      {publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
    </Helmet>
  )
}

export default SEO