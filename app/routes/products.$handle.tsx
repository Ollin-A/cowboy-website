import {Suspense, useState, useEffect, useCallback, useMemo} from 'react';
import {
  useLoaderData,
  useRouteLoaderData,
  Await,
  useNavigate,
  type FetcherWithComponents,
} from 'react-router';
import type {Route} from './+types/products.$handle';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
  Money,
  CartForm,
  type OptimisticCartLineInput,
} from '@shopify/hydrogen';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';
import ProductGallery, {
  type GalleryImage,
} from '~/components/product/ProductGallery';
import VariantSelector, {
  type VariantOption,
  type SelectedVariant as SelectedVariantMap,
} from '~/components/product/VariantSelector';
import StickyBuyModule from '~/components/product/StickyBuyModule';
import ProductAccordions, {
  type AccordionSection,
} from '~/components/product/ProductAccordions';
import TrustSignals from '~/components/product/TrustSignals';
import RecommendedProducts, {
  type RecommendedProduct,
} from '~/components/product/RecommendedProducts';
import Breadcrumbs from '~/components/ui/Breadcrumbs';
import {useCartDrawer} from '~/components/cart/CartDrawer';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {
  buildPageMeta,
  getOriginFromMatches,
  productJsonLd,
  breadcrumbJsonLd,
} from '~/lib/utils/seo';
import type {RootLoader} from '~/root';

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

export const meta: Route.MetaFunction = ({data, matches}) => {
  const product = data?.product;
  const title = product?.seo?.title || product?.title || '';
  const description =
    product?.seo?.description || product?.description || '';
  const image =
    product?.selectedOrFirstAvailableVariant?.image?.url ||
    (product as any)?.images?.nodes?.[0]?.url ||
    '';
  const origin = getOriginFromMatches(matches);
  const url = origin
    ? `${origin}/products/${product?.handle}`
    : `/products/${product?.handle}`;

  return buildPageMeta({
    title,
    description,
    url,
    image,
    type: 'product',
  });
};

// ---------------------------------------------------------------------------
// Loader
// ---------------------------------------------------------------------------

export async function loader(args: Route.LoaderArgs) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return {...deferredData, ...criticalData};
}

async function loadCriticalData({
  context,
  params,
  request,
}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  const [{product}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {handle, selectedOptions: getSelectedProductOptions(request)},
    }),
  ]);

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle, data: product});

  return {product};
}

