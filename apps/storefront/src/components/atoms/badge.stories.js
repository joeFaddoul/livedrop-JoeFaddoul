import { Badge } from './badge';
const meta = {
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
export const Default = {};
export const Info = {
    args: { color: 'info' },
};
export const Success = {
    args: { color: 'success' },
};
export const Warning = {
    args: { color: 'warning' },
};
