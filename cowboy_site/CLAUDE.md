# CLAUDE.md — Cowboy Website (Premium Western Fashion E-Commerce)

## Project Identity

A **premium headless e-commerce website** for a western apparel brand. The design philosophy is **"Western Luxury"** — the sophistication and UX polish of high-fashion houses (Zara navigation, Gucci-level PDP experience) applied to cowboy/rancher fashion. The site must feel aspirational, editorial, and meticulously designed — never like a generic Shopify template.

**Reference sites:** [kimesranch.com](https://kimesranch.com/), [doubledranch.com](https://doubledranch.com/), [stetson.com](https://stetson.com/), [gucci.com](https://gucci.com/).

---

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| **Framework** | Shopify Hydrogen (Remix + React) | Headless architecture. App-like UX with native Shopify ecosystem integration. |
| **Backend / CMS** | Shopify Storefront API (GraphQL) | Single source of truth for products, inventory, variants, customers. |
| **Hosting** | Shopify Oxygen | Global edge hosting, zero third-party server costs. Included with Shopify subscription. |
| **Styling** | Tailwind CSS | Configured with the brand's custom design tokens. |
| **Animation** | GSAP (GreenSock) | Complex chained animations, scroll-triggered reveals, luxurious easing. Replaces standard CSS transitions for hero interactions, page transitions, and micro-interactions. |
| **Deployment (Phase 1)** | Cloudflare Pages | Initial prototype/proposal deployment before Hydrogen/Oxygen migration. See "Migration Path" section. |

### Cloudflare → Hydrogen Migration Path

Phase 1 deploys on Cloudflare Pages as a functional storefront prototype (not just static). Cart functionality, routing, and data fetching must be architected with Hydrogen migration in mind from day one. Use Remix conventions, Shopify Storefront API patterns, and component structures that translate directly to Hydrogen/Oxygen without rewrites.

---

## Design System

### Color Palette

```
Primary:        #3F1E1F   (deep oxblood — headers, CTAs, primary UI elements)
Accent:         #3F1E1F   (pure red — links, hover states, secondary actions, emphasis)
Background:     #FFFFFF   (clean white — page backgrounds)
Text Primary:   #3C3737   (warm charcoal — body text)
Link:           #3F1E1F   (same as accent)
```

Configure these as Tailwind theme tokens AND CSS custom properties for GSAP animation access:

```css
:root {
  --color-primary: #3F1E1F;
  --color-accent: #3F1E1F;
  --color-bg: #FFFFFF;
  --color-text: #3C3737;
}
```

> **A11y note:** `#FF0000` on `#FFFFFF` has a contrast ratio of ~4.0:1 — passes AA for large text (≥18px / 14px bold) but fails AA for normal body text (needs 4.5:1). Use `--color-accent` for headings, links, buttons, and UI elements only. Body text must always use `--color-text` (#3C3737 on white = ~10.5:1, passes). For small red text, consider darkening to `#D40000` (~5.3:1) to meet AA on all sizes.

### Typography

**Fonts:**
- **Heading:** Lora (serif) — refined, editorial, warm. Used for all headings, display text, and hero copy.
- **Body:** GT America (sans-serif) — clean, modern, highly legible. Used for body text, UI labels, navigation, CTAs, and all non-heading content.

Both fonts must be **self-hosted** in `/public/fonts/` (WOFF2 format primary, WOFF fallback). No external Google Fonts CDN calls — they add latency and GDPR surface area.

> **Licensing:** GT America is a commercial typeface from Grilli Type. Ensure a valid web font license is acquired before production deployment. Lora is open-source (Google Fonts / SIL Open Font License).

```css
:root {
  --font-heading: 'Lora', Georgia, serif;
  --font-body: 'GT America', 'Helvetica Neue', Helvetica, Arial, sans-serif;
}
```

**Type Scale:**

```
/* Base sizes (from spec) */
body:   16px (1rem)     / line-height: 1.5   / font: GT America
h1:     36px (2.25rem)  / line-height: 1.15  / font: Lora
h2:     56px (3.5rem)   / line-height: 1.1   / font: Lora

/* Extended scale (derived, use for intermediate elements) */
h3:     28px (1.75rem)  / line-height: 1.2   / font: Lora
h4:     22px (1.375rem) / line-height: 1.3   / font: Lora
h5:     18px (1.125rem) / line-height: 1.4   / font: Lora
h6:     16px (1rem)     / line-height: 1.5   / font: Lora (weight differentiated)

/* Utility sizes */
text-sm:   14px (0.875rem) / line-height: 1.4  / GT America (captions, metadata, filter chips)
text-xs:   12px (0.75rem)  / line-height: 1.33 / GT America (legal, fine print)
text-lg:   18px (1.125rem) / line-height: 1.6  / GT America (lead paragraphs, intros)

/* Hero / Display (used sparingly — home hero, New Collection hero) */
text-hero: clamp(2.5rem, 5vw, 4.5rem) / line-height: 1.05 / font: Lora
```

**Letter Spacing:**

```
--tracking-tight:    -0.02em   (Lora headings at large sizes — h1, h2, hero)
--tracking-normal:   0         (body text, default)
--tracking-wide:     0.05em   (GT America in nav items, CTAs, labels)
--tracking-widest:   0.1em    (uppercase utility text, "SHOP ALL", "ADD TO BAG")
```

**Weight Usage:**
- Lora: Regular (400) for headings, Medium/SemiBold (500/600) for hero display. Italic for editorial accent if needed.
- GT America: Regular (400) for body, Medium (500) for UI labels/nav/CTAs, Bold (700) sparingly for strong emphasis.

> **Note on h2 being larger than h1:** The spec defines h2 at 56px and h1 at 36px. This is intentional — h2 is used as the oversized display heading on interior pages (category heroes, section titles), while h1 serves as the primary page identifier at a more restrained size. Maintain semantic HTML (`<h1>` is always the page title) regardless of visual size. Use CSS classes (e.g., `.heading-display` for 56px treatment) rather than tying visual size to heading level.

### Spacing & Layout

- **Max content width:** 1440px (with generous side padding)
- **Side padding:** `clamp(1.25rem, 4vw, 4rem)` — generous on all breakpoints
- **Section spacing:** Large, breathing gaps between page sections. The luxury is communicated through whitespace.
- **Grid:** 12-column grid for desktop layouts. Single column for mobile with clear vertical rhythm.

### Animation Language (GSAP)

Define consistent motion tokens:

```
/* Durations */
--duration-fast:    0.2s    (hover states, micro-interactions)
--duration-base:    0.4s    (element transitions, accordions)
--duration-slow:    0.8s    (page reveals, hero transitions)
--duration-slower:  1.2s    (scroll-triggered reveals)

/* Easing */
--ease-out:         power2.out     (most transitions)
--ease-in-out:      power2.inOut   (reversible states)
--ease-luxury:      power3.out     (hero reveals, premium feel)
--ease-bounce:      NEVER          (zero bounce/elastic — cheapens the brand)

/* Patterns */
- Page transitions: fade with subtle translateY (20-30px)
- Scroll reveals: staggered fade-up, 0.1s delay between elements
- Hover states: opacity/color shift, ~0.2s
- Accordion expand: smooth height animation with content fade, 0.3-0.4s
- Menu open: full-page translateY reveal, 0.6-0.8s
```

---

## Site Architecture & Routing

### Navigation (Zara-Style Full-Page Menu)

A hidden lateral menu that opens as a **full-page modal overlay** on click. Engineered with GSAP `translateY/X` and scroll-locking on `document.body`.

**Desktop:** Full-page overlay with categories laid out spaciously.
**Mobile:** Same full-page approach, optimized for touch. No hover states — everything is tap-based.

```
Navbar
├── New Collection
├── Men's
│   ├── New Men's [Temporada]
│   ├── Jeans
│   ├── Apparel
│   ├── Outerwear
│   └── Shop All Men's
├── Women's
│   ├── New Women's [Temporada]
│   ├── Jeans
│   ├── Apparel
│   ├── Outerwear
│   └── Shop All Women's
├── Hats
│   └── Shop All
├── Brand
├── Contact
│   └── FAQ
```

### Page Routes

```
/                           → Home
/collections/new            → New Collection (special hero with shoppable image)
/collections/mens           → Men's (mother category)
/collections/mens/jeans     → Men's Jeans (filtered view, different hero)
/collections/mens/apparel   → Men's Apparel
/collections/mens/outerwear → Men's Outerwear
/collections/mens/new       → New Men's Temporada
/collections/womens         → Women's (mother category)
/collections/womens/jeans   → Women's Jeans
/collections/womens/apparel → Women's Apparel
/collections/womens/outerwear → Women's Outerwear
/collections/womens/new     → New Women's Temporada
/collections/hats           → Hats
/products/:handle           → Product Detail Page (PDP)
/brand                      → Brand Story
/contact                    → Contact
/faq                        → FAQ
/404                        → Custom 404 page
```

> **Note:** There is no `/cart` route. The cart is a slide-out drawer accessible from any page via the header cart icon or "Add to Bag" actions.

---

## Page Specifications

### 1. HOME PAGE

**Flow (top to bottom):**

```
Hero (video background) → Category Portals (Men's / Women's) → Highlights Collection → Instagram Feed → Footer
```

#### Hero Section
- **Background:** Optimized short-looping video (2-3 second clips). Use `playsinline`, `muted`, `loop`, `autoplay` attributes.
- **Codec:** Compress via modern web codecs (H.265/HEVC with H.264 fallback). Zero impact on initial page load — lazy/deferred loading.
- **Content overlay:** Simple text referencing new collection / new arrivals / season. One CTA button linking to the referenced collection.
- **Mobile:** Provide a high-quality poster image fallback for iOS autoplay restrictions. Consider a shorter clip or static image with subtle Ken Burns effect.

#### Interactive Category Portals (Men's / Women's)
Two large image blocks side by side (stacked on mobile):

- **Default state:** Full image with category title overlay ("Men's Apparel" / "Women's Apparel").
- **Hover state (desktop):** `backdrop-filter: blur(10px)` applied via hardware-accelerated CSS. A `(+)` icon appears below the title.
- **Click/tap state:** The `(+)` triggers a React state change. The title fades and subcategory links slide in within the same container (New Temporada, Jeans, Apparel, Outerwear, Shop All). Transition must feel clean, sencilla, and luxurious.
- **Mobile adaptation:** Since hover doesn't exist on touch, the `(+)` icon is always visible. Tap toggles the subcategory expansion.

#### Highlights Collection (Video-on-Hover Product Cards)
A horizontal carousel of featured/high-value products.

- **Card structure:** Dual-media DOM — a static `<img>` sits atop a pre-loaded hidden `<video>`.
- **Desktop:** `onmouseenter` triggers video playback + opacity crossfade. `onmouseleave` reverses. Creates a "living product" effect.
- **Mobile:** Video plays on tap or on viewport entry via IntersectionObserver. Consider autoplay with sound off.
- **Below each card:** Product name + price.

#### Instagram Feed / Social Collage
- **Desktop:** 3×3 CSS Grid of photos/videos. `aspect-ratio: 1/1` with `object-fit: cover`.
- **Mobile:** 2×3 grid (2 columns, 3 rows).
- Each item links to the specific Instagram post.
- Mix photos and videos strategically for visual variety (not all static).
- Color/aesthetic cohesion between the images matters — curate for a good collage effect.

#### Footer
Spacious and minimal:
- Email newsletter signup input + submit button.
- Links organized by: Customer Service, About the Company, Store Info, Social Media.
- Generous whitespace. No clutter.

### 2. CATEGORY PAGES (PLP — Product Listing Pages)

Shared layout for **Men's, Women's, Hats**, and all subcategories.

#### Hero Section (Category)
- **Layout:** Split-screen. Left side: category title + brief description copy. Right side: category lifestyle image.
- **Subcategories** (e.g., Men's > Jeans) share this layout with different hero images and copy, but the product grid below is simply a filtered view of the parent category.

#### Product Grid
- **Max 24 products per page.**
- **Pagination:** Cursor-based pagination via Storefront API. "Next/Previous" buttons at the bottom of the grid. No infinite scroll — pagination keeps the experience controlled and predictable, preserves footer accessibility, and is more SEO-friendly.
- **Filter & Sort:** Required but spec needs definition:
  - **Filter facets:** Size, Color, Price Range, Material (at minimum).
  - **Filter UI:** Sidebar drawer on desktop, modal/bottom sheet on mobile. Horizontal chips for active filters.
  - **Sort options:** Newest, Price Low→High, Price High→Low, Best Selling.
  - **Active filter state:** Visible chips showing applied filters with clear "×" to remove.
- **Product cards:** Image + product name + price. Clean, minimal. Consistent aspect ratios.

### 3. NEW COLLECTION PAGE

**Special hero treatment** — more editorial than standard category pages:

- **Shoppable Hero:** Full-width hero with a model wearing a complete outfit from the collection. Products on the model are tagged with connecting lines/pointers showing product name + price.
  - **Tag positioning (V1):** Manually placed via hardcoded coordinates in a config/data file (e.g., a JSON map of `{ productHandle, x%, y%, label, price }`). Each tag is an absolutely positioned element with a line/connector to the product area on the image. This keeps V1 fast to ship without CMS dependencies.
  - **Tag positioning (Future):** If greenlit, migrate tag coordinates to Shopify metafields (product or collection level) so the marketing team can manage them without code changes. The component should be architected now to accept tag data from any source (props), making the swap from hardcoded JSON → Shopify metafield query seamless.

  **V1 tag data format** (`lib/data/shoppable-tags.json`):
  ```json
  {
    "collection-spring-2026": {
      "heroImage": "/images/collections/spring-2026-hero.jpg",
      "tags": [
        { "productHandle": "western-denim-jacket", "label": "Western Denim Jacket", "price": "$285", "x": 45, "y": 22 },
        { "productHandle": "ranch-belt-brown", "label": "Ranch Belt", "price": "$95", "x": 50, "y": 58 }
      ]
    }
  }
  ```
  `x` and `y` are percentages relative to the hero image dimensions so they scale responsively.

  - **Desktop hover:** Tags highlight on hover, can click to jump to PDP.
  - **Mobile tap:** Tags are tap-to-reveal or always visible in a simplified format.
- **Scroll behavior:** The hero is taller than the viewport. User scrolls down to "reveal" the full model image and all tagged products. Parallax-subtle, controlled GSAP scroll animation.
- Below the hero: standard product grid with filter/sort (same as other PLPs).

### 4. PRODUCT DETAIL PAGE (PDP)

**This is the most important page.** Architecture inspired by Gucci's PDP — the product must dominate the experience.

#### Design Philosophy
The page is not an interface that contains a product — it's an **environment built around the product.** The user's journey: **see → understand → discover → buy → explore details.**

#### Structure (Top to Bottom)

**A. Hero Visual / Editorial Gallery**
- Not a generic slider. An **editorial image sequence.**
- Image types needed per product: hero frontal, 3/4 angular view, model shot, close-up (texture/stitching/material), composition double (side-by-side views), interior/functional detail.
- **Desktop:** Large images within the main area. Some in double composition. Thumbnail navigation — subtle, discrete. Zoom capability without breaking UI cleanliness.
- **Mobile:** Full-width swipe gallery. Fluid swipe, discrete progress indicator. Pinch-to-zoom. The product image dominates the initial viewport.

**B. Commercial Zone (Buy Module)**
Hierarchical information:

- **Level 1 (Immediate):** Product name, price, selected color/variant, size selector, "Add to Bag" CTA.
- **Level 2 (Decision support):** Color/variant swatches (visual thumbnails, not just color dots), size guide link, availability, shipping estimate, returns info.
- **Level 3 (Trust/brand):** Services, customer support links, materials summary.

**Variant Selection:**
- Visual selector (thumbnail images) for colorways, prints, washes — anything that changes appearance.
- Text/tabular selector for sizes, fit, length/inseam.
- States: selected, hover, out-of-stock (greyed + strikethrough), low-stock, notify-me.

**Add to Bag CTA:**
- Full-width within the buy column. Generous height. High contrast.
- States: default, hover (subtle tone shift — no playful effects), focus, disabled (waiting for size/variant selection — clear message), loading, added-to-bag (brief confirmation).
- On successful add: the cart slide-out drawer opens automatically with the newly added item highlighted.

**C. Sticky Buy Module (Desktop)**
- The commercial zone becomes `position: sticky` as the user scrolls into the editorial/details section.
- Contains: CTA, delivery estimate, service links, returns/shipping.
- Stops before colliding with recommended products or footer.
- Dynamic `top` offset accounting for fixed header height.
- **Critical CSS:** No ancestor with `overflow: hidden/auto` that would break sticky. Calculate `max-height` for variable content.

**D. Editorial Information Layer**
- Product description: short editorial copy — presents spirit/materials/inspiration. Not a wall of specs.
- Accordion sections (expandable):
  - Product Details
  - Size & Fit
  - Materials & Care
  - Shipping & Returns
  - Craft / Construction / Origin (if applicable)
- Accordion design: generous row height, subtle dividers, minimal expand icon, smooth GSAP height animation, full keyboard accessibility (`button`, `aria-expanded`).

**E. Recommended Products ("You May Also Like")**
- Feels like a curated continuation of the collection, not a bolt-on.
- Desktop: wide grid/carousel with large product cards.
- Mobile: horizontal scroll carousel.
- Cross-sell without aggression: same family, complementary pieces, "complete the look."

**F. Breadcrumbs**
- Discrete. Positioned above product info or after recommendations.
- Provides navigation context + return to category.

#### Mobile PDP Sequence
1. Compact header
2. Full-width product image (dominant)
3. Gallery progress indicator
4. Product name
5. Price
6. Variants / color / size
7. Add to Bag CTA
8. Services / shipping / returns
9. Description
10. Accordions
11. Recommended products
12. Breadcrumbs

**Mobile sticky CTA option:** If implemented, use an extremely minimal bottom bar that appears only after scrolling past the main CTA. Must respect device safe areas. Must feel premium, not aggressive.

### 5. BRAND PAGE

Storytelling page with editorial aesthetic (reference: H Bar C "Our History"):
- Opens with a full-width lifestyle photo.
- Alternating text blocks and media (2 video compilations showing brand lifestyle clips).
- Copy covers: brand story, mission, values, craftsmanship, heritage.
- Maximum ~3 media pieces total. Let whitespace and typography carry the premium feel.

### 6. CONTACT PAGE

- **Top:** Contact form — Name, Email, Phone, Message fields. Clean, spacious form design.
- **Below:** Company phone (click-to-call via `tel:` link), business hours, welcoming copy.
- Form validation: elegant inline error states, not alarming. Success state: clean confirmation message.

### 7. FAQ PAGE

- Accordion-based Q&A list.
- Respects site color palette and typography.
- Each question expands on click with smooth animation.
- Clean dividers between items.

---

## Cart Experience — Slide-Out Drawer

The cart is a **slide-out drawer** (no dedicated `/cart` page). Opens on "Add to Bag" and from the cart icon in the header.

**Drawer contents:**
- Item list with: product image thumbnail, name, selected variant, quantity selector (+/−), remove button, line price.
- Subtotal display.
- Free shipping threshold indicator (if applicable).
- "Checkout" CTA → passes to Shopify secure checkout via Hydrogen hooks.
- Upsell/cross-sell section (optional, keep minimal — max 2 items).
- Estimated delivery info.
- **Empty cart state:** Styled on-brand layout with "Continue Shopping" CTA. Never a broken or blank state.

**Drawer behavior:**
- Slides in from the right with GSAP animation (0.3-0.4s, `power2.out`).
- Scroll-locks the body behind it.
- Backdrop overlay (semi-transparent) — click to close.
- Close button (×) clearly visible.
- Focus trap while open (a11y).
- On mobile: drawer takes full viewport width. Same content, optimized touch targets.

---

## Performance & Loading Strategy

### Image Optimization
- Serve WebP/AVIF with JPEG fallback.
- Responsive `srcset` with multiple breakpoints.
- Lazy loading (`loading="lazy"`) for everything below the fold.
- Hero/above-fold images: preloaded via `<link rel="preload">`.
- Product images: explicit `width`/`height` attributes to prevent CLS.

### Video Strategy
- Hero video: compress aggressively, preload poster frame, defer video load.
- Hover-to-play videos (Highlights carousel): use IntersectionObserver to load only when cards enter viewport. Do NOT preload all videos on page load.
- Serve multiple formats: MP4 (H.264) + WebM (VP9).

### Core Web Vitals Targets
- **LCP:** < 2.5s
- **CLS:** < 0.1
- **INP:** < 200ms

### Loading States
- Skeleton screens for API-fetched product grids.
- Placeholder shimmer animations for product cards while loading.
- Progressive image loading (blur-up or LQIP technique).

### Critical CSS
- Inline above-the-fold critical CSS.
- Defer non-critical stylesheets.

---

## Accessibility (WCAG 2.1 AA)

- **Keyboard navigation:** Full-screen menu, accordions, product galleries, variant selectors, cart drawer — all fully operable via keyboard.
- **Focus management:** When modals/drawers open, trap focus inside. When closed, return focus to trigger element.
- **Screen readers:** All product cards, form inputs, and interactive elements have proper ARIA labels.
- **Alt text:** Every product image and lifestyle photo needs descriptive alt text. Strategy: "[Product Name] - [View Type]" (e.g., "Western Denim Jacket - Front View").
- **Color contrast:** Verify all text/background combinations. `#FF0000` on `#FFFFFF` passes AA only for large text (≥18px). Use `--color-text` (#3C3737) for all body text. See Design System A11y note for red text guidance.
- **Reduced motion:** Respect `prefers-reduced-motion` — disable GSAP animations, video autoplay, and parallax for users who request it.
- **Focus visible:** Styled focus outlines that are visible and match the design system.
- **Semantic HTML:** Proper heading hierarchy (`h1` → `h6`), landmark regions, `<nav>`, `<main>`, `<footer>`.

---

## SEO & Metadata

- **Structured data:** Implement `Product`, `BreadcrumbList`, `Organization`, and `FAQPage` JSON-LD schemas.
- **Meta tags:** Unique `<title>` and `<meta description>` per page type. Dynamic for product and category pages.
- **Canonical URLs:** Especially for filtered/paginated PLPs to avoid duplicate content.
- **Open Graph / Social:** `og:title`, `og:description`, `og:image` for all shareable pages. Twitter Card tags.
- **Sitemap:** Auto-generated `sitemap.xml` including all products, collections, and static pages.
- **URL structure:** Clean, semantic (as defined in Routes section). No query params for primary navigation.

---

## Empty & Error States

Design these with the same care as primary pages:

- **404 page:** On-brand design with navigation back to home/collections.
- **Empty search results:** Helpful message + suggested collections.
- **No products matching filters:** Clear message + "Clear filters" CTA.
- **Out-of-stock product:** Grayed variant + "Notify Me" option. Never a dead end.
- **Form validation errors:** Inline, elegant, non-alarming.
- **Network error / offline:** Graceful fallback message.
- **Empty cart:** Styled state with "Continue Shopping" CTA.

---

## Analytics & Tracking

- **GA4 / GTM integration:** Implement from launch.
- **E-commerce events:** `view_item`, `add_to_cart`, `begin_checkout`, `purchase`, `view_item_list`, `select_item`.
- **Heatmap/session recording:** Prepare for tools like Hotjar/FullStory (add script hooks).
- **A/B testing:** Architecture should support feature flags for future testing.

---

## Future Considerations (Not in V1 but architect for them)

- **Customer accounts:** Login, registration, order history, saved addresses.
- **Wishlist / Favorites:** Save products for later.
- **Search:** Full-text product search with autocomplete.
- **Internationalization:** Multi-language support structure.
- **Aillin Bot Integration:** AI chatbot for the website. Spec TBD — leave integration hooks but no implementation yet.

---

## Project Structure (Recommended)

```
cowboy-website/
├── CLAUDE.md                     # This file
├── README.md                     # Project setup & run instructions
├── package.json
├── remix.config.js               # Remix/Hydrogen config
├── tailwind.config.ts            # Custom design tokens
├── tsconfig.json
├── public/
│   ├── fonts/                    # Self-hosted: Lora (woff2), GT America (woff2)
│   ├── videos/                   # Hero & product hover videos
│   └── favicon.ico
├── app/
│   ├── root.tsx                  # Root layout, global providers
│   ├── entry.client.tsx
│   ├── entry.server.tsx
│   ├── styles/
│   │   ├── tailwind.css          # Tailwind directives + custom properties
│   │   └── fonts.css             # @font-face declarations
│   ├── lib/
│   │   ├── shopify.ts            # Storefront API client setup
│   │   ├── queries/              # GraphQL query fragments
│   │   │   ├── product.ts
│   │   │   ├── collection.ts
│   │   │   └── cart.ts
│   │   ├── utils/
│   │   │   ├── animation.ts      # GSAP utility functions & presets
│   │   │   ├── media.ts          # Image/video optimization helpers
│   │   │   └── seo.ts            # Meta tag & structured data generators
│   │   └── constants.ts          # Site-wide constants (nav structure, etc.)
│   │   └── data/
│   │       └── shoppable-tags.json  # Manually placed product tag coordinates for New Collection hero
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx        # Navbar with menu trigger
│   │   │   ├── FullScreenMenu.tsx  # Zara-style overlay navigation
│   │   │   ├── Footer.tsx
│   │   │   └── AnnouncementBar.tsx # Optional top bar
│   │   ├── home/
│   │   │   ├── HeroVideo.tsx
│   │   │   ├── CategoryPortals.tsx  # Men's/Women's interactive blocks
│   │   │   ├── HighlightsCarousel.tsx  # Video-on-hover product cards
│   │   │   └── InstagramGrid.tsx
│   │   ├── product/
│   │   │   ├── ProductGallery.tsx      # Editorial image gallery
│   │   │   ├── ProductInfo.tsx         # Name, price, description
│   │   │   ├── VariantSelector.tsx     # Visual + text selectors
│   │   │   ├── AddToBag.tsx            # CTA with all states
│   │   │   ├── StickyBuyModule.tsx     # Desktop sticky wrapper
│   │   │   ├── ProductAccordions.tsx   # Details, Size & Fit, etc.
│   │   │   ├── TrustSignals.tsx        # Shipping, returns, services
│   │   │   └── RecommendedProducts.tsx
│   │   ├── collection/
│   │   │   ├── CollectionHero.tsx      # Split-screen hero
│   │   │   ├── ProductGrid.tsx         # Card grid with pagination
│   │   │   ├── FilterDrawer.tsx        # Filter sidebar/modal
│   │   │   ├── SortDropdown.tsx
│   │   │   ├── ActiveFilters.tsx       # Chip display
│   │   │   └── ShoppableHero.tsx       # New Collection tagged image
│   │   ├── cart/
│   │   │   ├── CartDrawer.tsx          # Slide-out cart
│   │   │   ├── CartItem.tsx
│   │   │   └── CartEmpty.tsx
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Accordion.tsx           # Reusable accordion primitive
│   │       ├── Skeleton.tsx            # Loading skeleton
│   │       ├── VideoPlayer.tsx         # Optimized video component
│   │       ├── ResponsiveImage.tsx     # srcset + lazy loading
│   │       └── Breadcrumbs.tsx
│   └── routes/
│       ├── _index.tsx                  # Home
│       ├── collections.$handle.tsx     # All collection pages
│       ├── collections.$handle.$sub.tsx # Subcategory filtered views
│       ├── products.$handle.tsx        # PDP
│       ├── brand.tsx
│       ├── contact.tsx
│       ├── faq.tsx
│       └── $.tsx                       # 404 catch-all
```

---

## Development Guidelines

### Code Style
- TypeScript strict mode.
- Functional components only (no class components).
- Prefer server-side data loading via Remix `loader` functions.
- Co-locate GraphQL queries with their route files or in `lib/queries/`.
- Component files export a single default component.

### Naming Conventions
- Components: `PascalCase` files and exports.
- Utilities/hooks: `camelCase`.
- CSS classes: Tailwind utilities. Custom classes only when Tailwind is insufficient. Use `@apply` sparingly.
- Routes: Follow Remix file-based routing conventions.

### Commit Discipline
- Atomic commits per feature/component.
- Prefix: `feat:`, `fix:`, `style:`, `perf:`, `a11y:`, `seo:`, `refactor:`, `docs:`.

### Testing Priorities
1. Cart functionality (add, remove, update, checkout handoff).
2. Filter/sort logic on PLPs.
3. Responsive layout breakpoints.
4. Accessibility (keyboard nav, screen reader).
5. Core Web Vitals (Lighthouse CI).

---

## Key Design Principles (for every component and page)

1. **Product is the protagonist.** Every layout decision serves the product, not the UI.
2. **Whitespace is luxury.** Generous spacing communicates premium positioning. When in doubt, add more space.
3. **Motion is refinement, not spectacle.** Smooth, controlled, short. Never bouncy, never flashy.
4. **Mobile is a reinterpretation, not a degradation.** The mobile experience should feel intentionally designed, not squeezed down.
5. **Consistency over cleverness.** Every page should feel like it belongs to the same brand system.
6. **No hover-only interactions.** Everything that works on hover must have a touch/tap equivalent.
7. **The brand palette is law.** Oxblood (#3F1E1F), red (#FF0000), white (#FFFFFF), warm charcoal (#3C3737). No rogue colors. Every element traces back to these tokens.