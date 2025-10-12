import { useNavigate, useOutletContext } from 'react-router-dom';
import { QuantityStepper } from '@/components/molecules/quantity-stepper';
import { Button } from '@/components/atoms/button';
import { calculateCartTotal, useCartStore } from '@/lib/store';
import type { Product } from '@/lib/types';
import { formatCurrency } from '@/lib/format';

type CartContext = {
  productMap: Record<string, Product>;
};

export function CartPage() {
  const navigate = useNavigate();
  const { productMap } = useOutletContext<CartContext>();
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const subtotal = calculateCartTotal(
    items,
    Object.fromEntries(Object.values(productMap).map((product) => [product.id, product.price])),
  );

  if (items.length === 0) {
    return (
      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-slate-200">
        <h1 className="text-2xl font-semibold text-slate-100">Your cart is empty</h1>
        <p className="mt-2 text-sm text-slate-400">Browse the catalog and add items to your cart.</p>
      </section>
    );
  }

  return (
    <section className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-100">Cart</h1>
        <span className="text-sm text-slate-400">
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </span>
      </header>
      <ul className="space-y-4">
        {items.map((item) => {
          const product = productMap[item.productId];
          if (!product) return null;
          return (
            <li key={item.productId} className="flex flex-col gap-4 rounded-2xl border border-slate-800 p-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <img src={product.image} alt={product.title} className="h-20 w-20 rounded-xl object-cover" />
                <div>
                  <h2 className="text-lg font-semibold text-slate-100">{product.title}</h2>
                  <p className="text-sm text-slate-400">{formatCurrency(product.price)}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <QuantityStepper
                  quantity={item.quantity}
                  min={1}
                  max={product.stockQty}
                  onChange={(value) => updateQuantity(product.id, value)}
                />
                <Button variant="ghost" onClick={() => removeItem(product.id)}>
                  Remove
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
      <footer className="flex flex-col items-end gap-3">
        <div className="text-right">
          <p className="text-sm text-slate-400">Subtotal</p>
          <p className="text-2xl font-semibold text-slate-100">{formatCurrency(subtotal)}</p>
        </div>
        <Button size="lg" onClick={() => navigate('/checkout')}>
          Proceed to checkout
        </Button>
      </footer>
    </section>
  );
}
