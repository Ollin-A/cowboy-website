import {useEffect} from 'react';
import {type FetcherWithComponents} from 'react-router';
import {CartForm, type OptimisticCartLineInput} from '@shopify/hydrogen';
import {useCartDrawer} from '~/components/cart/CartDrawer';

export function AddToCartButton({
  analytics,
  children,
  disabled,
  lines,
  onClick,
}: {
  analytics?: unknown;
  children: React.ReactNode;
  disabled?: boolean;
  lines: Array<OptimisticCartLineInput>;
  onClick?: () => void;
}) {
  const {open} = useCartDrawer();

  return (
    <CartForm route="/cart" inputs={{lines}} action={CartForm.ACTIONS.LinesAdd}>
      {(fetcher: FetcherWithComponents<any>) => (
        <>
          <AddToCartEffect fetcher={fetcher} onAdded={open} />
          <input
            name="analytics"
            type="hidden"
            value={JSON.stringify(analytics)}
          />
          <button
            type="submit"
            onClick={onClick}
            disabled={disabled ?? fetcher.state !== 'idle'}
          >
            {children}
          </button>
        </>
      )}
    </CartForm>
  );
}

/**
 * Opens the cart drawer when a line is successfully added.
 * Watches the fetcher transition from loading → idle (success).
 */
function AddToCartEffect({
  fetcher,
  onAdded,
}: {
  fetcher: FetcherWithComponents<any>;
  onAdded: () => void;
}) {
  useEffect(() => {
    if (fetcher.state === 'loading' && fetcher.data) {
      onAdded();
    }
  }, [fetcher.state, fetcher.data, onAdded]);

  return null;
}
