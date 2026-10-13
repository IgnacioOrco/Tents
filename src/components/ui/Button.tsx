import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-200 select-none active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2';

    const variants = {
      primary:
        'bg-crimson text-cream-50 hover:bg-crimson-600 active:bg-crimson-700 shadow-sm focus:ring-crimson/50',
      secondary:
        'bg-wood text-cream-50 hover:bg-wood-600 active:bg-wood-700 shadow-sm focus:ring-wood/50',
      outline:
        'border border-wood-300 text-wood-700 hover:bg-wood-100/60 active:bg-wood-200/50 focus:ring-wood/30 bg-transparent',
      ghost:
        'text-ink-soft hover:bg-wood-100/50 active:bg-wood-200/40 focus:ring-wood/20 bg-transparent',
      danger:
        'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm focus:ring-red-500/50',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 gap-1.5 h-8',
      md: 'text-xs sm:text-sm px-4 py-2.5 gap-2 h-10',
      lg: 'text-sm sm:text-base px-6 py-3 gap-2.5 h-12',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
        {...props}
      >
        {isLoading ? (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin flex-shrink-0" />
        ) : (
          leftIcon && <span className="flex-shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
