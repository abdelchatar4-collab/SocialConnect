/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Composant de prévisualisation du tableau croisé
*/

"use client";

import React from 'react';
import { PivotTableData } from '../types/pivotTable';

interface PivotTablePreviewProps {
    data: PivotTableData;
    showTotals: boolean;
    showPercentages: boolean;
    showHeatmap: boolean;
}

export const PivotTablePreview: React.FC<PivotTablePreviewProps> = ({
    data,
    showTotals,
    showPercentages,
    showHeatmap,
}) => {
    if (data.rows.length === 0 || data.columns.length === 0) {
        return <div className="text-center py-8 text-gray-400">Aucune donnée</div>;
    }

    const maxValue = Math.max(...data.data.flat());

    const getCellColor = (value: number) => {
        if (!showHeatmap || maxValue === 0) return '';
        const intensity = value / maxValue;
        return `rgba(79, 70, 229, ${intensity * 0.3})`;
    };

    const formatCell = (value: number, total: number) => {
        if (showPercentages && total > 0) {
            return `${value} (${Math.round((value / total) * 100)}%)`;
        }
        return value.toString();
    };

    return (
        <table className="w-full text-sm border-collapse">
            <thead>
                <tr>
                    <th className="border border-gray-200 bg-gray-100 p-2 text-left font-semibold">↓ / →</th>
                    {data.columns.slice(0, 8).map((col, i) => (
                        <th key={i} className="border border-gray-200 bg-gray-100 p-2 text-center font-semibold">
                            {col}
                        </th>
                    ))}
                    {data.columns.length > 8 && (
                        <th className="border border-gray-200 bg-gray-100 p-2 text-center text-gray-400">
                            +{data.columns.length - 8}
                        </th>
                    )}
                    {showTotals && (
                        <th className="border border-gray-200 bg-indigo-100 p-2 text-center font-bold">Total</th>
                    )}
                </tr>
            </thead>
            <tbody>
                {data.rows.slice(0, 10).map((row, rowIdx) => (
                    <tr key={rowIdx}>
                        <td className="border border-gray-200 bg-gray-50 p-2 font-medium">{row}</td>
                        {data.columns.slice(0, 8).map((_, colIdx) => (
                            <td
                                key={colIdx}
                                className="border border-gray-200 p-2 text-center"
                                style={{ backgroundColor: getCellColor(data.data[rowIdx]?.[colIdx] || 0) }}
                            >
                                {formatCell(data.data[rowIdx]?.[colIdx] || 0, data.grandTotal)}
                            </td>
                        ))}
                        {data.columns.length > 8 && (
                            <td className="border border-gray-200 p-2 text-center text-gray-400">...</td>
                        )}
                        {showTotals && (
                            <td className="border border-gray-200 bg-indigo-50 p-2 text-center font-bold">
                                {formatCell(data.rowTotals[rowIdx] || 0, data.grandTotal)}
                            </td>
                        )}
                    </tr>
                ))}
                {data.rows.length > 10 && (
                    <tr>
                        <td colSpan={Math.min(data.columns.length, 8) + 2} className="border border-gray-200 p-2 text-center text-gray-400">
                            +{data.rows.length - 10} autres lignes...
                        </td>
                    </tr>
                )}
                {showTotals && (
                    <tr>
                        <td className="border border-gray-200 bg-indigo-100 p-2 font-bold">Total</td>
                        {data.columns.slice(0, 8).map((_, colIdx) => (
                            <td key={colIdx} className="border border-gray-200 bg-indigo-50 p-2 text-center font-bold">
                                {formatCell(data.columnTotals[colIdx] || 0, data.grandTotal)}
                            </td>
                        ))}
                        {data.columns.length > 8 && (
                            <td className="border border-gray-200 bg-indigo-50 p-2 text-center">...</td>
                        )}
                        <td className="border border-gray-200 bg-indigo-200 p-2 text-center font-bold">
                            {data.grandTotal}
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    );
};
