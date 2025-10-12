import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import clsx from 'clsx';
import { forwardRef } from 'react';
const variantStyles = {
    primary: 'bg-brand text-slate-900 hover:bg-brand-light focus-visible:outline-brand-light disabled:bg-slate-600 disabled:text-slate-300',
    secondary: 'bg-slate-800 text-slate-100 hover:bg-slate-700 focus-visible:outline-slate-200 disabled:bg-slate-700 disabled:text-slate-400',
    ghost: 'bg-transparent text-brand hover:bg-slate-800 focus-visible:outline-brand-light disabled:text-slate-500',
};
const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-3 text-lg',
};
export const Button = forwardRef(({ className, variant = 'primary', size = 'md', isLoading, icon, children, disabled, ...rest }, ref) => {
    const content = (_jsxs("span", { className: "flex items-center justify-center gap-2", children: [icon, _jsx("span", { children: children })] }));
    return (_jsx("button", { ref: ref, className: clsx('inline-flex items-center justify-center rounded-full font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2', variantStyles[variant], sizeStyles[size], className), disabled: isLoading || disabled, "aria-busy": isLoading ? 'true' : undefined, ...rest, children: isLoading ? (_jsxs("span", { className: "flex items-center gap-2", children: [_jsx("span", { className: "h-4 w-4 animate-spin rounded-full border-2 border-slate-50 border-t-transparent" }), _jsx("span", { children: "Loading\u2026" })] })) : (content) }));
});
Button.displayName = 'Button';
