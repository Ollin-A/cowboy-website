import {createHydrogenContext} from '@shopify/hydrogen';
import {AppSession} from '~/lib/session';
import {CART_QUERY_FRAGMENT} from '~/lib/fragments';
import {createMockStorefront} from '~/lib/mock-storefront';
import {createMockCart} from '~/lib/mock-cart';

// Define the additional context object
const additionalContext = {
  // Additional context for custom properties, CMS clients, 3P SDKs, etc.
  // These will be available as both context.propertyName and context.get(propertyContext)
  // Example of complex objects that could be added:
  // cms: await createCMSClient(env),
  // reviews: await createReviewsClient(env),
} as const;

// Automatically augment HydrogenAdditionalContext with the additional context type
type AdditionalContextType = typeof additionalContext;

declare global {
  interface HydrogenAdditionalContext extends AdditionalContextType {}
}

/**
 * Creates Hydrogen context for React Router 7.9.x
 * Returns HydrogenRouterContextProvider with hybrid access patterns
 *
 * When `env.USE_MOCK_DATA === 'true'` (or `PUBLIC_STORE_DOMAIN` is absent),
 * the storefront's `.query()` method is replaced with a mock implementation
 * that returns fixture data. All other Hydrogen features (cart, session,
 * analytics) continue to work normally.
 * */
export async function createHydrogenRouterContext(
  request: Request,
  env: Env,
  executionContext: ExecutionContext,
) {
  /**
   * Open a cache instance in the worker and a custom session instance.
   */
  if (!env?.SESSION_SECRET) {
    throw new Error('SESSION_SECRET environment variable is not set');
  }

  const isMockMode =
    env.USE_MOCK_DATA === 'true' || !env.PUBLIC_STORE_DOMAIN;

  // In mock mode, provide fallback credentials so Hydrogen can initialize
  // its internals (cart, session, analytics) without a real Shopify store.
  const safeEnv = isMockMode
    ? {
        ...env,
        PUBLIC_STORE_DOMAIN:
          env.PUBLIC_STORE_DOMAIN || 'mock.myshopify.com',
        PUBLIC_STOREFRONT_API_TOKEN:
          env.PUBLIC_STOREFRONT_API_TOKEN || 'mock-token',
      }
    : env;

  const waitUntil = executionContext.waitUntil.bind(executionContext);
  const [cache, session] = await Promise.all([
    caches.open('hydrogen'),
    AppSession.init(request, [env.SESSION_SECRET]),
  ]);

  const hydrogenContext = createHydrogenContext(
    {
      env: safeEnv,
      request,
      cache,
      waitUntil,
      session,
      // Or detect from URL path based on locale subpath, cookies, or any other strategy
      i18n: {language: 'EN', country: 'US'},
      cart: {
        queryFragment: CART_QUERY_FRAGMENT,
      },
    },
    additionalContext,
  );

  if (isMockMode) {
    console.log('[MockStorefront] Running with mock data — no real Shopify store connected');
    const mock = createMockStorefront();
    const mockCart = createMockCart(session);

    // Proxy the storefront so that .query() is intercepted by the mock
    // while all other methods (CacheLong, CacheShort, i18n, analytics
    // helpers, etc.) delegate to the real Hydrogen storefront.
    const realStorefront = hydrogenContext.storefront;
    const storefrontProxy = new Proxy(realStorefront, {
      get(target, prop, receiver) {
        if (prop === 'query') return mock.query;
        return Reflect.get(target, prop, receiver);
      },
    });

    // Proxy the entire context to return the storefront proxy and mock cart
    return new Proxy(hydrogenContext, {
      get(target, prop, receiver) {
        if (prop === 'storefront') return storefrontProxy;
        if (prop === 'cart') return mockCart;
        return Reflect.get(target, prop, receiver);
      },
    }) as typeof hydrogenContext;
  }

  return hydrogenContext;
}
