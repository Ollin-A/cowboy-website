import {useState, useCallback} from 'react';
import {
  redirect,
  useLoaderData,
  useNavigate,
  useSearchParams,
  useRouteError,
  isRouteErrorResponse,
  Link,
} from 'react-router';
import type {Route} from './+types/collections.$handle';
import {getPaginationVariables, Analytics} from '@shopify/hydrogen';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {buildPageMeta, getOriginFromMatches} from '~/lib/utils/seo';
import CollectionHero from '~/components/collection/CollectionHero';
import ShoppableHero from '~/components/collection/ShoppableHero';
import type {ShoppableTag} from '~/components/collection/ShoppableHero';
import ProductGrid from '~/components/collection/ProductGrid';
import FilterDrawer from '~/components/collection/FilterDrawer';
import SortDropdown, {parseSortParam} from '~/components/collection/SortDropdown';
import ActiveFilters from '~/components/collection/ActiveFilters';
import shoppableTagsData from '~/lib/data/shoppable-tags.json';

export const meta: Route.MetaFunction = ({data, matches}) => {
  const collection = data?.collection;
  const title = collection?.seo?.title || collection?.title || 'Collection';
  const description =
    collection?.seo?.description || collection?.description || '';
  const origin = getOriginFromMatches(matches);
  const url = origin
    ? `${origin}/collections/${collection?.handle}`
    : `/collections/${collection?.handle}`;
  const image = collection?.image?.url;

  return buildPageMeta({title, description, url, image});
};

export async function loader(args: Route.LoaderArgs) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return {...deferredData, ...criticalData};
}

async function loadCriticalData({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;
  const url = new URL(request.url);

  const paginationVariables = getPaginationVariables(request, {
    pageBy: 24,
  });

  if (!handle) {
    throw redirect('/collections');
  }

  // Parse sort from URL
  const {sortKey, reverse} = parseSortParam(url.searchParams.get('sort'));

  // Parse filters from URL search params
  const filters = parseFiltersFromUrl(url.searchParams);

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
    throw new Response(`Collection ${handle} not found`, {
      status: 404,
    });
  }

  redirectIfHandleIsLocalized(request, {handle, data: collection});

  return {collection};
}

function loadDeferredData({context}: Route.LoaderArgs) {
  return {};
}

/** Parse filter params from URL search params into Storefront API filters */
export function parseFiltersFromUrl(
  searchParams: URLSearchParams,
): Array<Record<string, unknown>> {
  const filters: Array<Record<string, unknown>> = [];

  const sizeParam = searchParams.get('size');
  if (sizeParam) {
    sizeParam.split(',').forEach((size) => {
      filters.push({variantOption: {name: 'Size', value: size}});
    });
  }

  const colorParam = searchParams.get('color');
  if (colorParam) {
    colorParam.split(',').forEach((color) => {
      filters.push({variantOption: {name: 'Color', value: color}});
    });
  }

  const materialParam = searchParams.get('material');
  if (materialParam) {
    materialParam.split(',').forEach((material) => {
      filters.push({productType: material});
    });
  }

  const priceParam = searchParams.get('price');
  if (priceParam) {
    priceParam.split(',').forEach((range) => {
      const priceFilter = parsePriceRange(range);
      if (priceFilter) {
        filters.push({price: priceFilter});
      }
    });
  }

  return filters;
}

/** Convert price range label to Storefront API price filter */
function parsePriceRange(
  range: string,
): {min?: number; max?: number} | null {
  switch (range) {
    case 'Under $50':
      return {min: 0, max: 50};
    case '$50 - $100':
      return {min: 50, max: 100};
    case '$100 - $200':
      return {min: 100, max: 200};
    case '$200 - $500':
      return {min: 200, max: 500};
    case 'Over $500':
      return {min: 500};
    default:
      return null;
  }
}

export default function Collection() {
  const {collection} = useLoaderData<typeof loader>();
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

  const isNewCollection = collection.handle === 'new';
  const shoppableData = isNewCollection
    ? (shoppableTagsData as Record<string, {heroImage: string; tags: ShoppableTag[]}>)[
        'collection-new'
      ]
    : null;

  return (
    <div className={isNewCollection ? '' : 'container-content py-8 md:py-12'}>
      {/* Shoppable Hero for New Collection, standard hero for others */}
      {isNewCollection && shoppableData ? (
        <>
          <ShoppableHero
            heroImage={shoppableData.heroImage}
            tags={shoppableData.tags}
            altText="New Collection — Shop the Look"
          />
          <div className="container-content">
            <h1 className="heading-display mb-4">{collection.title}</h1>
            {collection.description && (
              <p className="font-body text-lg text-text leading-relaxed max-w-2xl mb-12">
                {collection.description}
              </p>
            )}
          </div>
        </>
      ) : (
        <CollectionHero
          title={collection.title}
          description={collection.description}
          image={collection.image}
        />
      )}

      {/* Toolbar: filter toggle + product count + sort */}
      <div className={isNewCollection ? 'container-content py-8 md:py-12' : ''}>
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
            {/* Empty state icon */}
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

const PRODUCT_ITEM_FRAGMENT = `#graphql
  fragment MoneyProductItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment ProductItem on Product {
    id
    handle
    title
    featuredImage {
      id
      altText
      url
      width
      height
    }
    priceRange {
      minVariantPrice {
        ...MoneyProductItem
      }
      maxVariantPrice {
        ...MoneyProductItem
      }
    }
  }
` as const;

export const COLLECTION_QUERY = `#graphql
  ${PRODUCT_ITEM_FRAGMENT}
  query Collection(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
    $sortKey: ProductCollectionSortKeys
    $reverse: Boolean
    $filters: [ProductFilter!]
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      image {
        url
        altText
        width
        height
      }
      seo {
        title
        description
      }
      products(
        first: $first,
        last: $last,
        before: $startCursor,
        after: $endCursor,
        sortKey: $sortKey,
        reverse: $reverse,
        filters: $filters
      ) {
        nodes {
          ...ProductItem
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          endCursor
          startCursor
        }
      }
    }
  }
` as const;
