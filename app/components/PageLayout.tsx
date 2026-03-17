import type {CartApiQueryFragment, HeaderQuery} from 'storefrontapi.generated';
import {useNavigation} from 'react-router';
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
  const navigation = useNavigation();
  const isLoading = navigation.state === 'loading';

  return (
    <Aside.Provider>
      <CartDrawerProvider>
        <CartDrawer cart={cart} />
        <Header cart={cart} />
        {/* Spacer for fixed header */}
        <div className="h-16 md:h-[70px]" />
        <main
          id="main-content"
          className="min-h-screen"
          style={{
            opacity: isLoading ? 0.4 : 1,
            transition: `opacity ${isLoading ? '0.2s' : '0.3s'} ease`,
          }}
        >
          {children}
        </main>
        <Footer />
      </CartDrawerProvider>
    </Aside.Provider>
  );
}
