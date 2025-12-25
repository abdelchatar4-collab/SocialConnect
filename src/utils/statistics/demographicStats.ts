/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - General and Demographic Stats
*/

import { User } from '@/types';
import { GeneralStats, DemographicStats } from './statsTypes';

export const getGeneralStats = (filteredUsers: User[], allUsers: User[]): GeneralStats => {
    const total = filteredUsers.length;
    const actifs = filteredUsers.filter(u => u.etat === "Ouvert").length;
    const oneMonthAgo = new Date(); oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const nouveauxCeMois = filteredUsers.filter(u => u.dateOuverture && new Date(u.dateOuverture) >= oneMonthAgo).length;
    const dossiersClotures = filteredUsers.filter(u => u.dateCloture).length;

    const twoMonthsAgo = new Date(); twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
    const nouveauxMPrecedent = allUsers.filter(u => u.dateOuverture && new Date(u.dateOuverture) >= twoMonthsAgo && new Date(u.dateOuverture) < oneMonthAgo).length;
    const changeNouveaux = nouveauxMPrecedent !== 0 ? Math.round((nouveauxCeMois - nouveauxMPrecedent) / nouveauxMPrecedent * 100) : 100;

    const parAntenne: Record<string, number> = {};
    filteredUsers.forEach(u => { const a = u.antenne || 'Non spécifié'; parAntenne[a] = (parAntenne[a] || 0) + 1; });

    return { total, actifs, nouveauxCeMois, dossiersClotures, parAntenne, changeTotal: 5, changeActifs: 2, changeNouveaux, changeClotures: -3 };
};

export const getDemographicStats = (users: User[]): DemographicStats => {
    const parGenre: Record<string, number> = {};
    const parAge: Record<string, number> = { 'Moins de 18 ans': 0, '18-30 ans': 0, '31-45 ans': 0, '46-60 ans': 0, 'Plus de 60 ans': 0, 'Non spécifié': 0 };
    const nationalites: Record<string, number> = {};

    users.forEach(u => {
        const g = u.genre || 'Non spécifié'; parGenre[g] = (parGenre[g] || 0) + 1;
        if (u.nationalite) nationalites[u.nationalite] = (nationalites[u.nationalite] || 0) + 1;
        if (!u.dateNaissance) parAge['Non spécifié']++;
        else {
            const age = Math.abs(new Date(Date.now() - new Date(u.dateNaissance).getTime()).getUTCFullYear() - 1970);
            if (age < 18) parAge['Moins de 18 ans']++;
            else if (age < 31) parAge['18-30 ans']++;
            else if (age < 46) parAge['31-45 ans']++;
            else if (age < 61) parAge['46-60 ans']++;
            else parAge['Plus de 60 ans']++;
        }
    });

    return { parGenre, parAge, topNationalites: Object.entries(nationalites).sort((a, b) => b[1] - a[1]).slice(0, 5) };
};
