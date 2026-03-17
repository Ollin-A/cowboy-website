import {useEffect, useRef, useCallback, useState, forwardRef, type Ref} from 'react';
import {NavLink} from 'react-router';
import gsap from 'gsap';

interface NavItem {
  label: string;
  to: string;
  children?: {label: string; to: string}[];
}

const NAV_ITEMS: NavItem[] = [
  {label: 'New Collection', to: '/collections/new'},
  {
    label: "Men's",
    to: '/collections/mens',
    children: [
      {label: "New Men's Temporada", to: '/collections/mens/new'},
      {label: 'Jeans', to: '/collections/mens/jeans'},
      {label: 'Apparel', to: '/collections/mens/apparel'},
      {label: 'Outerwear', to: '/collections/mens/outerwear'},
      {label: "Shop All Men's", to: '/collections/mens'},
    ],
  },
  {
    label: "Women's",
    to: '/collections/womens',
    children: [
      {label: "New Women's Temporada", to: '/collections/womens/new'},
      {label: 'Jeans', to: '/collections/womens/jeans'},
      {label: 'Apparel', to: '/collections/womens/apparel'},
      {label: 'Outerwear', to: '/collections/womens/outerwear'},
      {label: "Shop All Women's", to: '/collections/womens'},
    ],
  },
  {
    label: 'Hats',
    to: '/collections/hats',
    children: [{label: 'Shop All', to: '/collections/hats'}],
  },
  {label: 'Brand', to: '/brand'},
  {
    label: 'Contact',
    to: '/contact',
    children: [{label: 'FAQ', to: '/faq'}],
  },
];

