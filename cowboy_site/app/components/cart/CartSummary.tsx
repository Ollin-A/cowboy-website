import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {Money, type OptimisticCart} from '@shopify/hydrogen';

type CartSummaryProps = {
  cart: OptimisticCart<CartApiQueryFragment | null>;
};

const FREE_SHIPPING_THRESHOLD = 150; // dollars — set to 0 to disable

export function CartSummary({cart}: CartSummaryProps) {
  const subtotal = cart?.cost?.subtotalAmount;
  const checkoutUrl = cart?.checkoutUrl;
  const subtotalValue = subtotal?.amount != null ? parseFloat(String(subtotal.amount)) : 0;

  const showThreshold = FREE_SHIPPING_THRESHOLD > 0;
  const remaining = FREE_SHIPPING_THRESHOLD - subtotalValue;
  const progress = Math.min(
    (subtotalValue / FREE_SHIPPING_THRESHOLD) * 100,
    100,
  );
  const qualifies = remaining <= 0;

  return (
    <div className="shrink-0 border-t border-primary/10 bg-bg px-6 py-5">
      {/* Free shipping threshold */}
      {showThreshold && (
        <div className="mb-4">
          {qualifies ? (
            <p className="text-xs text-primary font-body font-medium text-center mb-0">
              You qualify for free shipping!
            </p>
          ) : (
            <>
              <p className="text-xs text-text/60 font-body text-center mb-2">
                ${remaining.toFixed(2)} away from free shipping
              </p>
              <div
                className="w-full h-1 bg-primary/10 rounded-full overflow-hidden"
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Free shipping progress: ${Math.round(progress)}%`}
              >
                <div
                  className="h-full bg-primary rounded-full transition-all duration-base"
                  style={{width: `${progress}%`}}
                />
              </div>
            </>
          )}
        </div>
      )}

      {/* Subtotal */}
      <div className="flex items-center justify-between mb-4">
        <span className="font-body text-sm text-text/70 uppercase tracking-wide">
          Subtotal
        </span>
        <span className="font-body text-base font-medium text-primary">
          {subtotal?.amount ? <Money data={subtotal} /> : '\u2014'}
        </span>
      </div>

      <p className="text-xs text-text/50 font-body mb-4">
        Shipping & taxes calculated at checkout.
      </p>

      {/* Checkout CTA */}
      {checkoutUrl && (
        <a
          href={checkoutUrl}
          target="_self"
          className="flex items-center justify-center w-full py-4 bg-primary text-bg font-body font-medium text-sm tracking-widest uppercase no-underline hover:opacity-90 transition-opacity duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          Checkout
        </a>
      )}
    </div>
  );
}
