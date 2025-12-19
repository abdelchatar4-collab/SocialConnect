/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-primary-50 text-primary-700 border border-primary-100 hover:bg-primary-100',
        secondary: 'bg-gray-50 text-gray-700 border border-gray-100 hover:bg-gray-100',
        success: 'bg-success-50 text-success-700 border border-success-100 hover:bg-success-100',
        destructive: 'bg-error-50 text-error-700 border border-error-100 hover:bg-error-100',
        warning: 'bg-warning-50 text-warning-700 border border-warning-100 hover:bg-warning-100',
        info: 'bg-primary-50 text-primary-700 border border-primary-100 hover:bg-primary-100', // Mapping info to primary for consistency
        outline: 'border border-gray-200 text-gray-600 bg-white hover:bg-gray-50',
        // Statuts spécifiques pour l'application
        ouvert: 'bg-success-50 text-success-700 border border-success-100',
        'en-cours': 'bg-primary-50 text-primary-700 border border-primary-100',
        cloture: 'bg-gray-100 text-gray-600 border border-gray-200',
        suspendu: 'bg-warning-50 text-warning-700 border border-warning-100',
      },
      size: {
        default: 'px-2.5 py-0.5 text-xs',
        sm: 'px-2 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

function Badge({ className, variant, size, dot, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot && (
        <span className={cn(
          'mr-1.5 h-1.5 w-1.5 rounded-full',
          variant === 'ouvert' && 'bg-success-500',
          variant === 'en-cours' && 'bg-info-500',
          variant === 'cloture' && 'bg-gray-500',
          variant === 'suspendu' && 'bg-warning-500',
          variant === 'success' && 'bg-success-500',
          variant === 'destructive' && 'bg-error-500',
          variant === 'warning' && 'bg-warning-500',
          variant === 'info' && 'bg-info-500',
          (variant === 'default' || !variant) && 'bg-primary-500'
        )} />
      )}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
