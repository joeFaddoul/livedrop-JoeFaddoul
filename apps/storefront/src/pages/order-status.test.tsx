import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { OrderStatusPage } from './order-status';

vi.mock('@/lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api')>();
  return {
    ...actual,
    getOrderStatus: vi.fn(async (orderId: string) => {
      if (orderId === 'ORD-TEST1234') {
        return {
          orderId,
          status: 'Packed' as const,
          carrier: 'Lightspeed Logistics',
          updatedAt: new Date('2024-01-01T10:00:00Z').toISOString(),
        };
      }
      return undefined;
    }),
  };
});

describe('OrderStatusPage', () => {
  it('renders masked order id when found', async () => {
    const router = createMemoryRouter(
      [
        {
          path: '/order/:orderId',
          element: <OrderStatusPage />,
        },
      ],
      { initialEntries: ['/order/ORD-TEST1234'] },
    );

    render(<RouterProvider router={router} />);

    expect(await screen.findByText(/\*\*\*\*1234/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /packed/i })).toBeInTheDocument();
  });
});
