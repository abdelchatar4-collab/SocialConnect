/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

/**
 * DashboardHeader - Modern dashboard header with title, refresh controls, and settings
 */

"use client";

import React, { useState } from 'react';
import { useDashboard } from './DashboardProvider';
import { RefreshCw, Settings, Clock, CheckCircle, Plus, BarChart3, Grid3X3 } from 'lucide-react';

interface DashboardHeaderProps {
    onOpenSettings: () => void;
    onCreateWidget?: () => void;
    onCreatePivot?: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
    onOpenSettings,
    onCreateWidget,
    onCreatePivot,
}) => {
    const { state, refreshData, toggleAutoRefresh } = useDashboard();
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleManualRefresh = async () => {
        setIsRefreshing(true);
        await refreshData();
        setTimeout(() => setIsRefreshing(false), 500);
    };

    const formatLastUpdated = (date: Date | null) => {
        if (!date) return 'Jamais';
        return date.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    return (
        <header className="dashboard-header">
            <div className="flex items-center gap-4">
                <h1 className="dashboard-title">
                    <span>📊</span>
                    <span>Tableau de Bord</span>
                    <span className="dashboard-title-accent">PASQ</span>
                </h1>

                {state.lastUpdated && (
                    <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Mis à jour à {formatLastUpdated(state.lastUpdated)}</span>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2">
                {/* Quick Actions - Create Buttons */}
                {onCreateWidget && (
                    <button
                        onClick={onCreateWidget}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 text-teal-700 hover:bg-teal-100 rounded-lg transition-colors text-sm font-medium"
                        title="Créer un widget personnalisé"
                    >
                        <BarChart3 className="w-4 h-4" />
                        <span className="hidden lg:inline">Widget</span>
                        <Plus className="w-3 h-3" />
                    </button>
                )}

                {onCreatePivot && (
                    <button
                        onClick={onCreatePivot}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg transition-colors text-sm font-medium"
                        title="Créer un tableau croisé"
                    >
                        <Grid3X3 className="w-4 h-4" />
                        <span className="hidden lg:inline">Tableau croisé</span>
                        <Plus className="w-3 h-3" />
                    </button>
                )}

                <div className="w-px h-6 bg-gray-200 mx-1 hidden sm:block" />

                {/* Auto-refresh indicator */}
                <div className="refresh-indicator">
                    <button
                        onClick={toggleAutoRefresh}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${state.autoRefreshEnabled
                            ? 'bg-teal-50 text-teal-700 hover:bg-teal-100'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            }`}
                        title={state.autoRefreshEnabled ? 'Désactiver le rafraîchissement auto' : 'Activer le rafraîchissement auto'}
                    >
                        <Clock className="w-4 h-4" />
                        {state.autoRefreshEnabled && (
                            <span className="refresh-countdown font-mono text-sm">
                                {state.autoRefreshInterval}s
                            </span>
                        )}
                    </button>
                </div>

                {/* Manual refresh button */}
                <button
                    onClick={handleManualRefresh}
                    disabled={isRefreshing || state.isLoading}
                    className="dashboard-btn dashboard-btn--primary"
                    title="Rafraîchir maintenant"
                >
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">Rafraîchir</span>
                </button>

                {/* Settings button */}
                <button
                    onClick={onOpenSettings}
                    className="dashboard-btn dashboard-btn--icon"
                    title="Paramètres du tableau de bord"
                >
                    <Settings className="w-4 h-4" />
                </button>
            </div>
        </header>
    );
};

export default DashboardHeader;
