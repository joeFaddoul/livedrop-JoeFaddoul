import { describe, expect, it, vi, beforeEach } from 'vitest';
vi.mock('@/lib/api', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        getOrderStatus: vi.fn(async (orderId) => {
            if (orderId === 'ORD-ALPHA99') {
                return {
                    orderId,
                    status: 'Shipped',
                    carrier: 'Lightspeed Logistics',
                    eta: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
                    updatedAt: new Date().toISOString(),
                };
            }
            return undefined;
        }),
    };
});
describe('support engine', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });
    it('returns matched policy answer with citation', async () => {
        const { askSupport } = await import('./engine');
        const response = await askSupport('What is your return window?');
        expect(response.refused).toBe(false);
        expect(response.message).toMatch(/\[Q03]/);
    });
    it('refuses when out of scope', async () => {
        const { askSupport } = await import('./engine');
        const response = await askSupport('Can you write me a poem about space lizards?');
        expect(response.refused).toBe(true);
    });
    it('includes order status citation when question has order id', async () => {
        const { askSupport } = await import('./engine');
        const response = await askSupport('Where is my order ORD-ALPHA99 right now?');
        expect(response.refused).toBe(false);
        expect(response.message).toContain('Order ****HA99');
        expect(response.message).toMatch(/\[Q\d{2}]/);
    });
});
