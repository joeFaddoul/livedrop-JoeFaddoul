import { jsx as _jsx } from "react/jsx-runtime";
import { useState } from 'react';
import { QuantityStepper } from './quantity-stepper';
const meta = {
    title: 'Molecules/QuantityStepper',
    component: QuantityStepper,
    render: (args) => {
        const [quantity, setQuantity] = useState(args.quantity);
        return _jsx(QuantityStepper, { ...args, quantity: quantity, onChange: setQuantity });
    },
    args: {
        quantity: 1,
        min: 1,
        max: 10,
    },
};
export default meta;
export const Default = {};
