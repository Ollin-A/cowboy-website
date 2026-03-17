import Accordion from '~/components/ui/Accordion';

export interface AccordionSection {
  title: string;
  /** HTML string or plain text content */
  content: string;
}

interface ProductAccordionsProps {
  sections: AccordionSection[];
  /** Index of section to default-open (none by default) */
  defaultOpenIndex?: number;
}

const defaultSections: AccordionSection[] = [
  {title: 'Product Details', content: ''},
  {title: 'Size & Fit', content: ''},
  {title: 'Materials & Care', content: ''},
  {title: 'Shipping & Returns', content: ''},
];

export default function ProductAccordions({
  sections = defaultSections,
  defaultOpenIndex,
}: ProductAccordionsProps) {
  const filteredSections = sections.filter((s) => s.content);

  if (filteredSections.length === 0) return null;

  return (
    <div className="w-full" role="region" aria-label="Product information">
      {filteredSections.map((section, i) => (
        <Accordion
          key={section.title}
          title={section.title}
          defaultOpen={i === defaultOpenIndex}
        >
          <div
            className="prose prose-sm max-w-none font-body text-text text-base leading-relaxed"
            dangerouslySetInnerHTML={{__html: section.content}}
          />
        </Accordion>
      ))}
    </div>
  );
}
