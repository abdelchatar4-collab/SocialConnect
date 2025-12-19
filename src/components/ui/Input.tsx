/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  helperText?: string;
  label?: string;
  required?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    type,
    error = false,
    leftIcon,
    rightIcon,
    helperText,
    label,
    required = false,
    disabled,
    ...props
  }, ref) => {
    const inputId = React.useId();

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {label}
            {required && <span className="text-error-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400 text-sm">{leftIcon}</span>
            </div>
          )}

          <input
            id={inputId}
            type={type}
            className={cn(
              'flex h-12 w-full rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 shadow-sm',
              leftIcon && 'pl-11',
              rightIcon && 'pr-11',
              error && 'border-error-500 focus:border-error-500 focus:ring-error-500/10 bg-error-50/30',
              disabled && 'bg-gray-100 border-gray-200 text-gray-500',
              className
            )}
            ref={ref}
            disabled={disabled}
            {...props}
          />

          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-400 text-sm">{rightIcon}</span>
            </div>
          )}
        </div>

        {helperText && (
          <p className={cn(
            'mt-2 text-xs',
            error ? 'text-error-600' : 'text-gray-600'
          )}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
