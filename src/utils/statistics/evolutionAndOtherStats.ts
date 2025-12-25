/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Evolution, Problems and Actions Stats
*/

import { User } from '@/types';
import { EvolutionStats, ProblematiquesStats, ActionsStats, ChargeStats, TimeFilter } from './statsTypes';

export const getEvolutionStats = (allUsers: User[], antenneFilter: string): EvolutionStats => {
    const months: string[] = [];
    const nouveauxParMois: number[] = [];
    const cloturesParMois: number[] = [];
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);
        months.push(`${d.toLocaleString('fr-FR', { month: 'short' })} ${d.getFullYear()}`);

        const usersToCount = antenneFilter === 'all' ? allUsers : allUsers.filter(u => u.antenne === antenneFilter);
        nouveauxParMois.push(usersToCount.filter(u => u.dateOuverture && new Date(u.dateOuverture) >= d && new Date(u.dateOuverture) <= monthEnd).length);
        cloturesParMois.push(usersToCount.filter(u => u.dateCloture && new Date(u.dateCloture) >= d && new Date(u.dateCloture) <= monthEnd).length);
    }

    return { labels: months, nouveauxParMois, cloturesParMois };
};

export const getProblematiquesStats = (users: User[]): ProblematiquesStats => {
    const types: Record<string, number> = {};
    let total = 0;
    users.forEach(u => {
        if (u.problematiques) {
            total += u.problematiques.length;
            u.problematiques.forEach(p => p.type && (types[p.type] = (types[p.type] || 0) + 1));
        }
    });
    return { total, repartition: Object.entries(types).sort((a, b) => b[1] - a[1]), moyenneParUsager: users.length > 0 ? (total / users.length).toFixed(1) : "0" };
};

export const getActionsStats = (users: User[]): ActionsStats => {
    const types: Record<string, number> = {};
    let total = 0;
    users.forEach(u => {
        const actions = u.actions || u.actionsSuivi;
        if (actions) {
            total += actions.length;
            actions.forEach(a => a.type && (types[a.type] = (types[a.type] || 0) + 1));
        }
    });
    return { totalActions: total, typesActions: Object.entries(types).sort((a, b) => b[1] - a[1]), moyenneParUsager: users.length > 0 ? (total / users.length).toFixed(1) : "0" };
};

export const getChargeStats = (users: User[]): ChargeStats => {
    const parGestionnaire: Record<string, number> = {};
    users.forEach(u => {
        if (u.gestionnaire && u.etat === "Ouvert") {
            const name = typeof u.gestionnaire === 'string' ? u.gestionnaire : (u.gestionnaire.prenom || 'Non spécifié');
            parGestionnaire[name] = (parGestionnaire[name] || 0) + 1;
        }
    });
    return { parGestionnaire: Object.entries(parGestionnaire).sort((a, b) => b[1] - a[1]) };
};
