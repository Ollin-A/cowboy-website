import {useRef, useEffect, useState, type ReactNode} from 'react';

interface StickyBuyModuleProps {
  children: ReactNode;
  /** Offset from top of viewport in px (accounts for fixed header). Default: 70 */
  topOffset?: number;
  /** Ref or selector for the element that should stop the sticky (e.g. recommended products section) */
  stopSelector?: string;
}

export default function StickyBuyModule({
  children,
  topOffset = 70,
  stopSelector,
}: StickyBuyModuleProps) {
  const stickyRef = useRef<HTMLDivElement>(null);
  const [shouldStop, setShouldStop] = useState(false);

  // Use IntersectionObserver to detect when the sentinel/stop element
  // enters the viewport, and un-stick the buy module before collision
  useEffect(() => {
    if (!stopSelector) return;

    const stopEl = document.querySelector(stopSelector);
    if (!stopEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShouldStop(entry.isIntersecting);
      },
      {
        rootMargin: `-${topOffset + 20}px 0px 0px 0px`,
        threshold: 0,
      },
    );

    observer.observe(stopEl);
    return () => observer.disconnect();
  }, [stopSelector, topOffset]);

  return (
    <>
      {/* Desktop: sticky */}
      <div
        ref={stickyRef}
        className="hidden md:block"
        style={{
          position: shouldStop ? 'relative' : 'sticky',
          top: shouldStop ? 'auto' : `${topOffset + 16}px`,
          alignSelf: 'start',
        }}
      >
        {children}
      </div>

      {/* Mobile: natural flow (no sticky) */}
      <div className="md:hidden">{children}</div>
    </>
  );
}
