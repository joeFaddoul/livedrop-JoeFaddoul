import { FormEvent, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { calculateCartTotal, useCartStore } from '@/lib/store';
import type { Product } from '@/lib/types';
import { formatCurrency } from '@/lib/format';
import { placeOrder } from '@/lib/api';
import { Button } from '@/components/atoms/button';
import { TextInput } from '@/components/atoms/text-input';

type CheckoutContext = {
  productMap: Record<string, Product>;
};

export function CheckoutPage() {
  const navigate = useNavigate();
  const { productMap } = useOutletContext<CheckoutContext>();
  const items = useCartStore((state) => state.items);
  const clear = useCartStore((state) => state.clear);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const subtotal = calculateCartTotal(
    items,
    Object.fromEntries(Object.values(productMap).map((product) => [product.id, product.price])),
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!items.length) return;
    setIsSubmitting(true);
    try {
      const { orderId } = await placeOrder(items);
      clear();
      navigate(`/order/${orderId}`, { replace: true, state: { email, fullName } });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Unable to place order', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="grid gap-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 lg:grid-cols-2">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <h1 className="text-2xl font-semibold text-slate-100">Checkout</h1>
        <TextInput
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <TextInput
          label="Full name"
          placeholder="Shipping name"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          required
        />
        <p className="text-sm text-slate-400">
          This is a checkout stub. No payment is collected. Placing the order creates a mock order ID and redirects to
          the order status page.
        </p>
        <Button type="submit" size="lg" isLoading={isSubmitting} disabled={!items.length}>
          Place order
        </Button>
      </form>

      <aside className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
        <h2 className="text-lg font-semibold text-slate-100">Order summary</h2>
        {items.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400">
            Your cart is empty. Add items from the catalog before checking out.
          </p>
        ) : (
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            {items.map((item) => {
              const product = productMap[item.productId];
              if (!product) return null;
              return (
                <li key={item.productId} className="flex justify-between">
                  <span>
                    {product.title}{' '}
                    <span className="text-slate-500">&times; {item.quantity}</span>
                  </span>
                  <span>{formatCurrency(product.price * item.quantity)}</span>
                </li>
              );
            })}
            <li className="flex justify-between border-t border-slate-800 pt-3 text-base font-semibold text-slate-100">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </li>
          </ul>
        )}
      </aside>
    </section>
  );
}
