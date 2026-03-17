import {useState, useCallback} from 'react';
import {
  redirect,
  useLoaderData,
  useParams,
  useNavigate,
  useSearchParams,
  useRouteError,
  isRouteErrorResponse,
  Link,
} from 'react-router';
import type {Route} from './+types/collections.$handle.$sub';
import {getPaginationVariables, Analytics} from '@shopify/hydrogen';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {buildPageMeta, getOriginFromMatches} from '~/lib/utils/seo';
import CollectionHero from '~/components/collection/CollectionHero';
import ProductGrid from '~/components/collection/ProductGrid';
import FilterDrawer from '~/components/collection/FilterDrawer';
import SortDropdown, {parseSortParam} from '~/components/collection/SortDropdown';
import ActiveFilters from '~/components/collection/ActiveFilters';
import {
  COLLECTION_QUERY,
  parseFiltersFromUrl,
} from './collections.$handle';

/**
 * Subcategory hero overrides.
 * Maps `parentHandle/sub` to custom title, description, and optional hero image.
 * Falls back to the parent collection data if no override is found.
 */
const SUBCATEGORY_META: Record<
  string,
  {title: string; description: string; image?: string}
> = {
  'mens/jeans': {
    title: "Men's Jeans",
    description:
      'Western-cut denim built for the ranch and the road. Premium fits in classic and modern washes.',
  },
  'mens/apparel': {
    title: "Men's Apparel",
    description:
      'Shirts, tees, and layers crafted with western heritage and modern sensibility.',
  },
  'mens/outerwear': {
    title: "Men's Outerwear",
    description:
      'Jackets and coats that stand up to the elements without sacrificing style.',
  },
  'mens/new': {
    title: "New Men's Arrivals",
    description:
      'The latest additions to our men\'s collection — fresh styles for the new season.',
  },
  'womens/jeans': {
    title: "Women's Jeans",
    description:
      'Feminine silhouettes meet rugged craftsmanship. Denim designed to move with you.',
  },
  'womens/apparel': {
    title: "Women's Apparel",
    description:
      'Blouses, tops, and essentials with western flair and refined finishing.',
  },
  'womens/outerwear': {
    title: "Women's Outerwear",
    description:
      'Statement outerwear that blends ranch-ready durability with elevated design.',
  },
  'womens/new': {
    title: "New Women's Arrivals",
    description:
      'The latest additions to our women\'s collection — fresh styles for the new season.',
  },
};

/**
 * Maps subcategory slugs to Shopify product type values for filtering.
 * These are used as `productType` filters in the Storefront API query.
 */
const SUB_TO_PRODUCT_TYPE: Record<string, string> = {
  jeans: 'Jeans',
  apparel: 'Apparel',
  outerwear: 'Outerwear',
};

/**
 * Maps subcategory slugs to tag values for filtering.
 * Used for subcategories that are better represented as tags (e.g., "new" arrivals).
 */
const SUB_TO_TAG: Record<string, string> = {
  new: 'new-arrival',
};

export const meta: Route.MetaFunction = ({data, params, matches}) => {
  const subMeta = SUBCATEGORY_META[`${params.handle}/${params.sub}`];
  const collection = data?.collection;
  const title =
    subMeta?.title ||
    collection?.seo?.title ||
    collection?.title ||
    'Collection';
  const description =
    subMeta?.description ||
    collection?.seo?.description ||
    collection?.description ||
    '';
  const origin = getOriginFromMatches(matches);
  // Canonical points to the unfiltered base collection URL
  const url = origin
    ? `${origin}/collections/${params.handle}/${params.sub}`
    : `/collections/${params.handle}/${params.sub}`;
  const image = collection?.image?.url;

  return buildPageMeta({title, description, url, image});
};

export async function loader(args: Route.LoaderArgs) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return {...deferredData, ...criticalData};
}

async function loadCriticalData({context, params, request}: Route.LoaderArgs) {
  const {handle, sub} = params;
  const {storefront} = context;
  const url = new URL(request.url);

  const paginationVariables = getPaginationVariables(request, {
    pageBy: 24,
  });

  if (!handle || !sub) {
    throw redirect('/collections');
  }

  // Parse sort from URL
  const {sortKey, reverse} = parseSortParam(url.searchParams.get('sort'));

  // Start with user-applied filters from URL
  const filters = parseFiltersFromUrl(url.searchParams);

  // Add subcategory filter (product type or tag)
  if (SUB_TO_PRODUCT_TYPE[sub]) {
    filters.push({productType: SUB_TO_PRODUCT_TYPE[sub]});
  } else if (SUB_TO_TAG[sub]) {
    filters.push({tag: SUB_TO_TAG[sub]});
  }

  const [{collection}] = await Promise.all([
    storefront.query(COLLECTION_QUERY, {
      variables: {
        handle,
        sortKey,
        reverse,
        filters: filters.length > 0 ? filters : undefined,
        ...paginationVariables,
      },
    }),
  ]);

  if (!collection) {
    throw new Response(`Collection ${handle}/${sub} not found`, {
      status: 404,
    });
  }

  redirectIfHandleIsLocalized(request, {handle, data: collection});

  return {collection, sub};
}

