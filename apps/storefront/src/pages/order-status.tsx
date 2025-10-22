import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { getOrderStatus } from '@/lib/api';
import { OrderTracking } from '@/components/OrderTracking';
import { maskId } from '@/lib/format';
import { formatCurrency } from '@/lib/format';
import type { OrderStatusRecord } from '@/lib/types';
import { useCustomerStore } from '@/lib/store';

export function OrderStatusPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const profile = useCustomerStore((state) => state.profile);
  const recentOrders = useCustomerStore((state) => state.recentOrders);

  const sortedOrders = useMemo(
    () =>
      [...recentOrders].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [recentOrders],
  );
  const routeOrderExists = orderId ? sortedOrders.some((order) => order.orderId === orderId) : false;

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [initialRecord, setInitialRecord] = useState<OrderStatusRecord | null>(null);
  const [currentRecord, setCurrentRecord] = useState<OrderStatusRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
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
    } else if (!routeOrderExists) {
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
        } else {
          setInitialRecord(status);
          setCurrentRecord(status);
          setError(null);
        }
      })
      .catch(() => setError('Unable to load order status right now. Please try again later.'))
      .finally(() => setLoading(false));
  }, [profile, selectedOrderId]);

  if (!profile) {
    return (
      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-slate-200">
        <h2 className="text-xl font-semibold text-slate-100">Identify yourself first</h2>
        <p className="mt-2 text-sm text-slate-400">
          Please return to the catalog and provide your email so we can show the correct order tracking information.
        </p>
      </section>
    );
  }

  if (sortedOrders.length === 0) {
    return (
      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-slate-200">
        <p>No orders found for this account.</p>
      </section>
    );
  }

  const activeOrderId = selectedOrderId ?? sortedOrders[0].orderId;
  const activeOrder = sortedOrders.find((order) => order.orderId === activeOrderId);
  const customerName = typeof location.state?.fullName === 'string' ? location.state.fullName : null;
  const maskedId = maskId(activeOrderId);

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Order status</h1>
          <p className="text-sm text-slate-400">
            Order <span data-testid="order-id" className="font-mono text-slate-100">{maskedId}</span>
            {customerName ? ` for ${customerName}` : ''}
          </p>
        </div>
      </header>

      {error && <p className="mt-4 rounded-lg bg-amber-500/20 px-4 py-3 text-amber-200">{error}</p>}

      {loading && !error && (
        <p className="mt-4 text-sm text-slate-400">Fetching the current status of your order...</p>
      )}

      <ul className="mt-6 space-y-3">
        {sortedOrders.map((order) => {
          const isActive = order.orderId === activeOrderId;
          return (
            <li key={order.orderId}>
              <button
                type="button"
                data-testid="order-card"
                className={`w-full rounded-2xl border p-4 text-left transition ${
                  isActive
                    ? 'border-brand bg-brand/10 text-brand-light'
                    : 'border-slate-700 bg-slate-950/40 text-slate-200 hover:border-brand/60'
                }`}
                aria-pressed={isActive}
                onClick={() => {
                  if (order.orderId !== activeOrderId) {
                    setSelectedOrderId(order.orderId);
                    navigate(`/order/${order.orderId}`, { replace: true });
                  }
                }}
              >
                <span className="font-mono text-xs">{maskId(order.orderId)}</span>
                <span className="mt-1 text-sm font-semibold">{order.status}</span>
                <span className="mt-1 text-xs text-slate-400">
                  Placed {new Date(order.createdAt).toLocaleDateString()} | {formatCurrency(order.total)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {!error && activeOrder && (
        <div className="mt-6 space-y-6">
          {currentRecord && (
            <article className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
              <h2 className="text-xl font-semibold text-slate-100">{currentRecord.status}</h2>
              <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-500">Last update</dt>
                  <dd className="text-sm text-slate-200">
                    {new Date(currentRecord.updatedAt).toLocaleString()}
                  </dd>
                </div>
                {currentRecord.carrier && (
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-500">Carrier</dt>
                    <dd className="text-sm text-slate-200">
                      {currentRecord.carrier}
                      {currentRecord.eta ? `, ETA ${new Date(currentRecord.eta).toLocaleDateString()}` : ''}
                    </dd>
                  </div>
                )}
              </dl>
            </article>
          )}
          <OrderTracking
            orderId={activeOrderId}
            initialStatus={initialRecord}
            onStatusChange={(status) => setCurrentRecord(status)}
          />
        </div>
      )}
    </section>
  );
}
