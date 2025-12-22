/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

/**
 * Dashboard Calculation Logic
 * Extracted from Dashboard.tsx for better maintainability and testing
 */

import { User, Gestionnaire } from '@/types';
import {
    DashboardStats,
    ActionStatsItem,
    ActionStatsByAntenneItem,
    PrevExpStats,
    HousingStats,
    ChartDataItem,
    TimelineDataItem,
    AgeGroups,
    CountByField,
    ProblematicApiData
} from '../types/dashboard';
import {
    getCachedUserActions,
    clearUserActionsCache,
    safePercent
} from './dashboardUtils';

/**
 * Helper to get gestionnaire display name for calculations
 */
export const getGestionnaireDisplayName = (
    gestionnaireId: string | null | undefined,
    gestionnaires: Gestionnaire[]
): string => {
    if (!gestionnaireId) return 'Non assigné';

    const gestionnaire = gestionnaires.find(g => g.id === gestionnaireId);
    if (gestionnaire) {
        return `${gestionnaire.prenom || ''} ${gestionnaire.nom || ''}`.trim();
    }

    return `Gestionnaire ${gestionnaireId.slice(0, 8)}...`;
};

/**
 * Calculates action statistics by TSR
 */
export const calculateActionStatsByTSR = (
    users: User[],
    gestionnaires: Gestionnaire[]
): {
    actionStatsByTSR: ActionStatsItem[];
    averageActionsPerTSR: number;
    averageActionsPerMonth: number;
    averageActionsPerYear: number;
} => {
    const tsrActionStats: { [tsrId: string]: ActionStatsItem } = {};

    // Vider le cache pour recalculer les actions à chaque fois
    clearUserActionsCache();

    // Analyser les gestionnaires et leurs actions
    users.forEach((user) => {
        const tsrId = typeof user.gestionnaire === 'string'
            ? user.gestionnaire
            : user.gestionnaire?.id || 'non-assigne';

        const tsrName = getGestionnaireDisplayName(tsrId, gestionnaires);
        const userActions = getCachedUserActions(user);

        if (!tsrActionStats[tsrId]) {
            tsrActionStats[tsrId] = {
                tsr: tsrName,
                totalActions: 0,
                averagePerMonth: 0,
                averagePerYear: 0,
                actionsByMonth: {}
            };
        }

        // Compter les actions de l'utilisateur
        tsrActionStats[tsrId].totalActions += userActions.length;

        // Grouper par mois pour calculer les moyennes
        userActions.forEach(action => {
            if (action.date) {
                const actionDate = typeof action.date === 'string' ? new Date(action.date) : action.date;
                const monthKey = `${actionDate.getFullYear()}-${actionDate.getMonth() + 1}`;

                if (!tsrActionStats[tsrId].actionsByMonth[monthKey]) {
                    tsrActionStats[tsrId].actionsByMonth[monthKey] = 0;
                }
                tsrActionStats[tsrId].actionsByMonth[monthKey]++;
            }
        });
    });

    // Calculer les moyennes pour chaque TSR
    const actionStatsByTSR: ActionStatsItem[] = Object.values(tsrActionStats).map(tsr => {
        const monthsWithActions = Object.keys(tsr.actionsByMonth).length;
        const averagePerMonth = monthsWithActions > 0 ? tsr.totalActions / monthsWithActions : 0;
        const averagePerYear = tsr.totalActions;

        return {
            ...tsr,
            averagePerMonth,
            averagePerYear
        };
    }).sort((a, b) => b.totalActions - a.totalActions);

    // Calculer les moyennes globales
    const totalTSRs = actionStatsByTSR.length;
    const totalActions = actionStatsByTSR.reduce((sum, tsr) => sum + tsr.totalActions, 0);
    const averageActionsPerTSR = totalTSRs > 0 ? totalActions / totalTSRs : 0;
    const averageActionsPerMonth = actionStatsByTSR.reduce((sum, tsr) => sum + tsr.averagePerMonth, 0) / (totalTSRs || 1);
    const averageActionsPerYear = actionStatsByTSR.reduce((sum, tsr) => sum + tsr.averagePerYear, 0) / (totalTSRs || 1);

    return {
        actionStatsByTSR,
        averageActionsPerTSR,
        averageActionsPerMonth,
        averageActionsPerYear
    };
};

/**
 * Calculates action statistics by antenne
 */
