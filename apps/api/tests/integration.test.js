import { describe, it, expect, beforeAll, afterEach, afterAll, vi } from 'vitest';
import request from 'supertest';

process.env.NODE_ENV = 'test';
process.env.PORT = '0';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
process.env.ALLOWED_ORIGINS = 'http://localhost:5173';
process.env.LLM_BASE_URL = 'https://llm.test';

const mockOrder = {
  _id: 'ORD-1234567890',
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
    json: async () => ({
      text: 'Order ORD-1234567890 is en route and will arrive soon. [Q05]',
    }),
  })),
);

vi.mock('../src/db.js', () => ({
  Order: {
    findById: vi.fn((id) => ({
      lean: vi.fn(async () => (id === mockOrder._id ? mockOrder : null)),
    })),
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

vi.mock('../src/sse/order-status.js', () => ({
  broadcastOrderStatus: vi.fn(),
  registerOrderStatusStream: vi.fn(),
  scheduleOrderProgression: vi.fn(),
  clearOrderTimers: vi.fn(),
}));

let app;

beforeAll(async () => {
  const serverModule = await import('../src/server.js');
  app = serverModule.app;
});

afterEach(() => {
  fetch.mockClear();
});

afterAll(() => {
  vi.unstubAllGlobals();
});

describe('assistant integration', () => {
  it('responds with grounded answer and citations', async () => {
    const response = await request(app).post('/api/assistant/chat').send({
      message: 'Where is my order ORD-1234567890 right now?',
      customerEmail: 'demo@example.com',
    });

    expect(response.status).toBe(200);
    expect(response.body.intent).toBe('order_status');
    expect(response.body.citations.length).toBeGreaterThan(0);
    expect(response.body.answer).toContain('[Q05]');
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('handles chitchat without contacting LLM', async () => {
    const response = await request(app).post('/api/assistant/chat').send({
      message: 'Thanks for the help!',
    });

    expect(response.status).toBe(200);
    expect(response.body.intent).toBe('chitchat');
    expect(response.body.citations).toEqual([]);
    expect(response.body.answer.toLowerCase()).toContain("you're very welcome");
    expect(fetch).not.toHaveBeenCalled();
  });
});
