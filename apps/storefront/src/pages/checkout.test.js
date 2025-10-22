import { jsx as _jsx } from "react/jsx-runtime";
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
    return _jsx(Outlet, { context: { productMap } });
}
describe('CheckoutPage', () => {
    it('disables place order when cart empty', async () => {
        const router = createMemoryRouter([
            {
                path: '/',
                element: _jsx(ContextProvider, {}),
                children: [
                    {
                        index: true,
                        element: _jsx(CheckoutPage, {}),
                    },
                ],
            },
        ], { initialEntries: ['/'] });
        render(_jsx(RouterProvider, { router: router }));
        const button = await screen.findByRole('button', { name: /place order/i });
        expect(button).toBeDisabled();
    });
});
