import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ProductCard } from '../molecules/product-card';
export function CatalogGrid({ products, onAddToCart, emptyMessage = 'No products match your filters.' }) {
    if (products.length === 0) {
        return (_jsxs("div", { className: "rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 p-10 text-center", children: [_jsx("p", { className: "text-lg font-semibold text-slate-200", children: emptyMessage }), _jsx("p", { className: "mt-2 text-sm text-slate-400", children: "Try adjusting filters or clearing the search." })] }));
    }
    return (_jsx("div", { className: "grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", role: "list", "aria-label": "Product catalog", children: products.map((product) => (_jsx("div", { role: "listitem", children: _jsx(ProductCard, { product: product, onAddToCart: onAddToCart }) }, product.id))) }));
}
