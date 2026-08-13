import React from "react";
import { Helmet } from "react-helmet-async";

export const SEOHead = ({
  title,
  description,
  canonicalUrl = "/",
  ogImage = "/assets/hero.png",
  ogType = "website",
  twitterHandle = "@uploadioai",
  robots = "index, follow",
  schemaList = [],
  keywords = [],
  author = "Uploadio AI",
  publishedTime,
  modifiedTime,
  locale = "en_US",
  siteName = "Uploadio AI",
  articleSection,
  articleTags = [],
}) => {
  const siteUrl = "https://uploadio.in";

  // Remove trailing slash from site URL
  const normalizedSiteUrl = siteUrl.replace(/\/$/, "");

  // Create proper canonical URL
  const fullCanonical = canonicalUrl
    ? canonicalUrl.startsWith("http")
      ? canonicalUrl
      : `${normalizedSiteUrl}${
          canonicalUrl.startsWith("/")
            ? canonicalUrl
            : `/${canonicalUrl}`
        }`
    : normalizedSiteUrl;

  // Create absolute OG image URL
  const fullImageUrl = ogImage
    ? ogImage.startsWith("http")
      ? ogImage
      : `${normalizedSiteUrl}${
          ogImage.startsWith("/")
            ? ogImage
            : `/${ogImage}`
        }`
    : `${normalizedSiteUrl}/assets/hero.png`;

  // Clean title
  const cleanTitle = title?.trim() || "Uploadio AI";

  // Clean description
  const cleanDescription = description?.trim() || "";

  // Convert keywords array into comma-separated string
  const keywordString = Array.isArray(keywords)
    ? keywords.filter(Boolean).join(", ")
    : keywords;

  return (
    <Helmet>
      {/* =========================
          PRIMARY SEO
      ========================= */}

      <title>{cleanTitle}</title>

      <meta
        name="description"
        content={cleanDescription}
      />

      <meta
        name="robots"
        content={robots}
      />

      {keywordString && (
        <meta
          name="keywords"
          content={keywordString}
        />
      )}

      {author && (
        <meta
          name="author"
          content={author}
        />
      )}

      <link
        rel="canonical"
        href={fullCanonical}
      />

      {/* =========================
          SEARCH ENGINE META
      ========================= */}

      <meta
        name="googlebot"
        content={robots}
      />

      <meta
        name="bingbot"
        content={robots}
      />

      <meta
        name="language"
        content="English"
      />

      {/* =========================
          OPEN GRAPH
      ========================= */}

      <meta
        property="og:title"
        content={cleanTitle}
      />

      <meta
        property="og:description"
        content={cleanDescription}
      />

      <meta
        property="og:url"
        content={fullCanonical}
      />

      <meta
        property="og:image"
        content={fullImageUrl}
      />

      <meta
        property="og:type"
        content={ogType}
      />

      <meta
        property="og:site_name"
        content={siteName}
      />

      <meta
        property="og:locale"
        content={locale}
      />

      {/* =========================
          ARTICLE META
      ========================= */}

      {ogType === "article" && publishedTime && (
        <meta
          property="article:published_time"
          content={publishedTime}
        />
      )}

      {ogType === "article" && modifiedTime && (
        <meta
          property="article:modified_time"
          content={modifiedTime}
        />
      )}

      {ogType === "article" && author && (
        <meta
          property="article:author"
          content={author}
        />
      )}

      {ogType === "article" && articleSection && (
        <meta
          property="article:section"
          content={articleSection}
        />
      )}

      {ogType === "article" &&
        articleTags.map((tag, index) => (
          <meta
            key={`article-tag-${index}`}
            property="article:tag"
            content={tag}
          />
        ))}

      {/* =========================
          TWITTER / X
      ========================= */}

      <meta
        name="twitter:card"
        content="summary_large_image"
      />

      {twitterHandle && (
        <meta
          name="twitter:site"
          content={twitterHandle}
        />
      )}

      <meta
        name="twitter:title"
        content={cleanTitle}
      />

      <meta
        name="twitter:description"
        content={cleanDescription}
      />

      <meta
        name="twitter:image"
        content={fullImageUrl}
      />

      {/* =========================
          ADDITIONAL META
      ========================= */}

      <meta
        name="theme-color"
        content="#ffffff"
      />

      {/* =========================
          STRUCTURED DATA
      ========================= */}

      {schemaList
        .filter(Boolean)
        .map((schema, index) => (
          <script
            key={`schema-${index}`}
            type="application/ld+json"
          >
            {JSON.stringify(schema)}
          </script>
        ))}
    </Helmet>
  );
};