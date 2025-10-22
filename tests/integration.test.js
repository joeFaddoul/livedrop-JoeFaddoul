import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';

process.env.NODE_ENV = 'test';
process.env.PORT = '0';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
process.env.ALLOWED_ORIGINS = 'http://localhost:5173';
process.env.LLM_BASE_URL = 'https://llm.test';

const mockOrder = {
  _id: 'ORD-ROOTTEST',
  status: 'Shipped',
  carrier: 'Lightspeed Logistics',
  estimatedDelivery: new Date().toISOString(),
  createdAt: new Date(),
  toObject() {
    return { ...this };
  },
  history: [],
};

vi.stubGlobal(
  'fetch',
  vi.fn(async () => ({
    ok: true,
    json: async () => ({ text: 'Order ORD-ROOTTEST is on the way. [Q05]' }),
  })),
);

vi.mock('../apps/api/src/db.js', () => ({
  Order: {
    findById: vi.fn(async (id) => (id === mockOrder._id ? mockOrder : null)),
    find: vi.fn(async () => [mockOrder]),
  },
  Customer: {
    findOne: vi.fn(async () => ({ _id: 'cust-1', email: 'demo@example.com' })),
  },
  AssistantMetric: {
    create: vi.fn(async () => ({})),
  },
  ORDER_STATUS_SEQUENCE: ['Placed', 'Packed', 'Shipped', 'Delivered'],
}));

vi.mock('../apps/api/src/sse/order-status.js', () => ({
  registerOrderStatusStream: vi.fn(),
  broadcastOrderStatus: vi.fn(),
  scheduleOrderProgression: vi.fn(),
  clearOrderTimers: vi.fn(),
}));

let app;

beforeAll(async () => {
  const serverModule = await import('../apps/api/src/server.js');
  app = serverModule.app;
});

afterAll(() => {
  vi.unstubAllGlobals();
});

describe('assistant integration (root)', () => {
  it('returns grounded answer with citations', async () => {
    const response = await request(app).post('/api/assistant/chat').send({
      message: 'Where is my order ORD-ROOTTEST?',
      customerEmail: 'demo@example.com',
    });

    expect(response.status).toBe(200);
    expect(response.body.answer).toContain('[Q05]');
  });

  it('handles chitchat without invoking policies', async () => {
    const response = await request(app).post('/api/assistant/chat').send({
      message: 'Thanks a lot!',
    });

    expect(response.status).toBe(200);
    expect(response.body.intent).toBe('chitchat');
    expect(response.body.citations).toEqual([]);
    expect(response.body.answer.toLowerCase()).toContain("you're very welcome");
  });
});
