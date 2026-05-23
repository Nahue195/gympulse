import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import clsx from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, id, ...props }, ref) => {
    const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-condensed font-600 tracking-widest uppercase text-[var(--ink-2)]"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            'gp-input',
            error && '!border-[var(--fire)] focus:!border-[var(--fire)] focus:!shadow-[0_0_0_3px_var(--fire-dim)]',
            className
          )}
          {...props}
        />
        {error && (
          <span className="text-xs text-[var(--fire)] font-condensed tracking-wide">
            {error}
          </span>
        )}
        {helperText && !error && (
          <span className="text-xs text-[var(--ink-3)]">{helperText}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
