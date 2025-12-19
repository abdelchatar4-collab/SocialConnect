/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

/**
 * Hook personnalisé pour gérer les classes Tailwind de manière cohérente
 *
 * Ce hook centralise la logique de génération de classes Tailwind
 * et évite la duplication dans les composants.
 */

import { useMemo } from 'react';
import { componentClasses, commonClasses, generateColorClasses } from '@/styles/design-tokens';
import { cn } from '@/lib/utils';

export type ColorVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'gray';
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'ghost' | 'outline';

/**
 * Hook pour générer des classes de bouton cohérentes
 */
export const useButtonClasses = (
  variant: ButtonVariant = 'primary',
  size: Size = 'md',
  className?: string,
  disabled?: boolean,
  loading?: boolean
) => {
  return useMemo(() => {
    const baseClasses = componentClasses.button[variant] || componentClasses.button.primary;

    const sizeClasses = {
      xs: 'px-2 py-1 text-xs',
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
      xl: 'px-8 py-4 text-lg',
    };

    const stateClasses = cn(
      disabled && commonClasses.disabled,
      loading && 'opacity-75 cursor-wait'
    );

    return cn(baseClasses, sizeClasses[size], stateClasses, className);
  }, [variant, size, className, disabled, loading]);
};

/**
 * Hook pour générer des classes de badge cohérentes
 */
export const useBadgeClasses = (
  variant: ColorVariant = 'primary',
  size: Size = 'md',
  className?: string
) => {
  return useMemo(() => {
    const baseClasses = componentClasses.badge[variant] || componentClasses.badge.primary;

    const sizeClasses = {
      xs: 'px-1.5 py-0.5 text-xs',
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-0.5 text-xs',
      lg: 'px-3 py-1 text-sm',
      xl: 'px-4 py-1 text-sm',
    };

    return cn(baseClasses, sizeClasses[size], className);
  }, [variant, size, className]);
};

/**
 * Hook pour générer des classes d'input cohérentes
 */
export const useInputClasses = (
  state: 'default' | 'error' | 'success' = 'default',
  size: Size = 'md',
  className?: string,
  disabled?: boolean
) => {
  return useMemo(() => {
    const baseClasses = componentClasses.input[state] || componentClasses.input.default;

    const sizeClasses = {
      xs: 'px-2 py-1 text-xs',
      sm: 'px-2.5 py-1.5 text-sm',
      md: 'px-3 py-2 text-sm',
      lg: 'px-4 py-3 text-base',
      xl: 'px-5 py-4 text-lg',
    };

    const stateClasses = cn(
      disabled && commonClasses.disabled
    );

    return cn(baseClasses, sizeClasses[size], stateClasses, className);
  }, [state, size, className, disabled]);
};

/**
 * Hook pour générer des classes de card cohérentes
 */
export const useCardClasses = (
  variant: 'default' | 'elevated' | 'outlined' = 'default',
  className?: string
) => {
  return useMemo(() => {
    const variantClasses = {
      default: commonClasses.card,
      elevated: `${commonClasses.card} shadow-lg hover:shadow-xl transition-shadow`,
      outlined: 'bg-white rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors',
    };

    return cn(variantClasses[variant], className);
  }, [variant, className]);
};

/**
 * Hook pour générer des classes de checkbox cohérentes
 */
export const useCheckboxClasses = (
  checked: boolean,
  disabled?: boolean,
  className?: string
) => {
  return useMemo(() => {
    const baseClasses = componentClasses.checkbox.base;
    const stateClasses = checked
      ? componentClasses.checkbox.checked
      : componentClasses.checkbox.unchecked;

    const disabledClasses = disabled && commonClasses.disabled;

    return cn(baseClasses, stateClasses, disabledClasses, className);
  }, [checked, disabled, className]);
};

/**
 * Hook pour générer des classes de table cohérentes
 */
export const useTableClasses = () => {
  return useMemo(() => ({
    table: commonClasses.table,
    header: commonClasses.tableHeader,
    cell: commonClasses.tableCell,
    row: 'hover:bg-gray-50 transition-colors',
    headerCell: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
  }), []);
};

/**
 * Hook pour générer des classes de layout cohérentes
 */
export const useLayoutClasses = () => {
  return useMemo(() => ({
    container: commonClasses.container,
    section: commonClasses.section,
    flexCenter: commonClasses.flexCenter,
    flexBetween: commonClasses.flexBetween,
    gridResponsive: commonClasses.gridResponsive,
    pageHeader: 'mb-8 pb-4 border-b border-gray-200',
    pageTitle: 'text-2xl font-bold text-gray-900',
    pageSubtitle: 'text-sm text-gray-600 mt-1',
  }), []);
};

/**
 * Hook pour générer des classes d'état cohérentes
 */
export const useStateClasses = (
  state: 'loading' | 'error' | 'success' | 'warning' | 'info',
  className?: string
) => {
  return useMemo(() => {
    const stateClasses = {
      loading: 'animate-pulse opacity-75',
      error: 'text-error-600 bg-error-50 border-error-200',
      success: 'text-success-600 bg-success-50 border-success-200',
      warning: 'text-warning-600 bg-warning-50 border-warning-200',
      info: 'text-primary-600 bg-primary-50 border-primary-200',
    };

    return cn(stateClasses[state], className);
  }, [state, className]);
};

/**
 * Hook principal qui combine tous les hooks de classes
 */
export const useStyleClasses = () => {
  return {
    button: useButtonClasses,
    badge: useBadgeClasses,
    input: useInputClasses,
    card: useCardClasses,
    checkbox: useCheckboxClasses,
    table: useTableClasses(),
    layout: useLayoutClasses(),
    state: useStateClasses,
  };
};
