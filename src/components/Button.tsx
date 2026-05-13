import type { ButtonHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled,
  className,
  ...props
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all whitespace-nowrap relative';

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-5 py-3 text-base',
    lg: 'px-6 py-4 text-lg',
  };

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 hover:-translate-y-0.5 hover:shadow-md disabled:hover:translate-y-0 disabled:hover:shadow-none',
    secondary: 'bg-slate-800 text-white border border-slate-700 hover:bg-slate-700 hover:border-slate-600 hover:-translate-y-0.5 disabled:hover:translate-y-0',
    ghost: 'bg-transparent text-slate-400 hover:bg-white/5 hover:text-white',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 hover:-translate-y-0.5 hover:shadow-md disabled:hover:translate-y-0 disabled:hover:shadow-none',
  };

  return (
    <button
      className={clsx(
        baseClasses,
        sizeClasses[size],
        variantClasses[variant],
        fullWidth && 'w-full',
        loading && 'pointer-events-none opacity-70',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
      ) : (
        children
      )}
    </button>
  );
}
