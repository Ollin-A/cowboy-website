import {useState, useCallback} from 'react';
import ProductGallery, {type GalleryImage} from '~/components/product/ProductGallery';
import VariantSelector, {
  type VariantOption,
  type SelectedVariant,
} from '~/components/product/VariantSelector';
import AddToBag from '~/components/product/AddToBag';
import StickyBuyModule from '~/components/product/StickyBuyModule';
import ProductAccordions, {
  type AccordionSection,
} from '~/components/product/ProductAccordions';
import TrustSignals from '~/components/product/TrustSignals';
import RecommendedProducts, {
  type RecommendedProduct,
} from '~/components/product/RecommendedProducts';

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const PLACEHOLDER = 'https://placehold.co';

const mockGalleryImages: GalleryImage[] = [
  {src: `${PLACEHOLDER}/800x1067/f5f0eb/3C3737?text=Front+View`, alt: 'Western Denim Jacket - Front View', width: 800, height: 1067},
  {src: `${PLACEHOLDER}/800x1067/f5f0eb/3C3737?text=3/4+Angle`, alt: 'Western Denim Jacket - 3/4 Angle', width: 800, height: 1067},
  {src: `${PLACEHOLDER}/800x1067/f5f0eb/3C3737?text=Back+View`, alt: 'Western Denim Jacket - Back View', width: 800, height: 1067},
  {src: `${PLACEHOLDER}/800x1067/f5f0eb/3C3737?text=Detail+Close-up`, alt: 'Western Denim Jacket - Stitching Detail', width: 800, height: 1067},
  {src: `${PLACEHOLDER}/800x1067/f5f0eb/3C3737?text=On+Model`, alt: 'Western Denim Jacket - Model Shot', width: 800, height: 1067},
];

const mockWashGalleryImages: GalleryImage[] = [
  {src: `${PLACEHOLDER}/800x1067/e8ddd4/3C3737?text=Light+Wash+Front`, alt: 'Western Denim Jacket Light Wash - Front', width: 800, height: 1067},
  {src: `${PLACEHOLDER}/800x1067/e8ddd4/3C3737?text=Light+Wash+Back`, alt: 'Western Denim Jacket Light Wash - Back', width: 800, height: 1067},
  {src: `${PLACEHOLDER}/800x1067/e8ddd4/3C3737?text=Light+Wash+Detail`, alt: 'Western Denim Jacket Light Wash - Detail', width: 800, height: 1067},
];

const mockVariantOptions: VariantOption[] = [
  {
    name: 'Color',
    values: [
      {
        value: 'Indigo Wash',
        available: true,
        image: {src: `${PLACEHOLDER}/64x80/2c3e6b/ffffff?text=IND`, alt: 'Indigo Wash'},
        galleryImages: mockGalleryImages,
      },
      {
        value: 'Light Wash',
        available: true,
        quantityAvailable: 3,
        lowStockThreshold: 5,
        image: {src: `${PLACEHOLDER}/64x80/c4b5a0/ffffff?text=LT`, alt: 'Light Wash'},
        galleryImages: mockWashGalleryImages,
      },
      {
        value: 'Black',
        available: false,
        image: {src: `${PLACEHOLDER}/64x80/1a1a1a/ffffff?text=BLK`, alt: 'Black'},
      },
    ],
  },
  {
    name: 'Size',
    values: [
      {value: 'XS', available: true},
      {value: 'S', available: true},
      {value: 'M', available: true, quantityAvailable: 2, lowStockThreshold: 3},
      {value: 'L', available: true},
      {value: 'XL', available: true},
      {value: 'XXL', available: false},
    ],
  },
];

