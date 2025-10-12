import { jsx as _jsx } from "react/jsx-runtime";
import clsx from 'clsx';
const colorStyles = {
    default: 'bg-slate-800 text-slate-200',
    info: 'bg-sky-500/20 text-sky-200',
    success: 'bg-emerald-500/20 text-emerald-200',
    warning: 'bg-amber-500/20 text-amber-200',
};
export function Badge({ children, color = 'default', className }) {
    return (_jsx("span", { className: clsx('inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide', colorStyles[color], className), children: children }));
}
