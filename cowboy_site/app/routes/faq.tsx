import type {Route} from './+types/faq';
import Accordion from '~/components/ui/Accordion';
import {buildPageMeta, faqPageJsonLd, getOriginFromMatches} from '~/lib/utils/seo';

export const meta: Route.MetaFunction = ({matches}) => {
  const origin = getOriginFromMatches(matches);
  const url = origin ? `${origin}/faq` : '/faq';

  return [
    ...buildPageMeta({
      title: 'FAQ',
      description:
        'Frequently asked questions about shipping, returns, sizing, materials, and more.',
      url,
    }),
    {'script:ld+json': faqPageJsonLd(FAQ_ITEMS)},
  ];
};

const FAQ_ITEMS = [
  {
    question: 'How long does shipping take?',
    answer:
      'Standard shipping within the continental United States typically takes 5–7 business days. Expedited shipping (2–3 business days) and overnight options are available at checkout. All orders are processed within 1–2 business days.',
  },
  {
    question: 'What is your return policy?',
    answer:
      'We accept returns within 30 days of delivery for unworn, unwashed items in their original condition with tags attached. To initiate a return, contact our customer service team with your order number. Return shipping is free for domestic orders. Refunds are processed within 5–7 business days of receiving the returned item.',
  },
  {
    question: 'How do I find the right size?',
    answer:
      'Each product page includes a detailed size guide with measurements in inches and centimeters. We recommend measuring a garment you already own and love, then comparing those measurements to our size chart. If you\'re between sizes, we generally recommend sizing up for a more comfortable fit. Our customer service team is also happy to help with specific sizing questions.',
  },
  {
    question: 'What materials do you use?',
    answer:
      'We source premium materials from trusted suppliers around the world. Our denim is woven from long-staple cotton for durability and comfort. Leather goods use vegetable-tanned hides that develop a beautiful patina over time. All hardware is cast from solid metal — never stamped or plated. Specific material details are listed on each product page under "Materials & Care."',
  },
  {
    question: 'How should I care for my garments?',
    answer:
      'For denim, we recommend washing inside out in cold water and hanging to dry to preserve color and fit. Leather items should be conditioned periodically with a quality leather balm. Hats should be stored on a flat surface or hat rack, away from direct sunlight and heat. Detailed care instructions are included with every product and on each product page.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit cards (Visa, Mastercard, American Express, Discover), PayPal, Apple Pay, Google Pay, and Shop Pay. All transactions are processed securely through Shopify\'s PCI-compliant payment system.',
  },
  {
    question: 'Do you ship internationally?',
    answer:
      'Yes, we ship to select international destinations. International shipping rates and delivery times vary by location and are calculated at checkout. Please note that international orders may be subject to customs duties and taxes, which are the responsibility of the recipient.',
  },
  {
    question: 'Can I exchange an item for a different size?',
    answer:
      'Absolutely. If you need a different size, contact our customer service team and we\'ll arrange an exchange. We\'ll send you a prepaid return label and ship the new size as soon as we receive the original item — or sooner if the new size is in stock, so you\'re never without your gear for long.',
  },
  {
    question: 'Do you offer gift cards?',
    answer:
      'Yes, digital gift cards are available in denominations of $50, $100, $250, and $500. Gift cards are delivered via email and never expire. They can be used on any product across the entire store.',
  },
  {
    question: 'How can I contact customer service?',
    answer:
      'You can reach us by phone at (800) 555-1234 during business hours (Monday–Friday, 9 AM – 6 PM CT; Saturday, 10 AM – 4 PM CT), or by email through our contact form any time. We typically respond within one business day.',
  },
];

export default function FaqPage() {
  return (
    <div className="container-content py-16 md:py-24">
      <h1 className="font-heading text-h1 md:text-h2 tracking-tight text-primary mb-4">
        Frequently Asked Questions
      </h1>
      <p className="font-body text-base md:text-lg text-text/70 mb-12 md:mb-16 max-w-xl">
        Find answers to common questions about our products, shipping, returns,
        and more.
      </p>

      <div className="max-w-3xl">
        {FAQ_ITEMS.map((item, index) => (
          <Accordion key={index} title={item.question}>
            <p>{item.answer}</p>
          </Accordion>
        ))}
      </div>
    </div>
  );
}
