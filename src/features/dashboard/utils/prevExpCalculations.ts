/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - PrevExp (Prevention Expulsion) Statistics Calculations
Extracted from dashboardCalculations.ts for maintainability
*/

import { User } from '@/types';
import { PrevExpStats } from '../types/dashboard';

/**
 * Groups solution into positive/negative/neutral categories
 */
const groupSolution = (solution: string): 'positive' | 'negative' | 'neutral' => {
    const solutionLower = solution.toLowerCase();
    if (solutionLower.includes('maintien') || solutionLower.includes('logement') && (solutionLower.includes('bxl') || solutionLower.includes('privé'))) {
        return 'positive';
    }
    if (solutionLower.includes('samu') || solutionLower.includes('aucune') || solutionLower.includes('urgence')) {
        return 'negative';
    }
    return 'neutral';
};

/**
 * Calculates PrevExp statistics
 */
export const calculatePrevExpStats = (users: User[]): PrevExpStats | null => {
    const prevExpUsers = users.filter(u => u.hasPrevExp);
    if (prevExpUsers.length === 0) return null;

    const now = new Date();

    // KPI: Dossiers Ouverts
    const dossiersOuvertsCount = prevExpUsers.filter(u => u.prevExpDossierOuvert === 'OUI').length;

    // KPI: Taux de Maintien
    const dossiersFermes = prevExpUsers.filter(u => u.prevExpDossierOuvert === 'NON');
    const dossiersMaintenus = dossiersFermes.filter(u => u.prevExpMaintienLogement === 'Oui').length;
    const tauxMaintien = dossiersFermes.length > 0 ? (dossiersMaintenus / dossiersFermes.length) * 100 : 0;

    // KPI: Motifs d'Expulsion
    const motifsCount: { [key: string]: number } = {};
    prevExpUsers.forEach(user => {
        if (user.prevExpMotifRequete) {
            const motifs = user.prevExpMotifRequete.split(',').map(m => m.trim()).filter(Boolean);
            motifs.forEach(motif => { motifsCount[motif] = (motifsCount[motif] || 0) + 1; });
        }
    });
    const motifsData = Object.entries(motifsCount)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8);

    // KPI: Timeline des Expulsions
    const threeMonthsLater = new Date();
    threeMonthsLater.setMonth(now.getMonth() + 3);

    const expulsionTimelineMap: { [key: string]: { count: number; users: { id: string; nom: string }[] } } = {};
    prevExpUsers.forEach(user => {
        if (user.prevExpDateExpulsion) {
            const date = new Date(user.prevExpDateExpulsion);
            if (date >= now && date <= threeMonthsLater) {
                const dateKey = date.toISOString().split('T')[0];
                if (!expulsionTimelineMap[dateKey]) {
                    expulsionTimelineMap[dateKey] = { count: 0, users: [] };
                }
                expulsionTimelineMap[dateKey].count++;
                expulsionTimelineMap[dateKey].users.push({
                    id: user.id,
                    nom: `${user.nom} ${user.prenom}`
                });
            }
        }
    });

    const expulsionTimeline = Object.entries(expulsionTimelineMap)
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // KPI: Issue des Dossiers
    const solutionCount: { [key: string]: number } = {};
    prevExpUsers.forEach(user => {
        if (user.prevExpSolutionRelogement) {
            const solutions = user.prevExpSolutionRelogement.split(',').map(s => s.trim()).filter(Boolean);
            solutions.forEach(solution => { solutionCount[solution] = (solutionCount[solution] || 0) + 1; });
        }
    });

    const solutionData = Object.entries(solutionCount).map(([name, value]) => ({
        name, value, group: groupSolution(name)
    }));

    // KPI: Demandes CPAS
    const cpasCount: { [key: string]: number } = {};
    prevExpUsers.forEach(user => {
        if (user.prevExpDemandeCpas) {
            const demandes = user.prevExpDemandeCpas.split(',').map(d => d.trim()).filter(Boolean);
            demandes.forEach(demande => { cpasCount[demande] = (cpasCount[demande] || 0) + 1; });
        }
    });
    const cpasData = Object.entries(cpasCount)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

    // KPI: Entonnoir Juridique
    const funnelStats = {
        audiencePassed: prevExpUsers.filter(u => u.prevExpDateAudience && new Date(u.prevExpDateAudience) < now).length,
        jugementPassed: prevExpUsers.filter(u => u.prevExpDateJugement && new Date(u.prevExpDateJugement) < now).length,
        expulsionFuture: prevExpUsers.filter(u => u.prevExpDateExpulsion && new Date(u.prevExpDateExpulsion) > now).length,
        total: prevExpUsers.length
    };

    // KPI: Qualité du Logement
    const housingQualityCount: { [key: string]: number } = {};
    prevExpUsers.forEach(user => {
        if (user.prevExpEtatLogement) {
            const etats = user.prevExpEtatLogement.split(',').map(e => e.trim()).filter(Boolean);
            etats.forEach(etat => { housingQualityCount[etat] = (housingQualityCount[etat] || 0) + 1; });
        }
    });
    const housingQualityData = Object.entries(housingQualityCount).map(([name, value]) => ({ name, value }));

    // Profil du Public
    const ageGroups: { [key: string]: number } = {
        '0-18 ans': 0, '19-30 ans': 0, '31-45 ans': 0, '46-60 ans': 0, '61+ ans': 0, 'Non spécifié': 0
    };
    const genreCount: { [key: string]: number } = {};

    prevExpUsers.forEach(user => {
        if (user.dateNaissance) {
            const age = new Date().getFullYear() - new Date(user.dateNaissance).getFullYear();
            if (age <= 18) ageGroups['0-18 ans']++;
            else if (age <= 30) ageGroups['19-30 ans']++;
            else if (age <= 45) ageGroups['31-45 ans']++;
            else if (age <= 60) ageGroups['46-60 ans']++;
            else ageGroups['61+ ans']++;
        } else ageGroups['Non spécifié']++;
        if (user.genre) genreCount[user.genre] = (genreCount[user.genre] || 0) + 1;
    });

    return {
        totalPrevExp: prevExpUsers.length,
        dossiersOuvertsCount,
        expulsionsEviteesCount: dossiersMaintenus,
        tauxMaintien,
        solutionData,
        cpasData,
        funnelStats,
        housingQualityData,
        motifsData,
        expulsionTimeline,
        profilPublic: {
            parAge: Object.entries(ageGroups).map(([name, value]) => ({ name, value })).filter(i => i.value > 0),
            parGenre: Object.entries(genreCount).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
            parCompositionFamiliale: []
        }
    };
};
