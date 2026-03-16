import {Pagination} from '@shopify/hydrogen';
import type {ProductItemFragment} from 'storefrontapi.generated';
import ProductCard from './ProductCard';
import Skeleton from '~/components/ui/Skeleton';

interface ProductGridProps {
  connection: React.ComponentProps<
    typeof Pagination<ProductItemFragment>
  >['connection'];
}

export default function ProductGrid({connection}: ProductGridProps) {
  return (
    <Pagination connection={connection}>
      {({nodes, isLoading, PreviousLink, NextLink}) => (
        <div>
          <div className="flex justify-center mb-10">
            <PreviousLink>
              {isLoading ? (
                <span className="font-body text-sm text-text/60">
                  Loading...
                </span>
              ) : (
                <button
                  type="button"
                  className="font-body text-sm font-medium tracking-widest uppercase text-primary border border-primary px-8 py-3 transition-colors duration-fast hover:bg-primary hover:text-bg cursor-pointer"
                >
                  Previous
                </button>
              )}
            </PreviousLink>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10">
              {Array.from({length: 8}).map((_, i) => (
                <Skeleton key={i} variant="card" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10">
              {nodes.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  loading={index < 8 ? 'eager' : 'lazy'}
                />
              ))}
            </div>
          )}

          <div className="flex justify-center mt-12">
            <NextLink>
              {isLoading ? (
                <span className="font-body text-sm text-text/60">
                  Loading...
                </span>
              ) : (
                <button
                  type="button"
                  className="font-body text-sm font-medium tracking-widest uppercase text-primary border border-primary px-8 py-3 transition-colors duration-fast hover:bg-primary hover:text-bg cursor-pointer"
                >
                  Next
                </button>
              )}
            </NextLink>
          </div>
        </div>
      )}
    </Pagination>
  );
}
