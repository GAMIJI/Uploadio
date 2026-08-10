import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ 
  title = 'Uploadio - The Ultimate AI Photo Studio | Free Passport Photos',
  description = 'Transform your selfies into perfect passport photos in seconds. Free, AI-powered, and completely private. No signup required.',
  keywords = 'passport photo, AI photo editor, passport photo maker, background removal, photo studio',
  image = 'https://uploadio.com/og-image.jpg',
  url = 'https://uploadio.com',
  type = 'website',
  author = 'Uploadio'
}) => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Uploadio',
    description: description,
    applicationCategory: 'Multimedia',
    operatingSystem: 'All',
    browserRequirements: 'Modern browser required',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    }
  };

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="Uploadio" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
      <meta name="twitter:creator" content="@uploadio" />

      {/* Additional Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      
      {/* Mobile App */}
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="format-detection" content="telephone=no" />

      {/* Theme Color */}
      <meta name="theme-color" content="#7C3AED" />
      <meta name="msapplication-TileColor" content="#7C3AED" />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

export default SEO;