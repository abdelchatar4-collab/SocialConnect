/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

/**
 * SettingsPanel - Slide-out panel for widget configuration
 */

"use client";

import React from 'react';
import { useDashboard } from './DashboardProvider';
import { X, RotateCcw, Eye, EyeOff } from 'lucide-react';

interface SettingsPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
    const { state, setWidgetVisibility, resetWidgets } = useDashboard();

    // Group widgets by category
    const kpiWidgets = state.widgets.filter(w => w.type.startsWith('kpi-'));
    const chartWidgets = state.widgets.filter(w => w.type.startsWith('chart-'));
    const otherWidgets = state.widgets.filter(w =>
        !w.type.startsWith('kpi-') && !w.type.startsWith('chart-')
    );

    const handleReset = () => {
        if (confirm('Réinitialiser la configuration du tableau de bord ?')) {
            resetWidgets();
        }
    };

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-40 transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Panel */}
            <aside className={`settings-panel ${isOpen ? 'settings-panel--open' : ''}`}>
                <div className="settings-header">
                    <h2 className="settings-title">Configuration</h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 border-b border-gray-200">
                    <button
                        onClick={handleReset}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Réinitialiser par défaut
                    </button>
                </div>

                <div className="overflow-y-auto max-h-[calc(100vh-140px)]">
                    {/* KPI Widgets */}
                    <div className="p-4">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                            Indicateurs Clés (KPIs)
                        </h3>
                        {kpiWidgets.map(widget => (
                            <WidgetToggle
                                key={widget.id}
                                widget={widget}
                                onToggle={(visible) => setWidgetVisibility(widget.id, visible)}
                            />
                        ))}
                    </div>

                    {/* Chart Widgets */}
                    <div className="p-4 border-t border-gray-100">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                            Graphiques
                        </h3>
                        {chartWidgets.map(widget => (
                            <WidgetToggle
                                key={widget.id}
                                widget={widget}
                                onToggle={(visible) => setWidgetVisibility(widget.id, visible)}
                            />
                        ))}
                    </div>

                    {/* Other Widgets */}
                    {otherWidgets.length > 0 && (
                        <div className="p-4 border-t border-gray-100">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                Autres
                            </h3>
                            {otherWidgets.map(widget => (
                                <WidgetToggle
                                    key={widget.id}
                                    widget={widget}
                                    onToggle={(visible) => setWidgetVisibility(widget.id, visible)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
};

// Individual widget toggle
interface WidgetToggleProps {
    widget: { id: string; title: string; visible: boolean };
    onToggle: (visible: boolean) => void;
}

const WidgetToggle: React.FC<WidgetToggleProps> = ({ widget, onToggle }) => {
    return (
        <div className="widget-toggle">
            <span className="widget-toggle-label">{widget.title}</span>
            <button
                onClick={() => onToggle(!widget.visible)}
                className={`p-2 rounded-lg transition-colors ${widget.visible
                        ? 'bg-teal-100 text-teal-700 hover:bg-teal-200'
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    }`}
            >
                {widget.visible ? (
                    <Eye className="w-4 h-4" />
                ) : (
                    <EyeOff className="w-4 h-4" />
                )}
            </button>
        </div>
    );
};

export default SettingsPanel;
