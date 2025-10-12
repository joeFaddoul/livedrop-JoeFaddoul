import type { Meta, StoryObj } from '@storybook/react';
import { VisuallyHidden } from './visually-hidden';

const meta: Meta<typeof VisuallyHidden> = {
  title: 'Atoms/VisuallyHidden',
  component: VisuallyHidden,
  render: (args) => (
    <button className="rounded bg-slate-800 px-4 py-2 text-slate-100">
      <VisuallyHidden {...args} />
      Visible Button Label
    </button>
  ),
  args: {
    children: 'Screen reader only label',
  },
};

export default meta;
type Story = StoryObj<typeof VisuallyHidden>;

export const Default: Story = {};
