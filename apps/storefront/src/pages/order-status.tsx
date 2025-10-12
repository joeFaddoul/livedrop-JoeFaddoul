import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { getOrderStatus } from '@/lib/api';
import { maskId } from '@/lib/format';
import type { OrderStatusRecord } from '@/lib/types';

const STATUS_DESCRIPTIONS: Record<OrderStatusRecord['status'], string> = {
  Placed: 'We received your order and it is waiting to be packed.',
  Packed: 'Your order is packed and ready to hand off to the carrier.',
  Shipped: 'The carrier picked up the order and it is on the way.',
  Delivered: 'Package delivered. Reach out if anything is missing.',
};

export function OrderStatusPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const location = useLocation();
  const [record, setRecord] = useState<OrderStatusRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;
    getOrderStatus(orderId)
      .then((status) => {
        if (!status) {
          setError('We could not find that order. Double-check the order ID and try again.');
        } else {
          setRecord(status);
          setError(null);
        }
      })
      .catch(() => setError('Unable to load order status right now. Please try again later.'));
  }, [orderId]);

  if (!orderId) {
    return (
      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-slate-200">
        <p>No order selected.</p>
      </section>
    );
  }

  const customerName = typeof location.state?.fullName === 'string' ? location.state.fullName : null;
  const maskedId = maskId(orderId);

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Order status</h1>
          <p className="text-sm text-slate-400">
            Order <span className="font-mono text-slate-100">{maskedId}</span>
            {customerName ? ` for ${customerName}` : ''}
          </p>
        </div>
      </header>

      {error && <p className="mt-4 rounded-lg bg-amber-500/20 px-4 py-3 text-amber-200">{error}</p>}

      {record && (
        <article className="mt-6 space-y-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
          <div>
            <h2 className="text-xl font-semibold text-slate-100">{record.status}</h2>
            <p className="text-sm text-slate-400">{STATUS_DESCRIPTIONS[record.status]}</p>
          </div>
          <dl className="grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">Last update</dt>
              <dd className="text-sm text-slate-200">
                {new Date(record.updatedAt).toLocaleString()}
              </dd>
            </div>
            {record.carrier && (
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">Carrier</dt>
                <dd className="text-sm text-slate-200">
                  {record.carrier}
                  {record.eta ? `, ETA ${new Date(record.eta).toLocaleDateString()}` : ''}
                </dd>
              </div>
            )}
          </dl>
        </article>
      )}
    </section>
  );
}
