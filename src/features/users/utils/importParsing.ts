/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Import Parsing Utilities
Extracted from ImportUsers.tsx
*/

import * as XLSX from 'xlsx';

interface AddressData {
    rue: string;
    codePostal: string;
    ville: string;
    numero: string;
}

interface CellData {
    v: any;
    w?: string;
    t?: string;
}

/**
 * Extract address components from a raw Excel row
 */
export const extractAddressColumns = (row: Record<string, any>): AddressData => {
    let rue = '';
    let codePostal = '';
    let ville = '';
    let numeroMaison = '';
    const rueKeys = ['rue', 'street', 'adresse', 'address'];
    const cpKeys = ['cp', 'code postal', 'postal code', 'zip'];
    const villeKeys = ['ville', 'city', 'commune', 'localité'];
    const numeroKeys = ['n°', 'numero', 'numéro', 'number', 'num'];

    for (const colName in row) {
        if (!colName || !row[colName]) continue;
        const colNameLower = colName.toLowerCase().trim();
        const value = row[colName].toString().trim();

        if (numeroKeys.some(key => colNameLower === key || colNameLower.includes(key))) {
            numeroMaison = value;
            continue;
        }
        if (rueKeys.some(key => colNameLower === key || colNameLower.includes(key)) && !numeroKeys.some(nk => colNameLower === nk || colNameLower.includes(nk))) {
            rue = value;
        }
        if (cpKeys.some(key => colNameLower === key || colNameLower.includes(key))) {
            codePostal = value;
        }
        if (villeKeys.some(key => colNameLower === key || colNameLower.includes(key))) {
            ville = value;
        }
    }

    return {
        rue: rue,
        codePostal: codePostal,
        ville: ville,
        numero: numeroMaison
    };
};

/**
 * Parse a cell value, specifically handling Excel serial dates
 */
export const parseCellValue = (cell: CellData | null, headerKey?: string): string => {
    if (!cell) return '';

    const lowerHeader = headerKey?.toLowerCase() || '';
    const dateHeaders = ['date', 'naissance', 'inscription', 'début', 'fin', 'rendez-vous'];
    const isPotentialDateColumn = dateHeaders.some(keyword => lowerHeader.includes(keyword));

    if (isPotentialDateColumn && cell.t === 'n') {
        try {
            const dateInfo = XLSX.SSF.parse_date_code(cell.v);
            if (dateInfo && dateInfo.y && dateInfo.m !== undefined && dateInfo.d) {
                const month = (dateInfo.m + 1).toString().padStart(2, '0');
                const day = dateInfo.d.toString().padStart(2, '0');
                const year = dateInfo.y;
                return `${year}-${month}-${day}`;
            }
        } catch (e) {
            console.warn(`[Import Debug] Failed to parse Excel serial date:`, cell.v, e);
        }
    }

    return cell.w !== undefined ? String(cell.w) : String(cell.v);
};