interface FullScreenMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FullScreenMenu({isOpen, onClose}: FullScreenMenuProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const navItemsRef = useRef<HTMLUListElement>(null);
  const subcategoryRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const firstNavItemRef = useRef<HTMLElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Toggle subcategory — on mobile expand inline, on desktop show in right column
  const toggleCategory = useCallback((label: string) => {
    setActiveCategory((prev) => (prev === label ? null : label));
  }, []);

  // Animate subcategory content in right column (desktop) or inline (mobile)
  useEffect(() => {
    const subEl = subcategoryRef.current;
    if (!subEl) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    const children = subEl.querySelectorAll('[data-sub-link]');

    if (activeCategory && children.length > 0) {
      if (prefersReducedMotion) {
        gsap.set(children, {opacity: 1, x: 0});
      } else {
        gsap.fromTo(
          children,
          {opacity: 0, x: 30},
          {
            opacity: 1,
            x: 0,
            duration: 0.35,
            stagger: 0.05,
            ease: 'power2.out',
          },
        );
      }
    }
  }, [activeCategory]);

  // Animate mobile inline submenus
  useEffect(() => {
    const subMenus = document.querySelectorAll('[data-submenu]');
    subMenus.forEach((el) => {
      const key = el.getAttribute('data-submenu') || '';
      const isExpanded = activeCategory === key;

      if (isExpanded) {
        gsap.set(el, {height: 'auto', overflow: 'hidden'});
        const autoHeight = (el as HTMLElement).offsetHeight;
        gsap.fromTo(
          el,
          {height: 0, opacity: 0},
          {height: autoHeight, opacity: 1, duration: 0.4, ease: 'power2.out'},
        );
      } else {
        gsap.to(el, {
          height: 0,
          opacity: 0,
          duration: 0.3,
          ease: 'power2.inOut',
          onComplete: () => {
            gsap.set(el, {overflow: 'hidden'});
          },
        });
      }
    });
  }, [activeCategory]);

  // Open/close animation
  useEffect(() => {
    if (!overlayRef.current || !menuRef.current) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';
      gsap.set(overlayRef.current, {display: 'flex'});

      if (prefersReducedMotion) {
        gsap.set(overlayRef.current, {opacity: 1});
        gsap.set(menuRef.current, {y: '0%'});
        if (navItemsRef.current) {
          const items = navItemsRef.current.querySelectorAll(':scope > li');
          gsap.set(items, {opacity: 1, y: 0});
        }
        firstNavItemRef.current?.focus();
      } else {
        const tl = gsap.timeline();
        tl.fromTo(
          overlayRef.current,
          {opacity: 0},
          {opacity: 1, duration: 0.3, ease: 'power2.out'},
        );
        tl.fromTo(
          menuRef.current,
          {y: '-100%'},
          {y: '0%', duration: 0.7, ease: 'power3.out'},
          0,
        );

        // Stagger nav items at 0.08s
        if (navItemsRef.current) {
          const items = navItemsRef.current.querySelectorAll(':scope > li');
          tl.fromTo(
            items,
            {opacity: 0, y: 20},
            {
              opacity: 1,
              y: 0,
              duration: 0.4,
              stagger: 0.08,
              ease: 'power2.out',
            },
            0.3,
          );
        }

        tl.call(() => {
          firstNavItemRef.current?.focus();
        });
      }
    } else {
      const onCloseComplete = () => {
        if (overlayRef.current) {
          gsap.set(overlayRef.current, {display: 'none'});
        }
        document.body.style.overflow = '';
        previousFocusRef.current?.focus();
        setActiveCategory(null);
      };

      if (prefersReducedMotion) {
        gsap.set(menuRef.current, {y: '-100%'});
        gsap.set(overlayRef.current, {opacity: 0});
        onCloseComplete();
      } else {
        const tl = gsap.timeline({onComplete: onCloseComplete});
        tl.to(menuRef.current, {
          y: '-100%',
          duration: 0.5,
          ease: 'power3.inOut',
        });
        tl.to(
          overlayRef.current,
          {opacity: 0, duration: 0.3, ease: 'power2.in'},
          0.2,
        );
      }
    }
  }, [isOpen]);

  // Keyboard: Escape to close + focus trap
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        const overlay = overlayRef.current;
        if (!overlay) return;

        const focusableSelector =
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
        const focusables = Array.from(
          overlay.querySelectorAll<HTMLElement>(focusableSelector),
        ).filter((el) => el.offsetParent !== null);

        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

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
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, activeCategory]);

  // Find active category's children for desktop right column
  const activeCategoryData = NAV_ITEMS.find((i) => i.label === activeCategory);
  const activeChildren = activeCategoryData?.children || [];

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex flex-col"
      style={{display: 'none'}}
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-primary/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Menu panel */}
      <div
        ref={menuRef}
        className="relative w-full bg-bg overflow-y-auto max-h-screen"
      >
        {/* Header row — close button only, minimal × top-right */}
        <div className="container-content flex items-center justify-end h-16 md:h-[70px]">
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="flex items-center justify-center w-10 h-10 cursor-pointer bg-transparent border-none p-0 text-primary"
            aria-label="Close navigation menu"
          >
            <svg
              width="24"
              height="24"
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

        <div className="h-px bg-primary/10" />

        {/* Navigation — two-column on desktop, single column on mobile */}
        <nav className="container-content py-10 md:py-16">
          <div className="md:grid md:grid-cols-2 md:gap-16">
            {/* Left column: main categories */}
            <ul ref={navItemsRef} className="list-none p-0 m-0">
              {NAV_ITEMS.map((item, index) => (
                <NavMenuItem
                  key={item.label}
                  item={item}
                  isActive={activeCategory === item.label}
                  onToggle={() => toggleCategory(item.label)}
                  onNavigate={onClose}
                  ref={index === 0 ? firstNavItemRef : undefined}
                />
              ))}
            </ul>

            {/* Right column: subcategory links (desktop only) */}
            <div
              ref={subcategoryRef}
              className="hidden md:flex md:flex-col md:justify-center md:min-h-[300px]"
              aria-live="polite"
            >
              {activeChildren.length > 0 && (
                <div className="space-y-4">
                  {activeChildren.map((child) => {
                    const isShopAll = child.label.toLowerCase().startsWith('shop all');
                    return (
                      <div key={child.to} data-sub-link>
                        <NavLink
                          to={child.to}
                          prefetch="intent"
                          onClick={onClose}
                          className={
                            isShopAll
                              ? 'font-body text-sm tracking-wide text-text/60 underline underline-offset-4 no-underline hover:text-primary transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'
                              : 'font-body text-base tracking-wide uppercase text-text no-underline hover:text-primary transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'
                          }
                        >
                          {child.label}
                        </NavLink>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}

interface NavMenuItemProps {
  item: NavItem;
  isActive: boolean;
  onToggle: () => void;
  onNavigate: () => void;
}

const NavMenuItem = forwardRef<HTMLElement, NavMenuItemProps>(function NavMenuItem(
  {item, isActive, onToggle, onNavigate},
  ref,
) {
  const hasChildren = item.children && item.children.length > 0;

  return (
    <li>
      {/* Main category row — generous 24px vertical spacing */}
      <div className="py-3">
        {hasChildren ? (
          <button
            type="button"
            ref={ref as Ref<HTMLButtonElement>}
            onClick={onToggle}
            className="group flex items-center gap-3 w-full bg-transparent border-none p-0 cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            aria-expanded={isActive}
            aria-controls={`submenu-${item.label}`}
          >
            <span className="flex flex-col">
              <span
                className={[
                  'font-heading text-2xl md:text-3xl tracking-tight transition-colors duration-200',
                  isActive ? 'text-primary' : 'text-primary/80 hover:text-primary',
                ].join(' ')}
              >
                {item.label}
              </span>
              <span className="block h-[2px] w-6 bg-primary mt-1 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
            </span>
            <span
              className="text-primary/50 transition-transform duration-300 text-lg leading-none"
              style={{
                transform: isActive ? 'rotate(45deg)' : 'rotate(0deg)',
              }}
              aria-hidden="true"
            >
              +
            </span>
          </button>
        ) : (
          <NavLink
            to={item.to}
            ref={ref as Ref<HTMLAnchorElement>}
            prefetch="intent"
            onClick={onNavigate}
            className="group inline-flex flex-col font-heading text-2xl md:text-3xl tracking-tight text-primary/80 no-underline hover:text-primary transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            {item.label}
            <span className="block h-[2px] w-6 bg-primary mt-1 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
          </NavLink>
        )}
      </div>

      {/* Subcategory links — mobile only (inline expand) */}
      {hasChildren && (
        <div
          data-submenu={item.label}
          id={`submenu-${item.label}`}
          role="region"
          aria-label={`${item.label} subcategories`}
          className="md:hidden"
          style={{height: 0, opacity: 0, overflow: 'hidden'}}
        >
          <ul className="list-none p-0 m-0 pl-4 py-2 space-y-1">
            {item.children!.map((child) => {
              const isShopAll = child.label.toLowerCase().startsWith('shop all');
              return (
                <li key={child.to} style={{minHeight: 48}}>
                  <NavLink
                    to={child.to}
                    prefetch="intent"
                    onClick={onNavigate}
                    tabIndex={isActive ? 0 : -1}
                    className={
                      isShopAll
                        ? 'flex items-center h-12 font-body text-sm tracking-wide text-text/60 underline underline-offset-4 hover:text-primary transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'
                        : 'flex items-center h-12 font-body text-base tracking-wide uppercase text-text hover:text-primary transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'
                    }
                  >
                    {child.label}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </li>
  );
});
