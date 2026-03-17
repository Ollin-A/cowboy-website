import type {CartApiQueryFragment, HeaderQuery} from 'storefrontapi.generated';
import {Aside} from '~/components/Aside';
import {Footer} from '~/components/Footer';
import {Header} from '~/components/Header';
import {CartDrawer, CartDrawerProvider} from '~/components/cart/CartDrawer';

interface PageLayoutProps {
  cart: Promise<CartApiQueryFragment | null>;
  header: HeaderQuery;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
  children?: React.ReactNode;
  footer?: unknown;
}

export function PageLayout({
  cart,
  children = null,
}: PageLayoutProps) {
  return (
    <Aside.Provider>
      <CartDrawerProvider>
        <CartDrawer cart={cart} />
        <Header cart={cart} />
        {/* Spacer for fixed header */}
        <div className="h-16 md:h-[70px]" />
        <main id="main-content" className="min-h-screen">{children}</main>
        <Footer />
      </CartDrawerProvider>
    </Aside.Provider>
  );
}
