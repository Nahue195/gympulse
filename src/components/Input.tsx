import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import clsx from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-2 w-full">
        {label && (
          <label className="text-sm font-medium text-white" htmlFor={props.id}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={clsx(
            'w-full px-4 py-3 text-base text-white bg-slate-800 border rounded-md transition-all',
            'focus:outline-none placeholder:text-slate-400',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error
              ? 'border-red-600 focus:border-red-600 focus:ring-4 focus:ring-red-600/20'
              : 'border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20',
            className
          )}
          {...props}
        />
        {error && <span className="text-sm text-red-600">{error}</span>}
        {helperText && !error && (
          <span className="text-sm text-slate-400">{helperText}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
