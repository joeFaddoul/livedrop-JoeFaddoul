import { TextInput } from './text-input';
const meta = {
    title: 'Atoms/TextInput',
    component: TextInput,
    args: {
        label: 'Search products',
        placeholder: 'Type a product name…',
    },
};
export default meta;
export const Default = {};
export const WithHint = {
    args: {
        hint: 'We search title and tags.',
    },
};
export const WithError = {
    args: {
        error: 'This field is required.',
    },
};
