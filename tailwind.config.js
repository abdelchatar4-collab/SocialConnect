/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

const config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
    './src/hooks/**/*.{js,ts,jsx,tsx,mdx}',
    './src/styles/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  // Configuration pour éviter les problèmes de purge CSS
  safelist: [
    // Classes dynamiques couramment utilisées
    'bg-primary-50', 'bg-primary-100', 'bg-primary-500', 'bg-primary-600', 'bg-primary-700',
    'bg-success-50', 'bg-success-100', 'bg-success-500', 'bg-success-600', 'bg-success-700',
    'bg-warning-50', 'bg-warning-100', 'bg-warning-500', 'bg-warning-600', 'bg-warning-700',
    'bg-error-50', 'bg-error-100', 'bg-error-500', 'bg-error-600', 'bg-error-700',
    'text-primary-50', 'text-primary-100', 'text-primary-500', 'text-primary-600', 'text-primary-700',
    'text-success-50', 'text-success-100', 'text-success-500', 'text-success-600', 'text-success-700',
    'text-warning-50', 'text-warning-100', 'text-warning-500', 'text-warning-600', 'text-warning-700',
    'text-error-50', 'text-error-100', 'text-error-500', 'text-error-600', 'text-error-700',
    'border-primary-500', 'border-success-500', 'border-warning-500', 'border-error-500',
    'ring-primary-500', 'ring-success-500', 'ring-warning-500', 'ring-error-500',
    // Classes d'état pour les checkboxes
    'checked:bg-primary-600', 'checked:border-primary-600', 'checked:text-white',
    // Classes de taille pour les boutons
    'px-2', 'py-1', 'px-3', 'py-1.5', 'px-4', 'py-2', 'px-6', 'py-3', 'px-8', 'py-4',
    'text-xs', 'text-sm', 'text-base', 'text-lg',
  ],
  theme: {
    extend: {
      // Palette de couleurs moderne pour l'application
      // Palette de couleurs moderne pour l'application (Premium Overhaul)
      colors: {
        // Primary: Deep Indigo "Corporate Saas"
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5', // Brand Primary
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        // Secondary/Neutral: Cool Slate for backgrounds
        gray: {
          50: '#f8fafc',  // App Background
          100: '#f1f5f9', // Card Background (Secondary)
          200: '#e2e8f0', // Borders
          300: '#cbd5e1', // Borders (Active)
          400: '#94a3b8', // Icons
          500: '#64748b', // Secondary Text
          600: '#475569', // Primary Text
          700: '#334155', // Headers
          800: '#1e293b', // Dark Text
          900: '#0f172a', // Black Text
          950: '#020617',
        },
        // Semantic: Success (Emerald)
        success: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
        // Semantic: Warning (Amber)
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        // Semantic: Error (Rose)
        error: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
        },
        // Secondary: Teal for secondary actions
        secondary: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
        },
        // Accent: Violet for special highlights
        accent: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
        },
        // Custom semantic aliases
        background: '#f8fafc', // gray-50
        surface: '#ffffff',
        'surface-subtle': '#f1f5f9', // gray-100
        text_dark: '#334155', // gray-700
        text_darker: '#1e293b', // gray-800
      },
      // Typographie moderne
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      // Espacements personnalisés
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      // Ombres modernes et douces (Colored Shadows)
      boxShadow: {
        'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'DEFAULT': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        'card': '0 0 0 1px rgba(226, 232, 240, 0.6), 0 4px 6px -1px rgba(0, 0, 0, 0.05)', // Border-ring concept
        'card-hover': '0 0 0 1px rgba(99, 102, 241, 0.2), 0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04)',
        'float': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        'glow': '0 0 15px rgba(99, 102, 241, 0.5)',
      },
      // Bordures modernes
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      // Animations modernes
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 0.6s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-4px)' },
          '60%': { transform: 'translateY(-2px)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};
export default config;
