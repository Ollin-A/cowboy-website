import {Suspense, useState, useCallback, useEffect, useRef} from 'react';
import {Await, NavLink, useAsyncValue} from 'react-router';
import {useOptimisticCart} from '@shopify/hydrogen';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {FullScreenMenu} from '~/components/FullScreenMenu';
import {useCartDrawer} from '~/components/cart/CartDrawer';

interface HeaderProps {
  cart: Promise<CartApiQueryFragment | null>;
}

export function Header({cart}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const {open: openCart} = useCartDrawer();

  const openMenu = useCallback(() => setIsMenuOpen(true), []);
  const closeMenu = useCallback(() => setIsMenuOpen(false), []);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-bg">
        <div className="container-content flex items-center justify-between h-16 md:h-[70px]">
          {/* Left: Hamburger menu trigger */}
          <button
            type="button"
            className="flex flex-col justify-center items-center w-10 h-10 gap-[5px] cursor-pointer bg-transparent border-none p-0"
            onClick={openMenu}
            aria-label="Open navigation menu"
            aria-expanded={isMenuOpen}
          >
            <span className="block w-6 h-[2px] bg-primary" />
            <span className="block w-6 h-[2px] bg-primary" />
            <span className="block w-6 h-[2px] bg-primary" />
          </button>

          {/* Center: Brand logo placeholder */}
          <NavLink
            to="/"
            prefetch="intent"
            className="absolute left-1/2 -translate-x-1/2 font-heading text-2xl tracking-wide text-primary no-underline hover:no-underline"
          >
            BRAND
          </NavLink>

          {/* Right: Cart icon with badge */}
          <Suspense fallback={<CartButton count={0} onClick={openCart} />}>
            <Await resolve={cart}>
              <CartButtonResolved onClick={openCart} />
            </Await>
          </Suspense>
        </div>

        {/* Subtle bottom border */}
        <div className="h-px bg-primary/10" />
      </header>

      <FullScreenMenu isOpen={isMenuOpen} onClose={closeMenu} />
    </>
  );
}

function CartIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-primary"
      aria-hidden="true"
    >
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  );
}

function CartButton({count, onClick}: {count: number; onClick: () => void}) {
  const label =
    count === 0
      ? 'Shopping bag, empty'
      : `Shopping bag, ${count} item${count !== 1 ? 's' : ''}`;

  const badgeRef = useRef<HTMLSpanElement>(null);
  const prevCount = useRef(count);

  useEffect(() => {
    if (count !== prevCount.current && count > 0 && badgeRef.current) {
      badgeRef.current.classList.remove('badge-pulse');
      // Force reflow to restart animation
      void badgeRef.current.offsetWidth;
      badgeRef.current.classList.add('badge-pulse');
    }
    prevCount.current = count;
  }, [count]);

  return (
    <button
      type="button"
      className="relative flex items-center justify-center w-10 h-10 cursor-pointer bg-transparent border-none p-0"
      onClick={onClick}
      aria-label={label}
    >
      <CartIcon />
      {count > 0 && (
        <span
          ref={badgeRef}
          className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-primary text-bg text-xs font-body font-medium leading-none px-1"
          aria-hidden="true"
        >
          {count}
        </span>
      )}
    </button>
  );
}

function CartButtonResolved({onClick}: {onClick: () => void}) {
  const originalCart = useAsyncValue() as CartApiQueryFragment | null;
  const cart = useOptimisticCart(originalCart);
  return <CartButton count={cart?.totalQuantity ?? 0} onClick={onClick} />;
}
