import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { VisuallyHidden } from './visually-hidden';

describe('VisuallyHidden', () => {
  it('renders content for screen readers', () => {
    render(<VisuallyHidden>Hidden label</VisuallyHidden>);
    const element = screen.getByText(/hidden label/i);
    expect(element).toHaveClass('sr-only');
  });
});
