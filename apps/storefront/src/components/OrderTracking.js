import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { getOrderStatus } from '@/lib/api';
import { subscribeToOrderStatus } from '@/lib/sse-client';
const STATUS_LABELS = {
    Placed: 'Order placed',
    Packed: 'Packed for shipment',
    Shipped: 'Shipped',
    Delivered: 'Delivered',
};
export function OrderTracking({ orderId, initialStatus, onStatusChange }) {
    const [record, setRecord] = useState(initialStatus ?? null);
    const [error, setError] = useState(null);
    useEffect(() => {
        if (!orderId)
            return undefined;
        let isMounted = true;
        let stopListening;
        const bootstrap = async () => {
            try {
                const latest = await getOrderStatus(orderId);
                if (latest && isMounted) {
                    setRecord(latest);
                    onStatusChange?.(latest);
                }
            }
            catch (bootstrapError) {
                console.warn('Unable to fetch initial order status', bootstrapError); // eslint-disable-line no-console
            }
        };
        bootstrap();
        try {
            stopListening = subscribeToOrderStatus(orderId, (event) => {
                if (!isMounted)
                    return;
                if (event.type === 'error') {
                    setError(event.message);
                    return;
                }
                setError(null);
                setRecord(event.order);
                onStatusChange?.(event.order);
            });
        }
        catch (subscriptionError) {
            setError(subscriptionError instanceof Error
                ? subscriptionError.message
                : 'Unable to open live updates.');
        }
        return () => {
            isMounted = false;
            stopListening?.();
        };
    }, [orderId]);
    const steps = useMemo(() => {
        const history = record?.history ?? [];
        const statuses = ['Placed', 'Packed', 'Shipped', 'Delivered'];
        return statuses.map((status) => {
            const entry = history.find((item) => item.status === status);
            return {
                status,
                label: STATUS_LABELS[status],
                timestamp: entry?.timestamp,
                isActive: record?.status === status,
                isCompleted: Boolean(entry) && status !== record?.status,
            };
        });
    }, [record]);
    if (!orderId) {
        return null;
    }
    return (_jsxs("section", { className: "rounded-2xl border border-slate-800 bg-slate-950/60 p-5", children: [_jsxs("header", { className: "mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-lg font-semibold text-slate-100", children: "Live order tracking" }), _jsxs("p", { className: "text-sm text-slate-400", children: ["Order", ' ', _jsx("span", { className: "font-mono text-slate-100", children: record?.orderId ?? orderId }), ' ', record?.status ? `is currently ${record.status}.` : 'status will appear shortly.'] })] }), record?.carrier && (_jsxs("span", { className: "rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-200", children: [record.carrier, record.eta ? ` · ETA ${new Date(record.eta).toLocaleDateString()}` : ''] }))] }), error && (_jsx("p", { className: "mb-4 rounded-lg bg-amber-500/20 px-3 py-2 text-sm text-amber-200", children: error })), _jsx("ol", { className: "relative space-y-4 border-l border-slate-800 pl-6", children: steps.map((step) => (_jsxs("li", { className: "relative", children: [_jsx("span", { className: `absolute -left-[26px] mt-1 h-3 w-3 rounded-full ${step.isCompleted
                                ? 'bg-emerald-400'
                                : step.isActive
                                    ? 'bg-brand'
                                    : 'bg-slate-600'}` }), _jsxs("div", { className: "flex flex-col gap-1", children: [_jsx("span", { className: "text-sm font-semibold text-slate-100", children: step.label }), _jsx("span", { className: "text-xs text-slate-500", children: step.timestamp
                                        ? new Date(step.timestamp).toLocaleString()
                                        : 'Awaiting update…' })] })] }, step.status))) })] }));
}
