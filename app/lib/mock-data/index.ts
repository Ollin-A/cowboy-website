/**
 * Mock data layer that replaces Shopify Storefront API calls for demo purposes.
 *
 * Exports helper functions that return data matching the exact shapes
 * returned by the Storefront API GraphQL queries used throughout the app.
 */

import productsData from './products.json';
import collectionsData from './collections.json';

// ─── Types ──────────────────────────────────────────────────────────────────────

type SortKey = 'BEST_SELLING' | 'NEWEST' | 'PRICE' | 'RELEVANCE' | 'CREATED';

interface CollectionQueryOptions {
  first?: number;
  last?: number;
  startCursor?: string;
  endCursor?: string;
  sortKey?: SortKey;
  reverse?: boolean;
  filters?: Array<
    | {variantOption: {name: string; value: string}}
    | {productType: string}
    | {tag: string}
    | {price: {min?: number; max?: number}}
  >;
}

interface PageInfo {
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  startCursor: string;
  endCursor: string;
}

// ─── Cursor helpers ─────────────────────────────────────────────────────────────

function encodeCursor(index: number): string {
  return btoa(`cursor:${index}`);
}

function decodeCursor(cursor: string): number {
  try {
    const decoded = atob(cursor);
    const match = decoded.match(/^cursor:(\d+)$/);
    return match ? parseInt(match[1], 10) : 0;
  } catch {
    return 0;
  }
}

// ─── Deterministic pseudo-random for "best selling" sort ────────────────────────

