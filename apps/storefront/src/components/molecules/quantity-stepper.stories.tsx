import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { QuantityStepper } from './quantity-stepper';

const meta: Meta<typeof QuantityStepper> = {
  title: 'Molecules/QuantityStepper',
  component: QuantityStepper,
  render: (args) => {
    const [quantity, setQuantity] = useState(args.quantity);
    return <QuantityStepper {...args} quantity={quantity} onChange={setQuantity} />;
  },
  args: {
    quantity: 1,
    min: 1,
    max: 10,
  },
};

export default meta;
type Story = StoryObj<typeof QuantityStepper>;

export const Default: Story = {};
