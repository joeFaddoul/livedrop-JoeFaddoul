import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TextInput } from './text-input';
describe('TextInput', () => {
    it('associates label and input', () => {
        render(_jsx(TextInput, { label: "Search" }));
        const field = screen.getByLabelText(/search/i);
        expect(field).toBeInTheDocument();
    });
    it('announces error text', () => {
        render(_jsx(TextInput, { label: "Email", error: "Email required" }));
        const field = screen.getByLabelText(/email/i);
        expect(field).toHaveAttribute('aria-invalid', 'true');
        const error = screen.getByText(/email required/i);
        expect(error.id).toEqual(field.getAttribute('aria-describedby'));
    });
});
