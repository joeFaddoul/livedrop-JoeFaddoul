import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { CatalogGrid } from './catalog-grid';

const products = [
  {
    id: 'SKU-1',
    title: 'Sample',
    price: 10,
    image: 'https://picsum.photos/seed/sample/200/200',
    tags: ['sample'],
    stockQty: 5,
    description: 'Sample description',
  },
];

describe('CatalogGrid', () => {
  it('renders list items for products', () => {
    render(
      <MemoryRouter>
        <CatalogGrid products={products} onAddToCart={() => {}} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('list', { name: /product catalog/i })).toBeInTheDocument();
    expect(screen.getByRole('listitem')).toBeInTheDocument();
  });

  it('shows empty state when no products', () => {
    render(
      <MemoryRouter>
        <CatalogGrid products={[]} onAddToCart={() => {}} />
      </MemoryRouter>,
    );
    expect(screen.getByText(/no products match/i)).toBeInTheDocument();
  });
});
