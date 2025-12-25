/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Dashboard Calculations Main Module
This module orchestrates all dashboard calculations and re-exports from specialized modules.
*/

import { User, Gestionnaire } from '@/types';
import { DashboardStats, CountByField, AgeGroups } from '../types/dashboard';
import { safePercent } from './dashboardUtils';

// Re-export from specialized modules
export { getGestionnaireDisplayName, calculateActionStatsByTSR, calculateActionStatsByAntenne } from './actionStatsCalculations';
export { calculatePrevExpStats } from './prevExpCalculations';
export { calculateHousingStats, getUrgentActions } from './housingCalculations';
export { generateSummaryText } from './summaryCalculations';

// Import for internal use
import { calculateActionStatsByAntenne, getGestionnaireDisplayName } from './actionStatsCalculations';

/**
 * Main statistics calculation function
 * Combines data from various sources into a unified DashboardStats object
 */
export const calculateStatistics = (
    users: User[],
    gestionnaires: Gestionnaire[]
): DashboardStats => {
    if (!users?.length) {
        return {
            total: 0, percentageActifs: 0, totalProblematiques: 0,
            parAntenne: [], parProblematique: [], parAge: [], parGenre: [],
            parSecteur: [], gestionnaireData: [], statutSocialData: [],
            actionTimelineData: [], actionStatsByAntenne: [],
            averageActionsPerAntenne: 0, averageActionsPerMonth: 0, averageActionsPerYear: 0
        } as any;
    }

    const total = users.length;
    const actifs = users.filter(u => u.etat === "Actif").length;
    const pourcentageActifs = safePercent(actifs, total);

    // Secteurs
    const secteurCount: CountByField = {};
    users.forEach(u => {
        secteurCount[u.secteur || 'Non spécifié'] = (secteurCount[u.secteur || 'Non spécifié'] || 0) + 1;
    });
    const parSecteur = Object.entries(secteurCount)
        .map(([name, value]) => ({ name, value }))
        .filter(i => i.value > 0)
        .sort((a, b) => b.value - a.value);

    // Problématiques
    const probCount: CountByField = {};
    users.forEach(u => u.problematiques?.forEach(p => {
        if (p.type) probCount[p.type] = (probCount[p.type] || 0) + 1;
    }));
    const parProblematique = Object.entries(probCount)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
    const totalProblematiques = new Set(
        users.filter(u => u.problematiques?.some(p => p.type === "Administratif" || p.type === "Logement")).map(u => u.id)
    ).size;

    // Genre
    const genreCount: CountByField = {};
    users.forEach(u => {
        const g = u.genre?.toLowerCase() === 'homme' ? 'Homme' :
            u.genre?.toLowerCase() === 'femme' ? 'Femme' : 'Non spécifié';
        genreCount[g] = (genreCount[g] || 0) + 1;
    });

    // Antenne
    const antenneCount: CountByField = {};
    users.forEach(u => {
        antenneCount[u.antenne || 'Non spécifié'] = (antenneCount[u.antenne || 'Non spécifié'] || 0) + 1;
    });
    const parAntenne = Object.entries(antenneCount)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

    // Gestionnaires
    const gestCount: CountByField = {};
    users.forEach(u => {
        const id = typeof u.gestionnaire === 'string' ? u.gestionnaire : u.gestionnaire?.id;
        const name = getGestionnaireDisplayName(id, gestionnaires);
        gestCount[name] = (gestCount[name] || 0) + 1;
    });
    const gestionnaireData = Object.entries(gestCount)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

    // Age
    const ages: AgeGroups = {
        '0-18 ans': 0, '19-30 ans': 0, '31-45 ans': 0, '46-60 ans': 0, '61+ ans': 0, 'Non spécifié': 0
    };
    users.forEach(u => {
        if (u.dateNaissance) {
            const age = new Date().getFullYear() - new Date(u.dateNaissance).getFullYear();
            if (age <= 18) ages['0-18 ans']++;
            else if (age <= 30) ages['19-30 ans']++;
            else if (age <= 45) ages['31-45 ans']++;
            else if (age <= 60) ages['46-60 ans']++;
            else ages['61+ ans']++;
        } else ages['Non spécifié']++;
    });

    // Statut social
    const statutCount: CountByField = {};
    users.forEach(u => {
        statutCount[u.statutSejour || 'Non spécifié'] = (statutCount[u.statutSejour || 'Non spécifié'] || 0) + 1;
    });

    // Timeline
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    const curYear = new Date().getFullYear();
    const timeline = months.map((m, i) => ({
        name: m,
        actions: users.filter(u =>
            u.dateOuverture && new Date(u.dateOuverture).getFullYear() === curYear &&
            new Date(u.dateOuverture).getMonth() === i
        ).length
    }));

    const actionStats = calculateActionStatsByAntenne(users);

    return {
        total,
        pourcentageActifs: Math.min(pourcentageActifs, 100),
        totalProblematiques,
        parAntenne,
        parProblematique,
        parAge: Object.entries(ages).map(([name, value]) => ({ name, value })),
        parGenre: Object.entries(genreCount).map(([name, value]) => ({ name, value })),
        parSecteur,
        gestionnaireData,
        statutSocialData: Object.entries(statutCount).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
        actionTimelineData: timeline,
        ...actionStats
    };
};
