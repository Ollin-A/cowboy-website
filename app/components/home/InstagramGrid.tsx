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
  {type: 'image', src: '/images/ig-1.jpg', alt: 'Western lifestyle photo 1', href: '#'},
  {type: 'video', src: '/videos/ig-2.mp4', webmSrc: '/videos/ig-2.webm', alt: 'Western lifestyle video 1', href: '#'},
  {type: 'image', src: '/images/ig-3.jpg', alt: 'Western lifestyle photo 2', href: '#'},
  {type: 'image', src: '/images/ig-4.jpg', alt: 'Western lifestyle photo 3', href: '#'},
  {type: 'image', src: '/images/ig-5.jpg', alt: 'Western lifestyle photo 4', href: '#'},
  {type: 'video', src: '/videos/ig-6.mp4', webmSrc: '/videos/ig-6.webm', alt: 'Western lifestyle video 2', href: '#'},
  {type: 'image', src: '/images/ig-7.jpg', alt: 'Western lifestyle photo 5', href: '#'},
  {type: 'image', src: '/images/ig-8.jpg', alt: 'Western lifestyle photo 6', href: '#'},
  {type: 'image', src: '/images/ig-9.jpg', alt: 'Western lifestyle photo 7', href: '#'},
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
