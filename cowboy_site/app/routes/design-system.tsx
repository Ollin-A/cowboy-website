/**
 * Design System Test Route
 * Renders every token from the design system for visual verification.
 * Available at /design-system
 */
export default function DesignSystem() {
  return (
    <div className="container-content" style={{paddingTop: '2rem', paddingBottom: '4rem'}}>
      <h1 style={{marginBottom: '2rem'}}>Design System</h1>

      {/* ── Color Palette ── */}
      <Section title="Color Palette">
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1.5rem'}}>
          <ColorSwatch name="Primary" value="#3F1E1F" token="--color-primary" />
          <ColorSwatch name="Accent" value="#FF0000" token="--color-accent" />
          <ColorSwatch name="Accent Dark" value="#D40000" token="--color-accent-dark" />
          <ColorSwatch name="Background" value="#FFFFFF" token="--color-bg" border />
          <ColorSwatch name="Text" value="#3C3737" token="--color-text" />
        </div>
      </Section>

      {/* ── Typography — Headings ── */}
      <Section title="Headings (Lora)">
        <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
          <div>
            <Label>h1 — 36px / 2.25rem / weight 400</Label>
            <h1>The Western Collection</h1>
          </div>
          <div>
            <Label>h2 — 56px / 3.5rem / weight 400 (display heading)</Label>
            <h2>New Arrivals</h2>
          </div>
          <div>
            <Label>h3 — 28px / 1.75rem</Label>
            <h3>Ranch Heritage Denim</h3>
          </div>
          <div>
            <Label>h4 — 22px / 1.375rem</Label>
            <h4>Crafted With Purpose</h4>
          </div>
          <div>
            <Label>h5 — 18px / 1.125rem</Label>
            <h5>Materials & Care</h5>
          </div>
          <div>
            <Label>h6 — 16px / 1rem / weight 600</Label>
            <h6>Shipping Information</h6>
          </div>
        </div>
      </Section>

      {/* ── Typography — Hero Display ── */}
      <Section title="Hero Display Text">
        <div>
          <Label>text-hero — clamp(2.5rem, 5vw, 4.5rem) / Lora</Label>
          <p className="text-hero">Born on the Range</p>
        </div>
      </Section>

      {/* ── Typography — Body Text ── */}
      <Section title="Body Text (GT America / System Fallback)">
        <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '680px'}}>
          <div>
            <Label>text-lg — 18px / 1.125rem (lead paragraph)</Label>
            <p className="text-lg leading-relaxed font-body">
              Every piece in our collection tells a story of the American West — where craftsmanship
              meets the open road and tradition shapes the future of fashion.
            </p>
          </div>
          <div>
            <Label>body — 16px / 1rem (default)</Label>
            <p className="font-body">
              Our denim is sourced from the finest mills and hand-finished at our workshop in
              Fort Worth, Texas. Each pair is built to last through years of wear, developing a
              unique patina that&apos;s yours alone. We believe in slow fashion — garments that get
              better with age, not ones destined for landfill.
            </p>
          </div>
          <div>
            <Label>text-sm — 14px / 0.875rem (captions, metadata)</Label>
            <p className="text-sm font-body">
              Free shipping on orders over $150. Returns accepted within 30 days.
            </p>
          </div>
          <div>
            <Label>text-xs — 12px / 0.75rem (legal, fine print)</Label>
            <p className="text-xs font-body">
              © 2026 Cowboy Brand. All rights reserved. Prices shown in USD.
            </p>
          </div>
        </div>
      </Section>

      {/* ── Letter Spacing ── */}
      <Section title="Letter Spacing">
        <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
          <div>
            <Label>tracking-tight: -0.02em (large headings)</Label>
            <p className="text-3xl font-heading tracking-tighter">Western Denim Jacket</p>
          </div>
          <div>
            <Label>tracking-normal: 0 (body text)</Label>
            <p className="text-base font-body tracking-normal">Standard body text spacing</p>
          </div>
          <div>
            <Label>tracking-wide: 0.05em (nav items, CTAs, labels)</Label>
            <p className="text-base font-body tracking-wide">Navigation Item Label</p>
          </div>
          <div>
            <Label>tracking-widest: 0.1em (uppercase utility text)</Label>
            <p className="text-sm font-body tracking-widest uppercase">Shop All · Add to Bag</p>
          </div>
        </div>
      </Section>

      {/* ── Font Weights ── */}
      <Section title="Font Weights">
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem'}}>
          <div>
            <Label>Lora Weights</Label>
            <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
              <p className="text-2xl font-heading" style={{fontWeight: 400}}>Regular 400 — The Range</p>
              <p className="text-2xl font-heading" style={{fontWeight: 500}}>Medium 500 — The Range</p>
              <p className="text-2xl font-heading" style={{fontWeight: 600}}>SemiBold 600 — The Range</p>
              <p className="text-2xl font-heading italic" style={{fontWeight: 400}}>Italic 400 — The Range</p>
            </div>
          </div>
          <div>
            <Label>GT America Weights</Label>
            <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
              <p className="text-lg font-body" style={{fontWeight: 400}}>Regular 400 — Body text</p>
              <p className="text-lg font-body" style={{fontWeight: 500}}>Medium 500 — UI labels, nav</p>
              <p className="text-lg font-body" style={{fontWeight: 700}}>Bold 700 — Strong emphasis</p>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Buttons ── */}
      <Section title="Buttons">
        <div style={{display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center'}}>
          <button className="bg-primary text-bg px-8 py-4 font-body font-medium text-sm tracking-widest uppercase transition-opacity duration-fast hover:opacity-90" style={{width: '100%', maxWidth: '360px'}}>
            Add to Bag
          </button>
          <button className="bg-primary text-bg px-8 py-3 font-body font-medium text-sm tracking-widest uppercase transition-opacity duration-fast hover:opacity-90">
            Shop Collection
          </button>
          <button className="border-2 border-primary text-primary px-8 py-3 font-body font-medium text-sm tracking-widest uppercase bg-transparent transition-colors duration-fast hover:bg-primary hover:text-bg">
            Learn More
          </button>
          <button className="bg-primary text-bg px-8 py-3 font-body font-medium text-sm tracking-widest uppercase opacity-40 cursor-not-allowed" disabled>
            Select a Size
          </button>
        </div>
      </Section>

      {/* ── Links ── */}
      <Section title="Links">
        <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
          <p>
            <Label>Accent link (default) — AA for large text only</Label>
            <a href="#" className="text-accent text-lg font-body" onClick={e => e.preventDefault()}>
              View New Collection →
            </a>
          </p>
          <p>
            <Label>Accent-dark link — AA compliant at all sizes</Label>
            <a href="#" className="text-accent-dark text-sm font-body" onClick={e => e.preventDefault()}>
              Terms & Conditions
            </a>
          </p>
          <p>
            <Label>Primary color link</Label>
            <a href="#" className="text-primary font-body underline" onClick={e => e.preventDefault()}>
              Return to shopping
            </a>
          </p>
        </div>
      </Section>

      {/* ── Spacing & Layout ── */}
      <Section title="Spacing & Layout">
        <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
          <div>
            <Label>Max content width: 1440px (90rem)</Label>
            <div className="bg-primary" style={{height: '8px', maxWidth: '1440px', borderRadius: '4px'}} />
          </div>
          <div>
            <Label>Side padding: clamp(1.25rem, 4vw, 4rem)</Label>
            <div style={{background: 'var(--color-accent)', opacity: 0.15, padding: 'var(--side-padding)', borderRadius: '4px'}}>
              <div className="bg-primary" style={{height: '8px', borderRadius: '4px'}} />
            </div>
          </div>
        </div>
      </Section>

      {/* ── Animation Tokens ── */}
      <Section title="Animation Duration Tokens">
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem'}}>
          <DurationDemo name="Fast" value="0.2s" token="--duration-fast" />
          <DurationDemo name="Base" value="0.4s" token="--duration-base" />
          <DurationDemo name="Slow" value="0.8s" token="--duration-slow" />
          <DurationDemo name="Slower" value="1.2s" token="--duration-slower" />
        </div>
      </Section>

      {/* ── Contrast Check ── */}
      <Section title="Color Contrast Reference">
        <div style={{display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '480px'}}>
          <ContrastDemo bg="#FFFFFF" fg="#3C3737" label="Text on White" ratio="~10.5:1" pass="AA + AAA" />
          <ContrastDemo bg="#FFFFFF" fg="#FF0000" label="Accent on White" ratio="~4.0:1" pass="AA Large only" />
          <ContrastDemo bg="#FFFFFF" fg="#D40000" label="Accent-dark on White" ratio="~5.3:1" pass="AA all sizes" />
          <ContrastDemo bg="#3F1E1F" fg="#FFFFFF" label="White on Primary" ratio="~12.3:1" pass="AA + AAA" />
        </div>
      </Section>
    </div>
  );
}

