/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

/**
 * DashboardProvider - Context provider for modern dashboard
 * Manages state, data fetching, auto-refresh, and widget configuration
 */

"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { User } from '@/types';
import {
    DashboardContextValue,
    DashboardState,
    DashboardStats,
    DashboardFilters,
    WidgetConfig,
    DEFAULT_WIDGETS,
    KPIData,
} from '../types/modernDashboard';
import { CustomWidgetConfig } from '../types/customWidget';
import { PivotTableConfig } from '../types/pivotTable';

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

// Provider props
interface DashboardProviderProps {
    children: React.ReactNode;
    users: User[];
}

export const DashboardProvider: React.FC<DashboardProviderProps> = ({ children, users }) => {
    const [state, setState] = useState<DashboardState>(() => {
        // Try to load saved widget config from localStorage
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
                if (savedCustom) {
                    customWidgets = JSON.parse(savedCustom) || [];
                }
                if (savedPivot) {
                    pivotTables = JSON.parse(savedPivot) || [];
                }
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

    // Calculate statistics from users
    const calculateStats = useCallback((userList: User[]): DashboardStats => {
        const total = userList.length;
        const actifs = userList.filter(u => u.etat === 'Actif' || u.etat === 'En cours').length;
        const pourcentageActifs = total > 0 ? (actifs / total) * 100 : 0;

        // Count problematiques
        const totalProblematiques = userList.reduce((acc, u) =>
            acc + (u.problematiques?.length || 0), 0);

        // Count by antenne
        const antenneCount: Record<string, number> = {};
        userList.forEach(u => {
            const antenne = u.antenne || 'Non spécifié';
            antenneCount[antenne] = (antenneCount[antenne] || 0) + 1;
        });
        const parAntenne = Object.entries(antenneCount)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);

        // Count by gestionnaire
        const gestionnaireCount: Record<string, number> = {};
        userList.forEach(u => {
            let gName = 'Non assigné';
            if (u.gestionnaire) {
                if (typeof u.gestionnaire === 'object') {
                    gName = `${u.gestionnaire.prenom || ''} ${u.gestionnaire.nom || ''}`.trim() || 'Non assigné';
                }
            }
            gestionnaireCount[gName] = (gestionnaireCount[gName] || 0) + 1;
        });
        const gestionnaireData = Object.entries(gestionnaireCount)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);

        // Count by age
        const parAge = calculateAgeDistribution(userList);

        // Count by genre (avec normalisation pour éviter les doublons)
        const genreCount: Record<string, number> = {};
        userList.forEach(u => {
            const genre = u.genre || 'Non spécifié';
            // Normaliser les genres pour éviter les doublons de casse
            const normalizedGenre =
                genre.toLowerCase() === 'homme' ? 'Homme' :
                    genre.toLowerCase() === 'femme' ? 'Femme' :
                        genre.toLowerCase() === 'autre' ? 'Autre' :
                            genre;
            genreCount[normalizedGenre] = (genreCount[normalizedGenre] || 0) + 1;
        });
        const parGenre = Object.entries(genreCount)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);

        // Count by secteur
        const secteurCount: Record<string, number> = {};
        userList.forEach(u => {
            const secteur = u.secteur || 'Non spécifié';
            secteurCount[secteur] = (secteurCount[secteur] || 0) + 1;
        });
        const parSecteur = Object.entries(secteurCount)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);

        // Count by problematique
        const probCount: Record<string, number> = {};
        userList.forEach(u => {
            u.problematiques?.forEach(p => {
                const type = (typeof p === 'string' ? p : p.type) || 'Non spécifié';
                probCount[type] = (probCount[type] || 0) + 1;
            });
        });
        const parProblematique = Object.entries(probCount)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);

        // Timeline data (ouvertures par mois)
        const actionTimelineData = calculateTimelineData(userList);

        // Count PrevExp
        const prevExpCount = userList.filter(u => u.hasPrevExp).length;

        // Count actions this month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const actionsThisMonth = userList.reduce((acc, u) => {
            const actions = u.actions?.filter(a => {
                if (!a.date) return false;
                const actionDate = new Date(a.date);
                return actionDate >= startOfMonth;
            });
            return acc + (actions?.length || 0);
        }, 0);

        // Build KPIs
        const kpis = {
            totalUsers: {
                value: total,
                label: 'Total Usagers',
                trend: { value: 12, direction: 'up' as const, period: 'ce mois' },
                color: '#008C7A',
            },
            activeCases: {
                value: actifs,
                label: 'Dossiers Actifs',
                trend: { value: pourcentageActifs, direction: 'stable' as const, period: 'du total' },
                color: '#00B4A7',
            },
            prevExp: {
                value: prevExpCount,
                label: 'Prévention Expulsion',
                color: '#EF4444',
            },
            actionsThisMonth: {
                value: actionsThisMonth,
                label: 'Actions ce mois',
                color: '#3B82F6',
            },
        };

        return {
            total,
            pourcentageActifs,
            totalProblematiques,
            parAntenne,
            parProblematique,
            parAge,
            parGenre,
            parSecteur,
            gestionnaireData,
            actionTimelineData,
            kpis,
        };
    }, []);

    // Helper: Calculate age distribution
    const calculateAgeDistribution = (userList: User[]) => {
        const ageGroups: Record<string, number> = {
            '0-18 ans': 0,
            '19-30 ans': 0,
            '31-45 ans': 0,
            '46-60 ans': 0,
            '61+ ans': 0,
            'Non spécifié': 0,
        };

        const now = new Date();
        userList.forEach(u => {
            if (!u.dateNaissance) {
                ageGroups['Non spécifié']++;
                return;
            }
            const birthDate = new Date(u.dateNaissance);
            const age = now.getFullYear() - birthDate.getFullYear();

            if (age <= 18) ageGroups['0-18 ans']++;
            else if (age <= 30) ageGroups['19-30 ans']++;
            else if (age <= 45) ageGroups['31-45 ans']++;
            else if (age <= 60) ageGroups['46-60 ans']++;
            else ageGroups['61+ ans']++;
        });

        return Object.entries(ageGroups)
            .map(([name, value]) => ({ name, value }))
            .filter(item => item.value > 0);
    };

    // Helper: Calculate timeline data
    const calculateTimelineData = (userList: User[]) => {
        const months: Record<string, number> = {};
        const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

        userList.forEach(u => {
            if (u.dateOuverture) {
                const date = new Date(u.dateOuverture);
                const year = date.getFullYear();
                if (year === 2025) {
                    const monthKey = monthNames[date.getMonth()];
                    months[monthKey] = (months[monthKey] || 0) + 1;
                }
            }
        });

        return monthNames.map(name => ({
            name,
            value: months[name] || 0,
        }));
    };

    // Refresh data
    const refreshData = useCallback(async () => {
        setState(prev => ({ ...prev, isLoading: true }));

        // Recalculate stats
        const newStats = calculateStats(users);
        setStats(newStats);

        setState(prev => ({
            ...prev,
            isLoading: false,
            lastUpdated: new Date(),
        }));

        setCountdown(state.autoRefreshInterval);
    }, [users, calculateStats, state.autoRefreshInterval]);

    // Toggle auto-refresh
    const toggleAutoRefresh = useCallback(() => {
        setState(prev => ({ ...prev, autoRefreshEnabled: !prev.autoRefreshEnabled }));
    }, []);

    // Set widget visibility
    const setWidgetVisibility = useCallback((widgetId: string, visible: boolean) => {
        setState(prev => {
            const newWidgets = prev.widgets.map(w =>
                w.id === widgetId ? { ...w, visible } : w
            );
            // Save to localStorage
            if (typeof window !== 'undefined') {
                localStorage.setItem(STORAGE_KEY, JSON.stringify({ widgets: newWidgets }));
            }
            return { ...prev, widgets: newWidgets };
        });
    }, []);

    // Reset widgets to default
    const resetWidgets = useCallback(() => {
        setState(prev => ({ ...prev, widgets: DEFAULT_WIDGETS }));
        if (typeof window !== 'undefined') {
            localStorage.removeItem(STORAGE_KEY);
        }
    }, []);

    // Set filter
    const setFilter = useCallback(<K extends keyof DashboardFilters>(
        key: K,
        value: DashboardFilters[K]
    ) => {
        setState(prev => ({
            ...prev,
            filters: { ...prev.filters, [key]: value },
        }));
    }, []);

    // ============ Custom Widgets CRUD ============

    // Add custom widget
    const addCustomWidget = useCallback((widget: Omit<CustomWidgetConfig, 'id' | 'createdAt' | 'order'>) => {
        setState(prev => {
            const newWidget: CustomWidgetConfig = {
                ...widget,
                id: `custom-${Date.now()}`,
                createdAt: new Date().toISOString(),
                order: prev.customWidgets.length + 1,
            };
            const newCustomWidgets = [...prev.customWidgets, newWidget];
            // Save to localStorage
            if (typeof window !== 'undefined') {
                localStorage.setItem(CUSTOM_WIDGETS_KEY, JSON.stringify(newCustomWidgets));
            }
            return { ...prev, customWidgets: newCustomWidgets };
        });
    }, []);

    // Update custom widget
    const updateCustomWidget = useCallback((widget: CustomWidgetConfig) => {
        setState(prev => {
            const newCustomWidgets = prev.customWidgets.map(w =>
                w.id === widget.id ? widget : w
            );
            if (typeof window !== 'undefined') {
                localStorage.setItem(CUSTOM_WIDGETS_KEY, JSON.stringify(newCustomWidgets));
            }
            return { ...prev, customWidgets: newCustomWidgets };
        });
    }, []);

    // Remove custom widget
    const removeCustomWidget = useCallback((widgetId: string) => {
        setState(prev => {
            const newCustomWidgets = prev.customWidgets.filter(w => w.id !== widgetId);
            if (typeof window !== 'undefined') {
                localStorage.setItem(CUSTOM_WIDGETS_KEY, JSON.stringify(newCustomWidgets));
            }
            return { ...prev, customWidgets: newCustomWidgets };
        });
    }, []);

    // ============ Pivot Tables CRUD ============

    // Add pivot table
    const addPivotTable = useCallback((config: Omit<PivotTableConfig, 'id' | 'createdAt' | 'order'>) => {
        setState(prev => {
            const newPivot: PivotTableConfig = {
                ...config,
                id: `pivot-${Date.now()}`,
                createdAt: new Date().toISOString(),
                order: prev.pivotTables.length + 1,
            };
            const newPivotTables = [...prev.pivotTables, newPivot];
            if (typeof window !== 'undefined') {
                localStorage.setItem(PIVOT_TABLES_KEY, JSON.stringify(newPivotTables));
            }
            return { ...prev, pivotTables: newPivotTables };
        });
    }, []);

    // Update pivot table
    const updatePivotTable = useCallback((config: PivotTableConfig) => {
        setState(prev => {
            const newPivotTables = prev.pivotTables.map(p =>
                p.id === config.id ? config : p
            );
            if (typeof window !== 'undefined') {
                localStorage.setItem(PIVOT_TABLES_KEY, JSON.stringify(newPivotTables));
            }
            return { ...prev, pivotTables: newPivotTables };
        });
    }, []);

    // Remove pivot table
    const removePivotTable = useCallback((id: string) => {
        setState(prev => {
            const newPivotTables = prev.pivotTables.filter(p => p.id !== id);
            if (typeof window !== 'undefined') {
                localStorage.setItem(PIVOT_TABLES_KEY, JSON.stringify(newPivotTables));
            }
            return { ...prev, pivotTables: newPivotTables };
        });
    }, []);

    // Initial data load
    useEffect(() => {
        refreshData();
    }, [refreshData]);

    // Auto-refresh timer
    useEffect(() => {
        if (!state.autoRefreshEnabled) {
            if (refreshTimerRef.current) {
                clearInterval(refreshTimerRef.current);
            }
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

        return () => {
            if (refreshTimerRef.current) {
                clearInterval(refreshTimerRef.current);
            }
        };
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
    if (!context) {
        throw new Error('useDashboard must be used within a DashboardProvider');
    }
    return context;
};

export default DashboardProvider;
