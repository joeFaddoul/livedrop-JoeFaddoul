import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate, useOutletContext } from 'react-router-dom';
import { QuantityStepper } from '@/components/molecules/quantity-stepper';
import { Button } from '@/components/atoms/button';
import { calculateCartTotal, useCartStore } from '@/lib/store';
import { formatCurrency } from '@/lib/format';
export function CartPage() {
    const navigate = useNavigate();
    const { productMap } = useOutletContext();
    const items = useCartStore((state) => state.items);
    const updateQuantity = useCartStore((state) => state.updateQuantity);
    const removeItem = useCartStore((state) => state.removeItem);
    const subtotal = calculateCartTotal(items, Object.fromEntries(Object.values(productMap).map((product) => [product.id, product.price])));
    if (items.length === 0) {
        return (_jsxs("section", { className: "rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-slate-200", children: [_jsx("h1", { className: "text-2xl font-semibold text-slate-100", children: "Your cart is empty" }), _jsx("p", { className: "mt-2 text-sm text-slate-400", children: "Browse the catalog and add items to your cart." })] }));
    }
    return (_jsxs("section", { className: "space-y-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-6", children: [_jsxs("header", { className: "flex items-center justify-between", children: [_jsx("h1", { className: "text-2xl font-semibold text-slate-100", children: "Cart" }), _jsxs("span", { className: "text-sm text-slate-400", children: [items.length, " ", items.length === 1 ? 'item' : 'items'] })] }), _jsx("ul", { className: "space-y-4", children: items.map((item) => {
                    const product = productMap[item.productId];
                    if (!product)
                        return null;
                    return (_jsxs("li", { className: "flex flex-col gap-4 rounded-2xl border border-slate-800 p-4 md:flex-row md:items-center md:justify-between", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("img", { src: product.image, alt: product.title, className: "h-20 w-20 rounded-xl object-cover" }), _jsxs("div", { children: [_jsx("h2", { className: "text-lg font-semibold text-slate-100", children: product.title }), _jsx("p", { className: "text-sm text-slate-400", children: formatCurrency(product.price) })] })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx(QuantityStepper, { quantity: item.quantity, min: 1, max: product.stockQty, onChange: (value) => updateQuantity(product.id, value) }), _jsx(Button, { variant: "ghost", onClick: () => removeItem(product.id), children: "Remove" })] })] }, item.productId));
                }) }), _jsxs("footer", { className: "flex flex-col items-end gap-3", children: [_jsxs("div", { className: "text-right", children: [_jsx("p", { className: "text-sm text-slate-400", children: "Subtotal" }), _jsx("p", { className: "text-2xl font-semibold text-slate-100", children: formatCurrency(subtotal) })] }), _jsx(Button, { size: "lg", onClick: () => navigate('/checkout'), children: "Proceed to checkout" })] })] }));
}
