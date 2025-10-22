import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { fetchDashboardMetrics, fetchDailyRevenueTrend } from '@/lib/api';
import { formatCurrency } from '@/lib/format';
import { Button } from '@/components/atoms/button';
function formatDuration(seconds) {
    const totalSeconds = Math.max(0, Math.floor(seconds));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    if (minutes > 0) {
        return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
}
function defaultDateRange(days = 30) {
    const end = new Date();
    const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
    const toInputValue = (value) => value.toISOString().slice(0, 10);
    return {
        start: toInputValue(start),
        end: toInputValue(end),
    };
}
export function AdminDashboardPage() {
    const [metrics, setMetrics] = useState(null);
    const [revenueTrend, setRevenueTrend] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [{ start, end }, setRange] = useState(defaultDateRange());
    const [isFetchingTrend, setIsFetchingTrend] = useState(false);
    useEffect(() => {
        let mounted = true;
        const load = async () => {
            try {
                const [dashboard, trend] = await Promise.all([
                    fetchDashboardMetrics(),
                    fetchDailyRevenueTrend({ startDate: start, endDate: end }),
                ]);
                if (!mounted)
                    return;
                setMetrics(dashboard);
                setRevenueTrend(trend);
            }
            catch (err) {
                if (mounted) {
                    setError(err instanceof Error
                        ? err.message
                        : 'Unable to load dashboard metrics. Check backend deployment.');
                }
            }
            finally {
                if (mounted)
                    setLoading(false);
            }
        };
        load();
        return () => {
            mounted = false;
        };
    }, []);
    useEffect(() => {
        // when date range changes after initial load, fetch new trend data
        if (loading)
            return;
        let ignore = false;
        const fetchTrend = async () => {
            setIsFetchingTrend(true);
            try {
                const trend = await fetchDailyRevenueTrend({
                    startDate: start,
                    endDate: end,
                });
                if (!ignore) {
                    setRevenueTrend(trend);
                }
            }
            catch (err) {
                if (!ignore) {
                    setError(err instanceof Error
                        ? err.message
                        : 'Unable to load daily revenue trend. Check backend deployment.');
                }
            }
            finally {
                if (!ignore) {
                    setIsFetchingTrend(false);
                }
            }
        };
        fetchTrend();
        return () => {
            ignore = true;
        };
    }, [start, end, loading]);
    const revenueTotals = useMemo(() => {
        if (revenueTrend.length === 0) {
            return { totalRevenue: 0, totalOrders: 0 };
        }
        return revenueTrend.reduce((acc, point) => ({
            totalRevenue: acc.totalRevenue + point.revenue,
            totalOrders: acc.totalOrders + point.orderCount,
        }), { totalRevenue: 0, totalOrders: 0 });
    }, [revenueTrend]);
    const revenueChart = useMemo(() => {
        if (revenueTrend.length === 0) {
            return null;
        }
        const maxRevenue = Math.max(...revenueTrend.map((point) => point.revenue), 1);
        const points = revenueTrend.map((point, index) => {
            const x = revenueTrend.length === 1 ? 50 : (index / (revenueTrend.length - 1)) * 100;
            const y = 100 - Math.min(100, (point.revenue / maxRevenue) * 100);
            return { x, y, revenue: point.revenue };
        });
        const path = points.map((point) => `${point.x},${point.y}`).join(' ');
        const areaPath = [
            `0,100`,
            ...points.map((point) => `${point.x},${point.y}`),
            `100,100`,
        ].join(' ');
        return {
            points,
            path,
            areaPath,
            maxRevenue,
        };
    }, [revenueTrend]);
    if (loading) {
        return (_jsx("div", { className: "rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-slate-200", children: "Loading dashboard\u2026" }));
    }
    if (error) {
        return (_jsx("div", { className: "rounded-2xl border border-amber-600/60 bg-amber-500/10 p-6 text-sm text-amber-100", children: error }));
    }
    if (!metrics)
        return null;
    return (_jsxs("div", { className: "grid gap-6 lg:grid-cols-[2fr_1fr]", children: [_jsxs("section", { className: "rounded-2xl border border-slate-800 bg-slate-900/60 p-5", children: [_jsx("h1", { className: "text-2xl font-semibold text-slate-100", children: "LiveDrop admin dashboard" }), _jsx("p", { className: "mt-2 text-sm text-slate-400", children: "Monitor storefront performance, assistant usage, and stock alerts. Data reflects the last few days of sample orders in your MongoDB cluster." }), _jsxs("div", { className: "mt-6 space-y-6", children: [_jsxs("div", { className: "rounded-2xl border border-slate-800 bg-slate-950/60 p-4", children: [_jsxs("div", { className: "flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-lg font-semibold text-slate-100", children: "Daily revenue" }), _jsxs("p", { className: "text-xs text-slate-500", children: ["Showing totals from ", new Date(start).toLocaleDateString(), " to", ' ', new Date(end).toLocaleDateString()] })] }), _jsxs("form", { className: "flex flex-wrap items-end gap-2 text-xs text-slate-400", onSubmit: (event) => {
                                                    event.preventDefault();
                                                }, children: [_jsxs("label", { className: "flex flex-col gap-1", children: [_jsx("span", { children: "From" }), _jsx("input", { type: "date", value: start, max: end, onChange: (event) => setRange((prev) => ({ ...prev, start: event.target.value })), className: "rounded border border-slate-700 bg-slate-900 px-2 py-1 text-slate-100" })] }), _jsxs("label", { className: "flex flex-col gap-1", children: [_jsx("span", { children: "To" }), _jsx("input", { type: "date", value: end, min: start, onChange: (event) => setRange((prev) => ({ ...prev, end: event.target.value })), className: "rounded border border-slate-700 bg-slate-900 px-2 py-1 text-slate-100" })] }), _jsx(Button, { type: "submit", size: "sm", isLoading: isFetchingTrend, className: "self-end", children: "Refresh" })] })] }), _jsxs("div", { className: "mt-3 flex items-center justify-between border-b border-slate-800 pb-3 text-sm text-slate-300", children: [_jsx("span", { children: "Total" }), _jsxs("span", { className: "font-semibold text-slate-100", children: [formatCurrency(revenueTotals.totalRevenue), " \u00B7 ", revenueTotals.totalOrders, " orders"] })] }), revenueChart ? (_jsxs("figure", { className: "mt-4 rounded-xl border border-slate-800 bg-slate-900/40 p-3", children: [_jsxs("figcaption", { className: "mb-2 flex items-center justify-between text-xs text-slate-400", children: [_jsx("span", { children: "Revenue trend" }), _jsxs("span", { children: ["Peak: ", formatCurrency(revenueChart.maxRevenue)] })] }), _jsxs("svg", { viewBox: "0 0 100 100", preserveAspectRatio: "none", className: "h-40 w-full", role: "img", "aria-label": "Daily revenue chart", children: [_jsx("defs", { children: _jsxs("linearGradient", { id: "revenueGradient", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "0%", stopColor: "rgb(56 189 248)", stopOpacity: "0.4" }), _jsx("stop", { offset: "100%", stopColor: "rgb(56 189 248)", stopOpacity: "0" })] }) }), _jsx("polyline", { points: revenueChart.areaPath, fill: "url(#revenueGradient)", stroke: "none" }), _jsx("polyline", { points: revenueChart.path, fill: "none", stroke: "rgb(56 189 248)", strokeWidth: 1.5, strokeLinejoin: "round", strokeLinecap: "round" }), revenueChart.points.map((point, index) => (_jsx("circle", { cx: point.x, cy: point.y, r: 0.8, fill: "rgb(56 189 248)" }, `${point.x}-${index}`)))] })] })) : (_jsx("p", { className: "mt-3 text-sm text-slate-400", children: "No revenue data available for the selected range." })), revenueTrend.length > 0 ? (_jsx("ul", { className: "mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-6", children: revenueTrend.map((point) => (_jsxs("li", { className: "rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-2 text-sm text-slate-300", children: [_jsx("p", { className: "text-xs text-slate-500", children: new Date(point.date).toLocaleDateString() }), _jsx("p", { className: "mt-1 font-semibold text-slate-100", children: formatCurrency(point.revenue) }), _jsxs("p", { className: "text-xs text-slate-400", children: [point.orderCount, " orders"] })] }, point.date))) })) : null] }), _jsxs("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3", children: [_jsx(StatCard, { label: "Revenue (30d)", value: formatCurrency(metrics.revenue ?? 0) }), _jsx(StatCard, { label: "Orders (30d)", value: (metrics.orders ?? 0).toString() }), _jsx(StatCard, { label: "Average order value", value: formatCurrency(metrics.averageOrderValue ?? 0) }), _jsx(StatCard, { label: "Active customers (7d)", value: metrics.activeCustomers.toString() }), _jsx(StatCard, { label: "Total customers", value: metrics.totalCustomers.toString() }), _jsx(StatCard, { label: "Assistant intents tracked", value: metrics.assistantSummary.length.toString() })] })] }), _jsxs("div", { className: "mt-6 grid gap-6 lg:grid-cols-2", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-lg font-semibold text-slate-100", children: "Recent orders" }), _jsx("ul", { className: "mt-3 space-y-2", children: metrics.latestOrders.map((order) => (_jsxs("li", { className: "flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-300", children: [_jsxs("span", { children: [order._id, " \u00B7 ", order.email] }), _jsx("span", { className: "font-semibold text-slate-100", children: order.status })] }, order._id))) })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h2", { className: "text-lg font-semibold text-slate-100", children: "Assistant intents" }), _jsx("ul", { className: "mt-3 space-y-2", children: metrics.assistantSummary.map((intent) => (_jsxs("li", { className: "flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-300", children: [_jsx("span", { children: intent._id }), _jsxs("span", { className: "text-slate-200", children: [intent.total, " \u00B7 ", (intent.successRate * 100).toFixed(0), "% success"] })] }, intent._id))) })] })] })] }), _jsxs("aside", { className: "space-y-6", children: [_jsxs("div", { className: "rounded-2xl border border-slate-800 bg-slate-900/60 p-5", children: [_jsx("h2", { className: "text-lg font-semibold text-slate-100", children: "Low stock alerts" }), _jsx("ul", { className: "mt-3 space-y-2", children: metrics.lowStockProducts.map((product) => (_jsxs("li", { className: "flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-300", children: [_jsx("span", { children: product.name }), _jsxs("span", { className: "font-semibold text-amber-300", children: [product.stock, " left"] })] }, product._id))) })] }), metrics.performance && (_jsxs("div", { className: "rounded-2xl border border-slate-800 bg-slate-900/60 p-5 text-sm text-slate-300", children: [_jsx("h2", { className: "text-lg font-semibold text-slate-100", children: "System performance" }), _jsxs("ul", { className: "mt-3 space-y-2", children: [_jsxs("li", { className: "flex items-center justify-between", children: [_jsx("span", { children: "API uptime" }), _jsx("span", { className: "font-semibold text-slate-100", children: formatDuration(metrics.performance.uptimeSeconds) })] }), _jsxs("li", { className: "flex items-center justify-between", children: [_jsx("span", { children: "Assistant requests (30d)" }), _jsx("span", { className: "font-semibold text-slate-100", children: metrics.performance.assistantRequests30d })] }), _jsxs("li", { className: "flex items-center justify-between", children: [_jsx("span", { children: "Assistant avg latency" }), _jsxs("span", { className: "font-semibold text-slate-100", children: [metrics.performance.assistantAvgLatencyMs, " ms"] })] }), _jsxs("li", { className: "flex items-center justify-between", children: [_jsx("span", { children: "Active SSE connections" }), _jsx("span", { className: "font-semibold text-slate-100", children: metrics.performance.activeSseConnections })] })] })] }))] })] }));
}
function StatCard({ label, value }) {
    return (_jsxs("div", { className: "rounded-2xl border border-slate-800 bg-slate-950/60 p-4", children: [_jsx("p", { className: "text-xs uppercase tracking-wide text-slate-500", children: label }), _jsx("p", { className: "mt-2 text-2xl font-semibold text-slate-100", children: value })] }));
}
