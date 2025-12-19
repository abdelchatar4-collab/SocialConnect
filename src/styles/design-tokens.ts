/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

/**
 * Design Tokens - Système centralisé de design
 *
 * Ce fichier centralise tous les tokens de design pour éviter la duplication
 * et les incohérences dans les styles Tailwind.
 */

// ============================================================================
// COULEURS
// ============================================================================
export const colors = {
  // Couleurs principales
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6', // Couleur principale
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },

  // États
  success: {
    50: '#f0fdf4',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
  },

  warning: {
    50: '#fffbeb',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
  },

  error: {
    50: '#fef2f2',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
  },

  // Couleurs neutres
  gray: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  }
} as const;

// ============================================================================
// ESPACEMENTS
// ============================================================================
export const spacing = {
  xs: '0.5rem',    // 8px
  sm: '0.75rem',   // 12px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
} as const;

// ============================================================================
// TYPOGRAPHIE
// ============================================================================
export const typography = {
  fontSizes: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
  },

  fontWeights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  lineHeights: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  }
} as const;

// ============================================================================
// OMBRES
// ============================================================================
export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  default: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
} as const;

// ============================================================================
// BORDURES
// ============================================================================
export const borders = {
  radius: {
    sm: '0.25rem',   // 4px
    default: '0.5rem', // 8px
    md: '0.75rem',   // 12px
    lg: '1rem',      // 16px
    xl: '1.5rem',    // 24px
  },

  width: {
    thin: '1px',
    default: '2px',
    thick: '3px',
  }
} as const;

// ============================================================================
// CLASSES UTILITAIRES COMMUNES
// ============================================================================
export const commonClasses = {
  // Conteneurs
  container: 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8',
  section: 'py-8 lg:py-12',

  // Cartes
  card: 'bg-white rounded-lg shadow-md border border-gray-200',
  cardHeader: 'p-6 border-b border-gray-200',
  cardContent: 'p-6',
  cardFooter: 'p-6 border-t border-gray-200',

  // Formulaires
  input: 'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white',
  label: 'block text-sm font-medium text-gray-700 mb-1',
  errorText: 'text-sm text-error-600 mt-1',

  // Boutons (classes de base)
  buttonBase: 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',

  // Tables
  table: 'min-w-full divide-y divide-gray-200',
  tableHeader: 'bg-gray-50',
  tableCell: 'px-6 py-4 whitespace-nowrap text-sm text-gray-900',

  // États
  loading: 'animate-pulse',
  disabled: 'opacity-50 cursor-not-allowed',

  // Layout
  flexCenter: 'flex items-center justify-center',
  flexBetween: 'flex items-center justify-between',
  gridResponsive: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
} as const;

// ============================================================================
// UTILITAIRES POUR GÉNÉRER DES CLASSES TAILWIND
// ============================================================================

/**
 * Génère des classes de couleur Tailwind cohérentes
 */
export const generateColorClasses = (color: keyof typeof colors, variant: 'bg' | 'text' | 'border', shade: number = 500) => {
  return `${variant}-${color}-${shade}`;
};

/**
 * Génère des classes d'espacement cohérentes
 */
export const generateSpacingClasses = (type: 'p' | 'm' | 'px' | 'py' | 'mx' | 'my', size: keyof typeof spacing) => {
  return `${type}-${size}`;
};

/**
 * Classes prédéfinies pour les composants les plus courants
 */
export const componentClasses = {
  // Boutons
  button: {
    primary: `${commonClasses.buttonBase} bg-primary-600 text-white hover:bg-primary-700 shadow-sm hover:shadow-md focus:ring-primary-500`,
    secondary: `${commonClasses.buttonBase} bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-300 focus:ring-gray-500`,
    danger: `${commonClasses.buttonBase} bg-error-600 text-white hover:bg-error-700 shadow-sm hover:shadow-md focus:ring-error-500`,
    success: `${commonClasses.buttonBase} bg-success-600 text-white hover:bg-success-700 shadow-sm hover:shadow-md focus:ring-success-500`,
    ghost: `${commonClasses.buttonBase} text-gray-700 hover:bg-gray-100 focus:ring-gray-500`,
    outline: `${commonClasses.buttonBase} text-primary-600 border border-primary-600 hover:bg-primary-50 focus:ring-primary-500`,
  },

  // Badges
  badge: {
    primary: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800',
    secondary: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800',
    success: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800',
    warning: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-100 text-warning-800',
    error: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-error-100 text-error-800',
    gray: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800',
  },

  // Inputs
  input: {
    default: `${commonClasses.input}`,
    error: `${commonClasses.input} border-error-500 focus:border-error-500 focus:ring-error-500`,
    success: `${commonClasses.input} border-success-500 focus:border-success-500 focus:ring-success-500`,
  },

  // Checkboxes
  checkbox: {
    base: 'relative inline-flex items-center justify-center w-5 h-5 rounded border-2 transition-all duration-200 cursor-pointer',
    unchecked: 'bg-white border-gray-300 hover:border-primary-400',
    checked: 'bg-primary-600 border-primary-600 text-white',
  }
} as const;
