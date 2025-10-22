import { z } from 'zod';
import { catalogFallback } from './catalog-fallback';
const API_BASE = import.meta.env.VITE_APP_API_BASE?.replace(/\/$/, '');
const isLiveBackend = Boolean(API_BASE);
const objectIdPattern = /^[a-fA-F0-9]{24}$/;
const productSchema = z.object({
    _id: z.string().optional(),
    id: z.string().optional(),
    name: z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    price: z.number(),
    currency: z.string().optional(),
    tags: z.array(z.string()).optional(),
    category: z.string().optional(),
    stock: z.number().optional(),
    stockQty: z.number().optional(),
    imageUrl: z.string().optional(),
    image: z.string().optional(),
});
const orderStatusSchema = z.object({
    _id: z.any().optional(),
    orderId: z.any().optional(),
    status: z.enum(['Placed', 'Packed', 'Shipped', 'Delivered']),
    carrier: z.string().optional(),
    estimatedDelivery: z.string().optional(),
    eta: z.string().optional(),
    updatedAt: z.string().optional(),
    createdAt: z.string().optional(),
    history: z
        .array(z.object({
        status: z.string(),
        timestamp: z.string().optional(),
        note: z.string().optional(),
    }))
        .optional(),
});
let cachedProducts = null;
function normalizeId(value, fallback) {
    if (typeof value === 'string' && value.trim())
        return value;
    if (typeof value === 'number')
        return String(value);
    if (value && typeof value === 'object' && 'toString' in value) {
        try {
            const asString = String(value);
            if (asString && asString !== '[object Object]') {
                return asString;
            }
        }
        catch {
            // ignore cast errors and fall back below
        }
    }
    if (fallback)
        return fallback;
    throw new Error('Unable to normalize identifier');
}
function mapProduct(document) {
    const fallbackId = typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2);
    return {
        id: normalizeId(document.id ?? document._id ?? fallbackId, fallbackId),
        title: document.title ?? document.name ?? 'Untitled product',
        description: document.description ?? '',
        price: document.price,
        image: document.image ?? document.imageUrl ?? '/fallback-product.png',
        tags: document.tags ?? [],
        stockQty: document.stockQty ??
            (typeof document.stock === 'number' ? document.stock : Math.floor(Math.random() * 50) + 10),
    };
}
async function fetchJson(path, init) {
    if (!isLiveBackend) {
        throw new Error('API base URL is not configured');
    }
    const response = await fetch(`${API_BASE}${path}`, {
        ...init,
        headers: {
            'Content-Type': 'application/json',
            ...(init?.headers ?? {}),
        },
    });
    if (!response.ok) {
        const text = await response.text();
        throw new Error(`API ${response.status}: ${text}`);
    }
    return response.json();
}
async function hydrateCatalog() {
    if (!cachedProducts) {
        if (isLiveBackend) {
            try {
                const payload = (await fetchJson('/api/products'));
                const items = Array.isArray(payload.products)
                    ? payload.products
                    : (Array.isArray(payload) ? payload : []);
                if (items.length > 0) {
                    const mapped = items.map((item) => mapProduct(productSchema.parse(item)));
                    cachedProducts = mapped;
                    return mapped;
                }
            }
            catch (error) {
                console.warn('Falling back to static catalog', error); // eslint-disable-line no-console
            }
        }
        const response = await fetch('/mock-catalog.json').catch(() => null);
        if (response?.ok) {
            const payload = (await response.json());
            if (Array.isArray(payload)) {
                const mapped = payload.map((item) => mapProduct(productSchema.parse({
                    ...item,
                    id: item.id,
                    title: item.title,
                    description: item.description,
                    price: item.price,
                    tags: item.tags,
                    stockQty: item.stockQty,
                    image: item.image,
                })));
                cachedProducts = mapped;
                return mapped;
            }
        }
        if (!cachedProducts) {
            cachedProducts = catalogFallback.map((item) => mapProduct(productSchema.parse({
                id: item.id,
                title: item.title,
                description: item.description,
                price: item.price,
                tags: item.tags,
                stockQty: item.stockQty,
                image: item.image,
            })));
        }
    }
    cachedProducts = cachedProducts ?? catalogFallback.map((item) => mapProduct(productSchema.parse({
        id: item.id,
        title: item.title,
        description: item.description,
        price: item.price,
        tags: item.tags,
        stockQty: item.stockQty,
        image: item.image,
    })));
    return cachedProducts ?? [];
}
export async function listProducts() {
    const products = await hydrateCatalog();
    return [...products].sort((a, b) => a.title.localeCompare(b.title));
}
export async function getProduct(id) {
    if (isLiveBackend) {
        try {
            const payload = await fetchJson(`/api/products/${id}`);
            return mapProduct(productSchema.parse(payload));
        }
        catch {
            // gracefully fall back to cached data
        }
    }
    const products = await hydrateCatalog();
    return products.find((product) => product.id === id);
}
export async function getRelatedProducts(id, take = 3) {
    if (isLiveBackend) {
        try {
            const payload = (await fetchJson(`/api/products/${id}/related`));
            if (Array.isArray(payload.related)) {
                return payload.related
                    .map((item) => mapProduct(productSchema.parse(item)))
                    .slice(0, take);
            }
        }
        catch {
            // fallback below
        }
    }
    const product = await getProduct(id);
    if (!product)
        return [];
    const products = await hydrateCatalog();
    return products
        .filter((candidate) => candidate.id !== id && candidate.tags.some((tag) => product.tags.includes(tag)))
        .slice(0, take);
}
export async function lookupCustomer(email) {
    if (!isLiveBackend) {
        throw new Error('Customer lookup requires the live API. Set VITE_APP_API_BASE.');
    }
    return fetchJson(`/api/customers?email=${encodeURIComponent(email)}`);
}
export async function placeOrder(customerEmail, cart, idempotencyKey) {
    if (!cart.length) {
        throw new Error('Cannot place an empty order.');
    }
    if (!isLiveBackend) {
        // Fallback to mock behavior
        const orderId = `ORD-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
        return { orderId, status: 'Placed' };
    }
    let normalizedItems;
    try {
        normalizedItems = cart.map((item) => ({
            productId: normalizeId(item.productId),
            quantity: item.quantity,
        }));
    }
    catch {
        throw new Error('Your cart contains items we could not match to the catalog. Please refresh the page, rebuild your cart, and try again.');
    }
    const invalidProductIds = normalizedItems.filter((item) => !objectIdPattern.test(item.productId));
    if (invalidProductIds.length > 0) {
        throw new Error('One or more cart items no longer match the live inventory. Please clear your cart and add products again from the catalog.');
    }
    const payload = await fetchJson('/api/orders', {
        method: 'POST',
        headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined,
        body: JSON.stringify({
            customerEmail,
            items: normalizedItems,
        }),
    });
    return payload;
}
function normalizeOrderStatus(raw) {
    const parsed = orderStatusSchema.safeParse(raw);
    if (!parsed.success)
        return undefined;
    const data = parsed.data;
    const fallbackId = typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2);
    let orderId;
    try {
        orderId = normalizeId(data.orderId ?? data._id, fallbackId);
    }
    catch {
        orderId = fallbackId;
    }
    let documentId;
    if (typeof data._id !== 'undefined') {
        try {
            documentId = normalizeId(data._id, orderId);
        }
        catch {
            documentId = orderId;
        }
    }
    else {
        documentId = orderId;
    }
    return {
        orderId,
        _id: documentId,
        status: data.status,
        carrier: data.carrier,
        eta: data.eta ?? data.estimatedDelivery,
        updatedAt: data.updatedAt ?? new Date().toISOString(),
        history: data.history?.map((entry) => ({
            status: entry.status,
            timestamp: entry.timestamp ?? new Date().toISOString(),
            note: entry.note,
        })),
    };
}
export async function getOrderStatus(orderId) {
    if (!orderId)
        return undefined;
    if (!isLiveBackend)
        return undefined;
    const payload = await fetchJson(`/api/orders/${orderId}`);
    return normalizeOrderStatus(payload);
}
export function parseOrderEvent(event) {
    try {
        const data = JSON.parse(event.data);
        if (data.type === 'error') {
            return { type: 'error', message: data.message ?? 'Unknown error' };
        }
        const order = normalizeOrderStatus(data.order);
        if (!order) {
            return { type: 'error', message: 'Malformed order payload' };
        }
        return { type: data.type ?? 'update', order };
    }
    catch (error) {
        return { type: 'error', message: error.message };
    }
}
export async function fetchDashboardMetrics() {
    if (!isLiveBackend) {
        throw new Error('Dashboard metrics require the live API.');
    }
    return fetchJson('/api/dashboard');
}
export async function sendAssistantMessage(payload) {
    if (!isLiveBackend) {
        throw new Error('Support assistant requires the live API.');
    }
    return fetchJson('/api/assistant/chat', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}
export async function fetchDailyRevenueTrend(params) {
    if (!isLiveBackend) {
        throw new Error('Daily revenue analytics require the live API.');
    }
    const search = new URLSearchParams();
    if (params?.startDate)
        search.set('startDate', params.startDate);
    if (params?.endDate)
        search.set('endDate', params.endDate);
    const query = search.toString();
    const payload = await fetchJson(`/api/analytics/sales/daily${query ? `?${query}` : ''}`);
    if (payload && Array.isArray(payload.points)) {
        return payload.points;
    }
    return [];
}
