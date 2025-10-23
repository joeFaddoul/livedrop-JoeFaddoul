import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useLoaderData, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../atoms/button';
import { CartDrawer } from '../organisms/cart-drawer';
import { SupportPanel } from '../organisms/support-panel';
import { UserLogin } from '@/components/UserLogin';
import { useCartStore, useCustomerStore, calculateCartTotal } from '@/lib/store';
import { formatCurrency } from '@/lib/format';
export function StorefrontLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const { products } = useLoaderData();
    const [isSupportOpen, setSupportOpen] = useState(false);
    const items = useCartStore((state) => state.items);
    const isCartOpen = useCartStore((state) => state.isCartOpen);
    const openCart = useCartStore((state) => state.openCart);
    const closeCart = useCartStore((state) => state.closeCart);
    const updateQuantity = useCartStore((state) => state.updateQuantity);
    const removeItem = useCartStore((state) => state.removeItem);
    const syncWithCatalog = useCartStore((state) => state.syncWithCatalog);
    const profile = useCustomerStore((state) => state.profile);
    const recentOrders = useCustomerStore((state) => state.recentOrders);
    const productMap = useMemo(() => products.reduce((acc, product) => {
        acc[product.id] = product;
        return acc;
    }, {}), [products]);
    useEffect(() => {
        const validIds = products.map((product) => product.id);
        syncWithCatalog(validIds);
    }, [products, syncWithCatalog]);
    const subtotal = calculateCartTotal(items, Object.fromEntries(products.map((product) => [product.id, product.price])));
    const itemCount = items.reduce((total, item) => total + item.quantity, 0);
    const showIdentityCard = location.pathname === '/';
    return (_jsxs("div", { className: "min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900", children: [_jsx("a", { href: "#main", className: "absolute left-1/2 -translate-x-1/2 -translate-y-full rounded-b-lg bg-brand px-4 py-2 text-sm font-semibold text-slate-900 focus:translate-y-0 focus:outline-none", children: "Skip to content" }), _jsx("header", { className: "sticky top-0 z-20 border-b border-slate-800 bg-slate-950/80 backdrop-blur", children: _jsxs("div", { className: "mx-auto flex max-w-6xl items-center justify-between px-4 py-4", children: [_jsxs(Link, { to: "/", className: "flex items-center gap-3 text-lg font-bold text-slate-100", children: [_jsx("img", { src: "/logo.svg", alt: "Storefront logo", className: "h-8 w-8" }), "Lightspeed Storefront"] }), _jsxs("nav", { className: "hidden gap-6 text-sm font-semibold text-slate-300 md:flex", children: [_jsx(NavLink, { to: "/", className: ({ isActive }) => isActive ? 'text-brand-light' : 'hover:text-slate-100', end: true, children: "Catalog" }), _jsx(NavLink, { to: "/checkout", className: ({ isActive }) => isActive ? 'text-brand-light' : 'hover:text-slate-100', children: "Checkout" }), recentOrders.length > 0 ? (_jsx(NavLink, { to: `/order/${recentOrders[0].orderId}`, className: ({ isActive }) => isActive ? 'text-brand-light' : 'hover:text-slate-100', children: "Track Order" })) : (_jsx("span", { className: "cursor-not-allowed text-slate-600", title: "Provide your email to view order tracking", children: "Track Order" })), _jsx(NavLink, { to: "/admin/dashboard", className: ({ isActive }) => isActive ? 'text-brand-light' : 'hover:text-slate-100', children: "Admin Dashboard" })] }), _jsxs("div", { className: "flex items-center gap-3", children: [profile && (_jsx("span", { className: "hidden rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-200 md:inline-flex", children: profile.name.split(' ')[0] })), _jsx(Button, { variant: "secondary", onClick: () => setSupportOpen(true), "aria-haspopup": "dialog", "aria-expanded": isSupportOpen, children: "Ask Support" }), _jsxs(Button, { variant: "primary", onClick: openCart, "aria-haspopup": "dialog", "aria-expanded": isCartOpen, children: ["Cart (", itemCount, ")"] })] })] }) }), _jsxs("main", { id: "main", className: "mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8", children: [_jsxs("section", { className: "rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-300 md:p-6", children: [_jsxs("p", { children: ["Early-access storefront preview. We're still polishing the experience. Cart totals update instantly:", ' ', _jsx("span", { className: "font-semibold text-slate-100", children: formatCurrency(subtotal) }), ". Support can surface policies or track demo order IDs ", _jsx("code", { className: "rounded bg-slate-800 px-2 py-1", children: "." }), "."] }), profile ? (_jsxs("p", { className: "mt-2 text-xs text-slate-400", children: ["Signed in as ", _jsx("span", { className: "font-semibold text-slate-200", children: profile.email }), ". Recent orders and support answers will use this identity."] })) : (_jsx("p", { className: "mt-2 text-xs text-slate-400", children: "Save your email below so orders, SSE tracking, and the assistant can personalize responses." }))] }), showIdentityCard && _jsx(UserLogin, {}), _jsx(Outlet, { context: {
                            products,
                            productMap,
                        } })] }), _jsx("footer", { className: "border-t border-slate-800 bg-slate-950/90 py-6", children: _jsxs("div", { className: "mx-auto flex max-w-6xl flex-col gap-3 px-4 text-sm text-slate-400 md:flex-row md:items-center md:justify-between", children: [_jsxs("p", { children: ["\u00A9 ", new Date().getFullYear(), " Lightspeed Storefront."] }), _jsxs("div", { className: "flex gap-4", children: [_jsx("a", { href: "#main", children: "Back to top" }), _jsx("button", { onClick: () => setSupportOpen(true), className: "text-brand hover:text-brand-light", children: "Contact support" })] })] }) }), _jsx(CartDrawer, { isOpen: isCartOpen, onClose: closeCart, items: items, products: productMap, subtotal: subtotal, onUpdateQuantity: updateQuantity, onRemove: removeItem, onCheckout: () => {
                    closeCart();
                    navigate('/checkout');
                } }), _jsx(SupportPanel, { isOpen: isSupportOpen, onClose: () => setSupportOpen(false) })] }));
}
