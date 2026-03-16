import {useState, useRef, useCallback, useEffect, type SyntheticEvent} from 'react';
import ResponsiveImage from '~/components/ui/ResponsiveImage';

export interface GalleryImage {
  src: string;
  alt: string;
  width: number;
  height: number;
  srcSet?: string;
}

interface ProductGalleryProps {
  images: GalleryImage[];
  /** Sizes hint for responsive images */
  sizes?: string;
}

function ImageFallback({alt}: {alt: string}) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-primary/5">
      <svg
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-primary/20 mb-3"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
      <span className="font-body text-xs text-primary/40 text-center px-4 max-w-[200px]">
        {alt || 'Image unavailable'}
      </span>
    </div>
  );
}

function handleImageError(e: SyntheticEvent<HTMLImageElement>) {
  const img = e.currentTarget;
  // Hide the broken image and show the fallback sibling
  img.style.display = 'none';
  const fallback = img.nextElementSibling as HTMLElement | null;
  if (fallback) fallback.style.display = 'flex';
}

export default function ProductGallery({images, sizes}: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({x: 50, y: 50});
  const mainImageRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{x: number; y: number} | null>(null);
  const galleryRef = useRef<HTMLDivElement>(null);

  // Reset index when images change (e.g. variant switch)
  useEffect(() => {
    setActiveIndex(0);
    setIsZoomed(false);
  }, [images]);

  const goTo = useCallback(
    (index: number) => {
      setActiveIndex(Math.max(0, Math.min(index, images.length - 1)));
      setIsZoomed(false);
    },
    [images.length],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isZoomed || !mainImageRef.current) return;
      const rect = mainImageRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setZoomPosition({x, y});
    },
    [isZoomed],
  );

  const toggleZoom = useCallback(() => {
    setIsZoomed((prev) => !prev);
  }, []);

  // Mobile swipe handling
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = {x: touch.clientX, y: touch.clientY};
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStartRef.current) return;
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);
      touchStartRef.current = null;

      // Only swipe if horizontal movement > 50px and greater than vertical
      if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > deltaY) {
        if (deltaX < 0 && activeIndex < images.length - 1) {
          goTo(activeIndex + 1);
        } else if (deltaX > 0 && activeIndex > 0) {
          goTo(activeIndex - 1);
        }
      }
    },
    [activeIndex, images.length, goTo],
  );

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        goTo(activeIndex - 1);
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        goTo(activeIndex + 1);
      } else if (e.key === 'Escape' && isZoomed) {
        setIsZoomed(false);
      }
    },
    [activeIndex, goTo, isZoomed],
  );

  if (images.length === 0) {
    return (
      <div
        className="w-full bg-primary/5 flex items-center justify-center"
        style={{aspectRatio: '3 / 4'}}
      >
        <ImageFallback alt="No product images available" />
      </div>
    );
  }

  const activeImage = images[activeIndex];

  return (
    <div
      ref={galleryRef}
      className="flex flex-col md:flex-row gap-3 md:gap-4"
      role="region"
      aria-roledescription="Product image gallery"
      aria-label={`Product gallery, ${images.length} images`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* Live region for screen readers */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {`Image ${activeIndex + 1} of ${images.length}: ${activeImage.alt}`}
      </div>
      {/* Thumbnail strip — desktop only */}
      {images.length > 1 && (
        <div
          className="hidden md:flex flex-col gap-2 w-[72px] shrink-0"
          role="tablist"
          aria-label="Product image thumbnails"
        >
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === activeIndex}
              aria-label={`View image ${i + 1} of ${images.length}`}
              onClick={() => goTo(i)}
              className={[
                'relative w-[72px] h-[96px] overflow-hidden border-2 bg-transparent p-0 cursor-pointer',
                'transition-all duration-fast',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                i === activeIndex
                  ? 'border-primary opacity-100'
                  : 'border-transparent opacity-60 hover:opacity-90',
              ].join(' ')}
            >
              <img
                src={img.src}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
                width={72}
                height={96}
              />
            </button>
          ))}
        </div>
      )}

      {/* Main image area */}
      <div className="flex-1 min-w-0" role="tabpanel" aria-label={activeImage.alt}>
        {/* Desktop: click-to-zoom main image */}
        <div
          ref={mainImageRef}
          className="hidden md:block relative overflow-hidden cursor-zoom-in"
          style={{aspectRatio: '3 / 4'}}
          onClick={toggleZoom}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setIsZoomed(false)}
          role="img"
          aria-label={activeImage.alt}
        >
          <img
            src={activeImage.src}
            alt={activeImage.alt}
            srcSet={activeImage.srcSet}
            sizes={sizes || '(min-width: 1024px) 50vw, 100vw'}
            width={activeImage.width}
            height={activeImage.height}
            loading="eager"
            fetchPriority="high"
            decoding="auto"
            onError={handleImageError}
            className={[
              'w-full h-full object-cover transition-transform duration-base',
              isZoomed ? 'scale-[2]' : 'scale-100',
            ].join(' ')}
            style={
              isZoomed
                ? {transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`}
                : undefined
            }
          />
          <div
            className="absolute inset-0 items-center justify-center hidden"
            style={{display: 'none'}}
          >
            <ImageFallback alt={activeImage.alt} />
          </div>
        </div>

        {/* Mobile: swipeable gallery */}
        <div
          className="md:hidden relative overflow-hidden"
          style={{aspectRatio: '3 / 4'}}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          role="img"
          aria-label={activeImage.alt}
        >
          <div
            className="flex transition-transform duration-base"
            style={{
              width: `${images.length * 100}%`,
              transform: `translateX(-${(activeIndex / images.length) * 100}%)`,
            }}
          >
            {images.map((img, i) => (
              <div
                key={i}
                className="w-full shrink-0"
                style={{width: `${100 / images.length}%`}}
              >
                <ResponsiveImage
                  src={img.src}
                  alt={img.alt}
                  width={img.width}
                  height={img.height}
                  srcSet={img.srcSet}
                  sizes="100vw"
                  lazy={i > 0}
                  className="w-full"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Mobile: dot indicators */}
        {images.length > 1 && (
          <div
            className="md:hidden flex items-center justify-center gap-2 mt-3"
            role="tablist"
            aria-label="Gallery navigation"
          >
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === activeIndex}
                aria-label={`Image ${i + 1} of ${images.length}`}
                onClick={() => goTo(i)}
                className={[
                  'w-2 h-2 rounded-full border-none p-0 cursor-pointer',
                  'transition-all duration-fast',
                  i === activeIndex
                    ? 'bg-primary scale-100'
                    : 'bg-primary/30 scale-75',
                ].join(' ')}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
