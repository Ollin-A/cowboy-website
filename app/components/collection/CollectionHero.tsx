import {useRef, useEffect} from 'react';
import {Image} from '@shopify/hydrogen';

interface CollectionHeroProps {
  title: string;
  description?: string | null;
  image?: {
    url: string;
    altText?: string | null;
    width?: number | null;
    height?: number | null;
  } | null;
}

export default function CollectionHero({
  title,
  description,
  image,
}: CollectionHeroProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    const text = textRef.current;
    const img = imageRef.current;
    if (!hero || !text || !img) return;

    let ctx: gsap.Context | undefined;

    import('gsap').then(({default: gsap}) => {
      const prefersReduced = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches;
      if (prefersReduced) return;

      ctx = gsap.context(() => {
        gsap.fromTo(
          text,
          {opacity: 0, y: 30},
          {opacity: 1, y: 0, duration: 0.8, ease: 'power3.out'},
        );
        gsap.fromTo(
          img,
          {opacity: 0, y: 20},
          {opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.15},
        );
      }, hero);
    });

    return () => {
      ctx?.revert();
    };
  }, []);

  return (
    <section ref={heroRef} className="mb-12 md:mb-16">
      <div className="flex flex-col md:flex-row md:items-stretch gap-0">
        {/* Image — full-width on mobile (shown first), right side on desktop */}
        <div
          ref={imageRef}
          className="w-full md:w-1/2 md:order-2 relative overflow-hidden -mx-[clamp(1.25rem,4vw,4rem)] md:mx-0 md:-mr-[clamp(1.25rem,4vw,4rem)]"
          style={{aspectRatio: image ? undefined : '4 / 3'}}
        >
          {image ? (
            <Image
              data={image}
              className="w-full h-full object-cover min-h-[300px] md:min-h-0"
              sizes="(min-width: 768px) 50vw, 100vw"
              loading="eager"
            />
          ) : (
            <div className="w-full h-full min-h-[300px] md:min-h-[400px] bg-primary/5" />
          )}
        </div>

        {/* Title + Description — below image on mobile, left side on desktop */}
        <div
          ref={textRef}
          className="flex flex-col justify-center md:w-1/2 md:order-1 md:pr-12 lg:pr-16 py-10 md:py-28"
        >
          <h1 className="heading-display m-0 mb-4">{title}</h1>
          {description && (
            <p className="font-body text-lg text-text leading-relaxed m-0 max-w-lg">
              {description}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
