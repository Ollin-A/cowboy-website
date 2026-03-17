/**
 * Mock Storefront Adapter
 *
 * Provides a drop-in replacement for Hydrogen's `context.storefront.query()`
 * by inspecting GraphQL query strings and dispatching to the mock data layer.
 *
 * Route loaders require ZERO changes — they call `context.storefront.query()`
 * the same way regardless of whether real or mock data is being served.
 */

import {
  getMockProduct,
  getMockCollection,
  getMockCollections,
  getMockRecommendedProducts,
} from '~/lib/mock-data';
import productsDataJson from '~/lib/mock-data/products.json';

// ─── Cache stubs (match Hydrogen's cache API shape) ─────────────────────────

export function CacheLong() {
  return {};
}

export function CacheShort() {
  return {};
}

// ─── Mock navigation menus ──────────────────────────────────────────────────

interface MockMenuItem {
  id: string;
  resourceId: null;
  tags: string[];
  title: string;
  type: string;
  url: string;
  items: MockMenuItem[];
}

function menuItem(
  id: string,
  title: string,
  url: string,
  items: MockMenuItem[] = [],
): MockMenuItem {
  return {id, resourceId: null, tags: [], title, type: 'HTTP', url, items};
}

const MOCK_MAIN_MENU = {
  id: 'gid://shopify/Menu/main-menu',
  items: [
    menuItem('gid://shopify/MenuItem/new', 'New Collection', '/collections/new'),
    menuItem('gid://shopify/MenuItem/mens', "Men's", '/collections/mens', [
      menuItem('gid://shopify/MenuItem/mens-new', "New Men's", '/collections/mens/new'),
      menuItem('gid://shopify/MenuItem/mens-jeans', 'Jeans', '/collections/mens/jeans'),
      menuItem('gid://shopify/MenuItem/mens-apparel', 'Apparel', '/collections/mens/apparel'),
      menuItem('gid://shopify/MenuItem/mens-outerwear', 'Outerwear', '/collections/mens/outerwear'),
      menuItem('gid://shopify/MenuItem/mens-all', "Shop All Men's", '/collections/mens'),
    ]),
    menuItem('gid://shopify/MenuItem/womens', "Women's", '/collections/womens', [
      menuItem('gid://shopify/MenuItem/womens-new', "New Women's", '/collections/womens/new'),
      menuItem('gid://shopify/MenuItem/womens-jeans', 'Jeans', '/collections/womens/jeans'),
      menuItem('gid://shopify/MenuItem/womens-apparel', 'Apparel', '/collections/womens/apparel'),
      menuItem('gid://shopify/MenuItem/womens-outerwear', 'Outerwear', '/collections/womens/outerwear'),
      menuItem('gid://shopify/MenuItem/womens-all', "Shop All Women's", '/collections/womens'),
    ]),
    menuItem('gid://shopify/MenuItem/hats', 'Hats', '/collections/hats', [
      menuItem('gid://shopify/MenuItem/hats-all', 'Shop All', '/collections/hats'),
    ]),
    menuItem('gid://shopify/MenuItem/brand', 'Brand', '/brand'),
    menuItem('gid://shopify/MenuItem/contact', 'Contact', '/contact', [
      menuItem('gid://shopify/MenuItem/faq', 'FAQ', '/faq'),
    ]),
  ],
};

const MOCK_FOOTER_MENU = {
  id: 'gid://shopify/Menu/footer',
  items: [
    menuItem('gid://shopify/MenuItem/footer-contact', 'Contact', '/contact'),
    menuItem('gid://shopify/MenuItem/footer-faq', 'FAQ', '/faq'),
    menuItem('gid://shopify/MenuItem/footer-brand', 'Our Story', '/brand'),
  ],
};

const MOCK_SHOP = {
  id: 'gid://shopify/Shop/mock',
  name: 'Cowboy',
  description: 'Premium western fashion — crafted for the modern West.',
  primaryDomain: {
    url: 'https://mock.myshopify.com',
  },
  brand: {
    logo: {
      image: {
        url: '',
      },
    },
  },
};

// ─── Mock query dispatcher ──────────────────────────────────────────────────

type QueryOptions = {
  variables?: Record<string, any>;
  cache?: any;
};

/**
 * The mock `.query()` method. Inspects the GraphQL query string to determine
 * which fixture to return, then delegates to the appropriate mock data helper.
 */