/* ── Helper Components ── */

function Section({title, children}: {title: string; children: React.ReactNode}) {
  return (
    <section style={{marginBottom: '4rem'}}>
      <div style={{borderBottom: '1px solid #e5e5e5', marginBottom: '1.5rem', paddingBottom: '0.5rem'}}>
        <h3 style={{color: 'var(--color-primary)'}}>{title}</h3>
      </div>
      {children}
    </section>
  );
}

function Label({children}: {children: React.ReactNode}) {
  return (
    <p className="text-xs font-body tracking-wide uppercase" style={{color: '#999', marginBottom: '0.25rem'}}>
      {children}
    </p>
  );
}

function ColorSwatch({name, value, token, border}: {name: string; value: string; token: string; border?: boolean}) {
  return (
    <div>
      <div
        style={{
          backgroundColor: value,
          width: '100%',
          height: '80px',
          borderRadius: '6px',
          border: border ? '1px solid #e5e5e5' : 'none',
          marginBottom: '0.5rem',
        }}
      />
      <p className="text-sm font-body" style={{fontWeight: 500, color: 'var(--color-primary)'}}>{name}</p>
      <p className="text-xs font-body" style={{color: '#999'}}>{value}</p>
      <p className="text-xs font-body" style={{color: '#999', fontFamily: 'monospace'}}>{token}</p>
    </div>
  );
}

