/**
 * Session-based mock cart for demo mode (USE_MOCK_DATA=true).
 *
 * Stores cart state in the cookie session so that Hydrogen's cart hooks
 * work without a real Shopify backend. Returns data in the exact
 * `CartApiQueryFragment` shape expected by the components.
 */

import type {AppSession} from '~/lib/session';
import productsData from '~/lib/mock-data/products.json';

// ─── Types ──────────────────────────────────────────────────────────────────────

interface MoneyV2 {
  amount: string;
  currencyCode: string;
}

interface CartLineInput {
  merchandiseId: string;
  quantity?: number;
  attributes?: Array<{key: string; value: string}>;
  selectedVariant?: any;
}

interface CartLineUpdateInput {
  id: string;
  quantity?: number;
  attributes?: Array<{key: string; value: string}>;
}

interface StoredCartLine {
  id: string;
  merchandiseId: string;
  quantity: number;
  attributes: Array<{key: string; value: string}>;
  // Resolved variant data (snapshotted at add time)
  variantTitle: string;
  productTitle: string;
  productHandle: string;
  productId: string;
  vendor: string;
  price: MoneyV2;
  compareAtPrice: MoneyV2 | null;
  image: {id: string; url: string; altText: string; width: number; height: number} | null;
  selectedOptions: Array<{name: string; value: string}>;
}

interface StoredCart {
  lines: StoredCartLine[];
  discountCodes: string[];
}

interface CartQueryDataReturn {
  cart: any;
  errors: any[] | null;
  warnings: any[] | null;
}

// ─── Session key ────────────────────────────────────────────────────────────────

const CART_SESSION_KEY = 'mockCart';
const MOCK_CART_ID = 'gid://shopify/Cart/mock-demo-cart';

// ─── Variant lookup ─────────────────────────────────────────────────────────────

/** Build a flat map of variantId → variant+product data for quick lookups. */
const variantMap = new Map<string, {variant: any; product: any}>();

for (const product of productsData) {
  // Check adjacentVariants (all variants live here in the mock data)
  if (product.adjacentVariants) {
    for (const variant of product.adjacentVariants) {
      variantMap.set(variant.id, {variant, product});
    }
  }
  // Also check firstSelectableVariant inside options
  if (product.options) {
    for (const option of product.options) {
      if (option.optionValues) {
        for (const ov of option.optionValues) {
          if (ov.firstSelectableVariant) {
            variantMap.set(ov.firstSelectableVariant.id, {
              variant: ov.firstSelectableVariant,
              product,
            });
          }
        }
      }
    }
  }
}

function resolveVariant(merchandiseId: string) {
  return variantMap.get(merchandiseId) ?? null;
}

// ─── Cart ID counter (for unique line IDs) ──────────────────────────────────────

let lineIdCounter = 0;

function generateLineId(): string {
  lineIdCounter++;
  return `gid://shopify/CartLine/mock-${Date.now()}-${lineIdCounter}`;
}

// ─── Cart shape builder ─────────────────────────────────────────────────────────

function buildCartFragment(stored: StoredCart): any {
  const lines = stored.lines.map((line) => ({
    id: line.id,
    quantity: line.quantity,
    attributes: line.attributes,
    cost: {
      totalAmount: {
        amount: (parseFloat(line.price.amount) * line.quantity).toFixed(2),
        currencyCode: line.price.currencyCode,
      },
      amountPerQuantity: {
        amount: line.price.amount,
        currencyCode: line.price.currencyCode,
      },
      compareAtAmountPerQuantity: line.compareAtPrice
        ? {
            amount: line.compareAtPrice.amount,
            currencyCode: line.compareAtPrice.currencyCode,
          }
        : null,
    },
    merchandise: {
      id: line.merchandiseId,
      availableForSale: true,
      compareAtPrice: line.compareAtPrice,
      price: line.price,
      requiresShipping: true,
      title: line.variantTitle,
      image: line.image,
      product: {
        handle: line.productHandle,
        title: line.productTitle,
        id: line.productId,
        vendor: line.vendor,
      },
      selectedOptions: line.selectedOptions,
    },
    parentRelationship: null,
  }));

  // Calculate totals
  let subtotal = 0;
  for (const line of stored.lines) {
    subtotal += parseFloat(line.price.amount) * line.quantity;
  }

  const totalQuantity = stored.lines.reduce((sum, l) => sum + l.quantity, 0);

  return {
    id: MOCK_CART_ID,
    updatedAt: new Date().toISOString(),
    checkoutUrl: '/checkout-demo',
    totalQuantity,
    buyerIdentity: {
      countryCode: 'US',
      customer: null,
      email: null,
      phone: null,
    },
    lines: {
      nodes: lines,
    },
    cost: {
      subtotalAmount: {
        amount: subtotal.toFixed(2),
        currencyCode: 'USD',
      },
      totalAmount: {
        amount: subtotal.toFixed(2),
        currencyCode: 'USD',
      },
      totalDutyAmount: null,
      totalTaxAmount: null,
    },
    note: '',
    attributes: [],
    discountCodes: stored.discountCodes.map((code) => ({
      code,
      applicable: true,
    })),
    appliedGiftCards: [],
  };
}

