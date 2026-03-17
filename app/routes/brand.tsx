import type {Route} from './+types/brand';
import {useRef, useEffect} from 'react';
import {buildPageMeta, getOriginFromMatches} from '~/lib/utils/seo';
import SectionDivider from '~/components/ui/SectionDivider';

export const meta: Route.MetaFunction = ({matches}) => {
  const origin = getOriginFromMatches(matches);
  const url = origin ? `${origin}/brand` : '/brand';

  return buildPageMeta({
    title: 'Our Story',
    description:
      'The story behind the brand — heritage, craftsmanship, and the spirit of the modern West.',
    url,
  });
};

const SECTIONS = [
  {
    heading: 'Our Story',
    body: `Born from the dust and grit of the American West, our brand was founded on a simple belief: that western wear deserves the same reverence and attention to detail as the world's finest fashion houses. What began as a small workshop in the heart of ranch country has grown into a label that bridges heritage and modernity — without ever losing sight of where it all started.

Every piece we create carries the DNA of the open range: honest materials, purposeful construction, and a quiet confidence that doesn't need to shout. We don't follow trends. We follow tradition, and then we push it forward.`,
    media: null, // Opening photo handled separately
  },
  {
    heading: 'Mission',
    body: `Our mission is to elevate western fashion to its rightful place among the world's most respected apparel. We believe the cowboy spirit — resilience, authenticity, and an unwavering connection to the land — deserves to be expressed through garments of uncompromising quality.

We design for the modern rancher, the weekend rider, and everyone who feels the pull of wide-open spaces. Every stitch, every rivet, every hand-finished detail is a promise: this is western wear made to last, made to wear, and made to be proud of.`,
    mediaType: 'video' as const,
  },
  {
    heading: 'Values & Craftsmanship',
    body: `Quality isn't a marketing word for us — it's a way of working. Our denim is sourced from mills that have been weaving for generations. Our leathers are vegetable-tanned, hand-cut, and finished by artisans who learned their craft from their parents and grandparents. Our hardware is cast, not stamped.

We believe in slow fashion in the truest sense: garments that improve with age, that develop character through wear, and that you'll pass down rather than throw away. Every piece is designed to ride, to work, and to live in — because that's what western wear was always meant to do.`,
    mediaType: 'video' as const,
  },
  {
    heading: 'Heritage',
    body: `The West built this country, and its legacy lives in every crease of a well-worn hat, every fade line on a pair of ranch jeans, every scuff on a pair of boots that have walked a thousand miles of fence line. We honor that legacy not through nostalgia, but through a commitment to making things the right way — the way they were always meant to be made.

From our workshop to your wardrobe, every piece carries a story. We hope it becomes part of yours.`,
    media: null,
  },
];

export default function BrandPage() {
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (prefersReducedMotion) return;

    let ctx: ReturnType<typeof import('gsap')['default']['context']>;

    Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(
      ([{default: gsap}, {ScrollTrigger}]) => {
        gsap.registerPlugin(ScrollTrigger);

        ctx = gsap.context(() => {
          const sections = main.querySelectorAll('[data-reveal]');

          sections.forEach((section) => {
            const children = section.querySelectorAll('[data-reveal-child]');
            const targets = children.length > 0 ? children : [section];

            gsap.fromTo(
              targets,
              {opacity: 0, y: 40},
              {
                opacity: 1,
                y: 0,
                duration: 0.8,
                stagger: 0.15,
                ease: 'power2.out',
                scrollTrigger: {
                  trigger: section,
                  start: 'top 85%',
                  once: true,
                },
              },
            );
          });
        }, main);
      },
    );

    return () => {
      ctx?.revert();
    };
  }, []);

  return (
    <div ref={mainRef}>
      {/* Opening full-width lifestyle photo */}
      <section className="relative w-full h-[60vh] md:h-[75vh] overflow-hidden">
        <div className="absolute inset-0 bg-primary/20" />
        <img
          src="https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1920&q=80&fit=crop"
          alt="Western landscape at golden hour"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-[var(--side-padding)] pb-12 md:pb-20">
          <h1 className="font-heading text-h1 md:text-h2 tracking-tight text-white">
            Our Story
          </h1>
        </div>
      </section>

      {/* Alternating content sections */}
      <div className="container-content py-16 md:py-24">
        {SECTIONS.map((section, index) => (
          <div key={section.heading}>
            {index > 0 && <SectionDivider variant="line" />}
            <section
              data-reveal
              className={`flex flex-col gap-8 md:gap-16 mb-20 md:mb-32 last:mb-0 ${
                index % 2 === 0
                  ? 'md:flex-row'
                  : 'md:flex-row-reverse'
              }`}
            >
            {/* Text block */}
            <div
              data-reveal-child
              className={`flex-1 flex flex-col justify-center ${
                section.mediaType || index === 0 ? '' : 'md:max-w-[65%] mx-auto'
              }`}
            >
              <h2 className="font-heading text-h3 md:text-h2 tracking-tight text-primary mb-6 md:mb-8">
                {section.heading}
              </h2>
              {section.body.split('\n\n').map((paragraph, pIdx) => (
                <p
                  key={pIdx}
                  className="font-body text-base md:text-lg leading-relaxed text-text mb-4 last:mb-0"
                >
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Media block */}
            {section.mediaType === 'video' && (
              <div
                data-reveal-child
                className="flex-1 relative aspect-[4/3] md:aspect-auto md:min-h-[400px] bg-primary/5 overflow-hidden"
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-primary/30 flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-6 h-6 md:w-8 md:h-8 text-primary/50 ml-1"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    <p className="font-body text-sm tracking-wide text-text/50 uppercase">
                      Brand Film {index === 1 ? 'I' : 'II'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </section>
          </div>
        ))}
      </div>
    </div>
  );
}
