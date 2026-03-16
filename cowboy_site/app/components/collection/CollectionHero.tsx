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
      <div className="flex flex-col-reverse md:flex-row md:items-stretch gap-8 md:gap-0">
        {/* Left: Title + Description */}
        <div
          ref={textRef}
          className="flex flex-col justify-center md:w-1/2 md:pr-12 lg:pr-16 py-8 md:py-16 lg:py-20"
        >
          <h1 className="heading-display m-0 mb-4">{title}</h1>
          {description && (
            <p className="font-body text-lg text-text leading-relaxed m-0 max-w-lg">
              {description}
            </p>
          )}
        </div>

        {/* Right: Image */}
        <div
          ref={imageRef}
          className="md:w-1/2 relative overflow-hidden"
          style={{aspectRatio: image ? undefined : '4 / 3'}}
        >
          {image ? (
            <Image
              data={image}
              className="w-full h-full object-cover"
              sizes="(min-width: 768px) 50vw, 100vw"
              loading="eager"
            />
          ) : (
            <div className="w-full h-full min-h-[280px] md:min-h-[400px] bg-primary/5" />
          )}
        </div>
      </div>
    </section>
  );
}
