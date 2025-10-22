import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, expect, it } from 'vitest';
import { Badge } from './badge';
describe('Badge', () => {
    it('renders text content', () => {
        render(_jsx(Badge, { color: "info", children: "Featured" }));
        expect(screen.getByText(/featured/i)).toBeInTheDocument();
    });
});
