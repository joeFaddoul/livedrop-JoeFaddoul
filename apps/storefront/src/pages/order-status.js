import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { getOrderStatus } from '@/lib/api';
import { maskId } from '@/lib/format';
const STATUS_DESCRIPTIONS = {
    Placed: 'We received your order and it is waiting to be packed.',
    Packed: 'Your order is packed and ready to hand off to the carrier.',
    Shipped: 'The carrier picked up the order and it is on the way.',
    Delivered: 'Package delivered. Reach out if anything is missing.',
};
export function OrderStatusPage() {
    const { orderId } = useParams();
    const location = useLocation();
    const [record, setRecord] = useState(null);
    const [error, setError] = useState(null);
    useEffect(() => {
        if (!orderId)
            return;
        getOrderStatus(orderId)
            .then((status) => {
            if (!status) {
                setError('We could not find that order. Double-check the order ID and try again.');
            }
            else {
                setRecord(status);
                setError(null);
            }
        })
            .catch(() => setError('Unable to load order status right now. Please try again later.'));
    }, [orderId]);
    if (!orderId) {
        return (_jsx("section", { className: "rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-slate-200", children: _jsx("p", { children: "No order selected." }) }));
    }
    const customerName = typeof location.state?.fullName === 'string' ? location.state.fullName : null;
    const maskedId = maskId(orderId);
    return (_jsxs("section", { className: "rounded-2xl border border-slate-800 bg-slate-900/60 p-6", children: [_jsx("header", { className: "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between", children: _jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-semibold text-slate-100", children: "Order status" }), _jsxs("p", { className: "text-sm text-slate-400", children: ["Order ", _jsx("span", { className: "font-mono text-slate-100", children: maskedId }), customerName ? ` for ${customerName}` : ''] })] }) }), error && _jsx("p", { className: "mt-4 rounded-lg bg-amber-500/20 px-4 py-3 text-amber-200", children: error }), record && (_jsxs("article", { className: "mt-6 space-y-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-5", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-xl font-semibold text-slate-100", children: record.status }), _jsx("p", { className: "text-sm text-slate-400", children: STATUS_DESCRIPTIONS[record.status] })] }), _jsxs("dl", { className: "grid gap-3 sm:grid-cols-2", children: [_jsxs("div", { children: [_jsx("dt", { className: "text-xs uppercase tracking-wide text-slate-500", children: "Last update" }), _jsx("dd", { className: "text-sm text-slate-200", children: new Date(record.updatedAt).toLocaleString() })] }), record.carrier && (_jsxs("div", { children: [_jsx("dt", { className: "text-xs uppercase tracking-wide text-slate-500", children: "Carrier" }), _jsxs("dd", { className: "text-sm text-slate-200", children: [record.carrier, record.eta ? `, ETA ${new Date(record.eta).toLocaleDateString()}` : ''] })] }))] })] }))] }));
}
