import {useRef, useEffect, useState} from 'react';
import {Link} from 'react-router';
import Button from '~/components/ui/Button';

interface HeroVideoProps {
  videoSrc?: string;
  webmSrc?: string;
  posterSrc?: string;
  headline?: string;
  subline?: string;
  ctaText?: string;
  ctaLink?: string;
}

export default function HeroVideo({
  videoSrc = '/videos/hero-placeholder.mp4',
  webmSrc = '/videos/hero-placeholder.webm',
  posterSrc = '/images/hero-poster.jpg',
  headline = 'New Collection',
  subline = 'Crafted for the modern West',
  ctaText = 'Shop Now',
  ctaLink = '/collections/new',
}: HeroVideoProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldAutoplay, setShouldAutoplay] = useState(true);

  // Pause video if user prefers reduced motion
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (prefersReducedMotion) {
      setShouldAutoplay(false);
      videoRef.current?.pause();
    }
  }, []);

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (prefersReducedMotion) return;

    let ctx: ReturnType<typeof import('gsap')['default']['context']>;

    import('gsap').then(({default: gsap}) => {
      ctx = gsap.context(() => {
        const children = content.children;
        gsap.fromTo(
          children,
          {opacity: 0, y: 30},
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: 'power3.out',
            delay: 0.3,
          },
        );
      }, sectionRef);
    });

    return () => {
      ctx?.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-screen min-h-[600px] overflow-hidden flex items-center justify-center"
      aria-label="Hero"
    >
      {/* Video background */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay={shouldAutoplay}
        loop
        muted
        playsInline
        poster={posterSrc}
        preload="metadata"
        aria-hidden="true"
      >
        <source src={webmSrc} type="video/webm" />
        <source src={videoSrc} type="video/mp4" />
      </video>

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/40" aria-hidden="true" />

      {/* Content overlay */}
      <div
        ref={contentRef}
        className="relative z-10 text-center px-[var(--side-padding)] max-w-3xl"
      >
        <h1
          className="font-heading text-hero tracking-tighter text-white mb-4"
          style={{color: '#fff'}}
        >
          {headline}
        </h1>
        <p className="font-body text-lg md:text-xl text-white/90 mb-8 max-w-xl mx-auto">
          {subline}
        </p>
        <Link to={ctaLink} prefetch="intent">
          <Button
            variant="secondary"
            size="lg"
            className="border-white text-white hover:bg-white hover:text-primary"
          >
            {ctaText}
          </Button>
        </Link>
      </div>
    </section>
  );
}
