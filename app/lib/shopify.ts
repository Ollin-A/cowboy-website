/**
 * Shopify Storefront API client utilities.
 *
 * In Hydrogen, the storefront client is created automatically by
 * `createHydrogenContext` in lib/context.ts and injected into every
 * route loader via `context.storefront`. This module re-exports the
 * query fragments and provides helper types so route files stay clean.
 *
 * Environment variables consumed by Hydrogen's built-in client:
 *   PUBLIC_STORE_DOMAIN          – e.g. "my-store.myshopify.com"
 *   PUBLIC_STOREFRONT_API_TOKEN  – Storefront API public access token
 *
 * These are set in .env (local dev / MiniOxygen) or in the Oxygen
 * dashboard for production deployments.
 */

// Re-export all query fragments for convenient imports
export {PRODUCT_QUERY, PRODUCT_FRAGMENT, PRODUCT_VARIANT_FRAGMENT} from './queries/product';
export {
  COLLECTION_QUERY,
  COLLECTION_PRODUCT_FRAGMENT,
  COLLECTIONS_QUERY,
} from './queries/collection';
export {
  CART_CREATE_MUTATION,
  CART_LINES_ADD_MUTATION,
  CART_LINES_UPDATE_MUTATION,
  CART_LINES_REMOVE_MUTATION,
  CART_QUERY,
} from './queries/cart';

/**
 * Pagination defaults used across collection / product-list queries.
 */
export const PAGINATION = {
  /** Max products per page on PLPs */
  pageSize: 24,
} as const;
