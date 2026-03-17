/**
 * SEO utility functions — structured data generators and meta tag helpers.
 *
 * All structured data follows Schema.org vocabulary and is output as JSON-LD.
 * Meta helpers produce arrays compatible with React Router 7's meta function.
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SITE_NAME = 'Cowboy';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Truncate a string to a max length, breaking at the last full word. */
export function truncate(text: string, max = 155): string {
  if (!text || text.length <= max) return text;
  const trimmed = text.slice(0, max);
  const lastSpace = trimmed.lastIndexOf(' ');
  return (lastSpace > 0 ? trimmed.slice(0, lastSpace) : trimmed) + '…';
}

/** Build a full canonical URL from origin + path. */
export function canonicalUrl(origin: string, path: string): string {
  return `${origin}${path.startsWith('/') ? path : `/${path}`}`;
}

/** Extract the origin URL from root loader matches. */
export function getOriginFromMatches(
  matches: ReadonlyArray<{id: string; data?: unknown} | undefined>,
): string {
  const rootData = matches.find((m) => m?.id === 'root')?.data as
    | {url?: string}
    | undefined;
  return rootData?.url ?? '';
}

// ---------------------------------------------------------------------------
// Meta tag builders
// ---------------------------------------------------------------------------

interface PageMetaOptions {
  title: string;
  description: string;
  url: string;
  image?: string;
  type?: string;
  noindex?: boolean;
  /** Set to false to use title as-is (e.g. home page). Defaults to true. */
  appendSiteName?: boolean;
}

/**
 * Generate a complete set of meta tags for a page:
 * title, description, canonical, Open Graph, and Twitter Card.
 */
export function buildPageMeta({
  title,
  description,
  url,
  image,
  type = 'website',
  noindex = false,
  appendSiteName = true,
}: PageMetaOptions): Array<Record<string, string>> {
  const desc = truncate(description);
  const pageTitle = appendSiteName ? `${title} | ${SITE_NAME}` : title;
  const tags: Array<Record<string, string>> = [
    {title: pageTitle},
    {name: 'description', content: desc},
    {tagName: 'link', rel: 'canonical', href: url},
    // Open Graph
    {property: 'og:site_name', content: SITE_NAME},
    {property: 'og:title', content: title},
    {property: 'og:description', content: desc},
    {property: 'og:url', content: url},
    {property: 'og:type', content: type},
    // Twitter Card
    {name: 'twitter:card', content: 'summary_large_image'},
    {name: 'twitter:title', content: title},
    {name: 'twitter:description', content: desc},
  ];

  if (image) {
    tags.push({property: 'og:image', content: image});
    tags.push({name: 'twitter:image', content: image});
  }

  if (noindex) {
    tags.push({name: 'robots', content: 'noindex, nofollow'});
  }

  return tags;
}

// ---------------------------------------------------------------------------
// JSON-LD Structured Data
// ---------------------------------------------------------------------------

/** Organization schema — used on the home page. */
export function organizationJsonLd(origin: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: origin,
    logo: `${origin}/favicon.svg`,
    sameAs: [
      // Add real social profile URLs here when available
    ],
  };
}

interface ProductJsonLdOptions {
  name: string;
  description: string;
  url: string;
  images: string[];
  brand: string;
  sku?: string;
  priceCurrency: string;
  price: string;
  availability: boolean;
}

/** Product schema — used on PDP routes. */
export function productJsonLd({
  name,
  description,
  url,
  images,
  brand,
  sku,
  priceCurrency,
  price,
  availability,
}: ProductJsonLdOptions) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    image: images,
    brand: {
      '@type': 'Brand',
      name: brand,
    },
    ...(sku ? {sku} : {}),
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency,
      price,
      availability: availability
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
  };
}

interface BreadcrumbItem {
  label: string;
  href: string;
}

/** BreadcrumbList schema — used on pages with breadcrumbs. */
export function breadcrumbJsonLd(items: BreadcrumbItem[], origin: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: canonicalUrl(origin, item.href),
    })),
  };
}

interface FaqItem {
  question: string;
  answer: string;
}

/** FAQPage schema — used on the FAQ route. */
export function faqPageJsonLd(items: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}
