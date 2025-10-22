import { parseOrderEvent } from './api';
const API_BASE = import.meta.env.VITE_APP_API_BASE?.replace(/\/$/, '');
export function subscribeToOrderStatus(orderId, listener) {
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
