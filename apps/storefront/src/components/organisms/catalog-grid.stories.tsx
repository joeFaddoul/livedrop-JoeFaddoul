import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import { CatalogGrid } from './catalog-grid';
import type { Product } from '@/lib/types';

const products: Product[] = [
  {
    id: 'CUBE-2001',
    title: 'Nova Speed Cube 3x3',
    price: 17.99,
    image: 'https://picsum.photos/seed/nova3x3/480/480',
    tags: ['3x3', 'speed'],
    stockQty: 140,
    description: 'Magnetic flagship 3x3 engineered for competition solves.',
  },
  {
    id: 'CUBE-2002',
    title: 'Nebula Magnetic 2x2',
    price: 12.5,
    image: 'https://picsum.photos/seed/nebula2x2/480/480',
    tags: ['2x2', 'magnetic'],
    stockQty: 110,
    description: 'Compact 2x2 cube with controllable turning for beginners.',
  },
];

const meta: Meta<typeof CatalogGrid> = {
  title: 'Organisms/CatalogGrid',
  component: CatalogGrid,
  args: {
    products,
    onAddToCart: () => {},
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof CatalogGrid>;

export const Default: Story = {};

export const Empty: Story = {
  args: {
    products: [],
  },
};