const mockAccordionSections: AccordionSection[] = [
  {
    title: 'Product Details',
    content: `
      <p>Crafted from premium 12oz selvedge denim, this western-inspired jacket features authentic pointed yokes,
      pearl snap buttons, and hand-finished details that honor the tradition of American ranchwear.</p>
      <ul>
        <li>12oz Japanese selvedge denim</li>
        <li>Pearl snap closure</li>
        <li>Pointed front and back yokes</li>
        <li>Two chest flap pockets</li>
        <li>Adjustable waist tabs</li>
      </ul>
    `,
  },
  {
    title: 'Size & Fit',
    content: `
      <p>Regular fit with room through the chest and shoulders. Model is 6'1" wearing size M.</p>
      <table style="width:100%;border-collapse:collapse;margin-top:0.5rem">
        <thead>
          <tr style="border-bottom:1px solid #e5e5e5">
            <th style="text-align:left;padding:0.5rem 0;font-weight:500">Size</th>
            <th style="text-align:left;padding:0.5rem 0;font-weight:500">Chest</th>
            <th style="text-align:left;padding:0.5rem 0;font-weight:500">Length</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom:1px solid #f0f0f0"><td style="padding:0.4rem 0">S</td><td>38"</td><td>26"</td></tr>
          <tr style="border-bottom:1px solid #f0f0f0"><td style="padding:0.4rem 0">M</td><td>40"</td><td>27"</td></tr>
          <tr style="border-bottom:1px solid #f0f0f0"><td style="padding:0.4rem 0">L</td><td>42"</td><td>28"</td></tr>
          <tr><td style="padding:0.4rem 0">XL</td><td>44"</td><td>29"</td></tr>
        </tbody>
      </table>
    `,
  },
  {
    title: 'Materials & Care',
    content: `
      <p><strong>Shell:</strong> 100% cotton selvedge denim (12oz)</p>
      <p><strong>Lining:</strong> 100% cotton flannel</p>
      <p><strong>Hardware:</strong> Antique brass pearl snaps</p>
      <p style="margin-top:1rem"><strong>Care:</strong> Machine wash cold, hang dry. Do not bleach. Iron on low if needed. The denim will develop a unique patina over time — embrace it.</p>
    `,
  },
  {
    title: 'Shipping & Returns',
    content: `
      <p>Free standard shipping on orders over $150. Express shipping available at checkout.</p>
      <p>Free returns within 30 days of delivery. Items must be unworn with tags attached.</p>
      <p>For questions, <a href="/contact" style="color:#3F1E1F">contact our team</a>.</p>
    `,
  },
];

const mockRecommended: RecommendedProduct[] = [
  {handle: 'ranch-belt-brown', title: 'Ranch Belt — Brown', price: '$95', image: {src: `${PLACEHOLDER}/600x800/f5f0eb/3C3737?text=Ranch+Belt`, alt: 'Ranch Belt Brown', width: 600, height: 800}},
  {handle: 'western-pearl-snap-shirt', title: 'Pearl Snap Shirt', price: '$165', image: {src: `${PLACEHOLDER}/600x800/f5f0eb/3C3737?text=Pearl+Snap`, alt: 'Pearl Snap Shirt', width: 600, height: 800}},
  {handle: 'selvedge-ranch-jeans', title: 'Selvedge Ranch Jeans', price: '$225', image: {src: `${PLACEHOLDER}/600x800/f5f0eb/3C3737?text=Ranch+Jeans`, alt: 'Selvedge Ranch Jeans', width: 600, height: 800}},
  {handle: 'cattleman-hat-black', title: 'Cattleman Hat — Black', price: '$185', image: {src: `${PLACEHOLDER}/600x800/f5f0eb/3C3737?text=Cattleman+Hat`, alt: 'Cattleman Hat Black', width: 600, height: 800}},
  {handle: 'western-boots-cognac', title: 'Western Boots — Cognac', price: '$345', image: {src: `${PLACEHOLDER}/600x800/f5f0eb/3C3737?text=Western+Boots`, alt: 'Western Boots Cognac', width: 600, height: 800}},
];

// ---------------------------------------------------------------------------
// Section wrapper for visual separation in the test page
// ---------------------------------------------------------------------------

