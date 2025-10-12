import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useId } from 'react';
import { Button } from '../atoms/button';
export function QuantityStepper({ quantity, min = 1, max = 99, onChange }) {
    const id = useId();
    const decrease = () => onChange(Math.max(min, quantity - 1));
    const increase = () => onChange(Math.min(max, quantity + 1));
    return (_jsxs("div", { className: "inline-flex items-center gap-3 rounded-full border border-slate-700 bg-slate-900 px-3 py-2", role: "group", "aria-labelledby": `${id}-label`, children: [_jsx("span", { id: `${id}-label`, className: "text-sm font-semibold text-slate-300", children: "Qty" }), _jsx(Button, { type: "button", variant: "ghost", size: "sm", onClick: decrease, "aria-label": "Decrease quantity", disabled: quantity <= min, children: "\u2013" }), _jsx("span", { className: "min-w-[2ch] text-center text-base font-semibold text-slate-100", role: "status", "aria-live": "polite", children: quantity }), _jsx(Button, { type: "button", variant: "ghost", size: "sm", onClick: increase, "aria-label": "Increase quantity", disabled: quantity >= max, children: "+" })] }));
}
