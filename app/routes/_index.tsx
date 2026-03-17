import {Await, useLoaderData} from 'react-router';
import type {Route} from './+types/_index';
import {Suspense, useRef, useEffect} from 'react';
import type {HighlightProduct} from '~/components/home/HighlightsCarousel';
import HeroVideo from '~/components/home/HeroVideo';
import CategoryPortals from '~/components/home/CategoryPortals';
import HighlightsCarousel from '~/components/home/HighlightsCarousel';
import InstagramGrid from '~/components/home/InstagramGrid';
import Skeleton from '~/components/ui/Skeleton';
import SectionDivider from '~/components/ui/SectionDivider';
import {
  buildPageMeta,
  organizationJsonLd,
  getOriginFromMatches,
} from '~/lib/utils/seo';

export const meta: Route.MetaFunction = ({matches}) => {
  const origin = getOriginFromMatches(matches);
  return [
    ...buildPageMeta({
      title: 'Cowboy | Western Luxury',
      description:
        "Premium western fashion — crafted for the modern West. Shop new arrivals in men's and women's apparel, jeans, outerwear, and hats.",
      url: origin ? `${origin}/` : '/',
      appendSiteName: false,
    }),
    {'script:ld+json': organizationJsonLd(origin)},
  ];
};

export async function loader(args: Route.LoaderArgs) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return {...deferredData, ...criticalData};
}

async function loadCriticalData({context}: Route.LoaderArgs) {
  return {
    isShopLinked: Boolean(context.env.PUBLIC_STORE_DOMAIN),
  };
}

function loadDeferredData({context}: Route.LoaderArgs) {
  const highlightProducts = context.storefront
    .query(HIGHLIGHTS_COLLECTION_QUERY, {
      variables: {handle: 'frontpage', first: 8},
    })
    .catch((error: Error) => {
      console.error(error);
      return null;
    });

  return {highlightProducts};
}

export default function Homepage() {
  const data = useLoaderData<typeof loader>();
  const mainRef = useRef<HTMLDivElement>(null);

  // GSAP ScrollTrigger reveal animations for each section
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
          // Select all sections after the hero (hero has its own entrance anim)
          const sections = main.querySelectorAll('[data-reveal]');

          sections.forEach((section) => {
            const children = section.querySelectorAll('[data-reveal-child]');
            const targets =
              children.length > 0 ? children : [section];

            // Directional x-offset for CategoryPortals children
            const isPortals = section.hasAttribute('data-reveal-portals');
            if (isPortals && children.length >= 2) {
              // Left portal slides from left, right portal from right
              Array.from(children).forEach((child, idx) => {
                gsap.fromTo(
                  child,
                  {opacity: 0, y: 40, scale: 0.98, x: idx === 0 ? -20 : 20},
                  {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    x: 0,
                    duration: 0.8,
                    delay: idx * 0.12,
                    ease: 'power2.out',
                    scrollTrigger: {
                      trigger: section,
                      start: 'top 85%',
                      once: true,
                    },
                  },
                );
              });
            } else {
              gsap.fromTo(
                targets,
                {opacity: 0, y: 40, scale: 0.98},
                {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  duration: 0.8,
                  stagger: 0.12,
                  ease: 'power2.out',
                  scrollTrigger: {
                    trigger: section,
                    start: 'top 85%',
                    once: true,
                  },
                },
              );
            }
          });
        }, main);
      },
    );

    return () => {
      ctx?.revert();
    };
  }, []);

  return (
    <div ref={mainRef} className="home">
      {/* 1. Hero Video — full viewport */}
      <HeroVideo />

      <SectionDivider variant="diamond" />

      {/* 2. Category Portals — Men's / Women's */}
      <div data-reveal data-reveal-portals>
        <CategoryPortals />
      </div>

      <SectionDivider variant="line" />

      {/* 3. Highlights Carousel — featured products */}
      <div data-reveal>
        <Suspense
          fallback={
            <HighlightsLoading />
          }
        >
          <Await resolve={data.highlightProducts}>
            {(response) => {
              const products: HighlightProduct[] =
                response?.collection?.products?.nodes ?? [];
              return <HighlightsCarousel products={products} />;
            }}
          </Await>
        </Suspense>
      </div>

      <SectionDivider variant="diamond" />

      {/* 4. Instagram Grid */}
      <div data-reveal>
        <InstagramGrid />
      </div>

      <SectionDivider variant="line" />
    </div>
  );
}

function HighlightsLoading() {
  return (
    <section className="py-16 md:py-24" aria-label="Loading highlights">
      <div className="container-content mb-8">
        <Skeleton className="h-10 w-48" />
      </div>
      <div className="flex gap-4 md:gap-6 px-[var(--side-padding)]">
        {Array.from({length: 4}).map((_, i) => (
          <div key={i} className="flex-shrink-0 w-[280px] md:w-[320px] lg:w-[360px]">
            <Skeleton className="aspect-[3/4] w-full mb-3" />
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        ))}
      </div>
    </section>
  );
}

const HIGHLIGHTS_COLLECTION_QUERY = `#graphql
  query HighlightsCollection(
    $handle: String!
    $first: Int!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      title
      products(first: $first, sortKey: BEST_SELLING) {
        nodes {
          id
          handle
          title
          featuredImage {
            id
            url
            altText
            width
            height
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
` as const;
