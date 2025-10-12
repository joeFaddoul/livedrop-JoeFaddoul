import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { SupportPanel } from './support-panel';
const meta = {
    title: 'Organisms/SupportPanel',
    component: SupportPanel,
    render: (args) => {
        const [open, setOpen] = useState(true);
        return (_jsxs(_Fragment, { children: [_jsx("button", { className: "rounded bg-brand px-4 py-2 text-slate-900", onClick: () => setOpen(true), children: "Ask Support" }), _jsx(SupportPanel, { ...args, isOpen: open, onClose: () => setOpen(false) })] }));
    },
    args: {
        isOpen: true,
    },
};
export default meta;
export const Default = {};