function loadDeferredData({context}: Route.LoaderArgs) {
  return {};
}

export default function SubcategoryCollection() {
  const {collection, sub} = useLoaderData<typeof loader>();
  const params = useParams();
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const openFilter = useCallback(() => setFilterOpen(true), []);
  const closeFilter = useCallback(() => setFilterOpen(false), []);

  const hasActiveFilters =
    searchParams.has('size') ||
    searchParams.has('color') ||
    searchParams.has('material') ||
    searchParams.has('price');

  const clearAllFilters = useCallback(() => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('size');
    newParams.delete('color');
    newParams.delete('material');
    newParams.delete('price');
    navigate(`?${newParams.toString()}`, {replace: true});
  }, [searchParams, navigate]);

  // Resolve subcategory hero content — override or fall back to collection data
  const subKey = `${params.handle}/${sub}`;
  const subMeta = SUBCATEGORY_META[subKey];

  const heroTitle = subMeta?.title || collection.title;
  const heroDescription = subMeta?.description || collection.description;

  return (
    <div className="container-content py-8 md:py-12">
      {/* Collection Hero — split-screen */}
      <CollectionHero
        title={heroTitle}
        description={heroDescription}
        image={collection.image}
      />

      {/* Toolbar: filter toggle + product count + sort */}
      <div className="flex flex-col gap-4 mb-8 border-t border-primary/10 pt-6">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={openFilter}
            className="inline-flex items-center gap-2 font-body text-xs font-medium tracking-widest uppercase text-primary bg-transparent border border-primary px-5 py-2.5 transition-colors duration-fast hover:bg-primary hover:text-bg cursor-pointer"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M1 3h14M3 8h10M5 13h6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            Filters
          </button>

          <span className="font-body text-xs text-text/50 tracking-wide">
            {collection.products.nodes.length} product{collection.products.nodes.length !== 1 ? 's' : ''}
          </span>

          <SortDropdown />
        </div>

        <ActiveFilters />
      </div>

      {/* Product grid */}
      <ProductGrid connection={collection.products} />

      {/* No results state */}
      {collection.products.nodes.length === 0 && (
        <div className="text-center py-16 md:py-24">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary/20 mx-auto mb-6"
            aria-hidden="true"
          >
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
          </svg>

          <h2 className="font-heading text-h3 text-primary mb-3">
            No products match your filters
          </h2>
          <p className="font-body text-base text-text/60 mb-8 max-w-md mx-auto">
            Try adjusting or clearing your filters to see more products.
          </p>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white font-body font-medium text-sm tracking-widest uppercase border-none cursor-pointer hover:bg-primary/90 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M10.5 3.5L3.5 10.5M3.5 3.5l7 7"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              Clear All Filters
            </button>
          )}
        </div>
      )}

      <FilterDrawer open={filterOpen} onClose={closeFilter} />

      <Analytics.CollectionView
        data={{
          collection: {
            id: collection.id,
            handle: collection.handle,
          },
        }}
      />
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const is404 = isRouteErrorResponse(error) && error.status === 404;

  return (
    <div className="container-content flex flex-col items-center justify-center text-center py-24 md:py-36 min-h-[40vh]">
      <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-primary/20 mb-6"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>

      <h1 className="font-heading text-h3 md:text-h2 tracking-tight text-primary mb-4">
        {is404 ? 'Collection Not Found' : 'Something went wrong'}
      </h1>
      <p className="font-body text-base text-text/60 mb-10 max-w-md">
        {is404
          ? "The collection you're looking for doesn't exist or may have been removed."
          : "We couldn't load this collection right now. Please try again."}
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          to="/"
          className="inline-flex items-center justify-center px-8 py-3 bg-primary text-white font-body font-medium text-sm tracking-widest uppercase no-underline hover:bg-primary/90 transition-colors duration-200"
        >
          Back to Home
        </Link>
        {is404 ? (
          <Link
            to="/collections/mens"
            className="inline-flex items-center justify-center px-8 py-3 border border-primary text-primary bg-transparent font-body font-medium text-sm tracking-widest uppercase no-underline hover:bg-primary hover:text-white transition-colors duration-200"
          >
            Browse All Collections
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center px-8 py-3 border border-primary text-primary bg-transparent font-body font-medium text-sm tracking-widest uppercase cursor-pointer hover:bg-primary hover:text-white transition-colors duration-200"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}
