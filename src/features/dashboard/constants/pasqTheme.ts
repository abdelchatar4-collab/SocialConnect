/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

// PASQ Design System - Extracted from Bilan Annuel 2025
// This file contains the exact color palette, gradients, and chart configurations
// used in the annual report to ensure visual consistency across the application

export const PASQ_COLORS = {
    // Charte couleurs PASQ - Official Brand Colors
    clair: '#66D1C9',      // Light turquoise
    interClair: '#33C7B6', // Medium-light turquoise
    normal: '#00B4A7',     // Standard turquoise
    interFonce: '#009F8D', // Medium-dark turquoise
    fonce: '#008C7A',      // Dark turquoise

    // Extended colors
    textPrimary: '#1a2332',
    textSecondary: '#4a5568',
    bgBody: '#f8fafb',
    bgSlide: '#ffffff',
    gris: '#e0e0e0',

    // Accent colors for specific use cases
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#3B82F6',
} as const;

export const PASQ_GRADIENTS = {
    primary: 'linear-gradient(135deg, #008C7A 0%, #00B4A7 50%, #33C7B6 100%)',
    soft: 'linear-gradient(135deg, rgba(102, 209, 201, 0.1) 0%, rgba(0, 180, 167, 0.05) 100%)',
    overlay: 'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.02) 100%)',
} as const;

export const PASQ_SHADOWS = {
    sm: '0 2px 8px rgba(0, 140, 122, 0.08)',
    md: '0 8px 24px rgba(0, 140, 122, 0.12)',
    lg: '0 16px 48px rgba(0, 140, 122, 0.16)',
    xl: '0 24px 64px rgba(0, 140, 122, 0.2)',
} as const;

// Chart.js color palette for consistent data visualization
export const CHART_COLORS = [
    PASQ_COLORS.fonce,      // #008C7A
    PASQ_COLORS.normal,     // #00B4A7
    PASQ_COLORS.interClair, // #33C7B6
    PASQ_COLORS.clair,      // #66D1C9
    PASQ_COLORS.interFonce, // #009F8D
    PASQ_COLORS.info,       // #3B82F6
    PASQ_COLORS.success,    // #10B981
    PASQ_COLORS.warning,    // #F59E0B
    PASQ_COLORS.danger,     // #EF4444
    PASQ_COLORS.gris,       // #e0e0e0
] as const;

// Recharts-specific color palette (same as Chart.js for consistency)
export const RECHARTS_COLORS = CHART_COLORS;

// Chart configuration defaults matching the annual report style
export const CHART_CONFIG = {
    borderRadius: 6,
    borderWidth: 0,
    gridColor: 'rgba(0,0,0,0.05)',
    fontFamily: "'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontSize: 13,
    textColor: PASQ_COLORS.textSecondary,

    // Line chart specific
    lineTension: 0.4,
    lineWidth: 3,
    pointRadius: 4,

    // Bar chart specific
    barBorderRadius: 6,

    // Pie/Doughnut specific
    pieInnerRadius: 60,
    pieOuterRadius: 100,
} as const;

// Card/Box styles matching the annual report
export const CARD_STYLES = {
    background: PASQ_GRADIENTS.soft,
    borderRadius: '12px',
    padding: '25px',
    boxShadow: PASQ_SHADOWS.sm,
    border: '1px solid rgba(102, 209, 201, 0.15)',

    hover: {
        transform: 'translateY(-4px)',
        boxShadow: PASQ_SHADOWS.md,
    },
} as const;

// Stat card styles (KPI cards)
export const STAT_CARD_STYLES = {
    background: PASQ_GRADIENTS.soft,
    borderRadius: '12px',
    padding: '25px',
    boxShadow: PASQ_SHADOWS.sm,
    border: '1px solid rgba(102, 209, 201, 0.15)',

    numberGradient: PASQ_GRADIENTS.primary,
    numberSize: '3em',
    numberWeight: 800,

    labelSize: '0.95em',
    labelColor: PASQ_COLORS.textSecondary,
    labelWeight: 500,
    labelTransform: 'uppercase',
    labelSpacing: '0.05em',
} as const;
