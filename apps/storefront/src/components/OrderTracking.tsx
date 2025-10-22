import { useEffect, useMemo, useState } from 'react';

import { getOrderStatus } from '@/lib/api';
import { subscribeToOrderStatus } from '@/lib/sse-client';
import type { OrderStatus, OrderStatusEvent, OrderStatusRecord } from '@/lib/types';

type OrderTrackingProps = {
  orderId: string;
  initialStatus?: OrderStatusRecord | null;
  onStatusChange?: (record: OrderStatusRecord | null) => void;
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  Placed: 'Order placed',
  Packed: 'Packed for shipment',
  Shipped: 'Shipped',
  Delivered: 'Delivered',
};

export function OrderTracking({ orderId, initialStatus, onStatusChange }: OrderTrackingProps) {
  const [record, setRecord] = useState<OrderStatusRecord | null>(initialStatus ?? null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return undefined;

    let isMounted = true;
    let stopListening: (() => void) | undefined;

    const bootstrap = async () => {
      try {
        const latest = await getOrderStatus(orderId);
        if (latest && isMounted) {
          setRecord(latest);
          onStatusChange?.(latest);
        }
      } catch (bootstrapError) {
        console.warn('Unable to fetch initial order status', bootstrapError); // eslint-disable-line no-console
      }
    };

    bootstrap();

    try {
      stopListening = subscribeToOrderStatus(orderId, (event: OrderStatusEvent) => {
        if (!isMounted) return;
        if (event.type === 'error') {
          setError(event.message);
          return;
        }
        setError(null);
        setRecord(event.order);
        onStatusChange?.(event.order);
      });
    } catch (subscriptionError) {
      setError(
        subscriptionError instanceof Error
          ? subscriptionError.message
          : 'Unable to open live updates.',
      );
    }

    return () => {
      isMounted = false;
      stopListening?.();
    };
  }, [orderId]);

  const steps = useMemo(() => {
    const history = record?.history ?? [];
    const statuses: OrderStatus[] = ['Placed', 'Packed', 'Shipped', 'Delivered'];
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

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
      <header className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">Live order tracking</h2>
          <p className="text-sm text-slate-400">
            Order{' '}
            <span className="font-mono text-slate-100">
              {record?.orderId ?? orderId}
            </span>{' '}
            {record?.status ? `is currently ${record.status}.` : 'status will appear shortly.'}
          </p>
        </div>
        {record?.carrier && (
          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-200">
            {record.carrier}
            {record.eta ? ` · ETA ${new Date(record.eta).toLocaleDateString()}` : ''}
          </span>
        )}
      </header>

      {error && (
        <p className="mb-4 rounded-lg bg-amber-500/20 px-3 py-2 text-sm text-amber-200">{error}</p>
      )}

      <ol className="relative space-y-4 border-l border-slate-800 pl-6">
        {steps.map((step) => (
          <li key={step.status} className="relative">
            <span
              className={`absolute -left-[26px] mt-1 h-3 w-3 rounded-full ${
                step.isCompleted
                  ? 'bg-emerald-400'
                  : step.isActive
                    ? 'bg-brand'
                    : 'bg-slate-600'
              }`}
            />
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-slate-100">{step.label}</span>
              <span className="text-xs text-slate-500">
                {step.timestamp
                  ? new Date(step.timestamp).toLocaleString()
                  : 'Awaiting update…'}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