export const calculateActionStatsByAntenne = (users: User[]): {
    actionStatsByAntenne: ActionStatsByAntenneItem[];
    averageActionsPerAntenne: number;
    averageActionsPerMonth: number;
    averageActionsPerYear: number;
} => {
    const antenneActionStats: { [antenneName: string]: ActionStatsByAntenneItem } = {};
    const antenneAnalysis: {
        [antenneName: string]: {
            users: number;
            tsrSet: Set<string>;
        }
    } = {};

    // Analyser les antennes et leurs actions
    users.forEach((user) => {
        const antenneName = user.antenne || 'Non spécifiée';
        const tsrId = typeof user.gestionnaire === 'string'
            ? user.gestionnaire
            : user.gestionnaire?.id || 'non-assigne';

        const userActions: any[] = getCachedUserActions(user);

        if (!antenneAnalysis[antenneName]) {
            antenneAnalysis[antenneName] = {
                users: 0,
                tsrSet: new Set()
            };
        }

        antenneAnalysis[antenneName].users++;
        antenneAnalysis[antenneName].tsrSet.add(tsrId);

        if (!antenneActionStats[antenneName]) {
            antenneActionStats[antenneName] = {
                antenne: antenneName,
                totalActions: 0,
                averagePerMonth: 0,
                averagePerYear: 0,
                actionsByMonth: {},
                numberOfTSR: 0,
                numberOfUsers: 0
            };
        }

        // Compter les actions de l'utilisateur
        antenneActionStats[antenneName].totalActions += userActions.length;

        // Grouper par mois pour calculer les moyennes
        userActions.forEach(action => {
            if (action.date) {
                const actionDate = typeof action.date === 'string' ? new Date(action.date) : action.date;
                const monthKey = `${actionDate.getFullYear()}-${actionDate.getMonth() + 1}`;

                if (!antenneActionStats[antenneName].actionsByMonth[monthKey]) {
                    antenneActionStats[antenneName].actionsByMonth[monthKey] = 0;
                }
                antenneActionStats[antenneName].actionsByMonth[monthKey]++;
            }
        });
    });

    // Finaliser les statistiques par antenne
    Object.entries(antenneAnalysis).forEach(([antenneName, analysis]) => {
        antenneActionStats[antenneName].numberOfTSR = analysis.tsrSet.size;
        antenneActionStats[antenneName].numberOfUsers = analysis.users;
    });

    // Calculer les moyennes pour chaque antenne
    const actionStatsByAntenne: ActionStatsByAntenneItem[] = Object.values(antenneActionStats).map(antenne => {
        const monthsWithActions = Object.keys(antenne.actionsByMonth).length;
        const averagePerMonth = monthsWithActions > 0 ? antenne.totalActions / monthsWithActions : 0;
        const averagePerYear = antenne.totalActions;

        return {
            ...antenne,
            averagePerMonth,
            averagePerYear
        };
    }).sort((a, b) => b.totalActions - a.totalActions);

    // Calculer les moyennes globales
    const totalAntennes = actionStatsByAntenne.length;
    const totalActions = actionStatsByAntenne.reduce((sum, antenne) => sum + antenne.totalActions, 0);
    const averageActionsPerAntenne = totalAntennes > 0 ? totalActions / totalAntennes : 0;
    const averageActionsPerMonth = actionStatsByAntenne.reduce((sum, antenne) => sum + antenne.averagePerMonth, 0) / (totalAntennes || 1);
    const averageActionsPerYear = actionStatsByAntenne.reduce((sum, antenne) => sum + antenne.averagePerYear, 0) / (totalAntennes || 1);

    return {
        actionStatsByAntenne,
        averageActionsPerAntenne,
        averageActionsPerMonth,
        averageActionsPerYear
    };
};

/**
 * Calculates PrevExp statistics
 */
export const calculatePrevExpStats = (users: User[]): PrevExpStats | null => {
    const prevExpUsers = users.filter(u => u.hasPrevExp);

    if (prevExpUsers.length === 0) {
        return null;
    }

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
            motifs.forEach(motif => {
                motifsCount[motif] = (motifsCount[motif] || 0) + 1;
            });
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
            solutions.forEach(solution => {
                solutionCount[solution] = (solutionCount[solution] || 0) + 1;
            });
        }
    });

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

    const solutionData = Object.entries(solutionCount).map(([name, value]) => ({
        name,
        value,
        group: groupSolution(name)
    }));

    // KPI: Demandes CPAS
    const cpasCount: { [key: string]: number } = {};
    prevExpUsers.forEach(user => {
        if (user.prevExpDemandeCpas) {
            const demandes = user.prevExpDemandeCpas.split(',').map(d => d.trim()).filter(Boolean);
            demandes.forEach(demande => {
                cpasCount[demande] = (cpasCount[demande] || 0) + 1;
            });
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
            etats.forEach(etat => {
                housingQualityCount[etat] = (housingQualityCount[etat] || 0) + 1;
            });
        }
    });

    const housingQualityData = Object.entries(housingQualityCount).map(([name, value]) => ({
        name,
        value
    }));

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

