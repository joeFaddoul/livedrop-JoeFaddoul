import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { CartDrawer } from './cart-drawer';
const products = {
    'CUBE-2001': {
        id: 'CUBE-2001',
        title: 'Nova Speed Cube 3x3',
        price: 17.99,
        image: 'https://picsum.photos/seed/nova3x3/200/200',
        tags: ['3x3', 'speed'],
        stockQty: 140,
        description: 'Magnetic flagship 3x3 cube.',
    },
};
const meta = {
    title: 'Organisms/CartDrawer',
    component: CartDrawer,
    render: (args) => {
        const [open, setOpen] = useState(true);
        return (_jsxs(_Fragment, { children: [_jsx("button", { className: "rounded bg-brand px-4 py-2 text-slate-900", onClick: () => setOpen(true), children: "Open Cart" }), _jsx(CartDrawer, { ...args, isOpen: open, onClose: () => setOpen(false), onCheckout: () => setOpen(false) })] }));
    },
    args: {
        isOpen: true,
        items: [{ productId: 'CUBE-2001', quantity: 1 }],
        products,
        subtotal: 17.99,
        onUpdateQuantity: () => { },
        onRemove: () => { },
    },
};
export default meta;
export const Default = {};
