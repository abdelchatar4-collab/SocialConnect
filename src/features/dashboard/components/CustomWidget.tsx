/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

/**
 * CustomWidget - Renders a user-created custom widget
 */

"use client";

import React, { useMemo } from 'react';
import { Edit3, Trash2, Download } from 'lucide-react';
import { CustomWidgetConfig, getFieldById } from '../types/customWidget';
import { User } from '@/types';
import { calculateWidgetData } from '../utils/widgetCalculations';
import { PieChartWidget, BarChartWidget } from '../widgets';
import { exportWidgetToExcel } from '../utils/excelExport';

interface CustomWidgetProps {
    config: CustomWidgetConfig;
    users: User[];
    onEdit: (widget: CustomWidgetConfig) => void;
    onDelete: (widgetId: string) => void;
}

export const CustomWidget: React.FC<CustomWidgetProps> = ({
    config,
    users,
    onEdit,
    onDelete,
}) => {
    // Calculate data
    const data = useMemo(() =>
        calculateWidgetData(users, config.analyzeField, config.filters),
        [users, config.analyzeField, config.filters]
    );

    // Get field info
    const field = getFieldById(config.analyzeField);
    const totalCount = data.reduce((acc, d) => acc + d.value, 0);

    // Get active filters for display
    const activeFilters = useMemo(() => {
        const filters: string[] = [];
        if (config.filters.hasPrevExp) filters.push('PrevExp');
        if (config.filters.isActive) filters.push('Actifs');
        if (config.filters.hasLitige) filters.push('Litige');
        if (config.filters.antenne) filters.push(`Ant: ${config.filters.antenne}`);
        return filters;
    }, [config.filters]);

    return (
        <div className="widget-card widget-card--medium animate-fadeIn">
            {/* Header */}
            <div className="widget-header">
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {config.name}
                    </h3>
                    {activeFilters.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                            {activeFilters.map((filter, i) => (
                                <span
                                    key={i}
                                    className="text-xs px-1.5 py-0.5 bg-teal-100 text-teal-700 rounded"
                                >
                                    {filter}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => exportWidgetToExcel(config.name, config.analyzeField, data)}
                        className="p-1.5 hover:bg-green-50 rounded-md transition-colors"
                        title="Exporter en Excel"
                    >
                        <Download className="w-4 h-4 text-gray-400 hover:text-green-600" />
                    </button>
                    <button
                        onClick={() => onEdit(config)}
                        className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                        title="Modifier"
                    >
                        <Edit3 className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                        onClick={() => {
                            if (confirm('Supprimer ce widget ?')) {
                                onDelete(config.id);
                            }
                        }}
                        className="p-1.5 hover:bg-red-50 rounded-md transition-colors"
                        title="Supprimer"
                    >
                        <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                    </button>
                </div>
            </div>

            {/* Stats badge */}
            <div className="px-4 pb-2">
                <span className="text-xs text-gray-500">
                    {data.length} valeurs • {totalCount} usagers
                </span>
            </div>

            {/* Chart Content */}
            <div className="widget-content">
                {data.length === 0 ? (
                    <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
                        Aucune donnée
                    </div>
                ) : config.chartType === 'table' ? (
                    <div className="overflow-auto max-h-60 px-4">
                        <table className="w-full text-sm">
                            <thead className="sticky top-0 bg-white">
                                <tr className="border-b">
                                    <th className="text-left py-2 text-gray-600 font-medium">Valeur</th>
                                    <th className="text-right py-2 text-gray-600 font-medium">Nb</th>
                                    <th className="text-right py-2 text-gray-600 font-medium">%</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.slice(0, 15).map((row, i) => (
                                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                                        <td className="py-1.5 text-gray-900">{row.name}</td>
                                        <td className="text-right py-1.5 font-medium text-gray-900">{row.value}</td>
                                        <td className="text-right py-1.5 text-gray-500">
                                            {totalCount > 0 ? Math.round((row.value / totalCount) * 100) : 0}%
                                        </td>
                                    </tr>
                                ))}
                                {data.length > 15 && (
                                    <tr>
                                        <td colSpan={3} className="py-2 text-center text-gray-400 text-xs">
                                            +{data.length - 15} autres...
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : config.chartType === 'pie' ? (
                    <div className="px-2">
                        <PieChartWidget data={data.slice(0, 8)} height={220} />
                    </div>
                ) : (
                    <div className="px-2">
                        <BarChartWidget data={data.slice(0, 10)} height={220} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomWidget;
