/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - API Import Utilities
*/

import prisma from '@/lib/prisma';

export const sanitizeStringField = (value: unknown): string | null => {
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed.toLowerCase() === 'undefined' || trimmed.toLowerCase() === 'null' || trimmed === '') return null;
        return trimmed;
    }
    return null;
};

export async function getAllGestionnaires() {
    return prisma.gestionnaire.findMany({ select: { id: true, nom: true, prenom: true } });
}

export function findGestionnaireId(nameOrId: unknown, allGest: any[]): string | null {
    if (typeof nameOrId !== 'string' || !nameOrId.trim()) return null;
    const input = nameOrId.trim().toLowerCase();
    if (allGest.some(g => g.id === nameOrId.trim())) return nameOrId.trim();

    const found = allGest.find(g => {
        const p = g.prenom?.trim().toLowerCase();
        const n = g.nom?.trim().toLowerCase();
        return (p && n && (`${p} ${n}` === input || `${n} ${p}` === input)) || (n && n === input) || (p && p === input);
    });
    return found ? found.id : null;
}
