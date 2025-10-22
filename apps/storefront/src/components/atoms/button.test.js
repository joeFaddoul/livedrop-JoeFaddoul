import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './button';
describe('Button', () => {
    it('renders provided label', () => {
        render(_jsx(Button, { children: "Buy now" }));
        expect(screen.getByRole('button', { name: /buy now/i })).toBeInTheDocument();
    });
    it('fires click handler when enabled', async () => {
        const user = userEvent.setup();
        const onClick = vi.fn();
        render(_jsx(Button, { onClick: onClick, children: "Add to cart" }));
        await user.click(screen.getByRole('button', { name: /add to cart/i }));
        expect(onClick).toHaveBeenCalledOnce();
    });
    it('shows loader text when isLoading', () => {
        render(_jsx(Button, { isLoading: true, children: "Checking out" }));
        expect(screen.getByRole('button', { name: /loading/i })).toHaveAttribute('aria-busy', 'true');
    });
});
