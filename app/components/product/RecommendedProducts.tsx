import {useRef, useCallback} from 'react';
import ResponsiveImage from '~/components/ui/ResponsiveImage';

export interface RecommendedProduct {
  handle: string;
  title: string;
  price: string;
  image: {
    src: string;
    alt: string;
    width: number;
    height: number;
    srcSet?: string;
  };
}

interface RecommendedProductsProps {
  products: RecommendedProduct[];
  heading?: string;
}

export default function RecommendedProducts({
  products,
  heading = 'You May Also Like',
}: RecommendedProductsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = useCallback((direction: 'left' | 'right') => {
    const container = scrollRef.current;
    if (!container) return;
    const cardWidth = container.firstElementChild?.clientWidth ?? 300;
    const offset = direction === 'left' ? -cardWidth - 16 : cardWidth + 16;
    container.scrollBy({left: offset, behavior: 'smooth'});
  }, []);

  if (products.length === 0) return null;

  return (
    <section
      className="w-full"
      aria-label="Recommended products"
      id="recommended-products"
    >
      {/* Heading row */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-heading text-2xl md:text-3xl tracking-tight text-primary m-0">
          {heading}
        </h2>

        {/* Desktop scroll arrows */}
        <div className="hidden md:flex items-center gap-2">
          <button
            type="button"
            aria-label="Scroll left"
            onClick={() => scroll('left')}
            className="w-10 h-10 flex items-center justify-center border border-primary/20 bg-transparent text-primary cursor-pointer hover:border-primary transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Scroll right"
            onClick={() => scroll('right')}
            className="w-10 h-10 flex items-center justify-center border border-primary/20 bg-transparent text-primary cursor-pointer hover:border-primary transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Scrollable product row */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 -mx-1 px-1"
        style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}
        role="list"
      >
        {products.map((product) => (
          <a
            key={product.handle}
            href={`/products/${product.handle}`}
            className="group block no-underline shrink-0 w-[260px] md:w-[calc(25%-12px)] snap-start"
            role="listitem"
          >
            <div
              className="relative overflow-hidden bg-[#f5f5f5]"
              style={{aspectRatio: '3 / 4'}}
            >
              <ResponsiveImage
                src={product.image.src}
                alt={product.image.alt}
                width={product.image.width}
                height={product.image.height}
                srcSet={product.image.srcSet}
                sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 260px"
                className="w-full h-full transition-transform duration-base group-hover:scale-[1.02]"
              />
            </div>
            <div className="mt-3">
              <h3 className="font-body font-medium text-sm text-text tracking-wide leading-snug m-0">
                {product.title}
              </h3>
              <p className="font-body text-sm text-text mt-1 mb-0">
                {product.price}
              </p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
