import { jsx as _jsx } from "react/jsx-runtime";
import { MemoryRouter } from 'react-router-dom';
import { ProductCard } from './product-card';
const product = {
    id: 'CUBE-2001',
    title: 'Nova Speed Cube 3x3',
    price: 17.99,
    image: 'https://picsum.photos/seed/nova3x3/480/480',
    tags: ['3x3', 'speed', 'magnetic'],
    stockQty: 140,
    description: 'Magnetic flagship 3x3 engineered for fast, stable turning.',
};
const meta = {
    title: 'Molecules/ProductCard',
    component: ProductCard,
    args: {
        product,
        onAddToCart: () => { },
    },
    parameters: {
        layout: 'centered',
    },
    decorators: [
        (Story) => (_jsx(MemoryRouter, { children: _jsx("div", { style: { maxWidth: 360 }, children: _jsx(Story, {}) }) })),
    ],
};
export default meta;
export const Default = {};
