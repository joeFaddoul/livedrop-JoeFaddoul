import { useEffect, useMemo, useState } from 'react';

import { fetchDashboardMetrics, fetchDailyRevenueTrend } from '@/lib/api';
import { formatCurrency } from '@/lib/format';
import type { DashboardMetrics, DailyRevenuePoint } from '@/lib/types';
import { Button } from '@/components/atoms/button';

function formatDuration(seconds: number) {
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
  const toInputValue = (value: Date) => value.toISOString().slice(0, 10);
  return {
    start: toInputValue(start),
    end: toInputValue(end),
  };
}

export function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [revenueTrend, setRevenueTrend] = useState<DailyRevenuePoint[]>([]);
  const [error, setError] = useState<string | null>(null);
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
        if (!mounted) return;
        setMetrics(dashboard);
        setRevenueTrend(trend);
      } catch (err) {
        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load dashboard metrics. Check backend deployment.',
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    // when date range changes after initial load, fetch new trend data
    if (loading) return;
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
      } catch (err) {
        if (!ignore) {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load daily revenue trend. Check backend deployment.',
          );
        }
      } finally {
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
    return revenueTrend.reduce(
      (acc, point) => ({
        totalRevenue: acc.totalRevenue + point.revenue,
        totalOrders: acc.totalOrders + point.orderCount,
      }),
      { totalRevenue: 0, totalOrders: 0 },
    );
  }, [revenueTrend]);

  const revenueChart = useMemo(() => {
    if (revenueTrend.length === 0) {
      return null;
    }
    const maxRevenue = Math.max(...revenueTrend.map((point) => point.revenue), 1);
    const points = revenueTrend.map((point, index) => {
      const x =
        revenueTrend.length === 1 ? 50 : (index / (revenueTrend.length - 1)) * 100;
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
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-slate-200">
        Loading dashboard…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-amber-600/60 bg-amber-500/10 p-6 text-sm text-amber-100">
        {error}
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <h1 className="text-2xl font-semibold text-slate-100">LiveDrop admin dashboard</h1>
        <p className="mt-2 text-sm text-slate-400">
          Monitor storefront performance, assistant usage, and stock alerts. Data reflects the last few days of sample
          orders in your MongoDB cluster.
        </p>
        <div className="mt-6 space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-100">Daily revenue</h2>
                <p className="text-xs text-slate-500">
                  Showing totals from {new Date(start).toLocaleDateString()} to{' '}
                  {new Date(end).toLocaleDateString()}
                </p>
              </div>
              <form
                className="flex flex-wrap items-end gap-2 text-xs text-slate-400"
                onSubmit={(event) => {
                  event.preventDefault();
                }}
              >
                <label className="flex flex-col gap-1">
                  <span>From</span>
                  <input
                    type="date"
                    value={start}
                    max={end}
                    onChange={(event) =>
                      setRange((prev) => ({ ...prev, start: event.target.value }))
                    }
                    className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-slate-100"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span>To</span>
                  <input
                    type="date"
                    value={end}
                    min={start}
                    onChange={(event) =>
                      setRange((prev) => ({ ...prev, end: event.target.value }))
                    }
                    className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-slate-100"
                  />
                </label>
                <Button
                  type="submit"
                  size="sm"
                  isLoading={isFetchingTrend}
                  className="self-end"
                >
                  Refresh
                </Button>
              </form>
            </div>
            <div className="mt-3 flex items-center justify-between border-b border-slate-800 pb-3 text-sm text-slate-300">
              <span>Total</span>
              <span className="font-semibold text-slate-100">
                {formatCurrency(revenueTotals.totalRevenue)} · {revenueTotals.totalOrders} orders
              </span>
            </div>
            {revenueChart ? (
              <figure className="mt-4 rounded-xl border border-slate-800 bg-slate-900/40 p-3">
                <figcaption className="mb-2 flex items-center justify-between text-xs text-slate-400">
                  <span>Revenue trend</span>
                  <span>
                    Peak: {formatCurrency(revenueChart.maxRevenue)}
                  </span>
                </figcaption>
                <svg
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  className="h-40 w-full"
                  role="img"
                  aria-label="Daily revenue chart"
                >
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgb(56 189 248)" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="rgb(56 189 248)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <polyline
                    points={revenueChart.areaPath}
                    fill="url(#revenueGradient)"
                    stroke="none"
                  />
                  <polyline
                    points={revenueChart.path}
                    fill="none"
                    stroke="rgb(56 189 248)"
                    strokeWidth={1.5}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                  {revenueChart.points.map((point, index) => (
                    <circle
                      key={`${point.x}-${index}`}
                      cx={point.x}
                      cy={point.y}
                      r={0.8}
                      fill="rgb(56 189 248)"
                    />
                  ))}
                </svg>
              </figure>
            ) : (
              <p className="mt-3 text-sm text-slate-400">
                No revenue data available for the selected range.
              </p>
            )}
            {revenueTrend.length > 0 ? (
              <ul className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-6">
                {revenueTrend.map((point) => (
                  <li
                    key={point.date}
                    className="rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-2 text-sm text-slate-300"
                  >
                    <p className="text-xs text-slate-500">
                      {new Date(point.date).toLocaleDateString()}
                    </p>
                    <p className="mt-1 font-semibold text-slate-100">
                      {formatCurrency(point.revenue)}
                    </p>
                    <p className="text-xs text-slate-400">{point.orderCount} orders</p>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              label="Revenue (30d)"
              value={formatCurrency(metrics.revenue ?? 0)}
            />
            <StatCard
              label="Orders (30d)"
              value={(metrics.orders ?? 0).toString()}
            />
            <StatCard
              label="Average order value"
              value={formatCurrency(metrics.averageOrderValue ?? 0)}
            />
            <StatCard
              label="Active customers (7d)"
              value={metrics.activeCustomers.toString()}
            />
            <StatCard
              label="Total customers"
              value={metrics.totalCustomers.toString()}
            />
            <StatCard
              label="Assistant intents tracked"
              value={metrics.assistantSummary.length.toString()}
            />
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">Recent orders</h2>
            <ul className="mt-3 space-y-2">
              {metrics.latestOrders.map((order) => (
                <li
                  key={order._id}
                  className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-300"
                >
                  <span>
                    {order._id} · {order.email}
                  </span>
                  <span className="font-semibold text-slate-100">{order.status}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-100">Assistant intents</h2>
            <ul className="mt-3 space-y-2">
              {metrics.assistantSummary.map((intent) => (
                <li
                  key={intent._id}
                  className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-300"
                >
                  <span>{intent._id}</span>
                  <span className="text-slate-200">
                    {intent.total} · {(intent.successRate * 100).toFixed(0)}% success
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <aside className="space-y-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <h2 className="text-lg font-semibold text-slate-100">Low stock alerts</h2>
          <ul className="mt-3 space-y-2">
            {metrics.lowStockProducts.map((product) => (
              <li
                key={product._id}
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-300"
              >
                <span>{product.name}</span>
                <span className="font-semibold text-amber-300">{product.stock} left</span>
              </li>
            ))}
          </ul>
        </div>
        {metrics.performance && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 text-sm text-slate-300">
            <h2 className="text-lg font-semibold text-slate-100">System performance</h2>
            <ul className="mt-3 space-y-2">
              <li className="flex items-center justify-between">
                <span>API uptime</span>
                <span className="font-semibold text-slate-100">
                  {formatDuration(metrics.performance.uptimeSeconds)}
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span>Assistant requests (30d)</span>
                <span className="font-semibold text-slate-100">
                  {metrics.performance.assistantRequests30d}
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span>Assistant avg latency</span>
                <span className="font-semibold text-slate-100">
                  {metrics.performance.assistantAvgLatencyMs} ms
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span>Active SSE connections</span>
                <span className="font-semibold text-slate-100">
                  {metrics.performance.activeSseConnections}
                </span>
              </li>
            </ul>
          </div>
        )}
      </aside>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-100">{value}</p>
    </div>
  );
}