function DurationDemo({name, value, token}: {name: string; value: string; token: string}) {
  return (
    <div style={{padding: '1rem', border: '1px solid #e5e5e5', borderRadius: '6px'}}>
      <p className="text-sm font-body" style={{fontWeight: 500, color: 'var(--color-primary)'}}>{name}</p>
      <p className="text-xs font-body" style={{color: '#999'}}>{value}</p>
      <p className="text-xs" style={{color: '#999', fontFamily: 'monospace'}}>{token}</p>
    </div>
  );
}

function ContrastDemo({bg, fg, label, ratio, pass}: {bg: string; fg: string; label: string; ratio: string; pass: string}) {
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
      <div style={{
        backgroundColor: bg,
        color: fg,
        padding: '0.5rem 1rem',
        borderRadius: '4px',
        border: '1px solid #e5e5e5',
        fontFamily: 'var(--font-body)',
        fontSize: '0.875rem',
        fontWeight: 500,
        minWidth: '120px',
        textAlign: 'center',
      }}>
        Aa
      </div>
      <div>
        <p className="text-sm font-body" style={{fontWeight: 500, color: 'var(--color-primary)'}}>{label}</p>
        <p className="text-xs font-body" style={{color: '#999'}}>{ratio} — {pass}</p>
      </div>
    </div>
  );
}
