import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';

const mockProduct = {
  _id: 'prod-1',
  name: 'Sample Product',
  price: 25,
  stock: 5,
  currency: 'USD',
  save: vi.fn(async function save() {
    return this;
  }),
};

const mockCustomer = {
  _id: 'cust-1',
  email: 'demo@example.com',
};

const createdOrders = [];

vi.mock('../apps/api/src/db.js', () => ({
  Order: {
    findOne: vi.fn(async () => null),
    findById: vi.fn(async (id) => createdOrders.find((order) => order._id === id) || null),
    find: vi.fn(async () => []),
    aggregate: vi.fn(async () => []),
    distinct: vi.fn(async () => []),
    create: vi.fn(async (payload) => {
      const doc = {
        ...payload,
        _id: `order-${createdOrders.length + 1}`,
        toObject() {
          return { ...this };
        },
        save: vi.fn(async function save() {
          return this;
        }),
      };
      createdOrders.push(doc);
      return doc;
    }),
  },
  Product: {
    find: vi.fn(async () => [mockProduct]),
  },
  Customer: {
    findOne: vi.fn(async (query) => (query.email === mockCustomer.email ? mockCustomer : null)),
  },
  ORDER_STATUS_SEQUENCE: ['Placed', 'Packed', 'Shipped', 'Delivered'],
}));

vi.mock('../apps/api/src/sse/order-status.js', () => ({
  scheduleOrderProgression: vi.fn(),
  broadcastOrderStatus: vi.fn(),
}));

const { default: ordersRouter } = await import('../apps/api/src/routes/orders.js');

describe('orders API', () => {
  beforeEach(() => {
    createdOrders.length = 0;
    mockProduct.stock = 5;
  });

  it('rejects orders with missing fields', async () => {
    const app = express();
    app.use(express.json());
    app.use('/api/orders', ordersRouter);

    const response = await request(app).post('/api/orders').send({});
    expect(response.status).toBe(400);
  });

  it('creates order and returns status', async () => {
    const app = express();
    app.use(express.json());
    app.use('/api/orders', ordersRouter);

    const response = await request(app)
      .post('/api/orders')
      .set('Idempotency-Key', 'abc123')
      .send({
        customerEmail: 'demo@example.com',
        items: [{ productId: 'prod-1', quantity: 1 }],
      });

    expect(response.status).toBe(201);
    expect(response.body.orderId).toBeDefined();
    expect(createdOrders).toHaveLength(1);
    expect(mockProduct.save).toHaveBeenCalled();
  });
});
