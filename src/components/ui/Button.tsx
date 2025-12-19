/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-white transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default: 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/40 hover:-translate-y-0.5 border border-transparent',
        destructive: 'bg-gradient-to-r from-error-600 to-error-500 text-white shadow-lg shadow-error-500/25 hover:shadow-xl hover:shadow-error-500/40 hover:-translate-y-0.5',
        outline: 'border border-gray-200 bg-white/50 backdrop-blur-sm hover:bg-white hover:border-primary-200 text-gray-700 hover:text-primary-600 shadow-sm hover:shadow-md transition-all',
        secondary: 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:text-gray-900 shadow-sm hover:shadow-md hover:-translate-y-0.5',
        ghost: 'hover:bg-primary-50 text-gray-600 hover:text-primary-700',
        link: 'text-primary-600 underline-offset-4 hover:underline hover:text-primary-700 font-semibold',
        success: 'bg-gradient-to-r from-success-600 to-success-500 text-white shadow-lg shadow-success-500/25 hover:shadow-xl hover:shadow-success-500/40 hover:-translate-y-0.5',
        warning: 'bg-gradient-to-r from-warning-600 to-warning-500 text-white shadow-lg shadow-warning-500/25 hover:shadow-xl hover:shadow-warning-500/40 hover:-translate-y-0.5',
      },
      size: {
        default: 'h-10 px-5 py-2.5',
        sm: 'h-9 rounded-md px-3 text-xs uppercase tracking-wide font-semibold',
        lg: 'h-12 rounded-xl px-8 text-base shadow-md',
        xl: 'h-14 rounded-2xl px-10 text-lg shadow-lg',
        icon: 'h-10 w-10 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant,
    size,
    asChild = false,
    loading = false,
    leftIcon,
    rightIcon,
    children,
    disabled,
    ...props
  }, ref) => {
    const isDisabled = disabled || loading;

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {loading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!loading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!loading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
