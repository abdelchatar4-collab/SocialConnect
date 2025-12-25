/*
Copyright (C) 2025 ABDEL KADER CHATAR
Licence GPLv3+
*/

/**
 * Normalise une chaîne de date en format YYYY-MM-DD
 * Supporte : DD/MM/YYYY, DD-MM-YYYY, DDMMYYYY, YYYY-MM-DD
 */
export const normalizeToISODate = (input: string | Date | null | undefined): string => {
    if (!input) return '';

    // Si c'est déjà un objet Date
    if (input instanceof Date) {
        if (isNaN(input.getTime())) return '';
        return input.toISOString().split('T')[0];
    }

    // Nettoyer l'entrée (enlever espaces, etc)
    const clean = input.trim().replace(/[.\-/]/g, '');

    // Cas DDMMYYYY (8 chiffres)
    if (/^\d{8}$/.test(clean)) {
        const d = clean.substring(0, 2);
        const m = clean.substring(2, 4);
        const y = clean.substring(4, 8);
        return `${y}-${m}-${d}`;
    }

    // Cas YYYY-MM-DD (déjà ISO)
    if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
        return input;
    }

    // Cas DD/MM/YYYY ou DD-MM-YYYY
    const dmyMatch = input.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
    if (dmyMatch) {
        const d = dmyMatch[1].padStart(2, '0');
        const m = dmyMatch[2].padStart(2, '0');
        const y = dmyMatch[3];
        return `${y}-${m}-${d}`;
    }

    // Fallback tentative via Date object
    try {
        const d = new Date(input);
        if (!isNaN(d.getTime())) {
            return d.toISOString().split('T')[0];
        }
    } catch {
        // Ignorer
    }

    return input; // Retourner tel quel si non reconnu, la validation s'en chargera
};

/**
 * Formate une date ISO (YYYY-MM-DD) en format français (DD/MM/YYYY)
 */
export const formatToFrenchDate = (isoDate: string | Date | null | undefined): string => {
    if (!isoDate) return '';

    try {
        const date = typeof isoDate === 'string' ? new Date(isoDate) : isoDate;
        if (isNaN(date.getTime())) return '';

        const d = String(date.getDate()).padStart(2, '0');
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const y = date.getFullYear();

        return `${d}/${m}/${y}`;
    } catch {
        return '';
    }
};

/**
 * Vérifie si une chaîne de date est valide (existe réellement au calendrier)
 */
export const isValidDate = (isoDate: string): boolean => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return false;

    const [y, m, d] = isoDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);

    return date.getFullYear() === y &&
        date.getMonth() === m - 1 &&
        date.getDate() === d;
};