/**
 * Calculates Housing statistics
 */
export const calculateHousingStats = (users: User[]): HousingStats | null => {
    const housingUsers = users.filter(u => u.logementDetails && typeof u.logementDetails === 'object');
    if (housingUsers.length === 0) return null;

    let totalLoyer = 0, countLoyer = 0, countSocial = 0;
    const typeLogementCount: { [key: string]: number } = {};
    const loyerRanges = { '0-300€': 0, '301-500€': 0, '501-700€': 0, '701-900€': 0, '901€+': 0 };

    housingUsers.forEach(user => {
        const details = user.logementDetails as any;
        if (details.loyer) {
            const loyer = parseFloat(details.loyer.toString().replace(',', '.').replace(/[^\d.-]/g, ''));
            if (!isNaN(loyer) && loyer > 0) {
                totalLoyer += loyer; countLoyer++;
                if (loyer <= 300) loyerRanges['0-300€']++;
                else if (loyer <= 500) loyerRanges['301-500€']++;
                else if (loyer <= 700) loyerRanges['501-700€']++;
                else if (loyer <= 900) loyerRanges['701-900€']++;
                else loyerRanges['901€+']++;
            }
        }
        if (details.typeLogement) {
            const type = details.typeLogement.trim();
            typeLogementCount[type] = (typeLogementCount[type] || 0) + 1;
            if (type.toLowerCase().includes('social') || type.toLowerCase().includes('ais')) countSocial++;
        }
    });

    return {
        totalLogement: housingUsers.length,
        loyerMoyen: countLoyer > 0 ? totalLoyer / countLoyer : 0,
        partLogementSocial: housingUsers.length > 0 ? (countSocial / housingUsers.length) * 100 : 0,
        typeLogementData: Object.entries(typeLogementCount).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
        loyerRangeData: Object.entries(loyerRanges).map(([name, value]) => ({ name, value }))
    };
};

/**
 * Get urgent actions
 */
export const getUrgentActions = (users: User[]) => {
    const now = new Date();
    return users
        .filter(u => u.prevExpDossierOuvert === 'OUI' || (u.prevExpDateExpulsion && new Date(u.prevExpDateExpulsion) > now))
        .map(u => ({
            id: u.id, nom: u.nom, prenom: u.prenom, dossierOuvert: u.prevExpDossierOuvert,
            dateExpulsion: u.prevExpDateExpulsion, gestionnaire: u.gestionnaire
        }))
        .sort((a, b) => {
            if (a.dateExpulsion && b.dateExpulsion) return new Date(a.dateExpulsion).getTime() - new Date(b.dateExpulsion).getTime();
            if (a.dossierOuvert === 'OUI' && b.dossierOuvert !== 'OUI') return -1;
            if (a.dossierOuvert !== 'OUI' && b.dossierOuvert === 'OUI') return 1;
            return 0;
        })
        .slice(0, 5);
};

/**
 * Generates summary text for the dashboard
 */
export const generateSummaryText = (stats: DashboardStats): string => {
    if (!stats) return "Aucune donnée disponible pour générer une synthèse.";

    const summaryParts: string[] = [];
    summaryParts.push(`📊 **Synthèse analytique du tableau de bord**`);
    summaryParts.push(`\n\n**Vue d'ensemble :** Le système de gestion des usagers compte actuellement **${stats.total} dossiers** au total.`);

    if (stats.pourcentageActifs) {
        const tauxActivite = stats.pourcentageActifs.toFixed(1);
        const interpretation = parseFloat(tauxActivite) > 70 ? "excellent" : parseFloat(tauxActivite) > 50 ? "satisfaisant" : "nécessitant une attention particulière";
        summaryParts.push(`\n\n**Taux d'activité :** ${tauxActivite}% des dossiers sont actuellement actifs, ce qui représente un niveau d'engagement ${interpretation}.`);
    }

    if (stats.actionStatsByAntenne?.length > 0 && stats.averageActionsPerAntenne !== undefined) {
        const topAntenne = stats.actionStatsByAntenne[0];
        summaryParts.push(`\n\n**Performance par antenne :** En moyenne, chaque antenne gère **${stats.averageActionsPerAntenne.toFixed(1)} actions**. L'antenne la plus active (${topAntenne.antenne}) a traité **${topAntenne.totalActions} actions**.`);
    }

    if (stats.parSecteur?.length > 0) {
        const topSectors = stats.parSecteur.slice(0, 3);
        const sectorSummary = topSectors.map(s => `**${s.name}** (${s.value} usagers, ${((s.value / stats.total) * 100).toFixed(1)}%)`).join(", ");
        summaryParts.push(`\n\n**Répartition sectorielle :** Les secteurs d'intervention prioritaires sont : ${sectorSummary}.`);
    }

    if (stats.parProblematique?.length > 0) {
        const topIssues = stats.parProblematique.slice(0, 3);
        const issuesSummary = topIssues.map(p => `**${p.name}** (${p.value} cas)`).join(", ");
        summaryParts.push(`\n\n**Problématiques dominantes :** Les enjeux les plus fréquemment rencontrés sont : ${issuesSummary}.`);
    }

    return summaryParts.join("");
};

