import type { Meta, StoryObj } from '@storybook/react';
import { TextInput } from './text-input';

const meta: Meta<typeof TextInput> = {
  title: 'Atoms/TextInput',
  component: TextInput,
  args: {
    label: 'Search products',
    placeholder: 'Type a product name…',
  },
};

export default meta;
type Story = StoryObj<typeof TextInput>;

export const Default: Story = {};

export const WithHint: Story = {
  args: {
    hint: 'We search title and tags.',
  },
};

export const WithError: Story = {
  args: {
    error: 'This field is required.',
  },
};
