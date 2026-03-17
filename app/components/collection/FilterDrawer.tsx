import {useState, useCallback, useEffect, useRef} from 'react';
import {useSearchParams} from 'react-router';
import Button from '~/components/ui/Button';

interface FilterFacet {
  label: string;
  paramKey: string;
  options: string[];
}

const FILTER_FACETS: FilterFacet[] = [
  {
    label: 'Size',
    paramKey: 'size',
    options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', '38'],
  },
  {
    label: 'Color',
    paramKey: 'color',
    options: [
      'Black',
      'White',
      'Brown',
      'Tan',
      'Navy',
      'Red',
      'Grey',
      'Denim',
    ],
  },
  {
    label: 'Price Range',
    paramKey: 'price',
    options: ['Under $50', '$50 - $100', '$100 - $200', '$200 - $500', 'Over $500'],
  },
  {
    label: 'Material',
    paramKey: 'material',
    options: ['Denim', 'Leather', 'Cotton', 'Wool', 'Suede', 'Canvas'],
  },
];

interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function FilterDrawer({open, onClose}: FilterDrawerProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [localFilters, setLocalFilters] = useState<Record<string, string[]>>(
    {},
  );
  const drawerRef = useRef<HTMLDivElement>(null);
  const [expandedFacets, setExpandedFacets] = useState<Record<string, boolean>>(
    () =>
      FILTER_FACETS.reduce(
        (acc, f) => ({...acc, [f.paramKey]: true}),
        {} as Record<string, boolean>,
      ),
  );

  // Sync local state from URL on open
  useEffect(() => {
    if (open) {
      const filters: Record<string, string[]> = {};
      FILTER_FACETS.forEach((facet) => {
        const value = searchParams.get(facet.paramKey);
        if (value) {
          filters[facet.paramKey] = value.split(',');
        }
      });
      setLocalFilters(filters);
    }
  }, [open, searchParams]);

  const triggerRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus management: capture trigger, focus close button on open, restore on close
  useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement as HTMLElement;
      requestAnimationFrame(() => {
        closeButtonRef.current?.focus();
      });
    }
  }, [open]);

  // Focus trap, escape key, scroll lock
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        const drawer = drawerRef.current;
        if (!drawer) return;

        const focusable = drawer.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
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
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      // Restore focus to trigger element
      triggerRef.current?.focus();
    };
  }, [open, onClose]);

  // GSAP animation
  useEffect(() => {
    const drawer = drawerRef.current;
    if (!drawer) return;

    let ctx: gsap.Context | undefined;

    import('gsap').then(({default: gsap}) => {
      ctx = gsap.context(() => {
        if (open) {
          gsap.fromTo(
            drawer,
            {x: '-100%'},
            {x: '0%', duration: 0.35, ease: 'power2.out'},
          );
        } else {
          gsap.to(drawer, {
            x: '-100%',
            duration: 0.3,
            ease: 'power2.out',
          });
        }
      });
    });

    return () => {
      ctx?.revert();
    };
  }, [open]);

  const toggleOption = useCallback((paramKey: string, option: string) => {
    setLocalFilters((prev) => {
      const current = prev[paramKey] || [];
      const exists = current.includes(option);
      return {
        ...prev,
        [paramKey]: exists
          ? current.filter((v) => v !== option)
          : [...current, option],
      };
    });
  }, []);

  const toggleFacet = useCallback((paramKey: string) => {
    setExpandedFacets((prev) => ({...prev, [paramKey]: !prev[paramKey]}));
  }, []);

  const applyFilters = useCallback(() => {
    setSearchParams(
      (prev) => {
        // Remove old filter params and pagination cursors
        FILTER_FACETS.forEach((f) => prev.delete(f.paramKey));
        prev.delete('cursor');
        prev.delete('direction');

        // Set new filter params
        Object.entries(localFilters).forEach(([key, values]) => {
          if (values.length > 0) {
            prev.set(key, values.join(','));
          }
        });

        return prev;
      },
      {preventScrollReset: false},
    );
    onClose();
  }, [localFilters, setSearchParams, onClose]);

  const clearAll = useCallback(() => {
    setLocalFilters({});
  }, []);

  const activeCount = Object.values(localFilters).reduce(
    (sum, arr) => sum + arr.length,
    0,
  );

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer — desktop: sidebar from left, mobile: bottom sheet */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Filter products"
        className={[
          'fixed z-50 bg-bg',
          // Desktop: left sidebar
          'max-lg:hidden left-0 top-0 h-full w-[340px] border-r border-[#e5e5e5] shadow-lg',
          // Start offscreen
          !open ? 'pointer-events-none' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        style={{transform: open ? undefined : 'translateX(-100%)'}}
      >
        <DrawerContent
          expandedFacets={expandedFacets}
          localFilters={localFilters}
          activeCount={activeCount}
          toggleFacet={toggleFacet}
          toggleOption={toggleOption}
          clearAll={clearAll}
          applyFilters={applyFilters}
          onClose={onClose}
          closeButtonRef={closeButtonRef}
        />
      </div>

      {/* Mobile: bottom sheet */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={onClose}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Filter products"
            className="relative bg-bg rounded-t-2xl max-h-[85vh] flex flex-col shadow-xl"
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-text/20" />
            </div>
            <DrawerContent
              expandedFacets={expandedFacets}
              localFilters={localFilters}
              activeCount={activeCount}
              toggleFacet={toggleFacet}
              toggleOption={toggleOption}
              clearAll={clearAll}
              applyFilters={applyFilters}
              onClose={onClose}
            />
          </div>
        </div>
      )}
    </>
  );
}

