/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Dashboard Statistics Calculation
Extracted from DashboardProvider.tsx for maintainability
*/

import { User } from '@/types';
import { DashboardStats, KPIData } from '../types/modernDashboard';

/**
 * Calculate age distribution from user list
 */
export const calculateAgeDistribution = (userList: User[]) => {
    const ageGroups: Record<string, number> = {
        '0-18 ans': 0,
        '19-30 ans': 0,
        '31-45 ans': 0,
        '46-60 ans': 0,
        '61+ ans': 0,
        'Non spécifié': 0,
    };

    const now = new Date();
    userList.forEach(u => {
        if (!u.dateNaissance) {
            ageGroups['Non spécifié']++;
            return;
        }
        const birthDate = new Date(u.dateNaissance);
        const age = now.getFullYear() - birthDate.getFullYear();

        if (age <= 18) ageGroups['0-18 ans']++;
        else if (age <= 30) ageGroups['19-30 ans']++;
        else if (age <= 45) ageGroups['31-45 ans']++;
        else if (age <= 60) ageGroups['46-60 ans']++;
        else ageGroups['61+ ans']++;
    });

    return Object.entries(ageGroups)
        .map(([name, value]) => ({ name, value }))
        .filter(item => item.value > 0);
};

/**
 * Calculate timeline data (openings per month)
 */
export const calculateTimelineData = (userList: User[], selectedYear: number) => {
    const months: Record<string, number> = {};
    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

    userList.forEach(u => {
        if (u.dateOuverture) {
            const date = new Date(u.dateOuverture);
            const year = date.getFullYear();
            if (year === selectedYear) {
                const monthKey = monthNames[date.getMonth()];
                months[monthKey] = (months[monthKey] || 0) + 1;
            }
        }
    });

    return monthNames.map(name => ({
        name,
        value: months[name] || 0,
    }));
};

/**
 * Calculate complete dashboard statistics from user list
 */
export const calculateDashboardStats = (userList: User[], selectedYear: number): DashboardStats => {
    // Defensive check
    if (!userList || !Array.isArray(userList)) {
        userList = [];
    }

    const total = userList.length;
    const actifs = userList.filter(u => u.etat === 'Actif' || u.etat === 'En cours').length;
    const pourcentageActifs = total > 0 ? (actifs / total) * 100 : 0;

    // Count problematiques
    const totalProblematiques = userList.reduce((acc, u) =>
        acc + (u.problematiques?.length || 0), 0);

    // Count by antenne
    const antenneCount: Record<string, number> = {};
    userList.forEach(u => {
        const antenne = u.antenne || 'Non spécifié';
        antenneCount[antenne] = (antenneCount[antenne] || 0) + 1;
    });
    const parAntenne = Object.entries(antenneCount)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

    // Count by gestionnaire
    const gestionnaireCount: Record<string, number> = {};
    userList.forEach(u => {
        let gName = 'Non assigné';
        if (u.gestionnaire) {
            if (typeof u.gestionnaire === 'object') {
                gName = `${u.gestionnaire.prenom || ''} ${u.gestionnaire.nom || ''}`.trim() || 'Non assigné';
            }
        }
        gestionnaireCount[gName] = (gestionnaireCount[gName] || 0) + 1;
    });
    const gestionnaireData = Object.entries(gestionnaireCount)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

    // Count by age
    const parAge = calculateAgeDistribution(userList);

    // Count by genre (with normalization)
    const genreCount: Record<string, number> = {};
    userList.forEach(u => {
        const genre = u.genre || 'Non spécifié';
        const normalizedGenre =
            genre.toLowerCase() === 'homme' ? 'Homme' :
                genre.toLowerCase() === 'femme' ? 'Femme' :
                    genre.toLowerCase() === 'autre' ? 'Autre' :
                        genre;
        genreCount[normalizedGenre] = (genreCount[normalizedGenre] || 0) + 1;
    });
    const parGenre = Object.entries(genreCount)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

    // Count by secteur
    const secteurCount: Record<string, number> = {};
    userList.forEach(u => {
        const secteur = u.secteur || 'Non spécifié';
        secteurCount[secteur] = (secteurCount[secteur] || 0) + 1;
    });
    const parSecteur = Object.entries(secteurCount)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

    // Count by problematique
    const probCount: Record<string, number> = {};
    userList.forEach(u => {
        u.problematiques?.forEach(p => {
            const type = (typeof p === 'string' ? p : p.type) || 'Non spécifié';
            probCount[type] = (probCount[type] || 0) + 1;
        });
    });
    const parProblematique = Object.entries(probCount)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

    // Timeline data
    const actionTimelineData = calculateTimelineData(userList, selectedYear);

    // Count PrevExp
    const prevExpCount = userList.filter(u => u.hasPrevExp).length;

    // Count actions this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const actionsThisMonth = userList.reduce((acc, u) => {
        const actions = u.actions?.filter(a => {
            if (!a.date) return false;
            const actionDate = new Date(a.date);
            return actionDate >= startOfMonth;
        });
        return acc + (actions?.length || 0);
    }, 0);

    // Build KPIs
    const kpis = {
        totalUsers: {
            value: total,
            label: 'Total Usagers',
            trend: { value: 12, direction: 'up' as const, period: 'ce mois' },
            color: '#008C7A',
        },
        activeCases: {
            value: actifs,
            label: 'Dossiers Actifs',
            trend: { value: pourcentageActifs, direction: 'stable' as const, period: 'du total' },
            color: '#00B4A7',
        },
        prevExp: {
            value: prevExpCount,
            label: 'Prévention Expulsion',
            color: '#EF4444',
        },
        actionsThisMonth: {
            value: actionsThisMonth,
            label: 'Actions ce mois',
            color: '#3B82F6',
        },
    };

    return {
        total,
        pourcentageActifs,
        totalProblematiques,
        parAntenne,
        parProblematique,
        parAge,
        parGenre,
        parSecteur,
        gestionnaireData,
        actionTimelineData,
        kpis,
    };
};
