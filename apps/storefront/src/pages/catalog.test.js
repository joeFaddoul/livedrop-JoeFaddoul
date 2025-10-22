import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { createMemoryRouter, Outlet, RouterProvider } from 'react-router-dom';
import { CatalogPage } from './catalog';
const products = [
    {
        id: 'CUBE-1',
        title: 'Nova Speed Cube',
        price: 18,
        image: 'https://picsum.photos/seed/nova/200/200',
        tags: ['3x3'],
        stockQty: 10,
        description: 'Speed cube for competition practice.',
    },
    {
        id: 'CUBE-2',
        title: 'Nebula Magnetic 2x2',
        price: 13,
        image: 'https://picsum.photos/seed/nebula/200/200',
        tags: ['2x2'],
        stockQty: 5,
        description: 'Magnetic 2x2 cube for training.',
    },
];
function ContextProvider() {
    return _jsx(Outlet, { context: { products } });
}
describe('CatalogPage', () => {
    it('filters products by search term', async () => {
        const user = userEvent.setup();
        const router = createMemoryRouter([
            {
                path: '/',
                element: _jsx(ContextProvider, {}),
                children: [
                    {
                        index: true,
                        element: _jsx(CatalogPage, {}),
                    },
                ],
            },
        ], { initialEntries: ['/'] });
        render(_jsx(RouterProvider, { router: router }));
        expect(await screen.findByText(/nova speed cube/i)).toBeInTheDocument();
        await user.type(screen.getByLabelText(/search/i), 'nebula');
        expect(screen.getByText(/nebula magnetic 2x2/i)).toBeInTheDocument();
        expect(screen.queryByText(/nova speed cube/i)).not.toBeInTheDocument();
    });
});
