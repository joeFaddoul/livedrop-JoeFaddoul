import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getOrderStatus } from '@/lib/api';
import { OrderTracking } from '@/components/OrderTracking';
import { maskId } from '@/lib/format';
import { formatCurrency } from '@/lib/format';
import { useCustomerStore } from '@/lib/store';
export function OrderStatusPage() {
    const { orderId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const profile = useCustomerStore((state) => state.profile);
    const recentOrders = useCustomerStore((state) => state.recentOrders);
    const sortedOrders = useMemo(() => [...recentOrders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), [recentOrders]);
    const routeOrderExists = orderId ? sortedOrders.some((order) => order.orderId === orderId) : false;
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [initialRecord, setInitialRecord] = useState(null);
    const [currentRecord, setCurrentRecord] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        if (!profile || sortedOrders.length === 0) {
            setSelectedOrderId(null);
            return;
        }
        if (orderId && routeOrderExists) {
            setSelectedOrderId(orderId);
            return;
        }
        const fallbackOrderId = sortedOrders[0].orderId;
        setSelectedOrderId(fallbackOrderId);
        if (!orderId) {
            navigate(`/order/${fallbackOrderId}`, { replace: true });
        }
        else if (!routeOrderExists) {
            navigate(`/order/${fallbackOrderId}`, { replace: true });
        }
    }, [orderId, profile, routeOrderExists, sortedOrders, navigate]);
    useEffect(() => {
        if (!profile || !selectedOrderId) {
            setInitialRecord(null);
            setCurrentRecord(null);
            setLoading(false);
            return;
        }
        setLoading(true);
        getOrderStatus(selectedOrderId)
            .then((status) => {
            if (!status) {
                setError('We could not find that order. Double-check the order ID and try again.');
                setInitialRecord(null);
                setCurrentRecord(null);
            }
            else {
                setInitialRecord(status);
                setCurrentRecord(status);
                setError(null);
            }
        })
            .catch(() => setError('Unable to load order status right now. Please try again later.'))
            .finally(() => setLoading(false));
    }, [profile, selectedOrderId]);
    if (!profile) {
        return (_jsxs("section", { className: "rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-slate-200", children: [_jsx("h2", { className: "text-xl font-semibold text-slate-100", children: "Identify yourself first" }), _jsx("p", { className: "mt-2 text-sm text-slate-400", children: "Please return to the catalog and provide your email so we can show the correct order tracking information." })] }));
    }
    if (sortedOrders.length === 0) {
        return (_jsx("section", { className: "rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-slate-200", children: _jsx("p", { children: "No orders found for this account." }) }));
    }
    const activeOrderId = selectedOrderId ?? sortedOrders[0].orderId;
    const activeOrder = sortedOrders.find((order) => order.orderId === activeOrderId);
    const customerName = typeof location.state?.fullName === 'string' ? location.state.fullName : null;
    const maskedId = maskId(activeOrderId);
    return (_jsxs("section", { className: "rounded-2xl border border-slate-800 bg-slate-900/60 p-6", children: [_jsx("header", { className: "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between", children: _jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-semibold text-slate-100", children: "Order status" }), _jsxs("p", { className: "text-sm text-slate-400", children: ["Order ", _jsx("span", { "data-testid": "order-id", className: "font-mono text-slate-100", children: maskedId }), customerName ? ` for ${customerName}` : ''] })] }) }), error && _jsx("p", { className: "mt-4 rounded-lg bg-amber-500/20 px-4 py-3 text-amber-200", children: error }), loading && !error && (_jsx("p", { className: "mt-4 text-sm text-slate-400", children: "Fetching the current status of your order..." })), _jsx("ul", { className: "mt-6 space-y-3", children: sortedOrders.map((order) => {
                    const isActive = order.orderId === activeOrderId;
                    return (_jsx("li", { children: _jsxs("button", { type: "button", "data-testid": "order-card", className: `w-full rounded-2xl border p-4 text-left transition ${isActive
                                ? 'border-brand bg-brand/10 text-brand-light'
                                : 'border-slate-700 bg-slate-950/40 text-slate-200 hover:border-brand/60'}`, "aria-pressed": isActive, onClick: () => {
                                if (order.orderId !== activeOrderId) {
                                    setSelectedOrderId(order.orderId);
                                    navigate(`/order/${order.orderId}`, { replace: true });
                                }
                            }, children: [_jsx("span", { className: "font-mono text-xs", children: maskId(order.orderId) }), _jsx("span", { className: "mt-1 text-sm font-semibold", children: order.status }), _jsxs("span", { className: "mt-1 text-xs text-slate-400", children: ["Placed ", new Date(order.createdAt).toLocaleDateString(), " | ", formatCurrency(order.total)] })] }) }, order.orderId));
                }) }), !error && activeOrder && (_jsxs("div", { className: "mt-6 space-y-6", children: [currentRecord && (_jsxs("article", { className: "rounded-2xl border border-slate-800 bg-slate-950/60 p-5", children: [_jsx("h2", { className: "text-xl font-semibold text-slate-100", children: currentRecord.status }), _jsxs("dl", { className: "mt-3 grid gap-3 sm:grid-cols-2", children: [_jsxs("div", { children: [_jsx("dt", { className: "text-xs uppercase tracking-wide text-slate-500", children: "Last update" }), _jsx("dd", { className: "text-sm text-slate-200", children: new Date(currentRecord.updatedAt).toLocaleString() })] }), currentRecord.carrier && (_jsxs("div", { children: [_jsx("dt", { className: "text-xs uppercase tracking-wide text-slate-500", children: "Carrier" }), _jsxs("dd", { className: "text-sm text-slate-200", children: [currentRecord.carrier, currentRecord.eta ? `, ETA ${new Date(currentRecord.eta).toLocaleDateString()}` : ''] })] }))] })] })), _jsx(OrderTracking, { orderId: activeOrderId, initialStatus: initialRecord, onStatusChange: (status) => setCurrentRecord(status) })] }))] }));
}
