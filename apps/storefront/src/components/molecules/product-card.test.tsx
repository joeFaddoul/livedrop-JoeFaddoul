import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { ProductCard } from './product-card';
import type { Product } from '@/lib/types';

const product: Product = {
  id: 'SKU-TEST',
  title: 'Test Product',
  price: 10,
  image: 'https://picsum.photos/seed/test/200/200',
  tags: ['test'],
  stockQty: 5,
  description: 'Just a test product.',
};

describe('ProductCard', () => {
  it('renders product info', () => {
    render(
      <MemoryRouter>
        <ProductCard product={product} onAddToCart={() => {}} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: /test product/i })).toBeInTheDocument();
    expect(screen.getByText(/just a test product/i)).toBeInTheDocument();
    expect(screen.getByText('$10.00')).toBeInTheDocument();
  });

  it('fires add to cart handler', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(
      <MemoryRouter>
        <ProductCard product={product} onAddToCart={onAdd} />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: /add test product to cart/i }));
    expect(onAdd).toHaveBeenCalledOnce();
    expect(onAdd).toHaveBeenCalledWith('SKU-TEST');
  });
});
