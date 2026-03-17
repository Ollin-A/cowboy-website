/**
 * Component Library — Visual Test Route
 * Renders every UI primitive in every state for verification.
 * Available at /components
 */
import {useState} from 'react';
import Button from '~/components/ui/Button';
import Accordion from '~/components/ui/Accordion';
import ResponsiveImage from '~/components/ui/ResponsiveImage';
import Skeleton from '~/components/ui/Skeleton';
import Breadcrumbs from '~/components/ui/Breadcrumbs';

export default function ComponentLibrary() {
  return (
    <div className="container-content" style={{paddingTop: '2rem', paddingBottom: '6rem'}}>
      <h1 style={{marginBottom: '0.5rem'}}>Component Library</h1>
      <p className="text-sm text-text/60 font-body" style={{marginBottom: '3rem'}}>
        UI primitives rendered in every variant and state.
      </p>

      <ButtonSection />
      <AccordionSection />
      <ResponsiveImageSection />
      <SkeletonSection />
      <BreadcrumbsSection />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Button
   ═══════════════════════════════════════════════════════════════════════════ */

function ButtonSection() {
  const [loading, setLoading] = useState(false);

  const simulateLoading = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <Section title="Button">
      {/* Variants */}
      <SubSection label="Variants">
        <div className="flex flex-wrap gap-4 items-center">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="accent">Accent</Button>
        </div>
      </SubSection>

      {/* Sizes */}
      <SubSection label="Sizes">
        <div className="flex flex-wrap gap-4 items-center">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
      </SubSection>

      {/* States */}
      <SubSection label="States">
        <div className="flex flex-wrap gap-4 items-center">
          <Button>Default</Button>
          <Button disabled>Disabled</Button>
          <Button loading={loading} onClick={simulateLoading}>
            {loading ? 'Loading...' : 'Click to Load'}
          </Button>
        </div>
      </SubSection>

      {/* Full Width */}
      <SubSection label="Full Width">
        <div style={{maxWidth: '400px'}}>
          <Button fullWidth size="lg">
            Add to Bag
          </Button>
        </div>
      </SubSection>

      {/* All Variants Disabled */}
      <SubSection label="All Variants — Disabled">
        <div className="flex flex-wrap gap-4 items-center">
          <Button variant="primary" disabled>Primary</Button>
          <Button variant="secondary" disabled>Secondary</Button>
          <Button variant="accent" disabled>Accent</Button>
        </div>
      </SubSection>

      {/* All Variants Loading */}
      <SubSection label="All Variants — Loading">
        <div className="flex flex-wrap gap-4 items-center">
          <Button variant="primary" loading>Primary</Button>
          <Button variant="secondary" loading>Secondary</Button>
          <Button variant="accent" loading>Accent</Button>
        </div>
      </SubSection>

      {/* All Sizes × Primary */}
      <SubSection label="Size Comparison — Primary Full Width">
        <div className="flex flex-col gap-3" style={{maxWidth: '400px'}}>
          <Button fullWidth size="sm">Small Full Width</Button>
          <Button fullWidth size="md">Medium Full Width</Button>
          <Button fullWidth size="lg">Large Full Width</Button>
        </div>
      </SubSection>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Accordion
   ═══════════════════════════════════════════════════════════════════════════ */

function AccordionSection() {
  return (
    <Section title="Accordion">
      <div style={{maxWidth: '640px'}}>
        <Accordion title="Product Details">
          <p>
            Crafted from 13oz selvedge denim sourced from Kuroki Mills in Japan.
            Chain-stitched hems with a classic straight-leg silhouette. Antique
            brass hardware throughout.
          </p>
        </Accordion>
        <Accordion title="Size & Fit">
          <p>
            True to size. Model is 6&apos;1&quot; / 185cm wearing size 32.
            Mid-rise with a relaxed straight leg. Inseam: 32&quot; (all sizes).
          </p>
        </Accordion>
        <Accordion title="Materials & Care" defaultOpen>
          <p>
            100% cotton selvedge denim, 13oz weight. Leather patch: vegetable-tanned
            cowhide. Machine wash cold, hang dry. Will develop natural fading and
            character over time.
          </p>
        </Accordion>
        <Accordion title="Shipping & Returns">
          <p>
            Free standard shipping on orders over $150. Express shipping available
            at checkout. Returns accepted within 30 days of delivery — item must be
            unworn with tags attached.
          </p>
        </Accordion>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ResponsiveImage
   ═══════════════════════════════════════════════════════════════════════════ */

function ResponsiveImageSection() {
  // Tiny 4x3 grey placeholder as base64
  const placeholder =
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2U4ZTVlNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPjQwMMOXMzAwPC90ZXh0Pjwvc3ZnPg==';

  return (
    <Section title="ResponsiveImage">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <Label>Lazy load (default)</Label>
          <ResponsiveImage
            src="https://cdn.shopify.com/s/files/1/0551/4566/0472/files/Placeholder.png"
            alt="Placeholder product image"
            width={400}
            height={300}
          />
        </div>
        <div>
          <Label>With blur-up placeholder</Label>
          <ResponsiveImage
            src="https://cdn.shopify.com/s/files/1/0551/4566/0472/files/Placeholder.png"
            alt="Placeholder with blur-up"
            width={400}
            height={300}
            placeholder={placeholder}
          />
        </div>
        <div>
          <Label>Eager load (above fold)</Label>
          <ResponsiveImage
            src="https://cdn.shopify.com/s/files/1/0551/4566/0472/files/Placeholder.png"
            alt="Eagerly loaded placeholder"
            width={400}
            height={300}
            lazy={false}
          />
        </div>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Skeleton
   ═══════════════════════════════════════════════════════════════════════════ */

function SkeletonSection() {
  return (
    <Section title="Skeleton">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <Label>Text variant</Label>
          <div className="flex flex-col gap-2">
            <Skeleton variant="text" />
            <Skeleton variant="text" className="w-full" />
            <Skeleton variant="text" className="w-1/2" />
          </div>
        </div>
        <div>
          <Label>Image variant</Label>
          <Skeleton variant="image" />
        </div>
        <div>
          <Label>Card variant</Label>
          <Skeleton variant="card" />
        </div>
      </div>

      <div style={{marginTop: '2rem'}}>
        <Label>Product grid skeleton (4 cards)</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Skeleton variant="card" />
          <Skeleton variant="card" />
          <Skeleton variant="card" />
          <Skeleton variant="card" />
        </div>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Breadcrumbs
   ═══════════════════════════════════════════════════════════════════════════ */

function BreadcrumbsSection() {
  return (
    <Section title="Breadcrumbs">
      <div className="flex flex-col gap-6">
        <div>
          <Label>Standard (3 levels)</Label>
          <Breadcrumbs
            items={[
              {label: 'Home', href: '/'},
              {label: "Men's", href: '/collections/mens'},
              {label: 'Jeans', href: '/collections/mens/jeans'},
            ]}
          />
        </div>
        <div>
          <Label>Product breadcrumb (4 levels)</Label>
          <Breadcrumbs
            items={[
              {label: 'Home', href: '/'},
              {label: "Men's", href: '/collections/mens'},
              {label: 'Jeans', href: '/collections/mens/jeans'},
              {label: 'Western Denim Jacket', href: '/products/western-denim-jacket'},
            ]}
          />
        </div>
        <div>
          <Label>Minimal (2 levels)</Label>
          <Breadcrumbs
            items={[
              {label: 'Home', href: '/'},
              {label: 'Brand', href: '/brand'},
            ]}
          />
        </div>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Layout Helpers
   ═══════════════════════════════════════════════════════════════════════════ */

function Section({title, children}: {title: string; children: React.ReactNode}) {
  return (
    <section style={{marginBottom: '5rem'}}>
      <div style={{borderBottom: '2px solid var(--color-primary)', marginBottom: '2rem', paddingBottom: '0.5rem'}}>
        <h2 style={{fontSize: '1.75rem'}}>{title}</h2>
      </div>
      {children}
    </section>
  );
}

function SubSection({label, children}: {label: string; children: React.ReactNode}) {
  return (
    <div style={{marginBottom: '2rem'}}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function Label({children}: {children: React.ReactNode}) {
  return (
    <p
      className="text-xs font-body tracking-wide uppercase"
      style={{color: '#999', marginBottom: '0.75rem'}}
    >
      {children}
    </p>
  );
}
