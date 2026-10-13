import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AlertCircle } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, leftIcon, rightIcon, id, ...props }, ref) => {
    const generatedId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1">
        {label && (
          <label htmlFor={generatedId} className="block text-xs font-bold text-ink-soft">
            {label}
            {props.required && <span className="text-crimson ml-0.5">*</span>}
          </label>
        )}
        <div className="relative rounded-xl shadow-sm">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-wood-500">
              {leftIcon}
            </div>
          )}
          <input
            id={generatedId}
            ref={ref}
            className={twMerge(
              clsx(
                'block w-full rounded-xl text-xs sm:text-sm text-ink placeholder:text-wood-400 bg-white border transition-colors duration-150',
                'focus:outline-none focus:ring-2 focus:ring-offset-1',
                leftIcon ? 'pl-9' : 'pl-3.5',
                rightIcon ? 'pr-9' : 'pr-3.5',
                'py-2.5',
                error
                  ? 'border-crimson text-crimson focus:border-crimson focus:ring-crimson/30'
                  : 'border-wood-200 focus:border-crimson focus:ring-crimson/20 hover:border-wood-300',
                props.disabled && 'bg-cream-100 text-wood-400 cursor-not-allowed',
                className
              )
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-wood-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <p className="text-[11px] text-crimson flex items-center gap-1 font-medium mt-1 animate-in fade-in duration-150">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p className="text-[11px] text-ink-muted mt-1">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
