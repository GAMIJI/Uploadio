import React from 'react';
import { Helmet } from 'react-helmet-async';

export const SEOHead = ({
  title,
  description,
  canonicalUrl,
  ogImage = '/assets/hero.png',
  ogType = 'website',
  twitterHandle = '@pixoraai',
  robots = 'index, follow',
  schemaList = []
}) => {
  const siteUrl = 'https://pixora.ai';
  const fullCanonical = canonicalUrl ? `${siteUrl}${canonicalUrl}` : siteUrl;
  const fullImageUrl = ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={fullCanonical} />
      <meta name="robots" content={robots} />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={fullCanonical} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content="Uploadio AI" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={twitterHandle} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />

      {schemaList.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};