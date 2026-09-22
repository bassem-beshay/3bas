import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed select-none';

    const variants = {
      primary: 'bg-noir-900 text-white hover:bg-noir-800 active:bg-noir-950 shadow-sm',
      secondary: 'bg-noir-100 text-noir-900 hover:bg-noir-200 active:bg-noir-300',
      outline: 'border border-noir-900 text-noir-900 hover:bg-noir-900 hover:text-white bg-transparent',
      ghost: 'text-noir-700 hover:text-noir-950 hover:bg-noir-100 bg-transparent',
      danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
    };

    const sizes = {
      sm: 'text-xs tracking-wider uppercase px-3 py-2 h-8',
      md: 'text-xs tracking-editorial uppercase px-6 py-3.5 h-11',
      lg: 'text-sm tracking-editorial uppercase px-8 py-4 h-13',
      icon: 'h-10 w-10 p-0',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4 text-current" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span>Processing...</span>
          </div>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
