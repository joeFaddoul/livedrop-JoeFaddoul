import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { StorefrontLayout } from './storefront-layout';

describe('StorefrontLayout', () => {
  it('renders navigation and cart button', async () => {
    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: <StorefrontLayout />,
          loader: () => ({
            products: [
              {
                id: 'SKU-1',
                title: 'Sample product',
                price: 12,
                image: 'https://picsum.photos/seed/sample/200/200',
                tags: ['sample'],
                stockQty: 5,
                description: 'Sample description',
              },
            ],
          }),
          children: [
            {
              index: true,
              element: <div>Home</div>,
            },
          ],
        },
      ],
      { initialEntries: ['/'] },
    );

    render(<RouterProvider router={router} />);

    expect(
      await screen.findByRole('button', { name: /cart/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });
});
