import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCustomerStore } from '@/lib/store';
vi.mock('@/lib/api', () => ({
    lookupCustomer: vi.fn(async () => ({
        customer: {
            _id: 'cust-1',
            name: 'Demo Customer',
            email: 'demo@example.com',
        },
        recentOrders: [
            {
                _id: 'order-1',
                status: 'Placed',
                total: 120,
                createdAt: new Date().toISOString(),
            },
        ],
    })),
}));
describe('UserLogin', () => {
    beforeEach(() => {
        const { clearCustomer } = useCustomerStore.getState();
        clearCustomer();
        vi.clearAllMocks();
    });
    it('looks up customer by email and stores profile', async () => {
        const user = userEvent.setup();
        const { UserLogin } = await import('./UserLogin');
        render(_jsx(UserLogin, {}));
        await user.type(screen.getByLabelText(/email address/i), 'demo@example.com');
        await user.click(screen.getByRole('button', { name: /save identity/i }));
        await waitFor(() => expect(screen.getByText(/welcome back, demo!/i)).toBeInTheDocument());
        const { profile } = useCustomerStore.getState();
        expect(profile?.email).toBe('demo@example.com');
    });
});
