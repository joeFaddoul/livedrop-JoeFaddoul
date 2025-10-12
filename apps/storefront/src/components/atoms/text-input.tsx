import clsx from 'clsx';
import { forwardRef } from 'react';

export type TextInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
};

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ id, label, hint, error, className, ...rest }, ref) => {
    const inputId = id ?? `input-${label.replace(/\s+/g, '-').toLowerCase()}`;
    const hintId = hint ? `${inputId}-hint` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;
    const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

    return (
      <div className="flex w-full flex-col gap-2">
        <label htmlFor={inputId} className="text-sm font-semibold text-slate-200">
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            'w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-base text-slate-100 outline-none transition focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/40',
            error && 'border-red-500 focus-visible:ring-red-500/40',
            className,
          )}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          {...rest}
        />
        {hint && (
          <p id={hintId} className="text-sm text-slate-400">
            {hint}
          </p>
        )}
        {error && (
          <p id={errorId} className="text-sm text-red-400">
            {error}
          </p>
        )}
      </div>
    );
  },
);

TextInput.displayName = 'TextInput';
