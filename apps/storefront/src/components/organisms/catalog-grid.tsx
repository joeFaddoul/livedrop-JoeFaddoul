import { ProductCard } from '../molecules/product-card';
import type { Product } from '@/lib/types';

export type CatalogGridProps = {
  products: Product[];
  onAddToCart: (productId: string) => void;
  emptyMessage?: string;
};

export function CatalogGrid({ products, onAddToCart, emptyMessage = 'No products match your filters.' }: CatalogGridProps) {
  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 p-10 text-center">
        <p className="text-lg font-semibold text-slate-200">{emptyMessage}</p>
        <p className="mt-2 text-sm text-slate-400">Try adjusting filters or clearing the search.</p>
      </div>
    );
  }

  return (
    <div
      className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      role="list"
      aria-label="Product catalog"
    >
      {products.map((product) => (
        <div role="listitem" key={product.id}>
          <ProductCard product={product} onAddToCart={onAddToCart} />
        </div>
      ))}
    </div>
  );
}
