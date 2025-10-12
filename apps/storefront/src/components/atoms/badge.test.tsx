import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, expect, it } from 'vitest';
import { Badge } from './badge';

describe('Badge', () => {
  it('renders text content', () => {
    render(<Badge color="info">Featured</Badge>);
    expect(screen.getByText(/featured/i)).toBeInTheDocument();
  });
});
