import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  Suspense,
} from 'react';
import {Await} from 'react-router';
import {useOptimisticCart} from '@shopify/hydrogen';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {CartItem, type CartLine} from './CartItem';
import {CartEmpty} from './CartEmpty';
import {CartSummary} from './CartSummary';

// ---------------------------------------------------------------------------
// Cart Drawer Context
// ---------------------------------------------------------------------------
type CartDrawerContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

const CartDrawerContext = createContext<CartDrawerContextValue | null>(null);

export function useCartDrawer() {
  const ctx = useContext(CartDrawerContext);
  if (!ctx) {
    throw new Error('useCartDrawer must be used within a CartDrawerProvider');
  }
  return ctx;
}

export function CartDrawerProvider({children}: {children: ReactNode}) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <CartDrawerContext.Provider value={{isOpen, open, close}}>
      {children}
    </CartDrawerContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Line-item children map (for warranties, gift wrapping, etc.)
// ---------------------------------------------------------------------------
type LineItemChildrenMap = {[parentId: string]: CartLine[]};

function getLineItemChildrenMap(lines: CartLine[]): LineItemChildrenMap {
  const children: LineItemChildrenMap = {};
  for (const line of lines) {
    if ('parentRelationship' in line && line.parentRelationship?.parent) {
      const parentId = line.parentRelationship.parent.id;
      if (!children[parentId]) children[parentId] = [];
      children[parentId].push(line);
    }
    if ('lineComponents' in line) {
      const nested = getLineItemChildrenMap(line.lineComponents);
      for (const [parentId, childLines] of Object.entries(nested)) {
        if (!children[parentId]) children[parentId] = [];
        children[parentId].push(...childLines);
      }
    }
  }
  return children;
}

// ---------------------------------------------------------------------------
// Cart Drawer Component
// ---------------------------------------------------------------------------
interface CartDrawerProps {
  cart: Promise<CartApiQueryFragment | null>;
}

export function CartDrawer({cart}: CartDrawerProps) {
  const {isOpen, close} = useCartDrawer();
  const drawerRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);

  // Capture the element that triggered the drawer open
  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement as HTMLElement;
    }
  }, [isOpen]);

  // GSAP animation
  useEffect(() => {
    const drawer = drawerRef.current;
    const backdrop = backdropRef.current;
    if (!drawer || !backdrop) return;

    let gsapInstance: typeof import('gsap').default | null = null;

    (async () => {
      const {default: gsap} = await import('gsap');
      gsapInstance = gsap;

      // Respect reduced motion
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches;

      if (isOpen) {
        // Show elements
        backdrop.style.visibility = 'visible';
        drawer.style.visibility = 'visible';

        if (prefersReducedMotion) {
          gsap.set(backdrop, {opacity: 1});
          gsap.set(drawer, {x: '0%'});
        } else {
          gsap.to(backdrop, {
            opacity: 1,
            duration: 0.3,
            ease: 'power2.out',
          });
          gsap.to(drawer, {
            x: '0%',
            duration: 0.35,
            ease: 'power2.out',
          });
        }
      } else {
        if (prefersReducedMotion) {
          gsap.set(backdrop, {opacity: 0});
          gsap.set(drawer, {x: '100%'});
          backdrop.style.visibility = 'hidden';
          drawer.style.visibility = 'hidden';
        } else {
          gsap.to(backdrop, {
            opacity: 0,
            duration: 0.25,
            ease: 'power2.out',
            onComplete: () => {
              backdrop.style.visibility = 'hidden';
            },
          });
          gsap.to(drawer, {
            x: '100%',
            duration: 0.3,
            ease: 'power2.out',
            onComplete: () => {
              drawer.style.visibility = 'hidden';
            },
          });
        }
      }
    })();

    return () => {
      // Cleanup — snap to final state if unmounting mid-animation
      if (gsapInstance) {
        gsapInstance.killTweensOf(backdrop);
        gsapInstance.killTweensOf(drawer);
      }
    };
  }, [isOpen]);

  // Scroll lock
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  // Focus trap + Escape key
  useEffect(() => {
    if (!isOpen) return;

    // Focus the close button when drawer opens
    requestAnimationFrame(() => {
      firstFocusableRef.current?.focus();
    });

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        close();
        return;
      }

      if (e.key === 'Tab') {
        const drawer = drawerRef.current;
        if (!drawer) return;

        const focusable = drawer.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Return focus to trigger element
      triggerRef.current?.focus();
    };
  }, [isOpen, close]);

  return (
    <>
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="fixed inset-0 bg-black/40 z-[60]"
        style={{opacity: 0, visibility: 'hidden'}}
        onClick={close}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping bag"
        className="fixed top-0 right-0 bottom-0 z-[61] w-full sm:w-[440px] bg-bg flex flex-col shadow-[-4px_0_24px_rgba(0,0,0,0.12)]"
        style={{transform: 'translateX(100%)', visibility: 'hidden'}}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 h-16 md:h-[70px] border-b border-primary/10 shrink-0">
          <h2 className="font-heading text-lg tracking-wide text-primary m-0">
            Your Bag
          </h2>
          <button
            ref={firstFocusableRef}
            type="button"
            onClick={close}
            className="flex items-center justify-center w-10 h-10 text-primary bg-transparent border-none cursor-pointer hover:opacity-70 transition-opacity duration-fast"
            aria-label="Close cart"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Cart content */}
        <Suspense
          fallback={
            <div className="flex-1 flex items-center justify-center">
              <div className="text-text/50 font-body text-sm">
                Loading your bag...
              </div>
            </div>
          }
        >
          <Await resolve={cart}>
            {(resolvedCart) => <CartDrawerContent cart={resolvedCart} />}
          </Await>
        </Suspense>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Inner content — resolved cart
// ---------------------------------------------------------------------------
function CartDrawerContent({
  cart: originalCart,
}: {
  cart: CartApiQueryFragment | null;
}) {
  const cart = useOptimisticCart(originalCart);
  const lines = cart?.lines?.nodes ?? [];
  const hasItems = lines.length > 0;
  const childrenMap = getLineItemChildrenMap(lines);

  if (!hasItems) {
    return <CartEmpty />;
  }

  return (
    <>
      {/* Scrollable item list */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <ul className="list-none m-0 p-0" aria-label="Cart items">
          {lines.map((line) => {
            // Skip child lines — they render inside their parent
            if (
              'parentRelationship' in line &&
              line.parentRelationship?.parent
            ) {
              return null;
            }
            return (
              <CartItem
                key={line.id}
                line={line}
                childrenMap={childrenMap}
              />
            );
          })}
        </ul>
      </div>

      {/* Summary footer */}
      <CartSummary cart={cart} />
    </>
  );
}
