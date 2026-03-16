import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {ProductItemFragment} from 'storefrontapi.generated';
import {useVariantUrl} from '~/lib/variants';

interface ProductCardProps {
  product: ProductItemFragment;
  loading?: 'eager' | 'lazy';
}

export default function ProductCard({product, loading}: ProductCardProps) {
  const variantUrl = useVariantUrl(product.handle);
  const image = product.featuredImage;

  return (
    <Link
      className="group block no-underline"
      prefetch="intent"
      to={variantUrl}
    >
      <div className="relative overflow-hidden" style={{aspectRatio: '3 / 4'}}>
        {image && (
          <Image
            alt={image.altText || `${product.title} - Product Image`}
            data={image}
            loading={loading}
            className="w-full h-full object-cover transition-transform duration-base group-hover:scale-[1.02]"
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
            width={image.width ?? 600}
            height={image.height ?? 800}
          />
        )}
      </div>

      <div className="mt-3">
        <h3 className="font-body font-medium text-sm text-text tracking-wide leading-snug m-0">
          {product.title}
        </h3>
        <p className="font-body text-sm text-text mt-1 mb-0">
          <Money data={product.priceRange.minVariantPrice} />
        </p>
      </div>
    </Link>
  );
}
