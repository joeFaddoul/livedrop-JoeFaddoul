import { useEffect, useState } from 'react';
import { Link, useNavigate, useOutletContext, useParams } from 'react-router-dom';
import type { Product } from '@/lib/types';
import { formatCurrency } from '@/lib/format';
import { Button } from '@/components/atoms/button';
import { Badge } from '@/components/atoms/badge';
import { useCartStore } from '@/lib/store';
import { getRelatedProducts } from '@/lib/api';

type ProductContext = {
  productMap: Record<string, Product>;
};

export function ProductPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { productMap } = useOutletContext<ProductContext>();
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);

  const product = productId ? productMap[productId] : undefined;
  const [related, setRelated] = useState<Product[]>([]);

  useEffect(() => {
    if (productId) {
      getRelatedProducts(productId, 3).then(setRelated).catch(() => setRelated([]));
    }
  }, [productId]);

  if (!product) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-slate-200">
        <p>Product not found. Return to the <Link className="text-brand" to="/">catalog</Link>.</p>
      </div>
    );
  }

  const stockColor = product.stockQty > 20 ? 'success' : product.stockQty > 0 ? 'info' : 'warning';
  const stockLabel = product.stockQty > 20 ? 'In stock' : product.stockQty > 0 ? 'Limited quantities' : 'Out of stock';

  return (
    <article className="grid gap-8 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 md:grid-cols-2">
      <div className="flex items-center justify-center self-start overflow-hidden rounded-3xl bg-slate-950">
        <img
          src={product.image}
          alt={product.title}
          className="h-auto w-full max-w-full object-contain"
        />
      </div>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <Link to="/" className="text-sm text-brand">
            &larr; Back to catalog
          </Link>
          <h1 className="text-3xl font-bold text-slate-100">{product.title}</h1>
          <Badge color={stockColor as never}>{stockLabel}</Badge>
          <p className="text-lg text-slate-300">{product.description}</p>
          <p className="text-4xl font-semibold text-slate-50">{formatCurrency(product.price)}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            size="lg"
            onClick={() => {
              addItem(product.id, 1);
              openCart();
            }}
          >
            Add to Cart
          </Button>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => {
              addItem(product.id, 1);
              navigate('/checkout');
            }}
          >
            Buy instantly
          </Button>
        </div>
        <section aria-labelledby="related-heading" className="rounded-2xl border border-slate-800 p-4">
          <h2 id="related-heading" className="text-lg font-semibold text-slate-100">
            You may also like
          </h2>
          {related.length === 0 ? (
            <p className="mt-3 text-sm text-slate-400">No related products yet.</p>
          ) : (
            <ul className="mt-3 grid gap-3 sm:grid-cols-2">
              {related.map((item) => (
                <li key={item.id} className="rounded-xl border border-slate-800 p-3">
                  <Link to={`/p/${item.id}`} className="flex flex-col gap-2">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-32 w-full rounded-xl object-cover"
                      loading="lazy"
                    />
                    <span className="text-sm font-semibold text-slate-100">{item.title}</span>
                    <span className="text-sm text-slate-400">{formatCurrency(item.price)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </article>
  );
}
