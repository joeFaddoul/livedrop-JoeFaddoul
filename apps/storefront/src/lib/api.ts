import { z } from 'zod';
import { catalogFallback } from './catalog-fallback';
import type { CartLineItem, OrderStatusRecord, Product } from './types';

let cachedProducts: Product[] | null = null;
const orderStatusStore = new Map<string, OrderStatusRecord>();

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

function parseCatalog(input: unknown): Product[] | null {
  const parsed = catalogSchema.safeParse(input);
  if (parsed.success) {
    return parsed.data;
  }
  return null;
}

function parseOrderStatus(input: OrderStatusRecord): OrderStatusRecord {
  const parsed = orderStatusSchema.parse(input);
  return parsed;
}

const seededStatuses: OrderStatusRecord[] = [
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

async function hydrateCatalog(): Promise<Product[]> {
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
    } catch {
      // fallback to static data
    }
  }

  const parsedFallback = parseCatalog(catalogFallback);
  cachedProducts = parsedFallback ?? catalogFallback;
  return cachedProducts;
}

export async function listProducts(): Promise<Product[]> {
  const products = await hydrateCatalog();
  return [...products].sort((a, b) => a.title.localeCompare(b.title));
}

export async function getProduct(id: string): Promise<Product | undefined> {
  const products = await hydrateCatalog();
  return products.find((item) => item.id === id);
}

export async function getRelatedProducts(id: string, take = 3): Promise<Product[]> {
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

export async function placeOrder(cart: CartLineItem[]) {
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

export async function getOrderStatus(orderId: string): Promise<OrderStatusRecord | undefined> {
  if (!orderId) {
    return undefined;
  }

  if (orderStatusStore.has(orderId)) {
    const record = orderStatusStore.get(orderId);
    return record ? parseOrderStatus(record) : undefined;
  }

  return undefined;
}
