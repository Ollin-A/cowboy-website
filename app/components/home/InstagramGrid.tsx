import {useRef, useEffect, useCallback} from 'react';

interface InstagramItem {
  type: 'image' | 'video';
  src: string;
  /** WebM source for video items (MP4 + WebM fallback) */
  webmSrc?: string;
  alt: string;
  href: string;
}

const PLACEHOLDER_ITEMS: InstagramItem[] = [
  {type: 'image', src: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80&fit=crop&crop=center', alt: 'Leather goods flat lay', href: '#'},
  {type: 'image', src: 'https://images.unsplash.com/photo-1565084888279-aca607ecce0c?w=600&q=80&fit=crop&crop=center', alt: 'Western boots close-up', href: '#'},
  {type: 'image', src: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80&fit=crop&crop=center', alt: 'Leather texture macro', href: '#'},
  {type: 'image', src: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80&fit=crop&crop=center', alt: 'Desert sunset landscape', href: '#'},
  {type: 'image', src: 'https://images.unsplash.com/photo-1529391409740-59f2cea08bc6?w=600&q=80&fit=crop&crop=center', alt: 'Western crafting tools', href: '#'},
  {type: 'image', src: 'https://images.unsplash.com/photo-1434389677669-e08b4cda3a7a?w=600&q=80&fit=crop&crop=center', alt: 'Person walking through prairie grass', href: '#'},
  {type: 'image', src: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&q=80&fit=crop&crop=center', alt: 'Denim detail close-up', href: '#'},
  {type: 'image', src: 'https://images.unsplash.com/photo-1504198453319-5ce911bafcde?w=600&q=80&fit=crop&crop=center', alt: 'Horses in morning fog', href: '#'},
  {type: 'image', src: 'https://images.unsplash.com/photo-1508349937151-22b68b72d5b6?w=600&q=80&fit=crop&crop=center', alt: 'Golden wheat field at sunset', href: '#'},
];

interface InstagramGridProps {
  items?: InstagramItem[];
  heading?: string;
}

export default function InstagramGrid({
  items = PLACEHOLDER_ITEMS,
  heading = 'Follow Us @brand',
}: InstagramGridProps) {
  return (
    <section className="py-16 md:py-24" aria-label="Instagram feed">
      <div className="container-content mb-8 md:mb-12 text-center">
        <h2 className="font-body text-sm tracking-widest uppercase text-text">
          Follow Us
        </h2>
        <a
          href="#"
          target="_blank"
          rel="noopener noreferrer"
          className="font-body text-sm text-text/50 no-underline hover:text-text transition-colors duration-200"
        >
          @brand
        </a>
      </div>

      <div className="container-content">
        {/* Desktop: 3×3, Mobile: 2×3 */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-1 md:gap-2">
          {items.map((item, i) => (
            <a
              key={i}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="relative block overflow-hidden group"
              aria-label={item.alt}
            >
              <div className="aspect-square">
                {item.type === 'video' ? (
                  <LazyVideo
                    src={item.src}
                    webmSrc={item.webmSrc}
                    alt={item.alt}
                  />
                ) : (
                  <img
                    src={item.src}
                    alt={item.alt}
                    width={480}
                    height={480}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-slow group-hover:scale-[1.02]"
                  />
                )}
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Lazy-loaded video that only plays when visible via IntersectionObserver */
function LazyVideo({
  src,
  webmSrc,
  alt,
}: {
  src: string;
  webmSrc?: string;
  alt: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (prefersReducedMotion) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      {threshold: 0.3},
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={videoRef}
      muted
      loop
      playsInline
      preload="none"
      className="w-full h-full object-cover transition-transform duration-slow group-hover:scale-[1.02]"
      aria-label={alt}
    >
      {webmSrc && <source src={webmSrc} type="video/webm" />}
      <source src={src} type="video/mp4" />
      {/* Fallback for browsers that don't support video */}
      <div className="w-full h-full bg-primary/10" />
    </video>
  );
}
