import {useState, useRef, useEffect, useCallback} from 'react';
import {Link} from 'react-router';

interface SubcategoryLink {
  label: string;
  href: string;
}

interface PortalData {
  title: string;
  image: string;
  subcategories: SubcategoryLink[];
}

const PORTALS: PortalData[] = [
  {
    title: "Men's Apparel",
    image: '/images/portal-mens-placeholder.jpg',
    subcategories: [
      {label: 'New Temporada', href: '/collections/mens/new'},
      {label: 'Jeans', href: '/collections/mens/jeans'},
      {label: 'Apparel', href: '/collections/mens/apparel'},
      {label: 'Outerwear', href: '/collections/mens/outerwear'},
      {label: 'Shop All', href: '/collections/mens'},
    ],
  },
  {
    title: "Women's Apparel",
    image: '/images/portal-womens-placeholder.jpg',
    subcategories: [
      {label: 'New Temporada', href: '/collections/womens/new'},
      {label: 'Jeans', href: '/collections/womens/jeans'},
      {label: 'Apparel', href: '/collections/womens/apparel'},
      {label: 'Outerwear', href: '/collections/womens/outerwear'},
      {label: 'Shop All', href: '/collections/womens'},
    ],
  },
];

export default function CategoryPortals() {
  return (
    <section
      className="container-content py-16 md:py-24"
      aria-label="Shop by category"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {PORTALS.map((portal) => (
          <Portal key={portal.title} data={portal} />
        ))}
      </div>
    </section>
  );
}

function Portal({data}: {data: PortalData}) {
  const [expanded, setExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);

  const toggle = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  useEffect(() => {
    const titleEl = titleRef.current;
    const linksEl = linksRef.current;
    if (!titleEl || !linksEl) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    if (prefersReducedMotion) {
      titleEl.style.opacity = expanded ? '0' : '1';
      linksEl.style.opacity = expanded ? '1' : '0';
      linksEl.style.pointerEvents = expanded ? 'auto' : 'none';
      return;
    }

    let ctx: ReturnType<typeof import('gsap')['default']['context']>;

    import('gsap').then(({default: gsap}) => {
      ctx = gsap.context(() => {
        if (expanded) {
          gsap.to(titleEl, {
            opacity: 0,
            y: -10,
            duration: 0.3,
            ease: 'power2.out',
          });
          gsap.fromTo(
            linksEl.children,
            {opacity: 0, y: 20},
            {
              opacity: 1,
              y: 0,
              duration: 0.4,
              stagger: 0.06,
              ease: 'power2.out',
              delay: 0.1,
            },
          );
          gsap.set(linksEl, {pointerEvents: 'auto'});
        } else {
          gsap.to(titleEl, {
            opacity: 1,
            y: 0,
            duration: 0.3,
            ease: 'power2.out',
          });
          gsap.to(linksEl.children, {
            opacity: 0,
            y: 10,
            duration: 0.25,
            stagger: 0.03,
            ease: 'power2.out',
          });
          gsap.set(linksEl, {pointerEvents: 'none'});
        }
      }, containerRef);
    });

    return () => {
      ctx?.revert();
    };
  }, [expanded]);

  return (
    <div
      ref={containerRef}
      className="group relative aspect-[4/5] md:aspect-[3/4] overflow-hidden cursor-pointer"
      onClick={toggle}
      role="button"
      tabIndex={0}
      aria-expanded={expanded}
      aria-label={`${data.title} — ${expanded ? 'collapse' : 'expand'} subcategories`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle();
        }
      }}
    >
      {/* Background image */}
      <img
        src={data.image}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        width={800}
        height={1000}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-slow"
      />

      {/* Hover blur overlay (desktop) — always visible when expanded */}
      <div
        className={[
          'absolute inset-0 transition-all duration-base',
          expanded
            ? 'backdrop-blur-[10px] bg-black/30'
            : 'backdrop-blur-0 bg-black/10 md:group-hover:backdrop-blur-[10px] md:group-hover:bg-black/30',
        ].join(' ')}
        aria-hidden="true"
      />

      {/* Title + expand icon (default state) */}
      <div
        ref={titleRef}
        className="absolute inset-0 flex flex-col items-center justify-center gap-4"
      >
        <h3 className="font-heading text-2xl md:text-3xl text-white tracking-tight">
          {data.title}
        </h3>
        {/* (+) icon — always visible on mobile, visible on hover on desktop */}
        <span
          className={[
            'flex items-center justify-center w-10 h-10 rounded-full border border-white/60 text-white text-xl leading-none transition-opacity duration-fast',
            'md:opacity-0 md:group-hover:opacity-100',
          ].join(' ')}
          aria-hidden="true"
        >
          +
        </span>
      </div>

      {/* Subcategory links (expanded state) */}
      <div
        ref={linksRef}
        className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none"
        aria-hidden={!expanded}
      >
        {data.subcategories.map((sub) => (
          <Link
            key={sub.href}
            to={sub.href}
            prefetch="intent"
            tabIndex={expanded ? 0 : -1}
            className="text-white font-body text-sm md:text-base tracking-wide uppercase opacity-0 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
            onClick={(e) => e.stopPropagation()}
          >
            {sub.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
