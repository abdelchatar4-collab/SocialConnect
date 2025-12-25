/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Standard Dashboard Widgets Grid
Extracted from DashboardLayout.tsx
*/

import React from 'react';
import { Users, FolderOpen, Home, Activity } from 'lucide-react';
import { WidgetConfig, WidgetType } from '../../types/modernDashboard';
import { WidgetContainer } from '../WidgetContainer';
import { KPICard, LineChartWidget, BarChartWidget, PieChartWidget } from '../../widgets';

interface StandardWidgetsGridProps {
    widgets: WidgetConfig[];
    stats: any;
}

export const StandardWidgetsGrid: React.FC<StandardWidgetsGridProps> = ({ widgets, stats }) => {
    const getWidgetConfig = (id: string) =>
        widgets.find((w: WidgetConfig) => w.id === id) || {
            id, title: '', visible: false, size: 'medium' as const, type: id as WidgetType, order: 0
        };

    if (!stats) return null;

    return (
        <div className="dashboard-grid stagger-children">
            {/* KPI Row */}
            {getWidgetConfig('kpi-total-users').visible && stats.kpis.totalUsers && (
                <div className={`widget-card widget-card--small animate-fadeIn`}>
                    <KPICard data={stats.kpis.totalUsers} icon={<Users className="w-6 h-6" />} />
                </div>
            )}

            {getWidgetConfig('kpi-active-cases').visible && stats.kpis.activeCases && (
                <div className={`widget-card widget-card--small animate-fadeIn`}>
                    <KPICard data={stats.kpis.activeCases} icon={<FolderOpen className="w-6 h-6" />} />
                </div>
            )}

            {getWidgetConfig('kpi-prev-exp').visible && stats.kpis.prevExp && (
                <div className={`widget-card widget-card--small animate-fadeIn`}>
                    <KPICard data={stats.kpis.prevExp} icon={<Home className="w-6 h-6" />} />
                </div>
            )}

            {getWidgetConfig('kpi-actions-month').visible && stats.kpis.actionsThisMonth && (
                <div className={`widget-card widget-card--small animate-fadeIn`}>
                    <KPICard data={stats.kpis.actionsThisMonth} icon={<Activity className="w-6 h-6" />} />
                </div>
            )}

            {/* Evolution Chart - Full Width */}
            {getWidgetConfig('chart-evolution').visible && stats.actionTimelineData && (
                <WidgetContainer config={getWidgetConfig('chart-evolution')}>
                    <LineChartWidget data={stats.actionTimelineData} color="#008C7A" height={320} />
                </WidgetContainer>
            )}

            {/* Distribution Charts */}
            {getWidgetConfig('chart-antenne').visible && stats.parAntenne && (
                <WidgetContainer config={getWidgetConfig('chart-antenne')}>
                    <PieChartWidget data={stats.parAntenne.slice(0, 6)} height={280} />
                </WidgetContainer>
            )}

            {getWidgetConfig('chart-gestionnaire').visible && stats.gestionnaireData && (
                <WidgetContainer config={getWidgetConfig('chart-gestionnaire')}>
                    <BarChartWidget data={stats.gestionnaireData.slice(0, 8)} height={280} />
                </WidgetContainer>
            )}

            {getWidgetConfig('chart-age').visible && stats.parAge && (
                <WidgetContainer config={getWidgetConfig('chart-age')}>
                    <BarChartWidget data={stats.parAge} height={280} />
                </WidgetContainer>
            )}

            {getWidgetConfig('chart-genre').visible && stats.parGenre && (
                <WidgetContainer config={getWidgetConfig('chart-genre')}>
                    <PieChartWidget data={stats.parGenre} height={280} innerRadius={30} />
                </WidgetContainer>
            )}

            {getWidgetConfig('chart-secteur').visible && stats.parSecteur && (
                <WidgetContainer config={getWidgetConfig('chart-secteur')}>
                    <BarChartWidget
                        data={stats.parSecteur.slice(0, 10)}
                        layout="vertical"
                        height={Math.max(280, stats.parSecteur.length * 35)}
                    />
                </WidgetContainer>
            )}

            {getWidgetConfig('chart-problematique').visible && stats.parProblematique && (
                <WidgetContainer config={getWidgetConfig('chart-problematique')}>
                    <BarChartWidget data={stats.parProblematique.slice(0, 10)} height={320} />
                </WidgetContainer>
            )}
        </div>
    );
};
