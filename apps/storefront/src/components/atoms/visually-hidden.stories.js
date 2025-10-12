import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { VisuallyHidden } from './visually-hidden';
const meta = {
    title: 'Atoms/VisuallyHidden',
    component: VisuallyHidden,
    render: (args) => (_jsxs("button", { className: "rounded bg-slate-800 px-4 py-2 text-slate-100", children: [_jsx(VisuallyHidden, { ...args }), "Visible Button Label"] })),
    args: {
        children: 'Screen reader only label',
    },
};
export default meta;
export const Default = {};
