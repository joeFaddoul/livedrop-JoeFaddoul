import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

beforeEach(() => {
  import.meta.env.VITE_APP_API_BASE = 'https://api.test';
});

const sendAssistantMessage = vi.fn(async () => ({
  intent: 'order_status',
  confidence: 0.9,
  answer: 'Order ORD-TEST is currently shipped. [Q05]',
  citations: ['Q05'],
  invocations: [{ name: 'lookupOrderStatus', args: { orderId: 'ORD-TEST' }, result: { found: true } }],
  policies: [{ qid: 'Q05', question: 'How do order tracking and returns work together for customers?' }],
  citationReport: {
    isValid: true,
    citedCitations: ['Q05'],
    validCitations: ['Q05'],
    invalidCitations: [],
  },
}));

vi.mock('@/lib/api', () => ({ sendAssistantMessage }));

vi.mock('@/assistant/engine', () => ({
  askSupport: vi.fn(async () => ({
    message: 'Fallback response',
    citedQid: 'Q01',
    refused: false,
  })),
}));

describe('SupportAssistant', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sends message and renders assistant reply with citations', async () => {
    const user = userEvent.setup();
    const { SupportAssistant } = await import('./SupportAssistant');

    render(<SupportAssistant />);
    await user.type(screen.getByPlaceholderText(/type your question/i), 'Where is my package?');
    await user.click(screen.getByRole('button', { name: /send/i }));

    expect(await screen.findByText(/order ord-test is currently shipped/i)).toBeInTheDocument();
    expect(screen.getByText(/^Citations:/i)).toBeInTheDocument();
    expect(screen.getByText(/citations validated/i)).toBeInTheDocument();
  });
});
