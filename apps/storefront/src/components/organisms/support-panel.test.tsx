import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const askSupport = vi.fn(async () => ({
  message: 'Standard shipping takes 3-5 business days. [Q01]',
  refused: false,
  citedQid: 'Q01',
}));

vi.mock('@/assistant/engine', () => ({ askSupport }));

describe('SupportPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sends question and renders assistant reply', async () => {
    const user = userEvent.setup();
    const { SupportPanel } = await import('./support-panel');

    render(<SupportPanel isOpen onClose={() => {}} />);

    await user.type(screen.getByPlaceholderText(/type your question/i), 'How long is shipping?');
    await user.click(screen.getByRole('button', { name: /send/i }));

    expect(askSupport).toHaveBeenCalledWith('How long is shipping?');
    expect(await screen.findByText(/standard shipping/i)).toBeInTheDocument();
  });
});
