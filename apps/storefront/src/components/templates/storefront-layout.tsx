import { useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useLoaderData, useNavigate } from 'react-router-dom';
import { Button } from '../atoms/button';
import { CartDrawer } from '../organisms/cart-drawer';
import { SupportPanel } from '../organisms/support-panel';
import { useCartStore, calculateCartTotal } from '@/lib/store';
import type { Product } from '@/lib/types';
import { formatCurrency } from '@/lib/format';

type LayoutLoaderData = {
  products: Product[];
};

export function StorefrontLayout() {
  const navigate = useNavigate();
  const { products } = useLoaderData() as LayoutLoaderData;
  const [isSupportOpen, setSupportOpen] = useState(false);

  const items = useCartStore((state) => state.items);
  const isCartOpen = useCartStore((state) => state.isCartOpen);
  const openCart = useCartStore((state) => state.openCart);
  const closeCart = useCartStore((state) => state.closeCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  const productMap = useMemo(
    () =>
      products.reduce<Record<string, Product>>((acc, product) => {
        acc[product.id] = product;
        return acc;
      }, {}),
    [products],
  );

  const subtotal = calculateCartTotal(
    items,
    Object.fromEntries(products.map((product) => [product.id, product.price])),
  );

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
      <a
        href="#main"
        className="absolute left-1/2 -translate-x-1/2 -translate-y-full rounded-b-lg bg-brand px-4 py-2 text-sm font-semibold text-slate-900 focus:translate-y-0 focus:outline-none"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center gap-3 text-lg font-bold text-slate-100">
            <img src="/logo.svg" alt="Storefront logo" className="h-8 w-8" />
            Lightspeed Storefront
          </Link>
          <nav className="hidden gap-6 text-sm font-semibold text-slate-300 md:flex">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? 'text-brand-light' : 'hover:text-slate-100'
              }
              end
            >
              Catalog
            </NavLink>
            <NavLink
              to="/checkout"
              className={({ isActive }) =>
                isActive ? 'text-brand-light' : 'hover:text-slate-100'
              }
            >
              Checkout
            </NavLink>
            <NavLink
              to="/order/ORD-ALPHA99"
              className={({ isActive }) =>
                isActive ? 'text-brand-light' : 'hover:text-slate-100'
              }
            >
              Track Order
            </NavLink>
          </nav>
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              onClick={() => setSupportOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={isSupportOpen}
            >
              Ask Support
            </Button>
            <Button
              variant="primary"
              onClick={openCart}
              aria-haspopup="dialog"
              aria-expanded={isCartOpen}
            >
              Cart ({itemCount})
            </Button>
          </div>
        </div>
      </header>

      <main id="main" className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-300 md:p-6">
          <p>
            Fast, responsive storefront demo, still under active development. Cart total:{' '}
            <span className="font-semibold text-slate-100">{formatCurrency(subtotal)}</span>. Ask support for policies
            or track sample order IDs like <code className="rounded bg-slate-800 px-2 py-1">ORD-ALPHA99</code>.
          </p>
        </section>
        <Outlet
          context={{
            products,
            productMap,
          }}
        />
      </main>

      <footer className="border-t border-slate-800 bg-slate-950/90 py-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
          <p>&copy; {new Date().getFullYear()} Lightspeed Storefront.</p>
          <div className="flex gap-4">
            <a href="#main">Back to top</a>
            <button onClick={() => setSupportOpen(true)} className="text-brand hover:text-brand-light">
              Contact support
            </button>
          </div>
        </div>
      </footer>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={closeCart}
        items={items}
        products={productMap}
        subtotal={subtotal}
        onUpdateQuantity={updateQuantity}
        onRemove={removeItem}
        onCheckout={() => {
          closeCart();
          navigate('/checkout');
        }}
      />

      <SupportPanel
        isOpen={isSupportOpen}
        onClose={() => setSupportOpen(false)}
      />
    </div>
  );
}
