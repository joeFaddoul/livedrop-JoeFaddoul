import { Link } from 'react-router-dom';
import type { Product } from '@/lib/types';
import { formatCurrency } from '@/lib/format';
import { Badge } from '../atoms/badge';
import { Button } from '../atoms/button';

export type ProductCardProps = {
  product: Product;
  onAddToCart: (productId: string) => void;
};

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm transition hover:border-brand/60 hover:shadow-lg hover:shadow-brand/10">
      <Link
        to={`/p/${product.id}`}
        className="group relative block overflow-hidden rounded-t-2xl"
      >
        <img
          src={product.image}
          alt={product.title}
          loading="lazy"
          className="h-48 w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3">
          <Badge color={product.stockQty > 50 ? 'success' : product.stockQty < 10 ? 'warning' : 'info'}>
            {product.stockQty > 50 ? 'In stock' : product.stockQty < 10 ? 'Low stock' : 'Limited'}
          </Badge>
        </span>
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <header>
          <h3 className="text-lg font-semibold text-slate-100">{product.title}</h3>
          <p className="mt-1 text-sm text-slate-400 line-clamp-2">{product.description}</p>
        </header>
        <footer className="mt-auto flex items-center justify-between">
          <span className="text-xl font-bold text-slate-50">{formatCurrency(product.price)}</span>
          <Button size="sm" onClick={() => onAddToCart(product.id)} aria-label={`Add ${product.title} to cart`}>
            Add to Cart
          </Button>
        </footer>
      </div>
    </article>
  );
}
