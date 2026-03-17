import {useRef, useEffect} from 'react';

type DividerVariant = 'line' | 'diamond' | 'star';

interface SectionDividerProps {
  variant?: DividerVariant;
  className?: string;
  width?: string;
}

export default function SectionDivider({
  variant = 'line',
  className = '',
  width = '60%',
}: SectionDividerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (prefersReducedMotion) return;

    let ctx: ReturnType<typeof import('gsap')['default']['context']>;

    Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(
      ([{default: gsap}, {ScrollTrigger}]) => {
        gsap.registerPlugin(ScrollTrigger);

        ctx = gsap.context(() => {
          const line = el.querySelector('[data-divider-line]');
          const ornament = el.querySelector('[data-divider-ornament]');

          if (line) {
            gsap.fromTo(
              line,
              {scaleX: 0},
              {
                scaleX: 1,
                duration: 0.8,
                ease: 'power2.out',
                scrollTrigger: {
                  trigger: el,
                  start: 'top 85%',
                  once: true,
                },
              },
            );
          }

          if (ornament) {
            gsap.fromTo(
              ornament,
              {opacity: 0, scale: 0.5},
              {
                opacity: 1,
                scale: 1,
                duration: 0.4,
                ease: 'power2.out',
                delay: 0.3,
                scrollTrigger: {
                  trigger: el,
                  start: 'top 85%',
                  once: true,
                },
              },
            );
          }
        }, el);
      },
    );

    return () => {
      ctx?.revert();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`py-12 md:py-16 flex items-center justify-center ${className}`}
      aria-hidden="true"
    >
      <div className="flex items-center" style={{width}}>
        {variant === 'line' && (
          <div
            data-divider-line
            className="w-full h-px bg-primary/15 origin-center"
          />
        )}

        {variant === 'diamond' && (
          <>
            <div
              data-divider-line
              className="flex-1 h-px bg-primary/15 origin-center"
            />
            <div
              data-divider-ornament
              className="mx-4 w-2 h-2 border border-primary/25 rotate-45 shrink-0"
            />
            <div
              data-divider-line
              className="flex-1 h-px bg-primary/15 origin-center"
            />
          </>
        )}

        {variant === 'star' && (
          <>
            <div
              data-divider-line
              className="flex-1 h-px bg-primary/15 origin-center"
            />
            <div data-divider-ornament className="mx-4 shrink-0">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="text-primary/20"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <div
              data-divider-line
              className="flex-1 h-px bg-primary/15 origin-center"
            />
          </>
        )}
      </div>
    </div>
  );
}
