/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Analytics Stats Calculators
*/

import { User } from '@/types/user';
import { UserStats } from './analyticsTypes';

export function calculateBaseStats(users: User[]): UserStats {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const stats: UserStats = {
        total: users.length, byStatus: {}, byNationality: {}, byAntenne: {},
        byGestionnaire: {}, byAgeGroup: {}, bySector: {}, byMonth: {},
        recentlyAdded: 0, recentlyUpdated: 0
    };

    users.forEach(u => {
        const s = u.etat || 'Non défini'; stats.byStatus[s] = (stats.byStatus[s] || 0) + 1;
        const n = u.nationalite || 'Non définie'; stats.byNationality[n] = (stats.byNationality[n] || 0) + 1;
        const a = u.antenne || 'Non définie'; stats.byAntenne[a] = (stats.byAntenne[a] || 0) + 1;
        const g = typeof u.gestionnaire === 'string' ? (u.gestionnaire || 'Non assigné') : (u.gestionnaire ? `${u.gestionnaire.prenom || ''} ${u.gestionnaire.nom || ''}`.trim() : 'Non assigné');
        stats.byGestionnaire[g] = (stats.byGestionnaire[g] || 0) + 1;
        const ag = u.trancheAge || 'Non définie'; stats.byAgeGroup[ag] = (stats.byAgeGroup[ag] || 0) + 1;
        const sec = u.secteur || 'Non défini'; stats.bySector[sec] = (stats.bySector[sec] || 0) + 1;

        if (u.dateOuverture) {
            const d = new Date(u.dateOuverture);
            const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            stats.byMonth[k] = (stats.byMonth[k] || 0) + 1;
            if (d >= thirtyDaysAgo) stats.recentlyAdded++;
        }
        if (u.derniereModification && new Date(u.derniereModification) >= thirtyDaysAgo) stats.recentlyUpdated++;
    });
    return stats;
}
