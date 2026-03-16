import {useCartDrawer} from './CartDrawer';

export function CartEmpty() {
  const {close} = useCartDrawer();

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
      {/* Empty bag icon */}
      <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-primary/20 mb-6"
        aria-hidden="true"
      >
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 01-8 0" />
      </svg>

      <h3 className="font-heading text-xl text-primary mb-2">
        Your bag is empty
      </h3>
      <p className="font-body text-sm text-text/60 mb-8 max-w-[240px]">
        Explore our collections and find something you love.
      </p>

      <button
        type="button"
        onClick={close}
        className="inline-flex items-center justify-center px-8 py-3 bg-primary text-bg font-body font-medium text-sm tracking-widest uppercase cursor-pointer border-none hover:opacity-90 transition-opacity duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        Continue Shopping
      </button>
    </div>
  );
}
