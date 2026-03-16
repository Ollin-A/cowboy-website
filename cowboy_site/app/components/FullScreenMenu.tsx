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
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const firstNavItemRef = useRef<HTMLElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Toggle subcategory expansion with GSAP height animation
  const toggleExpand = useCallback((label: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  }, []);

  // Animate subcategory height
  useEffect(() => {
    const subMenus = document.querySelectorAll('[data-submenu]');
    subMenus.forEach((el) => {
      const key = el.getAttribute('data-submenu') || '';
      const isExpanded = expandedItems.has(key);

      if (isExpanded) {
        // Expand: set height to auto via GSAP
        gsap.set(el, {height: 'auto', overflow: 'hidden'});
        const autoHeight = (el as HTMLElement).offsetHeight;
        gsap.fromTo(
          el,
          {height: 0, opacity: 0},
          {height: autoHeight, opacity: 1, duration: 0.4, ease: 'power2.out'},
        );
      } else {
        // Collapse
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
  }, [expandedItems]);

  // Open/close animation
  useEffect(() => {
    if (!overlayRef.current || !menuRef.current) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    if (isOpen) {
      // Save focus for restoration on close
      previousFocusRef.current = document.activeElement as HTMLElement;

      // Lock scroll
      document.body.style.overflow = 'hidden';

      // Show overlay
      gsap.set(overlayRef.current, {display: 'flex'});

      if (prefersReducedMotion) {
        gsap.set(overlayRef.current, {opacity: 1});
        gsap.set(menuRef.current, {y: '0%'});
        if (navItemsRef.current) {
          const items = navItemsRef.current.querySelectorAll(':scope > li');
          gsap.set(items, {opacity: 1, y: 0});
        }
        // Focus first nav item
        firstNavItemRef.current?.focus();
      } else {
        // Animate menu sliding down from top
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

        // Stagger nav items
        if (navItemsRef.current) {
          const items = navItemsRef.current.querySelectorAll(':scope > li');
          tl.fromTo(
            items,
            {opacity: 0, y: 20},
            {
              opacity: 1,
              y: 0,
              duration: 0.4,
              stagger: 0.06,
              ease: 'power2.out',
            },
            0.3,
          );
        }

        // Focus first nav item after animation
        tl.call(() => {
          firstNavItemRef.current?.focus();
        });
      }
    } else {
      // Close
      const onCloseComplete = () => {
        if (overlayRef.current) {
          gsap.set(overlayRef.current, {display: 'none'});
        }
        document.body.style.overflow = '';
        // Restore focus to the trigger element
        previousFocusRef.current?.focus();
        // Reset expanded items
        setExpandedItems(new Set());
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

  // Keyboard handling: Escape to close + focus trap
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
        ).filter(
          (el) => el.offsetParent !== null && !el.closest('[data-submenu]') ||
          (el.closest('[data-submenu]') && expandedItems.has(el.closest('[data-submenu]')?.getAttribute('data-submenu') || '')),
        );

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
  }, [isOpen, onClose, expandedItems]);

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
        {/* Header row with close button */}
        <div className="container-content flex items-center justify-between h-16 md:h-[70px]">
          <span className="font-heading text-2xl tracking-wide text-primary">
            BRAND
          </span>
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

        {/* Navigation items */}
        <nav className="container-content py-10 md:py-16">
          <ul ref={navItemsRef} className="list-none p-0 m-0 space-y-2">
            {NAV_ITEMS.map((item, index) => (
              <NavMenuItem
                key={item.label}
                item={item}
                isExpanded={expandedItems.has(item.label)}
                onToggle={() => toggleExpand(item.label)}
                onNavigate={onClose}
                ref={index === 0 ? firstNavItemRef : undefined}
              />
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}

interface NavMenuItemProps {
  item: NavItem;
  isExpanded: boolean;
  onToggle: () => void;
  onNavigate: () => void;
}

const NavMenuItem = forwardRef<HTMLElement, NavMenuItemProps>(function NavMenuItem({item, isExpanded, onToggle, onNavigate}, ref) {
  const hasChildren = item.children && item.children.length > 0;

  return (
    <li>
      <div className="flex items-center justify-between py-3 md:py-4 border-b border-primary/10">
        {hasChildren ? (
          <button
            type="button"
            ref={ref as Ref<HTMLButtonElement>}
            onClick={onToggle}
            className="flex items-center justify-between w-full bg-transparent border-none p-0 cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            aria-expanded={isExpanded}
            aria-controls={`submenu-${item.label}`}
          >
            <span className="font-heading text-2xl md:text-3xl tracking-wide text-primary">
              {item.label}
            </span>
            <span
              className="text-primary transition-transform duration-300 text-lg"
              style={{
                transform: isExpanded ? 'rotate(45deg)' : 'rotate(0deg)',
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
            className="font-heading text-2xl md:text-3xl tracking-wide text-primary no-underline hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            {item.label}
          </NavLink>
        )}
      </div>

      {/* Subcategory links */}
      {hasChildren && (
        <div
          data-submenu={item.label}
          id={`submenu-${item.label}`}
          role="region"
          aria-label={`${item.label} subcategories`}
          style={{height: 0, opacity: 0, overflow: 'hidden'}}
        >
          <ul className="list-none p-0 m-0 pl-4 md:pl-8 py-2 space-y-1">
            {item.children!.map((child) => (
              <li key={child.to}>
                <NavLink
                  to={child.to}
                  prefetch="intent"
                  onClick={onNavigate}
                  className="block py-2 font-body text-base md:text-lg tracking-wide text-text no-underline hover:text-primary transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  {child.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  );
});
