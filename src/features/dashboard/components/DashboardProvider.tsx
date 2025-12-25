/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Dashboard Provider
Refactored to use extracted calculation utilities
*/

"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { User } from '@/types';
import {
    DashboardContextValue,
    DashboardState,
    DashboardStats,
    DashboardFilters,
    DEFAULT_WIDGETS,
} from '../types/modernDashboard';
import { CustomWidgetConfig } from '../types/customWidget';
import { PivotTableConfig } from '../types/pivotTable';
import { calculateDashboardStats } from '../utils/providerStatsCalculations';

// Storage keys
const STORAGE_KEY = 'dashboard-widget-config';
const CUSTOM_WIDGETS_KEY = 'dashboard-custom-widgets';
const PIVOT_TABLES_KEY = 'dashboard-pivot-tables';

// Default state
const DEFAULT_STATE: DashboardState = {
    isLoading: true,
    lastUpdated: null,
    autoRefreshEnabled: true,
    autoRefreshInterval: 30,
    widgets: DEFAULT_WIDGETS,
    customWidgets: [],
    pivotTables: [],
    filters: {
        dateRange: { start: null, end: null },
        antenne: null,
        gestionnaire: null,
    },
};

// Create context
const DashboardContext = createContext<DashboardContextValue | null>(null);

interface DashboardProviderProps {
    children: React.ReactNode;
    users: User[];
}

