import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen } from '@testing-library/react';
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { OrderStatusPage } from './order-status';
import { useCustomerStore } from '@/lib/store';
vi.mock('@/lib/api', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        getOrderStatus: vi.fn(async (orderId) => {
            if (orderId === 'ORD-TEST1234') {
                return {
                    orderId,
                    status: 'Packed',
                    carrier: 'Lightspeed Logistics',
                    updatedAt: new Date('2024-01-01T10:00:00Z').toISOString(),
                };
            }
            return undefined;
        }),
    };
});
vi.mock('@/lib/sse-client', () => ({
    subscribeToOrderStatus: vi.fn(() => () => { }),
}));
describe('OrderStatusPage', () => {
    beforeEach(() => {
        useCustomerStore.setState({ profile: undefined, recentOrders: [] });
    });
    afterEach(() => {
        useCustomerStore.setState({ profile: undefined, recentOrders: [] });
    });
    it('renders masked order id when found', async () => {
        useCustomerStore.setState({
            profile: {
                _id: 'cust-1',
                name: 'Test User',
                email: 'test@example.com',
            },
            recentOrders: [
                {
                    _id: 'order-1',
                    orderId: 'ORD-TEST1234',
                    status: 'Packed',
                    total: 100,
                    createdAt: new Date('2024-01-01T09:00:00Z').toISOString(),
                },
                {
                    _id: 'order-2',
                    orderId: 'ORD-SECOND',
                    status: 'Placed',
                    total: 50,
                    createdAt: new Date('2024-01-02T09:00:00Z').toISOString(),
                },
            ],
        });
        const router = createMemoryRouter([
            {
                path: '/order/:orderId',
                element: _jsx(OrderStatusPage, {}),
            },
        ], { initialEntries: ['/order/ORD-TEST1234'] });
        render(_jsx(RouterProvider, { router: router }));
        expect(await screen.findByRole('heading', { name: /order status/i })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /packed/i })).toBeInTheDocument();
        const orderCards = await screen.findAllByTestId('order-card');
        expect(orderCards).toHaveLength(2);
        expect(orderCards[0]).toHaveTextContent('****COND');
        expect(orderCards[1]).toHaveTextContent('****1234');
    });
});
