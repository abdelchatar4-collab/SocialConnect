import { normalizeToISODate } from '@/utils/dateUtils';

export function parseExcelDate(val: any): Date | null {
    if (!val) return null;

    // Si c'est déjà un objet Date
    if (val instanceof Date && !isNaN(val.getTime())) {
        return new Date(Date.UTC(val.getUTCFullYear(), val.getUTCMonth(), val.getUTCDate()));
    }

    // Cas spécifique Excel : nombre de jours depuis 30/12/1899
    if (typeof val === 'number') {
        const d = new Date(new Date(1899, 11, 30).getTime() + val * 24 * 60 * 60 * 1000);
        return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    }

    // Pour les chaînes, utiliser notre normalisation robuste
    if (typeof val === 'string' && val.trim() !== '') {
        const normalized = normalizeToISODate(val);
        if (normalized && normalized.includes('-')) {
            const [y, m, d] = normalized.split('-').map(Number);
            return new Date(Date.UTC(y, m - 1, d));
        }
    }

    return null;
}

export function parseGenre(v: any): string {
    if (!v) return "Non spécifié";
    const g = String(v).toLowerCase().trim();
    if (g.includes('1') || g.startsWith('m') || g.includes('homme')) return "Homme";
    if (g.includes('2') || g.startsWith('f') || g.includes('femme')) return "Femme";
    return "Non spécifié";
}

export const safeStr = (v: any) => (v !== null && v !== undefined && String(v).trim() !== '') ? String(v).trim() : null;
export const safeStrDef = (v: any, d: string) => (v !== null && v !== undefined && String(v).trim() !== '') ? String(v).trim() : d;
