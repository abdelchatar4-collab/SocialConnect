/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Calculs pour les tableaux croisés dynamiques
*/

import { User } from '@/types';
import { PivotTableData, DynamicFilter } from '../types/pivotTable';
import { ANALYZABLE_FIELDS, CustomWidgetFilters } from '../types/customWidget';
import { calculateWidgetData } from '../components/WidgetBuilder';

/**
 * Calculate pivot table data from users
 */
export function calculatePivotData(
    users: User[],
    rowField: string,
    columnField: string,
    filters: CustomWidgetFilters,
    dynamicFilters: DynamicFilter[] = []
): PivotTableData {
    const rowData = calculateWidgetData(users, rowField, filters);
    const colData = calculateWidgetData(users, columnField, filters);

    const rows = rowData.map(r => r.name);
    const columns = colData.map(c => c.name);

    if (rows.length === 0 || columns.length === 0) {
        return { rows: [], columns: [], data: [], rowTotals: [], columnTotals: [], grandTotal: 0 };
    }

    // Apply boolean filters
    let filteredUsers = [...users];
    if (filters.hasPrevExp) filteredUsers = filteredUsers.filter(u => u.hasPrevExp);
    if (filters.isActive) filteredUsers = filteredUsers.filter(u =>
        u.etat === 'Actif' || u.etat === 'En cours' || u.etat === 'Ouvert'
    );
    if (filters.hasLitige) filteredUsers = filteredUsers.filter(u => {
        const details = typeof u.logementDetails === 'object' ? u.logementDetails : null;
        return details?.hasLitige === true;
    });

    // Apply dynamic filters
    dynamicFilters.forEach(df => {
        if (df.field && df.value) {
            filteredUsers = filteredUsers.filter(u => {
                const userValue = getFieldValue(u, df.field);
                return userValue === df.value;
            });
        }
    });

    // Build cross-tabulation matrix
    const data: number[][] = rows.map(() => columns.map(() => 0));
    const rowMap = new Map(rows.map((r, i) => [r, i]));
    const colMap = new Map(columns.map((c, i) => [c, i]));

    filteredUsers.forEach(user => {
        const rowValue = getFieldValue(user, rowField);
        const colValue = getFieldValue(user, columnField);
        const rowIdx = rowMap.get(rowValue);
        const colIdx = colMap.get(colValue);
        if (rowIdx !== undefined && colIdx !== undefined) {
            data[rowIdx][colIdx]++;
        }
    });

    // Calculate totals
    const rowTotals = data.map(row => row.reduce((a, b) => a + b, 0));
    const columnTotals = columns.map((_, colIdx) =>
        data.reduce((sum, row) => sum + (row[colIdx] || 0), 0)
    );
    const grandTotal = rowTotals.reduce((a, b) => a + b, 0);

    return { rows, columns, data, rowTotals, columnTotals, grandTotal };
}

/**
 * Get normalized field value from user
 */
export function getFieldValue(user: User, fieldId: string): string {
    const fieldConfig = ANALYZABLE_FIELDS.find(f => f.id === fieldId);
    if (!fieldConfig) return 'Non spécifié';

    const path = fieldConfig.path;
    const parts = path.split('.');
    let value: unknown = user;

    for (const part of parts) {
        if (value === null || value === undefined) break;
        value = (value as Record<string, unknown>)[part];
    }

    if (value === null || value === undefined || value === '') return 'Non spécifié';

    // For gestionnaire objects
    if (fieldId === 'gestionnaire' && typeof value === 'object') {
        const g = value as { prenom?: string; nom?: string };
        return `${g.prenom || ''} ${g.nom || ''}`.trim() || 'Non assigné';
    }

    const strValue = String(value).trim();
    if (strValue.length > 0) {
        return strValue.charAt(0).toUpperCase() + strValue.slice(1);
    }
    return strValue || 'Non spécifié';
}
