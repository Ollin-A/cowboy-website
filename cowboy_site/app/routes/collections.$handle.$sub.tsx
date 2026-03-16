import {useState, useCallback} from 'react';
import {redirect, useLoaderData, useParams} from 'react-router';
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

  const openFilter = useCallback(() => setFilterOpen(true), []);
  const closeFilter = useCallback(() => setFilterOpen(false), []);

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

      {/* Toolbar: filter toggle + active filters + sort */}
      <div className="flex flex-col gap-4 mb-8">
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

          <SortDropdown />
        </div>

        <ActiveFilters />
      </div>

      {/* Product grid */}
      <ProductGrid connection={collection.products} />

      {/* No results state */}
      {collection.products.nodes.length === 0 && (
        <div className="text-center py-16">
          <p className="font-body text-base text-text/60 mb-4">
            No products match your selected filters.
          </p>
          <p className="font-body text-sm text-text/40">
            Try adjusting or clearing your filters to see more products.
          </p>
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
