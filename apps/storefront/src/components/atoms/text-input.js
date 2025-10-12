import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import clsx from 'clsx';
import { forwardRef } from 'react';
export const TextInput = forwardRef(({ id, label, hint, error, className, ...rest }, ref) => {
    const inputId = id ?? `input-${label.replace(/\s+/g, '-').toLowerCase()}`;
    const hintId = hint ? `${inputId}-hint` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;
    const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;
    return (_jsxs("div", { className: "flex w-full flex-col gap-2", children: [_jsx("label", { htmlFor: inputId, className: "text-sm font-semibold text-slate-200", children: label }), _jsx("input", { ref: ref, id: inputId, className: clsx('w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-base text-slate-100 outline-none transition focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/40', error && 'border-red-500 focus-visible:ring-red-500/40', className), "aria-invalid": error ? 'true' : undefined, "aria-describedby": describedBy, ...rest }), hint && (_jsx("p", { id: hintId, className: "text-sm text-slate-400", children: hint })), error && (_jsx("p", { id: errorId, className: "text-sm text-red-400", children: error }))] }));
});
TextInput.displayName = 'TextInput';
