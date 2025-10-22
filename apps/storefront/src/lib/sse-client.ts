import { parseOrderEvent } from './api';
import type { OrderStatusEvent } from './types';

const API_BASE = import.meta.env.VITE_APP_API_BASE?.replace(/\/$/, '');

export function subscribeToOrderStatus(
  orderId: string,
  listener: (event: OrderStatusEvent) => void,
): () => void {
  if (!orderId) {
    throw new Error('orderId is required for SSE subscription');
  }

  if (!API_BASE) {
    throw new Error('SSE subscription requires VITE_APP_API_BASE to be configured.');
  }

  const url = new URL(`/api/sse/orders/${orderId}`, API_BASE);
  const source = new EventSource(url.toString(), { withCredentials: true });

  source.onmessage = (event) => {
    listener(parseOrderEvent(event));
  };

  source.onerror = () => {
    listener({ type: 'error', message: 'Connection lost. Attempting to reconnect…' });
  };

  return () => {
    source.close();
  };
}
