/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

/**
 * PivotTableWidget - Renders a saved pivot table (tableau croisé dynamique)
 */

"use client";

import React, { useMemo } from 'react';
import { Edit3, Trash2, Table2, Download } from 'lucide-react';
import { PivotTableConfig, PivotTableData } from '../types/pivotTable';
import { getFieldById } from '../types/customWidget';
import { User } from '@/types';
import { calculatePivotData } from './PivotTableBuilder';
import { exportPivotToExcel } from '../utils/excelExport';

interface PivotTableWidgetProps {
    config: PivotTableConfig;
    users: User[];
    onEdit: (config: PivotTableConfig) => void;
    onDelete: (id: string) => void;
}

export const PivotTableWidget: React.FC<PivotTableWidgetProps> = ({
    config,
    users,
    onEdit,
    onDelete,
}) => {
    // Calculate data
    const data = useMemo(() =>
        calculatePivotData(users, config.rowField, config.columnField, config.filters, config.dynamicFilters || []),
        [users, config.rowField, config.columnField, config.filters, config.dynamicFilters]
    );

    // Get field labels
    const rowFieldLabel = getFieldById(config.rowField)?.label || config.rowField;
    const colFieldLabel = getFieldById(config.columnField)?.label || config.columnField;

    // Active filters
    const activeFilters = useMemo(() => {
        const filters: string[] = [];
        if (config.filters.hasPrevExp) filters.push('PrevExp');
        if (config.filters.isActive) filters.push('Actifs');
        if (config.filters.hasLitige) filters.push('Litige');
        return filters;
    }, [config.filters]);

    // Find max for heatmap
    const maxValue = Math.max(...data.data.flat(), 1);

    const getCellColor = (value: number) => {
        if (!config.showHeatmap || maxValue === 0) return '';
        const intensity = value / maxValue;
        return `rgba(79, 70, 229, ${intensity * 0.35})`;
    };

    const formatCell = (value: number) => {
        if (config.showPercentages && data.grandTotal > 0) {
            const pct = Math.round((value / data.grandTotal) * 100);
            return <><span className="font-medium">{value}</span> <span className="text-gray-400 text-xs">({pct}%)</span></>;
        }
        return <span className="font-medium">{value}</span>;
    };

    return (
        <div className="widget-card widget-card--full animate-fadeIn">
            {/* Header */}
            <div className="widget-header">
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 truncate flex items-center gap-2">
                        <Table2 className="w-4 h-4 text-indigo-600" />
                        {config.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <span>{rowFieldLabel} × {colFieldLabel}</span>
                        {activeFilters.length > 0 && (
                            <>
                                <span>•</span>
                                {activeFilters.map((f, i) => (
                                    <span key={i} className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded">{f}</span>
                                ))}
                            </>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => exportPivotToExcel({
                            name: config.name,
                            rowField: config.rowField,
                            columnField: config.columnField,
                            rows: data.rows,
                            columns: data.columns,
                            data: data.data,
                            rowTotals: data.rowTotals,
                            columnTotals: data.columnTotals,
                            grandTotal: data.grandTotal,
                        })}
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
                        onClick={() => confirm('Supprimer ce tableau ?') && onDelete(config.id)}
                        className="p-1.5 hover:bg-red-50 rounded-md transition-colors"
                        title="Supprimer"
                    >
                        <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="px-4 pb-2 text-xs text-gray-500">
                {data.rows.length} lignes × {data.columns.length} colonnes • {data.grandTotal} usagers
            </div>

            {/* Table */}
            <div className="widget-content overflow-x-auto">
                {data.rows.length === 0 || data.columns.length === 0 ? (
                    <div className="flex items-center justify-center h-40 text-gray-400">Aucune donnée</div>
                ) : (
                    <table className="w-full text-sm border-collapse min-w-max">
                        <thead>
                            <tr>
                                <th className="border border-gray-200 bg-gray-100 p-2 text-left font-semibold sticky left-0">
                                    {rowFieldLabel} ↓ / {colFieldLabel} →
                                </th>
                                {data.columns.map((col, i) => (
                                    <th key={i} className="border border-gray-200 bg-gray-100 p-2 text-center font-semibold whitespace-nowrap">
                                        {col}
                                    </th>
                                ))}
                                {config.showTotals && (
                                    <th className="border border-gray-200 bg-indigo-100 p-2 text-center font-bold">Total</th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {data.rows.map((row, rowIdx) => (
                                <tr key={rowIdx} className="hover:bg-gray-50">
                                    <td className="border border-gray-200 bg-gray-50 p-2 font-medium sticky left-0 whitespace-nowrap">
                                        {row}
                                    </td>
                                    {data.columns.map((_, colIdx) => (
                                        <td
                                            key={colIdx}
                                            className="border border-gray-200 p-2 text-center"
                                            style={{ backgroundColor: getCellColor(data.data[rowIdx]?.[colIdx] || 0) }}
                                        >
                                            {formatCell(data.data[rowIdx]?.[colIdx] || 0)}
                                        </td>
                                    ))}
                                    {config.showTotals && (
                                        <td className="border border-gray-200 bg-indigo-50 p-2 text-center font-bold">
                                            {formatCell(data.rowTotals[rowIdx] || 0)}
                                        </td>
                                    )}
                                </tr>
                            ))}
                            {config.showTotals && (
                                <tr className="font-bold">
                                    <td className="border border-gray-200 bg-indigo-100 p-2 sticky left-0">Total</td>
                                    {data.columns.map((_, colIdx) => (
                                        <td key={colIdx} className="border border-gray-200 bg-indigo-50 p-2 text-center">
                                            {formatCell(data.columnTotals[colIdx] || 0)}
                                        </td>
                                    ))}
                                    <td className="border border-gray-200 bg-indigo-200 p-2 text-center">{data.grandTotal}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default PivotTableWidget;