function Section({title, children}: {title: string; children: React.ReactNode}) {
  return (
    <section className="py-12 border-b border-primary/10 last:border-b-0">
      <h2 className="font-heading text-2xl tracking-tight text-primary mb-8">
        {title}
      </h2>
      {children}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Test Route
// ---------------------------------------------------------------------------

export default function PdpComponentsTestRoute() {
  const [selected, setSelected] = useState<SelectedVariant>({
    Color: 'Indigo Wash',
  });
  const [addState, setAddState] = useState<'idle' | 'loading' | 'added'>('idle');

  // Resolve gallery images based on selected color variant
  const selectedColorOption = mockVariantOptions
    .find((o) => o.name === 'Color')
    ?.values.find((v) => v.value === selected.Color);
  const galleryImages = selectedColorOption?.galleryImages ?? mockGalleryImages;

  const handleSelect = useCallback(
    (optionName: string, value: string) => {
      setSelected((prev) => ({...prev, [optionName]: value}));
    },
    [],
  );

  const handleAddToBag = useCallback(() => {
    setAddState('loading');
    // Simulate network request
    setTimeout(() => {
      setAddState('added');
      setTimeout(() => setAddState('idle'), 2500);
    }, 1200);
  }, []);

  const sizeSelected = !!selected.Size;

  return (
    <div className="container-content py-8 md:py-16">
      <header className="mb-12">
        <h1 className="font-heading text-3xl md:text-4xl tracking-tight text-primary mb-2">
          PDP Components — Visual Test
        </h1>
        <p className="font-body text-text/60 text-sm">
          All Product Detail Page building blocks rendered with mock data for verification.
        </p>
      </header>

      {/* 1. Product Gallery */}
      <Section title="1. ProductGallery">
        <div className="max-w-3xl">
          <ProductGallery images={galleryImages} />
        </div>
      </Section>

      {/* 2. Variant Selector */}
      <Section title="2. VariantSelector">
        <div className="max-w-md">
          <VariantSelector
            options={mockVariantOptions}
            selected={selected}
            onSelect={handleSelect}
          />
          <div className="mt-6 p-4 bg-[#f9f9f9] font-body text-xs text-text/60">
            <strong>Selected state:</strong>{' '}
            {JSON.stringify(selected)}
          </div>
        </div>
      </Section>

      {/* 3. AddToBag — All States */}
      <Section title="3. AddToBag">
        <div className="max-w-md space-y-6">
          <div>
            <p className="font-body text-sm text-text/60 mb-2">
              Default (size selected, interactive — click to test loading → added flow):
            </p>
            <AddToBag
              sizeSelected={sizeSelected}
              available={true}
              onAddToBag={handleAddToBag}
              isLoading={addState === 'loading'}
              isAdded={addState === 'added'}
            />
          </div>

          <div>
            <p className="font-body text-sm text-text/60 mb-2">
              Disabled (no size selected):
            </p>
            <AddToBag
              sizeSelected={false}
              available={true}
              onAddToBag={() => {}}
            />
          </div>

          <div>
            <p className="font-body text-sm text-text/60 mb-2">
              Sold Out:
            </p>
            <AddToBag
              sizeSelected={true}
              available={false}
              onAddToBag={() => {}}
            />
          </div>

          <div>
            <p className="font-body text-sm text-text/60 mb-2">
              Loading:
            </p>
            <AddToBag
              sizeSelected={true}
              available={true}
              onAddToBag={() => {}}
              isLoading={true}
            />
          </div>

          <div>
            <p className="font-body text-sm text-text/60 mb-2">
              Added (confirmation):
            </p>
            <AddToBag
              sizeSelected={true}
              available={true}
              onAddToBag={() => {}}
              isAdded={true}
            />
          </div>
        </div>
      </Section>

      {/* 4. StickyBuyModule (demo layout) */}
      <Section title="4. StickyBuyModule (desktop sticky demo)">
        <p className="font-body text-sm text-text/60 mb-6">
          On desktop, the right column sticks while scrolling. On mobile it flows naturally.
          Scroll within this section to observe the sticky behavior.
        </p>
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left: simulated gallery / long content */}
          <div className="md:w-[55%] space-y-4">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="bg-[#f5f0eb] flex items-center justify-center font-body text-text/40 text-sm"
                style={{aspectRatio: '3 / 4'}}
              >
                Gallery Image {n}
              </div>
            ))}
          </div>

          {/* Right: sticky buy module */}
          <div className="md:w-[45%]">
            <StickyBuyModule topOffset={70} stopSelector="#recommended-products">
              <div className="space-y-6">
                <div>
                  <h3 className="font-heading text-xl text-primary m-0">
                    Western Denim Jacket
                  </h3>
                  <p className="font-body text-lg text-text mt-1 mb-0">$285</p>
                </div>

                <VariantSelector
                  options={mockVariantOptions}
                  selected={selected}
                  onSelect={handleSelect}
                />

                <AddToBag
                  sizeSelected={sizeSelected}
                  available={true}
                  onAddToBag={handleAddToBag}
                  isLoading={addState === 'loading'}
                  isAdded={addState === 'added'}
                />

                <TrustSignals />
              </div>
            </StickyBuyModule>
          </div>
        </div>
      </Section>

      {/* 5. Product Accordions */}
      <Section title="5. ProductAccordions">
        <div className="max-w-2xl">
          <ProductAccordions sections={mockAccordionSections} />
        </div>
      </Section>

      {/* 6. Trust Signals */}
      <Section title="6. TrustSignals (standalone)">
        <div className="max-w-md">
          <TrustSignals />
        </div>
      </Section>

      {/* 7. Recommended Products */}
      <Section title="7. RecommendedProducts">
        <RecommendedProducts products={mockRecommended} />
      </Section>
    </div>
  );
}
