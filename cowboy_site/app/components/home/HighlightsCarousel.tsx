import {useRef, useEffect, useCallback} from 'react';
import {Link} from 'react-router';
import {Money} from '@shopify/hydrogen';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';

export interface HighlightProduct {
  id: string;
  handle: string;
  title: string;
  featuredImage?: {
    url: string;
    altText?: string | null;
    width?: number;
    height?: number;
  } | null;
  /** Optional short video clip for hover-to-play effect (MP4) */
  videoUrl?: string;
  /** Optional WebM source for format fallback */
  videoWebmUrl?: string;
  priceRange: {
    minVariantPrice: Pick<MoneyV2, 'amount' | 'currencyCode'>;
  };
}

interface HighlightsCarouselProps {
  products: HighlightProduct[];
  heading?: string;
}

export default function HighlightsCarousel({
  products,
  heading = 'Highlights',
}: HighlightsCarouselProps) {
  const sectionRef = useRef<HTMLElement>(null);

  if (!products.length) return null;

  return (
    <section
      ref={sectionRef}
      className="py-16 md:py-24 overflow-hidden"
      aria-label={heading}
    >
      <div className="container-content mb-8 md:mb-12">
        <h2 className="font-heading text-3xl md:text-4xl tracking-tighter text-primary">
          {heading}
        </h2>
      </div>

      <div className="relative">
        <div
          className="flex gap-4 md:gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory px-[var(--side-padding)] pb-4 no-scrollbar"
          role="list"
        >
          {products.map((product) => (
            <HighlightCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

function HighlightCard({product}: {product: HighlightProduct}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleMouseEnter = useCallback(() => {
    const video = videoRef.current;
    const img = imgRef.current;
    if (!video || !img) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (prefersReducedMotion) return;

    video.play().catch(() => {});

    import('gsap').then(({default: gsap}) => {
      gsap.to(img, {opacity: 0, duration: 0.4, ease: 'power2.out'});
      gsap.to(video, {opacity: 1, duration: 0.4, ease: 'power2.out'});
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    const video = videoRef.current;
    const img = imgRef.current;
    if (!video || !img) return;

    import('gsap').then(({default: gsap}) => {
      gsap.to(img, {opacity: 1, duration: 0.3, ease: 'power2.out'});
      gsap.to(video, {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.out',
        onComplete: () => {
          video.pause();
          video.currentTime = 0;
        },
      });
    });
  }, []);

  // Mobile: play video on viewport entry via IntersectionObserver
  useEffect(() => {
    const video = videoRef.current;
    const card = cardRef.current;
    if (!video || !card || !product.videoUrl) return;

    // Only use IntersectionObserver on touch devices
    const isTouchDevice =
      typeof window !== 'undefined' && 'ontouchstart' in window;
    if (!isTouchDevice) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (prefersReducedMotion) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
          import('gsap').then(({default: gsap}) => {
            gsap.to(video, {opacity: 1, duration: 0.4, ease: 'power2.out'});
          });
        } else {
          video.pause();
          import('gsap').then(({default: gsap}) => {
            gsap.to(video, {opacity: 0, duration: 0.3, ease: 'power2.out'});
          });
        }
      },
      {threshold: 0.6},
    );

    observer.observe(card);
    return () => observer.disconnect();
  }, [product.videoUrl]);

  return (
    <div
      ref={cardRef}
      className="flex-shrink-0 w-[280px] md:w-[320px] lg:w-[360px] snap-start"
      role="listitem"
      onMouseEnter={product.videoUrl ? handleMouseEnter : undefined}
      onMouseLeave={product.videoUrl ? handleMouseLeave : undefined}
    >
      <Link
        to={`/products/${product.handle}`}
        prefetch="intent"
        className="block no-underline hover:no-underline"
      >
        {/* Dual-media container */}
        <div className="relative aspect-[3/4] overflow-hidden bg-primary/5 mb-3">
          {/* Static image (top layer) */}
          <img
            ref={imgRef}
            src={
              product.featuredImage?.url ||
              '/images/product-placeholder.jpg'
            }
            alt={
              product.featuredImage?.altText || `${product.title} - Featured`
            }
            width={product.featuredImage?.width || 360}
            height={product.featuredImage?.height || 480}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Hidden video (underneath, revealed on hover/viewport) */}
          {product.videoUrl && (
            <video
              ref={videoRef}
              muted
              loop
              playsInline
              preload="none"
              className="absolute inset-0 w-full h-full object-cover opacity-0"
              aria-hidden="true"
            >
              {product.videoWebmUrl && (
                <source src={product.videoWebmUrl} type="video/webm" />
              )}
              <source src={product.videoUrl} type="video/mp4" />
            </video>
          )}
        </div>

        {/* Product info */}
        <div className="space-y-1">
          <h4 className="font-body text-sm md:text-base text-text tracking-wide truncate">
            {product.title}
          </h4>
          <p className="font-body text-sm text-text/70">
            <Money data={product.priceRange.minVariantPrice} />
          </p>
        </div>
      </Link>
    </div>
  );
}