function DrawerContent({
  expandedFacets,
  localFilters,
  activeCount,
  toggleFacet,
  toggleOption,
  clearAll,
  applyFilters,
  onClose,
  closeButtonRef,
}: {
  expandedFacets: Record<string, boolean>;
  localFilters: Record<string, string[]>;
  activeCount: number;
  toggleFacet: (key: string) => void;
  toggleOption: (key: string, option: string) => void;
  clearAll: () => void;
  applyFilters: () => void;
  onClose: () => void;
  closeButtonRef?: React.RefObject<HTMLButtonElement | null>;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-[#e5e5e5]">
        <h2 className="font-body font-medium text-base tracking-wide text-primary m-0 uppercase">
          Filters
        </h2>
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          className="font-body text-sm text-text/60 hover:text-text transition-colors duration-fast cursor-pointer bg-transparent border-none"
          aria-label="Close filters"
        >
          Close
        </button>
      </div>

      {/* Facets */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {FILTER_FACETS.map((facet) => {
          const isExpanded = expandedFacets[facet.paramKey] ?? false;
          const selected = localFilters[facet.paramKey] || [];

          return (
            <div key={facet.paramKey} className="border-b border-[#e5e5e5]">
              <button
                type="button"
                onClick={() => toggleFacet(facet.paramKey)}
                aria-expanded={isExpanded}
                className="flex w-full items-center justify-between py-4 text-left font-body text-sm font-medium tracking-wide text-primary bg-transparent border-none cursor-pointer"
              >
                <span>
                  {facet.label}
                  {selected.length > 0 && (
                    <span className="ml-2 text-xs text-text/50">
                      ({selected.length})
                    </span>
                  )}
                </span>
                <span
                  className="text-base leading-none select-none transition-transform duration-base"
                  aria-hidden="true"
                  style={{
                    transform: isExpanded ? 'rotate(0)' : 'rotate(-90deg)',
                  }}
                >
                  {'\u2212'}
                </span>
              </button>

              {isExpanded && (
                <div className="pb-4 flex flex-wrap gap-2">
                  {facet.options.map((option) => {
                    const isSelected = selected.includes(option);
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => toggleOption(facet.paramKey, option)}
                        className={[
                          'px-3 py-1.5 text-xs font-body font-medium tracking-wide border transition-colors duration-fast cursor-pointer',
                          isSelected
                            ? 'bg-primary text-bg border-primary'
                            : 'bg-transparent text-text border-[#e5e5e5] hover:border-primary',
                        ].join(' ')}
                        aria-pressed={isSelected}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-6 py-5 border-t border-[#e5e5e5] flex items-center gap-4">
        {activeCount > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="font-body text-sm text-text/60 hover:text-text underline bg-transparent border-none cursor-pointer"
          >
            Clear All
          </button>
        )}
        <Button
          variant="primary"
          size="md"
          fullWidth
          onClick={applyFilters}
        >
          Apply Filters{activeCount > 0 ? ` (${activeCount})` : ''}
        </Button>
      </div>
    </div>
  );
}
