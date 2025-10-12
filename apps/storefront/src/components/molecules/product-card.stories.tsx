import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import { ProductCard } from './product-card';
import type { Product } from '@/lib/types';

const product: Product = {
  id: 'CUBE-2001',
  title: 'Nova Speed Cube 3x3',
  price: 17.99,
  image: 'https://picsum.photos/seed/nova3x3/480/480',
  tags: ['3x3', 'speed', 'magnetic'],
  stockQty: 140,
  description: 'Magnetic flagship 3x3 engineered for fast, stable turning.',
};

const meta: Meta<typeof ProductCard> = {
  title: 'Molecules/ProductCard',
  component: ProductCard,
  args: {
    product,
    onAddToCart: () => {},
  },
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div style={{ maxWidth: 360 }}>
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ProductCard>;

export const Default: Story = {};