async function mockQuery(
  queryString: string,
  options?: QueryOptions,
): Promise<any> {
  const variables = options?.variables || {};

  // ── Hydrogen internal ShopData query (analytics/localization) ──
  if (queryString.includes('query ShopData')) {
    return {
      shop: {id: MOCK_SHOP.id},
      localization: {
        country: {currency: {isoCode: 'USD'}},
        language: {isoCode: 'EN'},
      },
    };
  }

  // ── Header query (shop + menu) ──
  if (queryString.includes('query Header')) {
    return {
      shop: MOCK_SHOP,
      menu: MOCK_MAIN_MENU,
    };
  }

  // ── Footer query (menu only) ──
  if (queryString.includes('query Footer')) {
    return {
      menu: MOCK_FOOTER_MENU,
    };
  }

  // ── Recommended products (product with nested collections) ──
  // Must be checked BEFORE the generic product query
  if (
    queryString.includes('product(handle:') &&
    queryString.includes('collections(first:')
  ) {
    return buildRecommendedProductsResponse(variables.handle);
  }

  // ── Single product (PDP) ──
  if (queryString.includes('product(handle:')) {
    const product = getMockProduct(variables.handle);
    return {product};
  }

  // ── Single collection (PLP + highlights carousel) ──
  if (queryString.includes('collection(handle:')) {
    const collection = getMockCollection(variables.handle, {
      first: variables.first,
      last: variables.last,
      startCursor: variables.startCursor,
      endCursor: variables.endCursor,
      sortKey: variables.sortKey,
      reverse: variables.reverse,
      filters: variables.filters,
    });
    return {collection};
  }

  // ── Collections list ──
  if (queryString.includes('collections(first:')) {
    return {
      collections: {
        nodes: getMockCollections(),
      },
    };
  }

  // ── Regular search ──
  if (queryString.includes('query RegularSearch')) {
    return buildRegularSearchResponse(variables.term, variables.first);
  }

  // ── Predictive search ──
  if (queryString.includes('query PredictiveSearch')) {
    return buildPredictiveSearchResponse(variables.term, variables.limit);
  }

  // Fallback — log unmatched queries to aid debugging
  console.warn(
    '[MockStorefront] Unmatched query pattern:',
    queryString.slice(0, 120),
  );
  return {};
}

// ─── Recommended products response builder ──────────────────────────────────

/**
 * Builds the response shape for RECOMMENDED_PRODUCTS_QUERY:
 * `{ product: { id, collections: { nodes: [{ title, products: { nodes } }] } } }`
 */
function buildRecommendedProductsResponse(handle: string) {
  const product = getMockProduct(handle);
  if (!product) {
    return {product: null};
  }

  const recommended = getMockRecommendedProducts(handle, 9);

  return {
    product: {
      id: product.id,
      collections: {
        nodes: [
          {
            title: product.productType || 'Related Products',
            products: {
              nodes: recommended.map((p) => ({
                id: p.id,
                handle: p.handle,
                title: p.title,
                featuredImage: p.featuredImage,
                priceRange: {
                  minVariantPrice: p.priceRange.minVariantPrice,
                },
              })),
            },
          },
        ],
      },
    },
  };
}

// ─── Search response builders ────────────────────────────────────────────────

/**
 * Builds a response matching the RegularSearch query shape.
 * Searches products by title/handle/tags against the term.
 */
function buildRegularSearchResponse(term: string, first = 8) {
  const allProducts = (productsDataJson as any[]) || [];

  const lowerTerm = (term || '').toLowerCase().trim();

  // If no term, return empty results
  if (!lowerTerm) {
    return {
      articles: {nodes: []},
      pages: {nodes: []},
      products: {
        nodes: [],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: '',
          endCursor: '',
        },
      },
    };
  }

  // Search products by title, handle, vendor, tags, productType
  const matched = allProducts.filter((p) => {
    const searchable = [
      p.title,
      p.handle,
      p.vendor,
      p.productType,
      ...(p.tags || []),
    ]
      .join(' ')
      .toLowerCase();
    return searchable.includes(lowerTerm);
  });

  const sliced = matched.slice(0, first);

  return {
    articles: {nodes: []},
    pages: {nodes: []},
    products: {
      nodes: sliced.map((p: any) => ({
        __typename: 'Product' as const,
        handle: p.handle,
        id: p.id,
        publishedAt: p.publishedAt,
        title: p.title,
        trackingParameters: '',
        vendor: p.vendor,
        selectedOrFirstAvailableVariant: p.selectedOrFirstAvailableVariant,
      })),
      pageInfo: {
        hasNextPage: matched.length > first,
        hasPreviousPage: false,
        startCursor: '',
        endCursor: '',
      },
    },
  };
}

/**
 * Builds a response matching the PredictiveSearch query shape.
 */
function buildPredictiveSearchResponse(term: string, limit = 10) {
  const allProducts = (productsDataJson as any[]) || [];
  const lowerTerm = (term || '').toLowerCase().trim();

  if (!lowerTerm) {
    return {
      predictiveSearch: {
        articles: [],
        collections: [],
        pages: [],
        products: [],
        queries: [],
      },
    };
  }

  const matched = allProducts
    .filter((p) => {
      const searchable = [p.title, p.handle, p.vendor, ...(p.tags || [])]
        .join(' ')
        .toLowerCase();
      return searchable.includes(lowerTerm);
    })
    .slice(0, limit);

  return {
    predictiveSearch: {
      articles: [],
      collections: [],
      pages: [],
      products: matched.map((p: any) => ({
        __typename: 'Product' as const,
        id: p.id,
        title: p.title,
        handle: p.handle,
        trackingParameters: '',
        selectedOrFirstAvailableVariant: p.selectedOrFirstAvailableVariant,
      })),
      queries: [],
    },
  };
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Creates a mock storefront object matching the shape of Hydrogen's
 * `context.storefront`. The `.query()` method inspects query strings
 * and dispatches to the mock data layer.
 */
export function createMockStorefront() {
  return {
    query: mockQuery,
    CacheLong,
    CacheShort,
    i18n: {
      language: 'EN' as const,
      country: 'US' as const,
    },
  };
}
