import type { HTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({
  children,
  hover = false,
  padding = 'md',
  className,
  ...props
}: CardProps) {
  const baseClasses = 'bg-slate-800 rounded-lg shadow-md transition-all';

  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  return (
    <div
      className={clsx(
        baseClasses,
        paddingClasses[padding],
        hover && 'cursor-pointer hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow-md',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
