import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { calculateCartTotal, useCartStore, useCustomerStore } from '@/lib/store';
import { formatCurrency } from '@/lib/format';
import { lookupCustomer, placeOrder } from '@/lib/api';
import { Button } from '@/components/atoms/button';
import { TextInput } from '@/components/atoms/text-input';
export function CheckoutPage() {
    const navigate = useNavigate();
    const { productMap } = useOutletContext();
    const items = useCartStore((state) => state.items);
    const clear = useCartStore((state) => state.clear);
    const setCustomer = useCustomerStore((state) => state.setCustomer);
    const removeItem = useCartStore((state) => state.removeItem);
    const customerProfile = useCustomerStore((state) => state.profile);
    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState(null);
    const subtotal = calculateCartTotal(items, Object.fromEntries(Object.values(productMap).map((product) => [product.id, product.price])));
    useEffect(() => {
        if (customerProfile?.email) {
            setEmail((prev) => (prev ? prev : customerProfile.email ?? ''));
        }
    }, [customerProfile]);
    useEffect(() => {
        const missingItems = items.filter((item) => !productMap[item.productId]);
        if (missingItems.length > 0) {
            missingItems.forEach((item) => removeItem(item.productId));
            setFormError('Some items in your cart were no longer available and have been removed. Please add them again from the catalog.');
        }
    }, [items, productMap, removeItem]);
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!items.length)
            return;
        const customerEmail = email || customerProfile?.email;
        if (!customerEmail) {
            setFormError('Please add your email above so we can connect the order to your account.');
            return;
        }
        setIsSubmitting(true);
        try {
            setFormError(null);
            const idempotencyKey = typeof crypto !== 'undefined' && 'randomUUID' in crypto
                ? crypto.randomUUID()
                : Math.random().toString(36).slice(2);
            const { orderId } = await placeOrder(customerEmail, items, idempotencyKey);
            try {
                const refreshed = await lookupCustomer(customerEmail);
                setCustomer(refreshed.customer, refreshed.recentOrders);
            }
            catch (refreshError) {
                console.warn('Unable to refresh customer data after checkout', refreshError); // eslint-disable-line no-console
            }
            clear();
            navigate(`/order/${orderId}`, { replace: true, state: { email, fullName } });
        }
        catch (error) {
            // eslint-disable-next-line no-console
            console.error('Unable to place order', error);
            let message = 'Unable to place order. Please try again or contact support.';
            if (error instanceof Error) {
                const match = error.message.match(/API\s+\d+:\s+(.*)$/);
                if (match) {
                    try {
                        const parsed = JSON.parse(match[1]);
                        if (parsed?.error) {
                            message = typeof parsed.error === 'string' ? parsed.error : message;
                        }
                    }
                    catch {
                        message = match[1];
                    }
                }
                else if (error.message) {
                    message = error.message;
                }
            }
            setFormError(message);
        }
        finally {
            setIsSubmitting(false);
        }
    };
    return (_jsxs("section", { className: "grid gap-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 lg:grid-cols-2", children: [_jsxs("form", { className: "space-y-4", onSubmit: handleSubmit, children: [_jsx("h1", { className: "text-2xl font-semibold text-slate-100", children: "Checkout" }), _jsx(TextInput, { label: "Email", type: "email", placeholder: "you@example.com", value: email, onChange: (event) => setEmail(event.target.value), required: true }), _jsx(TextInput, { label: "Full name", placeholder: "Shipping name", value: fullName, onChange: (event) => setFullName(event.target.value), required: true }), formError && (_jsx("p", { className: "rounded-lg bg-amber-500/20 px-3 py-2 text-sm text-amber-200", children: formError })), _jsx("p", { className: "text-sm text-slate-400", children: "This is a checkout stub. No payment is collected. Placing the order creates a mock order ID and redirects to the order status page." }), _jsx(Button, { type: "submit", size: "lg", isLoading: isSubmitting, disabled: !items.length, children: "Place order" })] }), _jsxs("aside", { className: "rounded-2xl border border-slate-800 bg-slate-950/60 p-5", children: [_jsx("h2", { className: "text-lg font-semibold text-slate-100", children: "Order summary" }), items.length === 0 ? (_jsx("p", { className: "mt-3 text-sm text-slate-400", children: "Your cart is empty. Add items from the catalog before checking out." })) : (_jsxs("ul", { className: "mt-4 space-y-3 text-sm text-slate-300", children: [items.map((item) => {
                                const product = productMap[item.productId];
                                if (!product)
                                    return null;
                                return (_jsxs("li", { className: "flex justify-between", children: [_jsxs("span", { children: [product.title, ' ', _jsxs("span", { className: "text-slate-500", children: ["\u00D7 ", item.quantity] })] }), _jsx("span", { children: formatCurrency(product.price * item.quantity) })] }, item.productId));
                            }), _jsxs("li", { className: "flex justify-between border-t border-slate-800 pt-3 text-base font-semibold text-slate-100", children: [_jsx("span", { children: "Subtotal" }), _jsx("span", { children: formatCurrency(subtotal) })] })] }))] })] }));
}
