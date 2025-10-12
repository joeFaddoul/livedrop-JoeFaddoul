import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './badge';

const meta: Meta<typeof Badge> = {
  title: 'Atoms/Badge',
  component: Badge,
  args: {
    children: 'Featured',
  },
  argTypes: {
    color: {
      control: 'inline-radio',
      options: ['default', 'info', 'success', 'warning'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {};

export const Info: Story = {
  args: { color: 'info' },
};

export const Success: Story = {
  args: { color: 'success' },
};

export const Warning: Story = {
  args: { color: 'warning' },
};
