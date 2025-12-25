/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - API Users Import Helpers
*/

export function parseExcelDate(val: any): Date | null {
    if (!val) return null;
    if (val instanceof Date && !isNaN(val.getTime())) return new Date(Date.UTC(val.getFullYear(), val.getMonth(), val.getDate()));
    if (typeof val === 'number') {
        const d = new Date(new Date(1899, 11, 30).getTime() + val * 24 * 60 * 60 * 1000);
        return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    }
    if (typeof val === 'string') {
        const d = new Date(val); if (!isNaN(d.getTime())) return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        const parts = val.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/);
        if (parts) {
            const dd = parseInt(parts[1], 10), mm = parseInt(parts[2], 10) - 1; let yy = parseInt(parts[3], 10);
            if (yy < 100) yy += (yy < 50 ? 2000 : 1900);
            const dt = new Date(Date.UTC(yy, mm, dd)); if (!isNaN(dt.getTime())) return dt;
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
