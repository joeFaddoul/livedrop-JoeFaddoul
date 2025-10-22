import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SearchBar } from './search-bar';
describe('SearchBar', () => {
    const setup = () => render(_jsx(SearchBar, { query: "", onQueryChange: vi.fn(), selectedTag: "all", onTagChange: vi.fn(), sort: "price-asc", onSortChange: vi.fn(), tags: ['audio', 'wearables'] }));
    it('renders accessible search role', () => {
        setup();
        expect(screen.getByRole('search', { name: /product filters/i })).toBeInTheDocument();
    });
    it('allows changing tag selection', async () => {
        const user = userEvent.setup();
        const onTagChange = vi.fn();
        render(_jsx(SearchBar, { query: "", onQueryChange: vi.fn(), selectedTag: "all", onTagChange: onTagChange, sort: "price-asc", onSortChange: vi.fn(), tags: ['audio'] }));
        await user.selectOptions(screen.getByLabelText(/^tag$/i), 'audio');
        expect(onTagChange).toHaveBeenCalledWith('audio');
    });
    it('updates sort via button press', async () => {
        const user = userEvent.setup();
        const onSortChange = vi.fn();
        render(_jsx(SearchBar, { query: "", onQueryChange: vi.fn(), selectedTag: "all", onTagChange: vi.fn(), sort: "price-asc", onSortChange: onSortChange, tags: [] }));
        await user.click(screen.getByRole('button', { name: /price high to low/i }));
        expect(onSortChange).toHaveBeenCalledWith('price-desc');
    });
});
