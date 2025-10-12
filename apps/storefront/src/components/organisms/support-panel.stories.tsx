import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { SupportPanel } from './support-panel';

const meta: Meta<typeof SupportPanel> = {
  title: 'Organisms/SupportPanel',
  component: SupportPanel,
  render: (args) => {
    const [open, setOpen] = useState(true);
    return (
      <>
        <button className="rounded bg-brand px-4 py-2 text-slate-900" onClick={() => setOpen(true)}>
          Ask Support
        </button>
        <SupportPanel {...args} isOpen={open} onClose={() => setOpen(false)} />
      </>
    );
  },
  args: {
    isOpen: true,
  },
};

export default meta;
type Story = StoryObj<typeof SupportPanel>;

export const Default: Story = {};
