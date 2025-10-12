import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createMemoryRouter, Outlet, RouterProvider } from 'react-router-dom';
import { CheckoutPage } from './checkout';

const productMap = {
  'SKU-1': {
    id: 'SKU-1',
    title: 'Sample product',
    price: 20,
    image: 'https://picsum.photos/seed/sample/200/200',
    tags: [],
    stockQty: 5,
    description: 'Sample description',
  },
};

function ContextProvider() {
  return <Outlet context={{ productMap }} />;
}

describe('CheckoutPage', () => {
  it('disables place order when cart empty', async () => {
    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: <ContextProvider />,
          children: [
            {
              index: true,
              element: <CheckoutPage />,
            },
          ],
        },
      ],
      { initialEntries: ['/'] },
    );

    render(<RouterProvider router={router} />);
    const button = await screen.findByRole('button', { name: /place order/i });
    expect(button).toBeDisabled();
  });
});