function hashHandle(handle: string): number {
  let hash = 0;
  for (let i = 0; i < handle.length; i++) {
    hash = ((hash << 5) - hash + handle.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

// ─── Sort logic ─────────────────────────────────────────────────────────────────

function sortProducts(
  products: typeof productsData,
  sortKey: SortKey = 'RELEVANCE',
  reverse = false,
): typeof productsData {
  const sorted = [...products];

  switch (sortKey) {
    case 'PRICE':
      sorted.sort((a, b) => {
        const priceA = parseFloat(a.priceRange.minVariantPrice.amount);
        const priceB = parseFloat(b.priceRange.minVariantPrice.amount);
        return priceA - priceB;
      });
      break;

    case 'NEWEST':
    case 'CREATED':
      sorted.sort((a, b) => {
        return (
          new Date(b.publishedAt).getTime() -
          new Date(a.publishedAt).getTime()
        );
      });
      break;

    case 'BEST_SELLING':
      sorted.sort((a, b) => hashHandle(a.handle) - hashHandle(b.handle));
      break;

    case 'RELEVANCE':
    default:
      // Keep original order
      break;
  }

  if (reverse) {
    sorted.reverse();
  }

  return sorted;
}

// ─── Filter logic ───────────────────────────────────────────────────────────────

function filterProducts(
  products: typeof productsData,
  filters?: CollectionQueryOptions['filters'],
): typeof productsData {
  if (!filters || filters.length === 0) return products;

  return products.filter((product) => {
    return filters.every((filter) => {
      if ('variantOption' in filter) {
        const {name, value} = filter.variantOption;
        return product.adjacentVariants.some((v) =>
          v.selectedOptions.some(
            (opt) =>
              opt.name.toLowerCase() === name.toLowerCase() &&
              opt.value.toLowerCase() === value.toLowerCase(),
          ),
        );
      }

      if ('productType' in filter) {
        return (
          product.productType.toLowerCase() ===
          filter.productType.toLowerCase()
        );
      }

      if ('tag' in filter) {
        return product.tags.some(
          (t) => t.toLowerCase() === filter.tag.toLowerCase(),
        );
      }

      if ('price' in filter) {
        const price = parseFloat(product.priceRange.minVariantPrice.amount);
        if (filter.price.min !== undefined && price < filter.price.min)
          return false;
        if (filter.price.max !== undefined && price > filter.price.max)
          return false;
        return true;
      }

      return true;
    });
  });
}

// ─── Pagination logic ───────────────────────────────────────────────────────────

function paginateProducts(
  products: typeof productsData,
  options: Pick<
    CollectionQueryOptions,
    'first' | 'last' | 'startCursor' | 'endCursor'
  >,
): {nodes: typeof productsData; pageInfo: PageInfo} {
  const total = products.length;
  const pageSize = options.first || options.last || 24;

  let startIndex = 0;
  let endIndex = Math.min(pageSize, total);

  if (options.endCursor) {
    // "after" cursor — start after this position
    startIndex = decodeCursor(options.endCursor) + 1;
    endIndex = Math.min(startIndex + pageSize, total);
  } else if (options.startCursor) {
    // "before" cursor — end before this position
    endIndex = decodeCursor(options.startCursor);
    startIndex = Math.max(endIndex - pageSize, 0);
  }

  // Clamp bounds
  startIndex = Math.max(0, Math.min(startIndex, total));
  endIndex = Math.max(startIndex, Math.min(endIndex, total));

  const sliced = products.slice(startIndex, endIndex);

  return {
    nodes: sliced,
    pageInfo: {
      hasPreviousPage: startIndex > 0,
      hasNextPage: endIndex < total,
      startCursor: sliced.length > 0 ? encodeCursor(startIndex) : encodeCursor(0),
      endCursor:
        sliced.length > 0
          ? encodeCursor(startIndex + sliced.length - 1)
          : encodeCursor(0),
    },
  };
}

// ─── Public API ─────────────────────────────────────────────────────────────────

/**
 * Get a single product by handle. Returns the full product shape
 * matching PRODUCT_QUERY from `app/lib/queries/product.ts`.
 */
export function getMockProduct(handle: string) {
  const product = productsData.find((p) => p.handle === handle) || null;
  return product;
}

/**
 * Get a collection by handle with paginated, sorted, filtered products.
 * Returns the shape matching COLLECTION_QUERY from `app/lib/queries/collection.ts`.
 */
export function getMockCollection(
  handle: string,
  options: CollectionQueryOptions = {},
) {
  const collection = collectionsData.find((c) => c.handle === handle);
  if (!collection) return null;

  // Get the product handles in this collection, then resolve full product data
  let products = collection.products.nodes as typeof productsData;

  // Apply filters
  products = filterProducts(products, options.filters);

  // Apply sorting
  products = sortProducts(products, options.sortKey, options.reverse);

  // Apply pagination
  const paginated = paginateProducts(products, options);

  return {
    id: collection.id,
    handle: collection.handle,
    title: collection.title,
    description: collection.description,
    descriptionHtml: collection.descriptionHtml,
    image: collection.image,
    seo: collection.seo,
    products: paginated,
  };
}

/**
 * Get all collections (for navigation, sitemap, etc.).
 */
export function getMockCollections() {
  return collectionsData.map((c) => ({
    id: c.id,
    handle: c.handle,
    title: c.title,
    description: c.description,
    descriptionHtml: c.descriptionHtml,
    image: c.image,
    seo: c.seo,
  }));
}

/**
 * Get recommended products for a given product handle.
 * Returns products from the same collection, excluding the current product.
 * Matches the shape of RECOMMENDED_PRODUCTS_QUERY.
 */
export function getMockRecommendedProducts(handle: string, count = 8) {
  const product = productsData.find((p) => p.handle === handle);
  if (!product) return [];

  // Find products sharing the most tags (same category/type)
  const scored = productsData
    .filter((p) => p.handle !== handle)
    .map((p) => ({
      product: p,
      score:
        p.tags.filter((t) => product.tags.includes(t)).length +
        (p.productType === product.productType ? 3 : 0),
    }))
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, count).map((s) => ({
    id: s.product.id,
    handle: s.product.handle,
    title: s.product.title,
    featuredImage: s.product.featuredImage,
    priceRange: {
      minVariantPrice: s.product.priceRange.minVariantPrice,
    },
  }));
}
