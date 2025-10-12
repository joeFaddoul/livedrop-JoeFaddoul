import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { CatalogGrid } from '@/components/organisms/catalog-grid';
import { SearchBar } from '@/components/molecules/search-bar';
import { useCartStore } from '@/lib/store';
import type { Product } from '@/lib/types';

type CatalogContext = {
  products: Product[];
};

export function CatalogPage() {
  const { products } = useOutletContext<CatalogContext>();
  const addItem = useCartStore((state) => state.addItem);
  const [query, setQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');
  const [sort, setSort] = useState<'price-asc' | 'price-desc'>('price-asc');

  const tags = useMemo(
    () => Array.from(new Set(products.flatMap((product) => product.tags))).sort(),
    [products],
  );

  const filtered = useMemo(() => {
    const tokens = query
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);
    return products
      .filter((product) => {
        const matchesTag = selectedTag === 'all' || product.tags.includes(selectedTag);
        const matchesQuery =
          tokens.length === 0 ||
          tokens.every(
            (token) =>
              product.title.toLowerCase().includes(token) ||
              product.tags.some((tag) => tag.toLowerCase().includes(token)),
          );
        return matchesTag && matchesQuery;
      })
      .sort((a, b) => (sort === 'price-asc' ? a.price - b.price : b.price - a.price));
  }, [products, query, selectedTag, sort]);

  return (
    <div className="flex flex-col gap-6">
      <SearchBar
        query={query}
        onQueryChange={setQuery}
        selectedTag={selectedTag}
        onTagChange={setSelectedTag}
        sort={sort}
        onSortChange={setSort}
        tags={tags}
      />
      <CatalogGrid
        products={filtered}
        onAddToCart={(productId) => {
          addItem(productId, 1);
        }}
      />
    </div>
  );
}
