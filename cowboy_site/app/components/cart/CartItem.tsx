import type {CartLineUpdateInput} from '@shopify/hydrogen/storefront-api-types';
import {CartForm, Image, type OptimisticCartLine} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {Link} from 'react-router';
import {Money} from '@shopify/hydrogen';
import {useCartDrawer} from './CartDrawer';
import type {CartApiQueryFragment} from 'storefrontapi.generated';

export type CartLine = OptimisticCartLine<CartApiQueryFragment>;

type LineItemChildrenMap = {[parentId: string]: CartLine[]};

interface CartItemProps {
  line: CartLine;
  childrenMap: LineItemChildrenMap;
}

export function CartItem({line, childrenMap}: CartItemProps) {
  const {id, merchandise, quantity, cost, isOptimistic} = line;
  const {product, title, image, selectedOptions} = merchandise;
  const lineItemUrl = useVariantUrl(product.handle, selectedOptions);
  const {close} = useCartDrawer();
  const lineItemChildren = childrenMap[id];

  const prevQuantity = Math.max(0, quantity - 1);
  const nextQuantity = quantity + 1;

  return (
    <li className="py-5 first:pt-0 last:pb-0 border-b border-primary/8 last:border-b-0">
      <div className="flex gap-4">
        {/* Product image */}
        {image && (
          <Link
            to={lineItemUrl}
            onClick={close}
            prefetch="intent"
            className="shrink-0 w-20 h-20 bg-primary/5 rounded overflow-hidden"
          >
            <Image
              alt={`${product.title} - ${title}`}
              aspectRatio="1/1"
              data={image}
              height={80}
              width={80}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </Link>
        )}

        {/* Product details */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Name + Remove */}
          <div className="flex items-start justify-between gap-2">
            <Link
              to={lineItemUrl}
              onClick={close}
              prefetch="intent"
              className="font-body text-sm font-medium text-primary no-underline hover:underline leading-snug line-clamp-2"
            >
              {product.title}
            </Link>

            {/* Remove button */}
            <CartForm
              fetcherKey={getUpdateKey([id])}
              route="/cart"
              action={CartForm.ACTIONS.LinesRemove}
              inputs={{lineIds: [id]}}
            >
              <button
                type="submit"
                disabled={!!isOptimistic}
                className="shrink-0 flex items-center justify-center w-6 h-6 text-text/40 hover:text-primary bg-transparent border-none cursor-pointer transition-colors duration-fast p-0 disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label={`Remove ${product.title} from cart`}
              >
                <svg
                  width="14"
                  height="14"
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
            </CartForm>
          </div>

          {/* Variant options */}
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0">
            {selectedOptions
              .filter((opt) => opt.value !== 'Default Title')
              .map((option) => (
                <span
                  key={option.name}
                  className="text-xs text-text/60 font-body"
                >
                  {option.name}: {option.value}
                </span>
              ))}
          </div>

          {/* Price + Quantity */}
          <div className="mt-auto pt-2 flex items-center justify-between">
            {/* Quantity controls */}
            <div className="flex items-center border border-primary/15 rounded">
              <CartLineUpdateButton
                lines={[{id, quantity: prevQuantity}]}
              >
                <button
                  type="submit"
                  aria-label="Decrease quantity"
                  disabled={quantity <= 1 || !!isOptimistic}
                  className="w-8 h-8 flex items-center justify-center text-primary bg-transparent border-none cursor-pointer hover:bg-primary/5 transition-colors duration-fast disabled:opacity-30 disabled:cursor-not-allowed text-sm"
                >
                  &minus;
                </button>
              </CartLineUpdateButton>

              <span
                className="w-8 h-8 flex items-center justify-center text-sm font-body font-medium text-primary border-x border-primary/15 select-none"
                aria-label={`Quantity: ${quantity}`}
              >
                {quantity}
              </span>

              <CartLineUpdateButton
                lines={[{id, quantity: nextQuantity}]}
              >
                <button
                  type="submit"
                  aria-label="Increase quantity"
                  disabled={!!isOptimistic}
                  className="w-8 h-8 flex items-center justify-center text-primary bg-transparent border-none cursor-pointer hover:bg-primary/5 transition-colors duration-fast disabled:opacity-30 disabled:cursor-not-allowed text-sm"
                >
                  +
                </button>
              </CartLineUpdateButton>
            </div>

            {/* Line price */}
            <div className="font-body text-sm font-medium text-primary">
              {cost?.totalAmount ? (
                <Money data={cost.totalAmount} />
              ) : (
                <span>&mdash;</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Child line items (warranties, gift wrapping, etc.) */}
      {lineItemChildren && lineItemChildren.length > 0 && (
        <ul className="list-none m-0 p-0 pl-24 mt-2">
          {lineItemChildren.map((childLine) => (
            <CartItem
              key={childLine.id}
              line={childLine}
              childrenMap={childrenMap}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

function CartLineUpdateButton({
  children,
  lines,
}: {
  children: React.ReactNode;
  lines: CartLineUpdateInput[];
}) {
  const lineIds = lines.map((line) => line.id);
  return (
    <CartForm
      fetcherKey={getUpdateKey(lineIds)}
      route="/cart"
      action={CartForm.ACTIONS.LinesUpdate}
      inputs={{lines}}
    >
      {children}
    </CartForm>
  );
}

function getUpdateKey(lineIds: string[]) {
  return [CartForm.ACTIONS.LinesUpdate, ...lineIds].join('-');
}
