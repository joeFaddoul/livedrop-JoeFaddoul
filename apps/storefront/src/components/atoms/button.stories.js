import { Button } from './button';
const meta = {
    title: 'Atoms/Button',
    component: Button,
    argTypes: {
        variant: {
            control: 'radio',
            options: ['primary', 'secondary', 'ghost'],
        },
        size: {
            control: 'radio',
            options: ['sm', 'md', 'lg'],
        },
    },
    args: {
        children: 'Add to Cart',
    },
};
export default meta;
export const Primary = {
    args: {
        variant: 'primary',
    },
};
export const Secondary = {
    args: {
        variant: 'secondary',
    },
};
export const Ghost = {
    args: {
        variant: 'ghost',
    },
};