function loadDeferredData({context, params}: Route.LoaderArgs) {
  const {storefront} = context;
  const {handle} = params;

  // Fetch recommended products (non-blocking)
  const recommended = storefront
    .query(RECOMMENDED_PRODUCTS_QUERY, {
      variables: {handle: handle!},
    })
    .catch((error: Error) => {
      console.error('Failed to load recommended products:', error);
      return null;
    });

  return {recommended};
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function Product() {
  const {product, recommended} = useLoaderData<typeof loader>();
  const rootData = useRouteLoaderData<RootLoader>('root');
  const origin = (rootData as any)?.url ?? '';

  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const {title, descriptionHtml, vendor, handle} = product;

  // ---- Gallery images ----
  const galleryImages = useGalleryImages(product, selectedVariant);

  // ---- Breadcrumbs ----
  const breadcrumbItems = useMemo(() => {
    const productType = (product as any).productType;
    const items = [{label: 'Home', href: '/'}];
    if (productType) {
      items.push({
        label: productType,
        href: `/collections/${productType.toLowerCase().replace(/\s+/g, '-')}`,
      });
    } else {
      items.push({label: 'Products', href: '/collections'});
    }
    items.push({label: title, href: `/products/${handle}`});
    return items;
  }, [title, handle, product]);

  // ---- Accordion sections from product data + metafields ----
  const accordionSections = useAccordionSections(product);

  // ---- Variant selector data ----
  const navigate = useNavigate();

  const variantOptions: VariantOption[] = useMemo(
    () =>
      productOptions
        .filter((opt) => opt.optionValues.length > 1)
        .map((opt) => ({
          name: opt.name,
          values: opt.optionValues.map((v) => ({
            value: v.name,
            available: v.available,
            image: v.swatch?.image?.previewImage?.url
              ? {src: v.swatch.image.previewImage.url, alt: v.name}
              : undefined,
          })),
        })),
    [productOptions],
  );

  const selectedMap: SelectedVariantMap = useMemo(() => {
    const map: SelectedVariantMap = {};
    selectedVariant?.selectedOptions?.forEach((opt: {name: string; value: string}) => {
      map[opt.name] = opt.value;
    });
    return map;
  }, [selectedVariant]);

  const handleVariantSelect = useCallback(
    (optionName: string, value: string) => {
      const option = productOptions.find((o) => o.name === optionName);
      const optionValue = option?.optionValues.find((v) => v.name === value);
      if (!optionValue) return;

      if (optionValue.isDifferentProduct) {
        navigate(`/products/${optionValue.handle}?${optionValue.variantUriQuery}`, {
          replace: true,
          preventScrollReset: true,
        });
      } else if (optionValue.variantUriQuery) {
        navigate(`?${optionValue.variantUriQuery}`, {
          replace: true,
          preventScrollReset: true,
        });
      }
    },
    [productOptions, navigate],
  );

  // ---- JSON-LD structured data ----
  const productUrl = origin
    ? `${origin}/products/${handle}`
    : `/products/${handle}`;

  const jsonLdProduct = useMemo(
    () =>
      productJsonLd({
        name: title,
        description: product.description,
        url: productUrl,
        images:
          (product as any).images?.nodes?.map(
            (img: {url: string}) => img.url,
          ) ?? [],
        brand: vendor,
        sku: selectedVariant?.sku || undefined,
        priceCurrency: selectedVariant?.price?.currencyCode ?? 'USD',
        price: selectedVariant?.price?.amount ?? '0',
        availability: selectedVariant?.availableForSale ?? false,
      }),
    [title, product, vendor, handle, selectedVariant, productUrl],
  );

  const jsonLdBreadcrumbs = useMemo(
    () => breadcrumbJsonLd(breadcrumbItems, origin),
    [breadcrumbItems, origin],
  );

  return (
    <article className="container-content pb-16 md:pb-24">
      {/* JSON-LD: Product + BreadcrumbList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLdProduct)}}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLdBreadcrumbs)}}
      />

      {/* Top breadcrumbs — desktop only */}
      <div className="hidden md:block pt-6 pb-4">
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      {/* Product Gallery — full width */}
      <section className="mb-8 md:mb-12">
        <ProductGallery
          images={galleryImages}
          sizes="(min-width: 1024px) 60vw, 100vw"
        />
      </section>

      {/* Product name + price */}
      <div className="mb-8 md:mb-10">
        <h1 className="font-heading text-2xl md:text-[36px] leading-[1.15] tracking-tight text-primary m-0">
          {title}
        </h1>
        {vendor && (
          <p className="font-body text-sm text-text/50 tracking-wide mt-1 mb-0">
            {vendor}
          </p>
        )}
        <div className="mt-3">
          <ProductPriceDisplay
            price={selectedVariant?.price}
            compareAtPrice={selectedVariant?.compareAtPrice}
          />
        </div>
      </div>

      {/* Two-column section: editorial (left) | buy module (right) */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_380px] lg:grid-cols-[1fr_420px] gap-x-12 lg:gap-x-16 gap-y-0">
        {/* Buy module — first in DOM for mobile-first ordering */}
        <div className="md:col-start-2 md:row-start-1">
          <StickyBuyModule
            topOffset={70}
            stopSelector="#recommended-products"
          >
            <div className="flex flex-col gap-6">
              {/* Variant selector */}
              {variantOptions.length > 0 && (
                <VariantSelector
                  options={variantOptions}
                  selected={selectedMap}
                  onSelect={handleVariantSelect}
                />
              )}

              {/* Add to Bag */}
              <AddToCartSection selectedVariant={selectedVariant} />

              {/* Trust signals */}
              <TrustSignals />
            </div>
          </StickyBuyModule>
        </div>

        {/* Editorial column */}
        <div className="md:col-start-1 md:row-start-1 mt-10 md:mt-0">
          {/* Product description */}
          {descriptionHtml && (
            <div className="mb-8 md:mb-10">
              <div
                className="font-body text-base md:text-lg leading-relaxed text-text prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{__html: descriptionHtml}}
              />
            </div>
          )}

          {/* Accordions */}
          <ProductAccordions sections={accordionSections} />
        </div>
      </div>

      {/* Recommended products */}
      <div className="mt-16 md:mt-24">
        <Suspense
          fallback={
            <RecommendedSkeleton />
          }
        >
          <Await resolve={recommended}>
            {(data) => <RecommendedSection data={data} />}
          </Await>
        </Suspense>
      </div>

      {/* Bottom breadcrumbs */}
      <div className="mt-12 md:mt-16 pt-8 border-t border-primary/10">
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      {/* Analytics */}
      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </article>
  );
}

// ---------------------------------------------------------------------------
// Add to Cart Section (CartForm wrapper)
// ---------------------------------------------------------------------------

function AddToCartSection({
  selectedVariant,
}: {
  selectedVariant: any;
}) {
  const {open: openCart} = useCartDrawer();
  const isAvailable = selectedVariant?.availableForSale ?? false;
  const lines: OptimisticCartLineInput[] = selectedVariant
    ? [{merchandiseId: selectedVariant.id, quantity: 1, selectedVariant}]
    : [];

  return (
    <CartForm
      route="/cart"
      inputs={{lines}}
      action={CartForm.ACTIONS.LinesAdd}
    >
      {(fetcher: FetcherWithComponents<any>) => {
        const isLoading = fetcher.state !== 'idle';
        const disabled = !selectedVariant || !isAvailable;

        const label = disabled
          ? !isAvailable
            ? 'Sold Out'
            : 'Select a Size'
          : isLoading
            ? 'Adding...'
            : 'Add to Bag';

        return (
          <>
            <AddToCartEffect fetcher={fetcher} onAdded={openCart} />
            <button
              type="submit"
              disabled={disabled || isLoading}
              aria-busy={isLoading}
              className={[
                'w-full py-4 px-8 font-body font-medium text-sm tracking-widest uppercase',
                'border-none cursor-pointer transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                'flex items-center justify-center gap-2',
                disabled || isLoading
                  ? 'bg-primary/30 text-white/70 cursor-not-allowed'
                  : 'bg-primary text-white hover:bg-primary/90',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {isLoading && (
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              )}
              {label}
            </button>
            {/* Notify Me — shown when variant is selected but unavailable */}
            {selectedVariant && !isAvailable && (
              <NotifyMe variantTitle={selectedVariant.title} />
            )}
          </>
        );
      }}
    </CartForm>
  );
}

// ---------------------------------------------------------------------------
// Notify Me (Out-of-Stock)
// ---------------------------------------------------------------------------

function NotifyMe({variantTitle}: {variantTitle?: string}) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setError('');

      if (!email.trim()) {
        setError('Please enter your email.');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        setError('Please enter a valid email address.');
        return;
      }

      // Placeholder: in production, send to back-in-stock notification service
      setSubmitted(true);
    },
    [email],
  );

  if (submitted) {
    return (
      <div className="border border-primary/10 px-4 py-4 text-center">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-primary mx-auto mb-2"
          aria-hidden="true"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <p className="font-body text-sm text-text">
          We&apos;ll notify you when{' '}
          {variantTitle ? (
            <span className="font-medium">{variantTitle}</span>
          ) : (
            'this item'
          )}{' '}
          is back in stock.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-primary/10 px-4 py-4">
      <p className="font-body text-sm text-text/70 mb-3">
        Get notified when{' '}
        {variantTitle ? (
          <span className="font-medium text-text">{variantTitle}</span>
        ) : (
          'this item'
        )}{' '}
        is back in stock.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2" noValidate>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          aria-label="Email for back-in-stock notification"
          className={`flex-1 border ${
            error ? 'border-[#D40000]' : 'border-primary/20'
          } bg-transparent px-3 py-2.5 font-body text-sm text-text placeholder:text-text/40 focus:outline-none focus:border-primary transition-colors duration-200`}
        />
        <button
          type="submit"
          className="px-5 py-2.5 bg-primary text-white font-body text-xs font-medium tracking-widest uppercase border-none cursor-pointer hover:bg-primary/90 transition-colors duration-200 shrink-0"
        >
          Notify Me
        </button>
      </form>
      {error && (
        <p className="mt-1.5 font-body text-xs text-[#D40000]">{error}</p>
      )}
    </div>
  );
}

function AddToCartEffect({
  fetcher,
  onAdded,
}: {
  fetcher: FetcherWithComponents<any>;
  onAdded: () => void;
}) {
  useEffect(() => {
    if (fetcher.state === 'loading' && fetcher.data) {
      onAdded();
    }
  }, [fetcher.state, fetcher.data, onAdded]);
  return null;
}

// ---------------------------------------------------------------------------
// Product Price Display
// ---------------------------------------------------------------------------

function ProductPriceDisplay({
  price,
  compareAtPrice,
}: {
  price?: MoneyV2;
  compareAtPrice?: MoneyV2 | null;
}) {
  if (!price) return null;

  const hasDiscount =
    compareAtPrice &&
    parseFloat(compareAtPrice.amount) > parseFloat(price.amount);

  return (
    <div className="flex items-baseline gap-3">
      <span
        className={[
          'font-body text-xl md:text-2xl font-medium',
          hasDiscount ? 'text-[#D40000]' : 'text-text',
        ].join(' ')}
      >
        <Money data={price} />
      </span>
      {hasDiscount && (
        <s className="font-body text-base text-text/40">
          <Money data={compareAtPrice} />
        </s>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Recommended Products Section
// ---------------------------------------------------------------------------

function RecommendedSection({data}: {data: any}) {
  if (!data?.product?.id) return null;

  // Use same-collection products as recommendations
  const product = data.product;
  const collections = product.collections?.nodes ?? [];
  const firstCollection = collections[0];
  const collectionProducts =
    firstCollection?.products?.nodes?.filter(
      (p: any) => p.id !== product.id,
    ) ?? [];

  if (collectionProducts.length === 0) return null;

  const recommended: RecommendedProduct[] = collectionProducts
    .slice(0, 8)
    .map((p: any) => ({
      handle: p.handle,
      title: p.title,
      price: `$${parseFloat(p.priceRange?.minVariantPrice?.amount ?? '0').toFixed(0)}`,
      image: {
        src: p.featuredImage?.url ?? '',
        alt: p.featuredImage?.altText ?? p.title,
        width: p.featuredImage?.width ?? 600,
        height: p.featuredImage?.height ?? 800,
        srcSet: p.featuredImage?.url
          ? buildSrcSet(p.featuredImage.url)
          : undefined,
      },
    }));

  return <RecommendedProducts products={recommended} />;
}

function RecommendedSkeleton() {
  return (
    <div className="w-full" aria-hidden="true">
      <div className="skeleton-shimmer h-8 w-64 rounded mb-8" />
      <div className="flex gap-4 overflow-hidden">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="shrink-0 w-[260px] md:w-[calc(25%-12px)]">
            <div
              className="skeleton-shimmer rounded"
              style={{aspectRatio: '3/4'}}
            />
            <div className="mt-3 skeleton-shimmer h-4 w-3/4 rounded" />
            <div className="mt-2 skeleton-shimmer h-4 w-1/3 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

/**
 * Build gallery images from product data, reordering to show
 * the selected variant's image first.
 */
function useGalleryImages(product: any, selectedVariant: any): GalleryImage[] {
  return useMemo(() => {
    const imageNodes: any[] = product.images?.nodes ?? [];
    if (imageNodes.length === 0 && selectedVariant?.image) {
      return [variantImageToGallery(selectedVariant.image)];
    }

    const images: GalleryImage[] = imageNodes.map((img: any) => ({
      src: img.url,
      alt: img.altText || `${product.title} product image`,
      width: img.width ?? 1200,
      height: img.height ?? 1600,
      srcSet: buildSrcSet(img.url),
    }));

    // Reorder: put the selected variant's image first
    if (selectedVariant?.image?.url) {
      const variantUrl = selectedVariant.image.url.split('?')[0];
      const idx = images.findIndex(
        (img) => img.src.split('?')[0] === variantUrl,
      );
      if (idx > 0) {
        const [match] = images.splice(idx, 1);
        images.unshift(match);
      }
    }

    return images;
  }, [product, selectedVariant]);
}

function variantImageToGallery(image: any): GalleryImage {
  return {
    src: image.url,
    alt: image.altText || 'Product image',
    width: image.width ?? 1200,
    height: image.height ?? 1600,
    srcSet: buildSrcSet(image.url),
  };
}

function buildSrcSet(url: string): string {
  if (!url) return '';
  const widths = [400, 600, 800, 1000, 1200, 1600];
  return widths
    .map((w) => {
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}width=${w} ${w}w`;
    })
    .join(', ');
}

/**
 * Build accordion sections from product metafields and description.
 */
function useAccordionSections(product: any): AccordionSection[] {
  return useMemo(() => {
    const metafields: any[] = product.metafields ?? [];
    const getMetafield = (key: string) =>
      metafields.find((m: any) => m?.key === key)?.value ?? '';

    const materials = getMetafield('materials');
    const careInstructions = getMetafield('care_instructions');
    const sizeGuide = getMetafield('size_guide');
    const origin = getMetafield('origin');

    const sections: AccordionSection[] = [];

    // Product Details — use origin or a generic fallback
    if (origin) {
      sections.push({title: 'Product Details', content: origin});
    }

    // Size & Fit
    if (sizeGuide) {
      sections.push({title: 'Size & Fit', content: sizeGuide});
    }

    // Materials & Care
    const materialsContent = [materials, careInstructions]
      .filter(Boolean)
      .join('<br /><br />');
    if (materialsContent) {
      sections.push({title: 'Materials & Care', content: materialsContent});
    }

    // Shipping & Returns — always present with static content
    sections.push({
      title: 'Shipping & Returns',
      content: `
        <p>Free standard shipping on all orders over $150. Orders typically ship within 1–2 business days and arrive within 2–5 business days.</p>
        <p>Free returns within 30 days of delivery. Items must be unworn, unwashed, and in original condition with tags attached.</p>
        <p>For questions about your order, please <a href="/contact" style="color: var(--color-primary); text-decoration: underline;">contact our team</a>.</p>
      `.trim(),
    });

    return sections;
  }, [product]);
}

// ---------------------------------------------------------------------------
// GraphQL Queries
// ---------------------------------------------------------------------------

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    quantityAvailable
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
` as const;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    description
    descriptionHtml
    productType
    tags
    encodedVariantExistence
    encodedVariantAvailability
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants (selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    images(first: 20) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
    media(first: 10) {
      nodes {
        mediaContentType
        alt
        ... on MediaImage {
          id
          image {
            url
            altText
            width
            height
          }
        }
        ... on Video {
          id
          sources {
            url
            mimeType
            width
            height
          }
        }
      }
    }
    metafields(identifiers: [
      { namespace: "custom", key: "materials" }
      { namespace: "custom", key: "care_instructions" }
      { namespace: "custom", key: "size_guide" }
      { namespace: "custom", key: "origin" }
    ]) {
      namespace
      key
      value
      type
    }
    seo {
      description
      title
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
` as const;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  query RecommendedProducts(
    $country: CountryCode
    $language: LanguageCode
    $handle: String!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      id
      collections(first: 1) {
        nodes {
          title
          products(first: 9, sortKey: BEST_SELLING) {
            nodes {
              id
              handle
              title
              featuredImage {
                url
                altText
                width
                height
              }
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    }
  }
` as const;
