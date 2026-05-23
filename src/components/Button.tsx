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
  const base =
    'inline-flex items-center justify-center gap-2 font-condensed font-700 tracking-widest uppercase whitespace-nowrap transition-all duration-150 relative select-none';

  const sizes = {
    sm: 'px-4 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
  };

  const variants = {
    primary: [
      'bg-acid text-black rounded-sm',
      'hover:bg-[#D8FF1A] hover:-translate-y-px active:translate-y-0',
      'disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:bg-acid',
    ].join(' '),

    secondary: [
      'bg-transparent text-ink border border-[var(--border-2)] rounded-sm',
      'hover:border-[var(--acid)] hover:text-acid hover:-translate-y-px',
      'active:translate-y-0',
      'disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:border-[var(--border-2)] disabled:hover:text-ink',
    ].join(' '),

    ghost: [
      'bg-transparent text-[var(--ink-2)] rounded-sm',
      'hover:text-ink hover:bg-[var(--surface-2)]',
      'disabled:opacity-40',
    ].join(' '),

    danger: [
      'bg-[var(--fire)] text-white rounded-sm',
      'hover:bg-[#FF5530] hover:-translate-y-px active:translate-y-0',
      'disabled:opacity-40 disabled:hover:translate-y-0',
    ].join(' '),
  };

  return (
    <button
      className={clsx(
        base,
        sizes[size],
        variants[variant],
        fullWidth && 'w-full',
        (loading || disabled) && 'pointer-events-none',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        children
      )}
    </button>
  );
}
