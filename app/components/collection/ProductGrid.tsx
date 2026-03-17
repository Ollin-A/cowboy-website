import {Link, useLocation} from 'react-router';
import type {ProductItemFragment} from 'storefrontapi.generated';
import ProductCard from './ProductCard';

interface ProductGridProps {
  connection: {
    nodes: ProductItemFragment[];
    pageInfo: {
      hasPreviousPage: boolean;
      hasNextPage: boolean;
      startCursor: string | null;
      endCursor: string | null;
    };
  };
  productCount?: number;
}

/**
 * Builds a pagination URL that preserves all existing search params
 * (sort, size, color, price, material) and sets cursor + direction.
 */
function buildPaginationUrl(
  search: string,
  cursor: string | null,
  direction: 'next' | 'previous',
): string {
  const params = new URLSearchParams(search);
  if (cursor) {
    params.set('cursor', cursor);
    params.set('direction', direction);
  } else {
    params.delete('cursor');
    params.delete('direction');
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export default function ProductGrid({connection, productCount}: ProductGridProps) {
  const {search} = useLocation();
  const {nodes, pageInfo} = connection;

  const previousUrl = pageInfo.hasPreviousPage
    ? buildPaginationUrl(search, pageInfo.startCursor, 'previous')
    : null;

  const nextUrl = pageInfo.hasNextPage
    ? buildPaginationUrl(search, pageInfo.endCursor, 'next')
    : null;

  return (
    <div>
      {/* Previous page link */}
      {previousUrl && (
        <div className="flex justify-center mb-10">
          <Link
            to={previousUrl}
            preventScrollReset={false}
            className="font-body text-sm text-text/60 hover:text-primary transition-colors duration-fast no-underline"
          >
            &larr; Previous
          </Link>
        </div>
      )}

      {/* Product grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-10 md:gap-x-8 md:gap-y-14">
        {nodes.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            loading={index < 8 ? 'eager' : 'lazy'}
          />
        ))}
      </div>

      {/* Next page link */}
      {nextUrl && (
        <div className="flex justify-center mt-14">
          <Link
            to={nextUrl}
            preventScrollReset={false}
            className="font-body text-sm text-text/60 hover:text-primary transition-colors duration-fast no-underline"
          >
            Next &rarr;
          </Link>
        </div>
      )}
    </div>
  );
}
