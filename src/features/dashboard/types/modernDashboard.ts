/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

/**
 * Dashboard Types - Modern Dashboard Architecture
 * Widget-based, extensible type system
 */

import { User } from '@/types';
import { CustomWidgetConfig } from './customWidget';
import { PivotTableConfig } from './pivotTable';

// Widget Configuration
export interface WidgetConfig {
    id: string;
    type: WidgetType;
    title: string;
    visible: boolean;
    size: 'small' | 'medium' | 'large' | 'full';
    order: number;
}

export type WidgetType =
    | 'kpi-total-users'
    | 'kpi-active-cases'
    | 'kpi-prev-exp'
    | 'kpi-actions-month'
    | 'chart-evolution'
    | 'chart-antenne'
    | 'chart-gestionnaire'
    | 'chart-age'
    | 'chart-genre'
    | 'chart-secteur'
    | 'chart-problematique'
    | 'table-urgent'
    | 'prev-exp-summary'
    | 'housing-summary';

// Dashboard State
export interface DashboardState {
    isLoading: boolean;
    lastUpdated: Date | null;
    autoRefreshEnabled: boolean;
    autoRefreshInterval: number; // in seconds
    widgets: WidgetConfig[];
    customWidgets: CustomWidgetConfig[]; // User-created widgets
    pivotTables: PivotTableConfig[]; // User-created pivot tables
    filters: DashboardFilters;
}

export interface DashboardFilters {
    dateRange: {
        start: Date | null;
        end: Date | null;
    };
    antenne: string | null;
    gestionnaire: string | null;
}

// KPI Data
export interface KPIData {
    value: number;
    label: string;
    trend?: {
        value: number;
        direction: 'up' | 'down' | 'stable';
        period: string;
    };
    icon?: string;
    color?: string;
}

// Chart Data Types
export interface ChartDataItem {
    name: string;
    value: number;
}

export interface TimelineDataItem {
    name: string;
    value: number;
    date?: string;
}

// Statistics Types (compatible with existing)
export interface DashboardStats {
    total: number;
    pourcentageActifs: number;
    totalProblematiques: number;
    parAntenne: ChartDataItem[];
    parProblematique: ChartDataItem[];
    parAge: ChartDataItem[];
    parGenre: ChartDataItem[];
    parSecteur: ChartDataItem[];
    gestionnaireData: ChartDataItem[];
    actionTimelineData: TimelineDataItem[];
    // Aggregated KPIs
    kpis: {
        totalUsers: KPIData;
        activeCases: KPIData;
        prevExp: KPIData;
        actionsThisMonth: KPIData;
    };
}

// Dashboard Context
export interface DashboardContextValue {
    state: DashboardState;
    stats: DashboardStats | null;
    users: User[];
    // Actions
    refreshData: () => Promise<void>;
    toggleAutoRefresh: () => void;
    setWidgetVisibility: (widgetId: string, visible: boolean) => void;
    resetWidgets: () => void;
    setFilter: <K extends keyof DashboardFilters>(
        key: K,
        value: DashboardFilters[K]
    ) => void;
    // Custom widgets
    addCustomWidget: (widget: Omit<CustomWidgetConfig, 'id' | 'createdAt' | 'order'>) => void;
    updateCustomWidget: (widget: CustomWidgetConfig) => void;
    removeCustomWidget: (widgetId: string) => void;
    // Pivot tables
    addPivotTable: (config: Omit<PivotTableConfig, 'id' | 'createdAt' | 'order'>) => void;
    updatePivotTable: (config: PivotTableConfig) => void;
    removePivotTable: (id: string) => void;
}

// Widget Component Props
export interface WidgetProps<T = unknown> {
    config: WidgetConfig;
    data?: T;
    isLoading?: boolean;
}

// Default Widget Configuration
export const DEFAULT_WIDGETS: WidgetConfig[] = [
    { id: 'kpi-total-users', type: 'kpi-total-users', title: 'Total Usagers', visible: true, size: 'small', order: 1 },
    { id: 'kpi-active-cases', type: 'kpi-active-cases', title: 'Dossiers Actifs', visible: true, size: 'small', order: 2 },
    { id: 'kpi-prev-exp', type: 'kpi-prev-exp', title: 'Prévention Expulsion', visible: true, size: 'small', order: 3 },
    { id: 'kpi-actions-month', type: 'kpi-actions-month', title: 'Actions ce mois', visible: true, size: 'small', order: 4 },
    { id: 'chart-evolution', type: 'chart-evolution', title: 'Évolution 2025', visible: true, size: 'full', order: 5 },
    { id: 'chart-antenne', type: 'chart-antenne', title: 'Par Antenne', visible: true, size: 'medium', order: 6 },
    { id: 'chart-gestionnaire', type: 'chart-gestionnaire', title: 'Par Gestionnaire', visible: true, size: 'medium', order: 7 },
    { id: 'chart-age', type: 'chart-age', title: 'Par Âge', visible: true, size: 'medium', order: 8 },
    { id: 'chart-genre', type: 'chart-genre', title: 'Par Genre', visible: true, size: 'medium', order: 9 },
    { id: 'chart-secteur', type: 'chart-secteur', title: 'Par Secteur', visible: true, size: 'medium', order: 10 },
    { id: 'chart-problematique', type: 'chart-problematique', title: 'Problématiques', visible: true, size: 'full', order: 11 },
    { id: 'table-urgent', type: 'table-urgent', title: 'Actions Urgentes', visible: true, size: 'full', order: 12 },
];
