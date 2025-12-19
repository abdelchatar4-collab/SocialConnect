/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

/**
 * Pivot Table Types - 2D cross-tabulation configuration
 */

import { CustomWidgetFilters } from './customWidget';

// Dynamic Filter - field + value pair
export interface DynamicFilter {
    field: string;  // e.g., 'genre', 'antenne', 'gestionnaire'
    value: string;  // e.g., 'Femme', 'Centre', 'Jean Dupont'
}

// Pivot Table Configuration
export interface PivotTableConfig {
    id: string;
    name: string;
    rowField: string;      // Field for rows (e.g., langue)
    columnField: string;   // Field for columns (e.g., antenne)
    filters: CustomWidgetFilters;  // Boolean filters (hasPrevExp, isActive, hasLitige)
    dynamicFilters: DynamicFilter[];  // Dynamic field+value filters
    showPercentages: boolean;
    showTotals: boolean;
    showHeatmap: boolean;
    createdAt: string;
    order: number;
}

// Pivot Table Data Structure
export interface PivotTableData {
    rows: string[];        // Row values (e.g., ['Français', 'Arabe', ...])
    columns: string[];     // Column values (e.g., ['Centre', 'Cureghem', ...])
    data: number[][];      // 2D array of counts [row][column]
    rowTotals: number[];   // Sum of each row
    columnTotals: number[];// Sum of each column
    grandTotal: number;    // Total of all values
}

// Default empty pivot table for creation
export const createEmptyPivotTable = (): Omit<PivotTableConfig, 'id' | 'createdAt' | 'order'> => ({
    name: '',
    rowField: 'langue',
    columnField: 'antenne',
    filters: {},
    dynamicFilters: [],
    showPercentages: false,
    showTotals: true,
    showHeatmap: false,
});