// ─── Public API: createMockCart ─────────────────────────────────────────────────

export function createMockCart(session: AppSession) {
  function getStored(): StoredCart {
    const raw = session.get(CART_SESSION_KEY);
    if (raw && typeof raw === 'object') return raw as StoredCart;
    return {lines: [], discountCodes: []};
  }

  function save(cart: StoredCart) {
    session.set(CART_SESSION_KEY, cart);
  }

  function wrapResult(stored: StoredCart): CartQueryDataReturn {
    return {
      cart: buildCartFragment(stored),
      errors: null,
      warnings: null,
    };
  }

  return {
    async get(): Promise<any> {
      const stored = getStored();
      if (stored.lines.length === 0) return null;
      return buildCartFragment(stored);
    },

    async addLines(lines: CartLineInput[]): Promise<CartQueryDataReturn> {
      const stored = getStored();

      for (const input of lines) {
        const qty = input.quantity ?? 1;
        const merchandiseId = input.merchandiseId;

        // Check if this variant is already in cart — merge quantities
        const existing = stored.lines.find(
          (l) => l.merchandiseId === merchandiseId,
        );
        if (existing) {
          existing.quantity += qty;
          continue;
        }

        // Resolve variant data from mock products
        const resolved = resolveVariant(merchandiseId);
        if (!resolved) {
          console.warn(
            `[MockCart] Variant ${merchandiseId} not found in mock data`,
          );
          continue;
        }

        const {variant, product} = resolved;

        stored.lines.push({
          id: generateLineId(),
          merchandiseId,
          quantity: qty,
          attributes: input.attributes ?? [],
          variantTitle: variant.title ?? 'Default Title',
          productTitle: product.title,
          productHandle: product.handle,
          productId: product.id,
          vendor: product.vendor ?? 'Cowboy Brand',
          price: variant.price,
          compareAtPrice: variant.compareAtPrice ?? null,
          image: variant.image ?? product.featuredImage ?? null,
          selectedOptions: variant.selectedOptions ?? [],
        });
      }

      save(stored);
      return wrapResult(stored);
    },

    async updateLines(
      lines: CartLineUpdateInput[],
    ): Promise<CartQueryDataReturn> {
      const stored = getStored();

      for (const input of lines) {
        const line = stored.lines.find((l) => l.id === input.id);
        if (!line) continue;

        if (input.quantity !== undefined) {
          if (input.quantity <= 0) {
            // Remove the line
            stored.lines = stored.lines.filter((l) => l.id !== input.id);
          } else {
            line.quantity = input.quantity;
          }
        }
        if (input.attributes) {
          line.attributes = input.attributes;
        }
      }

      save(stored);
      return wrapResult(stored);
    },

    async removeLines(lineIds: string[]): Promise<CartQueryDataReturn> {
      const stored = getStored();
      stored.lines = stored.lines.filter((l) => !lineIds.includes(l.id));
      save(stored);
      return wrapResult(stored);
    },

    async updateDiscountCodes(
      codes: string[],
    ): Promise<CartQueryDataReturn> {
      const stored = getStored();
      stored.discountCodes = codes.filter(Boolean);
      save(stored);
      return wrapResult(stored);
    },

    async addGiftCardCodes(_codes: string[]): Promise<CartQueryDataReturn> {
      // No-op in demo mode
      return wrapResult(getStored());
    },

    async removeGiftCardCodes(
      _codes: string[],
    ): Promise<CartQueryDataReturn> {
      return wrapResult(getStored());
    },

    async updateBuyerIdentity(
      _identity: any,
    ): Promise<CartQueryDataReturn> {
      return wrapResult(getStored());
    },

    setCartId(_cartId: string): Headers {
      // In mock mode, cart state lives in the session cookie.
      // The session is auto-committed by server.ts when session.isPending.
      return new Headers();
    },
  };
}
