/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

/**
 * Excel Export Utilities for Dashboard Widgets
 */

import { ANALYZABLE_FIELDS, getFieldById } from '../types/customWidget';

// Types for export
interface WidgetDataRow {
    name: string;
    value: number;
    percentage?: number;
}

interface PivotExportData {
    name: string;
    rowField: string;
    columnField: string;
    rows: string[];
    columns: string[];
    data: number[][];
    rowTotals: number[];
    columnTotals: number[];
    grandTotal: number;
}

/**
 * Export widget data to CSV/Excel format
 */
export function exportWidgetToExcel(
    widgetName: string,
    fieldId: string,
    data: WidgetDataRow[]
): void {
    const fieldLabel = getFieldById(fieldId)?.label || fieldId;

    // Create CSV content
    let csv = `\uFEFF`; // BOM for Excel UTF-8
    csv += `${widgetName}\n`;
    csv += `Champ: ${fieldLabel}\n\n`;
    csv += `${fieldLabel};Nombre;Pourcentage\n`;

    const total = data.reduce((sum, row) => sum + row.value, 0);

    data.forEach(row => {
        const pct = total > 0 ? Math.round((row.value / total) * 100) : 0;
        csv += `${row.name};${row.value};${pct}%\n`;
    });

    csv += `\nTotal;${total};100%\n`;

    downloadCSV(csv, `widget_${sanitizeFilename(widgetName)}.csv`);
}

/**
 * Export pivot table to CSV/Excel format
 */
export function exportPivotToExcel(data: PivotExportData): void {
    const rowLabel = getFieldById(data.rowField)?.label || data.rowField;
    const colLabel = getFieldById(data.columnField)?.label || data.columnField;

    // Create CSV content
    let csv = `\uFEFF`; // BOM for Excel UTF-8
    csv += `${data.name}\n`;
    csv += `Lignes: ${rowLabel} / Colonnes: ${colLabel}\n\n`;

    // Header row
    csv += `${rowLabel} \\ ${colLabel}`;
    data.columns.forEach(col => {
        csv += `;${col}`;
    });
    csv += `;Total\n`;

    // Data rows
    data.rows.forEach((row, rowIdx) => {
        csv += row;
        data.columns.forEach((_, colIdx) => {
            csv += `;${data.data[rowIdx]?.[colIdx] || 0}`;
        });
        csv += `;${data.rowTotals[rowIdx] || 0}\n`;
    });

    // Totals row
    csv += `Total`;
    data.columns.forEach((_, colIdx) => {
        csv += `;${data.columnTotals[colIdx] || 0}`;
    });
    csv += `;${data.grandTotal}\n`;

    downloadCSV(csv, `pivot_${sanitizeFilename(data.name)}.csv`);
}

/**
 * Download CSV file
 */
function downloadCSV(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Sanitize filename
 */
function sanitizeFilename(name: string): string {
    return name
        .toLowerCase()
        .replace(/[àáâã]/g, 'a')
        .replace(/[éèêë]/g, 'e')
        .replace(/[ïî]/g, 'i')
        .replace(/[ôö]/g, 'o')
        .replace(/[ùûü]/g, 'u')
        .replace(/[ç]/g, 'c')
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_')
        .slice(0, 50);
}
