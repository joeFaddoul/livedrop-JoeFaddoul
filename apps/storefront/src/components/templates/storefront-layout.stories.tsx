import type { Meta, StoryObj } from '@storybook/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { StorefrontLayout } from './storefront-layout';

const router = createMemoryRouter(
  [
    {
      path: '/',
      element: <StorefrontLayout />,
      loader: () => ({
        products: [
          {
            id: 'CUBE-2001',
            title: 'Nova Speed Cube 3x3',
            price: 17.99,
            image: 'https://picsum.photos/seed/nova3x3/480/480',
            tags: ['3x3', 'speed'],
            stockQty: 140,
            description: 'Magnetic flagship cube built for competition solves.',
          },
        ],
      }),
      children: [
        {
          index: true,
          element: (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 text-slate-200">
              Catalog goes here.
            </div>
          ),
        },
      ],
    },
  ],
  { initialEntries: ['/'] },
);

const meta: Meta<typeof StorefrontLayout> = {
  title: 'Templates/StorefrontLayout',
  component: StorefrontLayout,
  render: () => <RouterProvider router={router} />,
};

export default meta;
type Story = StoryObj<typeof StorefrontLayout>;

export const Default: Story = {};
