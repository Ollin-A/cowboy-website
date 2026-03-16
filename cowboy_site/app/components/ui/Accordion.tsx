import {useRef, useState, useCallback, useEffect, useId} from 'react';

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export default function Accordion({title, children, defaultOpen = false}: AccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const buttonId = `accordion-btn-${id}`;
  const panelId = `accordion-panel-${id}`;

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    let ctx: gsap.Context | undefined;

    import('gsap').then(({default: gsap}) => {
      ctx = gsap.context(() => {
        if (isOpen) {
          const height = innerRef.current?.scrollHeight ?? 0;
          gsap.fromTo(
            content,
            {height: 0, opacity: 0},
            {height, opacity: 1, duration: 0.35, ease: 'power2.out'},
          );
        } else {
          gsap.to(content, {
            height: 0,
            opacity: 0,
            duration: 0.3,
            ease: 'power2.out',
          });
        }
      });
    });

    return () => {
      ctx?.revert();
    };
  }, [isOpen]);

  return (
    <div className="border-b border-[#e5e5e5]">
      <button
        type="button"
        id={buttonId}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={toggle}
        className="flex w-full items-center justify-between py-5 px-0 text-left font-body text-base font-medium tracking-wide text-primary cursor-pointer bg-transparent border-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        <span>{title}</span>
        <span
          className="text-lg leading-none transition-transform duration-base select-none"
          aria-hidden="true"
        >
          {isOpen ? '\u2212' : '+'}
        </span>
      </button>

      <div
        ref={contentRef}
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        className="overflow-hidden"
        style={{height: defaultOpen ? 'auto' : 0, opacity: defaultOpen ? 1 : 0}}
      >
        <div ref={innerRef} className="pb-6 text-text font-body text-base leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}
