import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CartDrawer } from './cart-drawer';
const products = {
    'SKU-1': {
        id: 'SKU-1',
        title: 'Sample Product',
        price: 25,
        image: 'https://picsum.photos/seed/sample/200/200',
        tags: [],
        stockQty: 5,
        description: 'Sample description',
    },
};
describe('CartDrawer', () => {
    it('renders cart items when open', () => {
        render(_jsx(CartDrawer, { isOpen: true, onClose: () => { }, items: [{ productId: 'SKU-1', quantity: 2 }], products: products, onUpdateQuantity: () => { }, onRemove: () => { }, subtotal: 50, onCheckout: () => { } }));
        expect(screen.getByRole('heading', { name: /cart/i })).toBeInTheDocument();
        expect(screen.getByText(/sample product/i)).toBeInTheDocument();
        expect(screen.getByText('$25.00')).toBeInTheDocument();
    });
    it('emits checkout callback', async () => {
        const user = userEvent.setup();
        const onCheckout = vi.fn();
        render(_jsx(CartDrawer, { isOpen: true, onClose: () => { }, items: [{ productId: 'SKU-1', quantity: 1 }], products: products, onUpdateQuantity: () => { }, onRemove: () => { }, subtotal: 25, onCheckout: onCheckout }));
        await user.click(screen.getByRole('button', { name: /go to checkout/i }));
        expect(onCheckout).toHaveBeenCalledOnce();
    });
});
