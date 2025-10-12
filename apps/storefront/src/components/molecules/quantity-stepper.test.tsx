import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { QuantityStepper } from './quantity-stepper';

describe('QuantityStepper', () => {
  it('announces current quantity', () => {
    render(<QuantityStepper quantity={2} onChange={() => {}} />);
    expect(screen.getByRole('status')).toHaveTextContent('2');
  });

  it('limits quantity to min and max bounds', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<QuantityStepper quantity={1} min={1} max={2} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: /increase quantity/i }));
    expect(onChange).toHaveBeenCalledWith(2);
  });
});
