/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

/**
 * DashboardLayout - Main layout component for the modern dashboard
 * Orchestrates all widgets in a responsive grid
 */

"use client";

import React, { useState } from 'react';
import { User } from '@/types';

// Types
import { WidgetConfig, WidgetType } from '../types/modernDashboard';

// Context
import { DashboardProvider, useDashboard } from './DashboardProvider';

// Components
import { DashboardHeader } from './DashboardHeader';
import { SettingsPanel } from './SettingsPanel';
import { WidgetContainer } from './WidgetContainer';
import { WidgetBuilder } from './WidgetBuilder';
import { CustomWidget } from './CustomWidget';
import { PivotTableBuilder } from './PivotTableBuilder';
import { PivotTableWidget } from './PivotTableWidget';

// Widgets
import { KPICard, LineChartWidget, BarChartWidget, PieChartWidget } from '../widgets';

// Styles
import '../styles/dashboard-modern.css';

// Icons
import { Users, FolderOpen, Home, Activity, Plus, Grid3X3 } from 'lucide-react';

// Types
import { CustomWidgetConfig } from '../types/customWidget';
import { PivotTableConfig } from '../types/pivotTable';

interface DashboardLayoutProps {
    users: User[];
}

// Inner component that uses the context
const DashboardContent: React.FC = () => {
    const { state, stats, users, addCustomWidget, updateCustomWidget, removeCustomWidget, addPivotTable, updatePivotTable, removePivotTable } = useDashboard();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isWidgetBuilderOpen, setIsWidgetBuilderOpen] = useState(false);
    const [editingWidget, setEditingWidget] = useState<CustomWidgetConfig | undefined>(undefined);
    const [isPivotBuilderOpen, setIsPivotBuilderOpen] = useState(false);
    const [editingPivot, setEditingPivot] = useState<PivotTableConfig | undefined>(undefined);

    if (state.isLoading && !stats) {
        return <DashboardSkeleton />;
    }

    // Get widget config by id
    const getWidgetConfig = (id: string) =>
        state.widgets.find((w: WidgetConfig) => w.id === id) || { id, title: '', visible: false, size: 'medium' as const, type: id as WidgetType, order: 0 };

    return (
        <div className="dashboard-container">
            <DashboardHeader
                onOpenSettings={() => setIsSettingsOpen(true)}
                onCreateWidget={() => {
                    setEditingWidget(undefined);
                    setIsWidgetBuilderOpen(true);
                }}
                onCreatePivot={() => {
                    setEditingPivot(undefined);
                    setIsPivotBuilderOpen(true);
                }}
            />

            <div className="dashboard-grid stagger-children">
                {/* KPI Row */}
                {getWidgetConfig('kpi-total-users').visible && stats?.kpis.totalUsers && (
                    <div className={`widget-card widget-card--small animate-fadeIn`}>
                        <KPICard
                            data={stats.kpis.totalUsers}
                            icon={<Users className="w-6 h-6" />}
                        />
                    </div>
                )}

                {getWidgetConfig('kpi-active-cases').visible && stats?.kpis.activeCases && (
                    <div className={`widget-card widget-card--small animate-fadeIn`}>
                        <KPICard
                            data={stats.kpis.activeCases}
                            icon={<FolderOpen className="w-6 h-6" />}
                        />
                    </div>
                )}

                {getWidgetConfig('kpi-prev-exp').visible && stats?.kpis.prevExp && (
                    <div className={`widget-card widget-card--small animate-fadeIn`}>
                        <KPICard
                            data={stats.kpis.prevExp}
                            icon={<Home className="w-6 h-6" />}
                        />
                    </div>
                )}

                {getWidgetConfig('kpi-actions-month').visible && stats?.kpis.actionsThisMonth && (
                    <div className={`widget-card widget-card--small animate-fadeIn`}>
                        <KPICard
                            data={stats.kpis.actionsThisMonth}
                            icon={<Activity className="w-6 h-6" />}
                        />
                    </div>
                )}

                {/* Evolution Chart - Full Width */}
                {getWidgetConfig('chart-evolution').visible && stats?.actionTimelineData && (
                    <WidgetContainer config={getWidgetConfig('chart-evolution')}>
                        <LineChartWidget
                            data={stats.actionTimelineData}
                            color="#008C7A"
                            height={320}
                        />
                    </WidgetContainer>
                )}

                {/* Distribution Charts - 2 columns */}
                {getWidgetConfig('chart-antenne').visible && stats?.parAntenne && (
                    <WidgetContainer config={getWidgetConfig('chart-antenne')}>
                        <PieChartWidget
                            data={stats.parAntenne.slice(0, 6)}
                            height={280}
                        />
                    </WidgetContainer>
                )}

                {getWidgetConfig('chart-gestionnaire').visible && stats?.gestionnaireData && (
                    <WidgetContainer config={getWidgetConfig('chart-gestionnaire')}>
                        <BarChartWidget
                            data={stats.gestionnaireData.slice(0, 8)}
                            height={280}
                        />
                    </WidgetContainer>
                )}

                {getWidgetConfig('chart-age').visible && stats?.parAge && (
                    <WidgetContainer config={getWidgetConfig('chart-age')}>
                        <BarChartWidget
                            data={stats.parAge}
                            height={280}
                        />
                    </WidgetContainer>
                )}

                {getWidgetConfig('chart-genre').visible && stats?.parGenre && (
                    <WidgetContainer config={getWidgetConfig('chart-genre')}>
                        <PieChartWidget
                            data={stats.parGenre}
                            height={280}
                            innerRadius={30}
                        />
                    </WidgetContainer>
                )}

                {getWidgetConfig('chart-secteur').visible && stats?.parSecteur && (
                    <WidgetContainer config={getWidgetConfig('chart-secteur')}>
                        <BarChartWidget
                            data={stats.parSecteur.slice(0, 10)}
                            layout="vertical"
                            height={Math.max(280, stats.parSecteur.length * 35)}
                        />
                    </WidgetContainer>
                )}

                {getWidgetConfig('chart-problematique').visible && stats?.parProblematique && (
                    <WidgetContainer config={getWidgetConfig('chart-problematique')}>
                        <BarChartWidget
                            data={stats.parProblematique.slice(0, 10)}
                            height={320}
                        />
                    </WidgetContainer>
                )}
            </div>

            {/* Custom Widgets Section */}
            {(state.customWidgets.length > 0 || true) && (
                <div className="mt-8">
                    <div className="flex items-center justify-between mb-4 px-1">
                        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            📊 Widgets personnalisés
                            {state.customWidgets.length > 0 && (
                                <span className="text-sm font-normal text-gray-500">
                                    ({state.customWidgets.length})
                                </span>
                            )}
                        </h2>
                        <button
                            onClick={() => {
                                setEditingWidget(undefined);
                                setIsWidgetBuilderOpen(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
                        >
                            <Plus className="w-4 h-4" />
                            Nouveau widget
                        </button>
                    </div>

                    {state.customWidgets.length === 0 ? (
                        <div className="bg-gray-50 rounded-lg p-8 text-center">
                            <p className="text-gray-500 mb-4">
                                Créez des widgets personnalisés pour analyser vos données avec des filtres spécifiques.
                            </p>
                            <button
                                onClick={() => {
                                    setEditingWidget(undefined);
                                    setIsWidgetBuilderOpen(true);
                                }}
                                className="text-teal-600 hover:text-teal-700 font-medium"
                            >
                                + Créer mon premier widget
                            </button>
                        </div>
                    ) : (
                        <div className="dashboard-grid">
                            {state.customWidgets.map(widget => (
                                <CustomWidget
                                    key={widget.id}
                                    config={widget}
                                    users={users}
                                    onEdit={(w) => {
                                        setEditingWidget(w);
                                        setIsWidgetBuilderOpen(true);
                                    }}
                                    onDelete={removeCustomWidget}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Settings Panel */}
            <SettingsPanel
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
            />

            {/* Widget Builder Modal */}
            <WidgetBuilder
                isOpen={isWidgetBuilderOpen}
                onClose={() => {
                    setIsWidgetBuilderOpen(false);
                    setEditingWidget(undefined);
                }}
                onSave={(widget) => {
                    if (editingWidget) {
                        updateCustomWidget({ ...editingWidget, ...widget });
                    } else {
                        addCustomWidget(widget);
                    }
                }}
                users={users}
                editingWidget={editingWidget}
            />

            {/* Pivot Tables Section */}
            {(state.pivotTables.length > 0 || true) && (
                <div className="mt-8">
                    <div className="flex items-center justify-between mb-4 px-1">
                        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <Grid3X3 className="w-5 h-5 text-indigo-600" />
                            Tableaux croisés dynamiques
                            {state.pivotTables.length > 0 && (
                                <span className="text-sm font-normal text-gray-500">
                                    ({state.pivotTables.length})
                                </span>
                            )}
                        </h2>
                        <button
                            onClick={() => {
                                setEditingPivot(undefined);
                                setIsPivotBuilderOpen(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                        >
                            <Plus className="w-4 h-4" />
                            Nouveau tableau
                        </button>
                    </div>

                    {state.pivotTables.length === 0 ? (
                        <div className="bg-gray-50 rounded-lg p-8 text-center">
                            <p className="text-gray-500 mb-4">
                                Créez des tableaux croisés pour analyser vos données selon 2 dimensions (lignes × colonnes).
                            </p>
                            <button
                                onClick={() => {
                                    setEditingPivot(undefined);
                                    setIsPivotBuilderOpen(true);
                                }}
                                className="text-indigo-600 hover:text-indigo-700 font-medium"
                            >
                                + Créer mon premier tableau croisé
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {state.pivotTables.map(pivot => (
                                <PivotTableWidget
                                    key={pivot.id}
                                    config={pivot}
                                    users={users}
                                    onEdit={(p) => {
                                        setEditingPivot(p);
                                        setIsPivotBuilderOpen(true);
                                    }}
                                    onDelete={removePivotTable}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Pivot Table Builder Modal */}
            <PivotTableBuilder
                isOpen={isPivotBuilderOpen}
                onClose={() => {
                    setIsPivotBuilderOpen(false);
                    setEditingPivot(undefined);
                }}
                onSave={(config) => {
                    if (editingPivot) {
                        updatePivotTable({ ...editingPivot, ...config });
                    } else {
                        addPivotTable(config);
                    }
                }}
                users={users}
                editingPivot={editingPivot}
            />
        </div>
    );
};

// Skeleton loader
const DashboardSkeleton: React.FC = () => (
    <div className="dashboard-container">
        <div className="dashboard-header">
            <div className="skeleton skeleton--title" />
            <div className="flex gap-3">
                <div className="skeleton" style={{ width: 100, height: 36 }} />
                <div className="skeleton" style={{ width: 36, height: 36 }} />
            </div>
        </div>

        <div className="dashboard-grid">
            {/* KPI Skeletons */}
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="widget-card widget-card--small">
                    <div className="kpi-card">
                        <div className="skeleton skeleton--text" />
                        <div className="skeleton" style={{ height: 48, width: '60%', marginTop: 12 }} />
                        <div className="skeleton skeleton--text" style={{ width: '40%', marginTop: 12 }} />
                    </div>
                </div>
            ))}

            {/* Chart Skeletons */}
            <div className="widget-card widget-card--full">
                <div className="widget-header">
                    <div className="skeleton skeleton--text" />
                </div>
                <div className="widget-content">
                    <div className="skeleton skeleton--chart" />
                </div>
            </div>
        </div>
    </div>
);

// Main component with provider
export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ users }) => {
    return (
        <DashboardProvider users={users}>
            <DashboardContent />
        </DashboardProvider>
    );
};

export default DashboardLayout;
