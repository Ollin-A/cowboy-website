import {Link} from 'react-router';

export default function CheckoutDemo() {
  return (
    <main className="flex flex-col items-center justify-center text-center min-h-[80vh] px-6">
      <svg
        width="56"
        height="56"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-primary/30 mb-6"
        aria-hidden="true"
      >
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>

      <h1 className="font-heading text-h3 md:text-h2 tracking-tight text-primary mb-4">
        Checkout Preview
      </h1>
      <p className="font-body text-base text-text/60 mb-10 max-w-md">
        This is a demo storefront. In production, this page will redirect to
        Shopify&rsquo;s secure checkout.
      </p>

      <Link
        to="/"
        className="inline-flex items-center justify-center px-8 py-3 bg-primary text-white font-body font-medium text-sm tracking-widest uppercase no-underline hover:opacity-90 transition-opacity duration-200"
      >
        Continue Shopping
      </Link>
    </main>
  );
}
