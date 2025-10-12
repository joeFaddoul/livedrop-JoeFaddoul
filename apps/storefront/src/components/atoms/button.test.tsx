import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './button';

describe('Button', () => {
  it('renders provided label', () => {
    render(<Button>Buy now</Button>);
    expect(screen.getByRole('button', { name: /buy now/i })).toBeInTheDocument();
  });

  it('fires click handler when enabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Add to cart</Button>);

    await user.click(screen.getByRole('button', { name: /add to cart/i }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('shows loader text when isLoading', () => {
    render(<Button isLoading>Checking out</Button>);
    expect(screen.getByRole('button', { name: /loading/i })).toHaveAttribute('aria-busy', 'true');
  });
});
