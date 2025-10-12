import { z } from 'zod';
import { catalogFallback } from './catalog-fallback';
let cachedProducts = null;
const orderStatusStore = new Map();
const CATALOG_URL = '/mock-catalog.json';
const productSchema = z
    .object({
    id: z.string().min(1),
    title: z.string().min(1),
    price: z.number(),
    image: z.string().url().or(z.string().min(1)),
    tags: z.array(z.string().min(1)),
    stockQty: z.number(),
    description: z.string(),
})
    .strict();
const catalogSchema = z.array(productSchema);
const orderStatusSchema = z
    .object({
    orderId: z.string().min(1),
    status: z.enum(['Placed', 'Packed', 'Shipped', 'Delivered']),
    carrier: z.string().optional(),
    eta: z.string().optional(),
    updatedAt: z.string(),
})
    .strict();
function parseCatalog(input) {
    const parsed = catalogSchema.safeParse(input);
    if (parsed.success) {
        return parsed.data;
    }
    return null;
}
function parseOrderStatus(input) {
    const parsed = orderStatusSchema.parse(input);
    return parsed;
}
const seededStatuses = [
    {
        orderId: 'ORD-ALPHA99',
        status: 'Packed',
        carrier: 'Lightspeed Logistics',
        eta: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        orderId: 'ORD-BETA11',
        status: 'Shipped',
        carrier: 'Lightspeed Logistics',
        eta: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        orderId: 'ORD-GAMMA77',
        status: 'Delivered',
        carrier: 'Swift Parcel',
        eta: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
    },
];
seededStatuses.forEach((status) => orderStatusStore.set(status.orderId, parseOrderStatus(status)));
async function hydrateCatalog() {
    if (cachedProducts) {
        return cachedProducts;
    }
    if (typeof fetch === 'function') {
        try {
            const response = await fetch(CATALOG_URL);
            if (response.ok) {
                const payload = await response.json();
                const parsed = parseCatalog(payload);
                if (parsed) {
                    cachedProducts = parsed;
                    return cachedProducts;
                }
            }
        }
        catch {
            // fallback to static data
        }
    }
    const parsedFallback = parseCatalog(catalogFallback);
    cachedProducts = parsedFallback ?? catalogFallback;
    return cachedProducts;
}
export async function listProducts() {
    const products = await hydrateCatalog();
    return [...products].sort((a, b) => a.title.localeCompare(b.title));
}
export async function getProduct(id) {
    const products = await hydrateCatalog();
    return products.find((item) => item.id === id);
}
export async function getRelatedProducts(id, take = 3) {
    const product = await getProduct(id);
    if (!product) {
        return [];
    }
    const products = await hydrateCatalog();
    const related = products
        .filter((item) => item.id !== id && item.tags.some((tag) => product.tags.includes(tag)))
        .slice(0, take);
    return related;
}
export async function placeOrder(cart) {
    if (!cart.length) {
        throw new Error('Cannot place an empty order.');
    }
    const orderId = `ORD-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
    const record = parseOrderStatus({
        orderId,
        status: 'Placed',
        carrier: 'Lightspeed Logistics',
        eta: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
    });
    orderStatusStore.set(orderId, record);
    return { orderId };
}
export async function getOrderStatus(orderId) {
    if (!orderId) {
        return undefined;
    }
    if (orderStatusStore.has(orderId)) {
        const record = orderStatusStore.get(orderId);
        return record ? parseOrderStatus(record) : undefined;
    }
    return undefined;
}
