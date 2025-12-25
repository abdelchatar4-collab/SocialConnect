/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Excel Parsing Utilities
*/

import { parseISO, isValid, format } from 'date-fns';
import * as XLSX from 'xlsx';

/**
 * Normalisation plus robuste des clés (insensible casse, accents, espaces multiples)
 */
export const normalizeKey = (key: string): string =>
    key
        .toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, ' ');

/**
 * Trouve la valeur dans rawData correspondant à l'une des clés possibles.
 */
export function findValue(rawData: Record<string, any>, keys: string[], defaultValue: any = ''): any {
    if (!rawData) return defaultValue;

    const normalizedKeys = keys.map(normalizeKey);

    for (const rawKey in rawData) {
        const normalizedRawKey = normalizeKey(rawKey);
        if (normalizedKeys.includes(normalizedRawKey)) {
            const value = rawData[rawKey];
            return value !== null && value !== undefined ? value : defaultValue;
        }
    }
    return defaultValue;
}

/**
 * Transforme une valeur de date Excel (nombre ou string) en format yyyy-MM-dd.
 */
export function transformDateExcel(value: string | number | null | undefined): string | null {
    if (!value) return null;
    try {
        if (typeof value === 'number') {
            if (value > 0 && value < 2958466) {
                const dateInfo = XLSX.SSF.parse_date_code(value);
                if (dateInfo && dateInfo.y && dateInfo.m !== undefined && dateInfo.d) {
                    const utcDate = new Date(Date.UTC(dateInfo.y, dateInfo.m - 1, dateInfo.d));
                    if (!isNaN(utcDate.getTime())) {
                        return format(utcDate, 'yyyy-MM-dd');
                    }
                }
            }
        }
        if (typeof value === 'string') {
            const trimmedValue = value.trim();
            if (!trimmedValue) return null;

            const formatsToTry = [
                { regex: /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/, order: 'YMD' },
                { regex: /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/, order: 'DMY' },
                { regex: /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2})$/, order: 'MDY_short' },
                { regex: /^(\d{2})[-/.](\d{1,2})[-/.](\d{1,2})$/, order: 'YMD_short' },
            ];

            for (const formatConfig of formatsToTry) {
                const match = trimmedValue.match(formatConfig.regex);
                if (match) {
                    let yearStr: string, monthStr: string, dayStr: string;
                    if (formatConfig.order === 'YMD') {
                        [, yearStr, monthStr, dayStr] = match;
                    } else if (formatConfig.order === 'DMY') {
                        [, dayStr, monthStr, yearStr] = match;
                    } else if (formatConfig.order === 'MDY_short') {
                        [, monthStr, dayStr, yearStr] = match;
                        yearStr = (parseInt(yearStr) < 70 ? '20' : '19') + yearStr;
                    } else if (formatConfig.order === 'YMD_short') {
                        [, yearStr, monthStr, dayStr] = match;
                        yearStr = (parseInt(yearStr) < 70 ? '20' : '19') + yearStr;
                    } else {
                        continue;
                    }

                    const pDay = parseInt(dayStr);
                    const pMonth = parseInt(monthStr);
                    const pYear = parseInt(yearStr);

                    if (pDay >= 1 && pDay <= 31 && pMonth >= 1 && pMonth <= 12 && pYear > 1900 && pYear < 2100) {
                        const formattedDate = `${pYear}-${String(pMonth).padStart(2, '0')}-${String(pDay).padStart(2, '0')}`;
                        const parsed = parseISO(formattedDate);
                        if (isValid(parsed)) return formattedDate;
                    }
                }
            }
            try {
                const parsed = parseISO(trimmedValue);
                if (isValid(parsed)) return format(parsed, 'yyyy-MM-dd');
            } catch (parseError) { /* ignore */ }
        }
    } catch (e) {
        console.warn(`Error transforming date value: ${value}`, e);
        return null;
    }
    return null;
}

/**
 * Lit intelligemment la valeur d'une cellule Excel.
 */
export const parseCellValue = (cell: any, headerKey: string | undefined): string => {
    if (!cell || (cell.v === undefined && cell.w === undefined)) return '';

    const lower = headerKey?.toLowerCase() || '';
    const isDate = ['date', 'naissance', 'inscription', 'debut', 'fin', 'rendez-vous'].some(k => lower.includes(k));

    if (isDate && cell.t === 'n') {
        const d = transformDateExcel(cell.v);
        if (d) return d;
    }

    return cell.w !== undefined ? String(cell.w) : String(cell.v);
};
