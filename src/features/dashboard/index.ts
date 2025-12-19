/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

/**
 * Index principal pour la fonctionnalité Dashboard
 *
 * Ce fichier centralise tous les exports de la fonctionnalité tableau de bord.
 */

// Components - Legacy
export { default as Dashboard } from './components/Dashboard/Dashboard';
// export { default as ReportGenerator } from './components/ReportGenerator';

// Components - Modern Modular Dashboard
export { DashboardLayout } from './components/DashboardLayout';
export { DashboardProvider, useDashboard } from './components/DashboardProvider';
export { DashboardHeader } from './components/DashboardHeader';
export { WidgetContainer } from './components/WidgetContainer';
export { SettingsPanel } from './components/SettingsPanel';

// Widgets
export * from './widgets';

// Types (legacy dashboard types)
export * from './types/dashboard';

// Modern Dashboard Types (avoid duplicates by explicit exports)
export type {
    WidgetConfig,
    WidgetType,
    DashboardState,
    DashboardFilters,
    DashboardContextValue,
    WidgetProps,
    KPIData,
} from './types/modernDashboard';
export { DEFAULT_WIDGETS } from './types/modernDashboard';
