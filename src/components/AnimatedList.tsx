import { Children, isValidElement } from 'react';
import type { ReactNode } from 'react';
import clsx from 'clsx';

interface AnimatedListProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  animation?: 'slideUp' | 'slideInRight' | 'fadeIn' | 'scaleIn';
}

export function AnimatedList({
  children,
  className,
  staggerDelay = 50,
  animation = 'slideUp',
}: AnimatedListProps) {
  const animationClasses = {
    slideUp: 'animate-slideUp',
    slideInRight: 'animate-slideInRight',
    fadeIn: 'animate-fadeIn',
    scaleIn: 'animate-scaleIn',
  };

  return (
    <div className={clsx('space-y-4', className)}>
      {Children.map(children, (child, index) => {
        if (!isValidElement(child)) return child;

        return (
          <div
            key={child.key ?? index}
            className={animationClasses[animation]}
            style={{
              animationDelay: `${index * staggerDelay}ms`,
              animationFillMode: 'both',
            }}
          >
            {child}
          </div>
        );
      })}
    </div>
  );
}

interface AnimatedItemProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  animation?: 'slideUp' | 'slideInRight' | 'fadeIn' | 'scaleIn';
}

export function AnimatedItem({
  children,
  className,
  delay = 0,
  animation = 'fadeIn',
}: AnimatedItemProps) {
  const animationClasses = {
    slideUp: 'animate-slideUp',
    slideInRight: 'animate-slideInRight',
    fadeIn: 'animate-fadeIn',
    scaleIn: 'animate-scaleIn',
  };

  return (
    <div
      className={clsx(animationClasses[animation], className)}
      style={{
        animationDelay: `${delay}ms`,
        animationFillMode: 'both',
      }}
    >
      {children}
    </div>
  );
}
