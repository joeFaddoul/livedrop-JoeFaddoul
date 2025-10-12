import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Link, useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { formatCurrency } from '@/lib/format';
import { Button } from '@/components/atoms/button';
import { Badge } from '@/components/atoms/badge';
import { useCartStore } from '@/lib/store';
import { getRelatedProducts } from '@/lib/api';
export function ProductPage() {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { productMap } = useOutletContext();
    const addItem = useCartStore((state) => state.addItem);
    const openCart = useCartStore((state) => state.openCart);
    const product = productId ? productMap[productId] : undefined;
    const [related, setRelated] = useState([]);
    useEffect(() => {
        if (productId) {
            getRelatedProducts(productId, 3).then(setRelated).catch(() => setRelated([]));
        }
    }, [productId]);
    if (!product) {
        return (_jsx("div", { className: "rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-slate-200", children: _jsxs("p", { children: ["Product not found. Return to the ", _jsx(Link, { className: "text-brand", to: "/", children: "catalog" }), "."] }) }));
    }
    const stockColor = product.stockQty > 20 ? 'success' : product.stockQty > 0 ? 'info' : 'warning';
    const stockLabel = product.stockQty > 20 ? 'In stock' : product.stockQty > 0 ? 'Limited quantities' : 'Out of stock';
    return (_jsxs("article", { className: "grid gap-8 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 md:grid-cols-2", children: [_jsx("div", { children: _jsx("img", { src: product.image, alt: product.title, className: "h-full w-full rounded-3xl object-cover" }) }), _jsxs("div", { className: "flex flex-col gap-6", children: [_jsxs("div", { className: "flex flex-col gap-3", children: [_jsx(Link, { to: "/", className: "text-sm text-brand", children: "\u2190 Back to catalog" }), _jsx("h1", { className: "text-3xl font-bold text-slate-100", children: product.title }), _jsx(Badge, { color: stockColor, children: stockLabel }), _jsx("p", { className: "text-lg text-slate-300", children: product.description }), _jsx("p", { className: "text-4xl font-semibold text-slate-50", children: formatCurrency(product.price) })] }), _jsxs("div", { className: "flex flex-col gap-3 sm:flex-row", children: [_jsx(Button, { size: "lg", onClick: () => {
                                    addItem(product.id, 1);
                                    openCart();
                                }, children: "Add to Cart" }), _jsx(Button, { size: "lg", variant: "secondary", onClick: () => {
                                    addItem(product.id, 1);
                                    navigate('/checkout');
                                }, children: "Buy instantly" })] }), _jsxs("section", { "aria-labelledby": "related-heading", className: "rounded-2xl border border-slate-800 p-4", children: [_jsx("h2", { id: "related-heading", className: "text-lg font-semibold text-slate-100", children: "You may also like" }), related.length === 0 ? (_jsx("p", { className: "mt-3 text-sm text-slate-400", children: "No related products yet." })) : (_jsx("ul", { className: "mt-3 grid gap-3 sm:grid-cols-2", children: related.map((item) => (_jsx("li", { className: "rounded-xl border border-slate-800 p-3", children: _jsxs(Link, { to: `/p/${item.id}`, className: "flex flex-col gap-2", children: [_jsx("img", { src: item.image, alt: item.title, className: "h-32 w-full rounded-xl object-cover", loading: "lazy" }), _jsx("span", { className: "text-sm font-semibold text-slate-100", children: item.title }), _jsx("span", { className: "text-sm text-slate-400", children: formatCurrency(item.price) })] }) }, item.id))) }))] })] })] }));
}