/**
 * Main statistics calculation function
 */
export const calculateStatistics = (
    users: User[],
    gestionnaires: Gestionnaire[]
): DashboardStats => {
    if (!users?.length) {
        return {
            total: 0, percentageActifs: 0, totalProblematiques: 0, parAntenne: [], parProblematique: [],
            parAge: [], parGenre: [], parSecteur: [], gestionnaireData: [], statutSocialData: [],
            actionTimelineData: [], actionStatsByAntenne: [], averageActionsPerAntenne: 0,
            averageActionsPerMonth: 0, averageActionsPerYear: 0
        } as any;
    }

    const total = users.length;
    const actifs = users.filter(u => u.etat === "Actif").length;
    const pourcentageActifs = safePercent(actifs, total);

    // Secteurs
    const secteurCount: CountByField = {};
    users.forEach(u => { secteurCount[u.secteur || 'Non spécifié'] = (secteurCount[u.secteur || 'Non spécifié'] || 0) + 1; });
    const parSecteur = Object.entries(secteurCount).map(([name, value]) => ({ name, value })).filter(i => i.value > 0).sort((a, b) => b.value - a.value);

    // Problématiques
    const probCount: CountByField = {};
    users.forEach(u => u.problematiques?.forEach(p => { if (p.type) probCount[p.type] = (probCount[p.type] || 0) + 1; }));
    const parProblematique = Object.entries(probCount).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    const totalProblematiques = new Set(users.filter(u => u.problematiques?.some(p => p.type === "Administratif" || p.type === "Logement")).map(u => u.id)).size;

    // Genre
    const genreCount: CountByField = {};
    users.forEach(u => {
        const g = u.genre?.toLowerCase() === 'homme' ? 'Homme' : u.genre?.toLowerCase() === 'femme' ? 'Femme' : 'Non spécifié';
        genreCount[g] = (genreCount[g] || 0) + 1;
    });

    // Antenne
    const antenneCount: CountByField = {};
    users.forEach(u => { antenneCount[u.antenne || 'Non spécifié'] = (antenneCount[u.antenne || 'Non spécifié'] || 0) + 1; });
    const parAntenne = Object.entries(antenneCount).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

    // Gestionnaires
    const gestCount: CountByField = {};
    users.forEach(u => {
        const id = typeof u.gestionnaire === 'string' ? u.gestionnaire : u.gestionnaire?.id;
        const name = getGestionnaireDisplayName(id, gestionnaires);
        gestCount[name] = (gestCount[name] || 0) + 1;
    });
    const gestionnaireData = Object.entries(gestCount).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

    // Age
    const ages: AgeGroups = { '0-18 ans': 0, '19-30 ans': 0, '31-45 ans': 0, '46-60 ans': 0, '61+ ans': 0, 'Non spécifié': 0 };
    users.forEach(u => {
        if (u.dateNaissance) {
            const age = new Date().getFullYear() - new Date(u.dateNaissance).getFullYear();
            if (age <= 18) ages['0-18 ans']++; else if (age <= 30) ages['19-30 ans']++;
            else if (age <= 45) ages['31-45 ans']++; else if (age <= 60) ages['46-60 ans']++; else ages['61+ ans']++;
        } else ages['Non spécifié']++;
    });

    // Statut social
    const statutCount: CountByField = {};
    users.forEach(u => { statutCount[u.statutSejour || 'Non spécifié'] = (statutCount[u.statutSejour || 'Non spécifié'] || 0) + 1; });

    // Timeline
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    const curYear = new Date().getFullYear();
    const timeline = months.map((m, i) => ({
        name: m,
        actions: users.filter(u => u.dateOuverture && new Date(u.dateOuverture).getFullYear() === curYear && new Date(u.dateOuverture).getMonth() === i).length
    }));

    const actionStats = calculateActionStatsByAntenne(users);

    return {
        total, pourcentageActifs: Math.min(pourcentageActifs, 100), totalProblematiques,
        parAntenne, parProblematique, parAge: Object.entries(ages).map(([name, value]) => ({ name, value })),
        parGenre: Object.entries(genreCount).map(([name, value]) => ({ name, value })),
        parSecteur, gestionnaireData, statutSocialData: Object.entries(statutCount).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
        actionTimelineData: timeline, ...actionStats
    };
};
