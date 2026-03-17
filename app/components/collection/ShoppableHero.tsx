import {useRef, useEffect, useState} from 'react';
import {Link} from 'react-router';

export interface ShoppableTag {
  productHandle: string;
  label: string;
  price: string;
  x: number;
  y: number;
}

interface ShoppableHeroProps {
  heroImage: string;
  tags: ShoppableTag[];
  altText?: string;
}

export default function ShoppableHero({
  heroImage,
  tags,
  altText = 'New Collection',
}: ShoppableHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const imageWrap = imageRef.current;
    if (!section || !imageWrap) return;

    let ctx: ReturnType<typeof import('gsap')['default']['context']> | undefined;

    Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger'),
    ]).then(([{default: gsap}, {ScrollTrigger}]) => {
      gsap.registerPlugin(ScrollTrigger);

      const prefersReduced = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches;
      if (prefersReduced) return;

      ctx = gsap.context(() => {
        // Subtle parallax: the image translates slower than scroll
        gsap.fromTo(
          imageWrap,
          {y: 0},
          {
            y: -60,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          },
        );

        // Fade in tags with stagger
        const tagEls = section.querySelectorAll('[data-shoppable-tag]');
        gsap.fromTo(
          tagEls,
          {opacity: 0, scale: 0.6},
          {
            opacity: 1,
            scale: 1,
            duration: 0.6,
            ease: 'power3.out',
            stagger: 0.1,
            scrollTrigger: {
              trigger: section,
              start: 'top 60%',
              toggleActions: 'play none none none',
            },
          },
        );
      }, section);
    });

    return () => {
      ctx?.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full mb-12 md:mb-16 overflow-hidden"
    >
      {/* Hero image container — taller than viewport for scroll reveal */}
      <div
        ref={imageRef}
        className="relative w-full"
        style={{minHeight: '120vh'}}
      >
        <img
          src={heroImage}
          alt={altText}
          width={1440}
          height={1728}
          className="w-full h-full object-cover absolute inset-0"
          loading="eager"
        />

        {/* Placeholder gradient when image not loaded */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-primary/10 to-primary/30"
          aria-hidden="true"
        />

        {/* Product tags */}
        {tags.map((tag) => (
          <ShoppableTagMarker
            key={tag.productHandle}
            tag={tag}
            isActive={activeTag === tag.productHandle}
            onActivate={() => setActiveTag(tag.productHandle)}
            onDeactivate={() =>
              setActiveTag((prev) =>
                prev === tag.productHandle ? null : prev,
              )
            }
          />
        ))}
      </div>
    </section>
  );
}

function ShoppableTagMarker({
  tag,
  isActive,
  onActivate,
  onDeactivate,
}: {
  tag: ShoppableTag;
  isActive: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
}) {
  const markerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={markerRef}
      data-shoppable-tag
      className="absolute group"
      style={{left: `${tag.x}%`, top: `${tag.y}%`, transform: 'translate(-50%, -50%)'}}
    >
      {/* Connector line */}
      <div
        className="absolute left-1/2 bottom-full -translate-x-1/2 w-px bg-white/80 hidden md:block transition-all duration-base"
        style={{height: isActive ? 32 : 24}}
        aria-hidden="true"
      />

      {/* Circular marker */}
      <button
        type="button"
        className="relative z-10 w-5 h-5 md:w-6 md:h-6 rounded-full border-2 border-white bg-white/20 backdrop-blur-sm cursor-pointer transition-all duration-fast hover:bg-white/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        onClick={onActivate}
        onMouseEnter={onActivate}
        onMouseLeave={onDeactivate}
        aria-label={`${tag.label} — ${tag.price}`}
      >
        {/* Pulse ring */}
        <span
          className="absolute inset-0 rounded-full border border-white/60 animate-ping"
          style={{animationDuration: '2.5s'}}
          aria-hidden="true"
        />
        {/* Inner dot */}
        <span className="absolute inset-1.5 md:inset-2 rounded-full bg-white" aria-hidden="true" />
      </button>

      {/* Desktop tooltip — hover to reveal */}
      <div
        className={`
          absolute left-1/2 -translate-x-1/2 z-20 whitespace-nowrap pointer-events-none
          transition-all duration-base
          hidden md:block
          ${isActive ? 'opacity-100 -translate-y-2' : 'opacity-0 translate-y-0'}
        `}
        style={{bottom: 'calc(100% + 40px)'}}
      >
        <Link
          to={`/products/${tag.productHandle}`}
          className="pointer-events-auto block bg-white px-4 py-2.5 shadow-lg no-underline"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="block font-body text-xs font-medium tracking-wide uppercase text-text">
            {tag.label}
          </span>
          <span className="block font-body text-sm text-text/70 mt-0.5">
            {tag.price}
          </span>
        </Link>
      </div>

      {/* Mobile label — always visible, simplified */}
      <Link
        to={`/products/${tag.productHandle}`}
        className="md:hidden absolute left-full ml-2 top-1/2 -translate-y-1/2 z-20 bg-white/90 backdrop-blur-sm px-2.5 py-1.5 shadow-md no-underline whitespace-nowrap"
      >
        <span className="block font-body text-[10px] font-medium tracking-wide uppercase text-text leading-tight">
          {tag.label}
        </span>
        <span className="block font-body text-[10px] text-text/60">
          {tag.price}
        </span>
      </Link>
    </div>
  );
}