export const DashboardProvider: React.FC<DashboardProviderProps> = ({ children, users = [] }) => {
    const [state, setState] = useState<DashboardState>(() => {
        if (typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem(STORAGE_KEY);
                const savedCustom = localStorage.getItem(CUSTOM_WIDGETS_KEY);
                const savedPivot = localStorage.getItem(PIVOT_TABLES_KEY);
                let widgets = DEFAULT_WIDGETS;
                let customWidgets: CustomWidgetConfig[] = [];
                let pivotTables: PivotTableConfig[] = [];

                if (saved) {
                    const parsed = JSON.parse(saved);
                    widgets = parsed.widgets || DEFAULT_WIDGETS;
                }
                if (savedCustom) customWidgets = JSON.parse(savedCustom) || [];
                if (savedPivot) pivotTables = JSON.parse(savedPivot) || [];
                return { ...DEFAULT_STATE, widgets, customWidgets, pivotTables };
            } catch (e) {
                console.warn('Failed to load dashboard config:', e);
            }
        }
        return DEFAULT_STATE;
    });

    const [stats, setStats] = useState<DashboardStats | null>(null);
    const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
    const [countdown, setCountdown] = useState(state.autoRefreshInterval);
    const { selectedYear } = useAdmin();

    // Refresh data
    const refreshData = useCallback(async () => {
        setState(prev => ({ ...prev, isLoading: true }));
        const newStats = calculateDashboardStats(users, selectedYear);
        setStats(newStats);
        setState(prev => ({ ...prev, isLoading: false, lastUpdated: new Date() }));
        setCountdown(state.autoRefreshInterval);
    }, [users, selectedYear, state.autoRefreshInterval]);

    // Toggle auto-refresh
    const toggleAutoRefresh = useCallback(() => {
        setState(prev => ({ ...prev, autoRefreshEnabled: !prev.autoRefreshEnabled }));
    }, []);

    // Set widget visibility
    const setWidgetVisibility = useCallback((widgetId: string, visible: boolean) => {
        setState(prev => {
            const newWidgets = prev.widgets.map(w => w.id === widgetId ? { ...w, visible } : w);
            if (typeof window !== 'undefined') {
                localStorage.setItem(STORAGE_KEY, JSON.stringify({ widgets: newWidgets }));
            }
            return { ...prev, widgets: newWidgets };
        });
    }, []);

    // Reset widgets to default
    const resetWidgets = useCallback(() => {
        setState(prev => ({ ...prev, widgets: DEFAULT_WIDGETS }));
        if (typeof window !== 'undefined') localStorage.removeItem(STORAGE_KEY);
    }, []);

    // Set filter
    const setFilter = useCallback(<K extends keyof DashboardFilters>(key: K, value: DashboardFilters[K]) => {
        setState(prev => ({ ...prev, filters: { ...prev.filters, [key]: value } }));
    }, []);

    // ============ Custom Widgets CRUD ============
    const addCustomWidget = useCallback((widget: Omit<CustomWidgetConfig, 'id' | 'createdAt' | 'order'>) => {
        setState(prev => {
            const newWidget: CustomWidgetConfig = {
                ...widget,
                id: `custom-${Date.now()}`,
                createdAt: new Date().toISOString(),
                order: prev.customWidgets.length + 1,
            };
            const newCustomWidgets = [...prev.customWidgets, newWidget];
            if (typeof window !== 'undefined') localStorage.setItem(CUSTOM_WIDGETS_KEY, JSON.stringify(newCustomWidgets));
            return { ...prev, customWidgets: newCustomWidgets };
        });
    }, []);

    const updateCustomWidget = useCallback((widget: CustomWidgetConfig) => {
        setState(prev => {
            const newCustomWidgets = prev.customWidgets.map(w => w.id === widget.id ? widget : w);
            if (typeof window !== 'undefined') localStorage.setItem(CUSTOM_WIDGETS_KEY, JSON.stringify(newCustomWidgets));
            return { ...prev, customWidgets: newCustomWidgets };
        });
    }, []);

    const removeCustomWidget = useCallback((widgetId: string) => {
        setState(prev => {
            const newCustomWidgets = prev.customWidgets.filter(w => w.id !== widgetId);
            if (typeof window !== 'undefined') localStorage.setItem(CUSTOM_WIDGETS_KEY, JSON.stringify(newCustomWidgets));
            return { ...prev, customWidgets: newCustomWidgets };
        });
    }, []);

    // ============ Pivot Tables CRUD ============
    const addPivotTable = useCallback((config: Omit<PivotTableConfig, 'id' | 'createdAt' | 'order'>) => {
        setState(prev => {
            const newPivot: PivotTableConfig = {
                ...config,
                id: `pivot-${Date.now()}`,
                createdAt: new Date().toISOString(),
                order: prev.pivotTables.length + 1,
            };
            const newPivotTables = [...prev.pivotTables, newPivot];
            if (typeof window !== 'undefined') localStorage.setItem(PIVOT_TABLES_KEY, JSON.stringify(newPivotTables));
            return { ...prev, pivotTables: newPivotTables };
        });
    }, []);

    const updatePivotTable = useCallback((config: PivotTableConfig) => {
        setState(prev => {
            const newPivotTables = prev.pivotTables.map(p => p.id === config.id ? config : p);
            if (typeof window !== 'undefined') localStorage.setItem(PIVOT_TABLES_KEY, JSON.stringify(newPivotTables));
            return { ...prev, pivotTables: newPivotTables };
        });
    }, []);

    const removePivotTable = useCallback((id: string) => {
        setState(prev => {
            const newPivotTables = prev.pivotTables.filter(p => p.id !== id);
            if (typeof window !== 'undefined') localStorage.setItem(PIVOT_TABLES_KEY, JSON.stringify(newPivotTables));
            return { ...prev, pivotTables: newPivotTables };
        });
    }, []);

    // Initial data load
    useEffect(() => { refreshData(); }, [refreshData]);

    // Auto-refresh timer
    useEffect(() => {
        if (!state.autoRefreshEnabled) {
            if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
            return;
        }

        const intervalId = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    refreshData();
                    return state.autoRefreshInterval;
                }
                return prev - 1;
            });
        }, 1000);

        refreshTimerRef.current = intervalId;
        return () => { if (refreshTimerRef.current) clearInterval(refreshTimerRef.current); };
    }, [state.autoRefreshEnabled, state.autoRefreshInterval, refreshData]);

    // Context value
    const contextValue: DashboardContextValue = useMemo(() => ({
        state: { ...state, autoRefreshInterval: countdown },
        stats,
        users,
        refreshData,
        toggleAutoRefresh,
        setWidgetVisibility,
        resetWidgets,
        setFilter,
        addCustomWidget,
        updateCustomWidget,
        removeCustomWidget,
        addPivotTable,
        updatePivotTable,
        removePivotTable,
    }), [state, countdown, stats, users, refreshData, toggleAutoRefresh, setWidgetVisibility, resetWidgets, setFilter, addCustomWidget, updateCustomWidget, removeCustomWidget, addPivotTable, updatePivotTable, removePivotTable]);

    return (
        <DashboardContext.Provider value={contextValue}>
            {children}
        </DashboardContext.Provider>
    );
};

// Hook to use dashboard context
export const useDashboard = (): DashboardContextValue => {
    const context = useContext(DashboardContext);
    if (!context) throw new Error('useDashboard must be used within a DashboardProvider');
    return context;
};

export default DashboardProvider;
