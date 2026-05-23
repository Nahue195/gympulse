import type { HTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  accent?: boolean;
}

export function Card({
  children,
  hover = false,
  padding = 'md',
  accent = false,
  className,
  ...props
}: CardProps) {
  const paddings = {
    none: '',
    sm:   'p-3',
    md:   'p-4',
    lg:   'p-6',
  };

  return (
    <div
      className={clsx(
        'gp-card transition-all duration-150',
        paddings[padding],
        hover && 'cursor-pointer hover:-translate-y-0.5 hover:border-[var(--border-2)]',
        accent && 'border-l-2 border-l-[var(--acid)]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
