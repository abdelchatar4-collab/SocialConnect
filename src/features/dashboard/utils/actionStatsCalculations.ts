/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Action Statistics Calculations
Extracted from dashboardCalculations.ts for maintainability
*/

import { User, Gestionnaire } from '@/types';
import { ActionStatsItem, ActionStatsByAntenneItem } from '../types/dashboard';
import { getCachedUserActions, clearUserActionsCache } from './dashboardUtils';

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
    clearUserActionsCache();

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

        tsrActionStats[tsrId].totalActions += userActions.length;

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

    const actionStatsByTSR: ActionStatsItem[] = Object.values(tsrActionStats).map(tsr => {
        const monthsWithActions = Object.keys(tsr.actionsByMonth).length;
        const averagePerMonth = monthsWithActions > 0 ? tsr.totalActions / monthsWithActions : 0;
        return { ...tsr, averagePerMonth, averagePerYear: tsr.totalActions };
    }).sort((a, b) => b.totalActions - a.totalActions);

    const totalTSRs = actionStatsByTSR.length;
    const totalActions = actionStatsByTSR.reduce((sum, tsr) => sum + tsr.totalActions, 0);

    return {
        actionStatsByTSR,
        averageActionsPerTSR: totalTSRs > 0 ? totalActions / totalTSRs : 0,
        averageActionsPerMonth: actionStatsByTSR.reduce((sum, tsr) => sum + tsr.averagePerMonth, 0) / (totalTSRs || 1),
        averageActionsPerYear: actionStatsByTSR.reduce((sum, tsr) => sum + tsr.averagePerYear, 0) / (totalTSRs || 1)
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
    const antenneAnalysis: { [antenneName: string]: { users: number; tsrSet: Set<string> } } = {};

    users.forEach((user) => {
        const antenneName = user.antenne || 'Non spécifiée';
        const tsrId = typeof user.gestionnaire === 'string'
            ? user.gestionnaire
            : user.gestionnaire?.id || 'non-assigne';

        const userActions: any[] = getCachedUserActions(user);

        if (!antenneAnalysis[antenneName]) {
            antenneAnalysis[antenneName] = { users: 0, tsrSet: new Set() };
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

        antenneActionStats[antenneName].totalActions += userActions.length;

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

    Object.entries(antenneAnalysis).forEach(([antenneName, analysis]) => {
        antenneActionStats[antenneName].numberOfTSR = analysis.tsrSet.size;
        antenneActionStats[antenneName].numberOfUsers = analysis.users;
    });

    const actionStatsByAntenne: ActionStatsByAntenneItem[] = Object.values(antenneActionStats).map(antenne => {
        const monthsWithActions = Object.keys(antenne.actionsByMonth).length;
        const averagePerMonth = monthsWithActions > 0 ? antenne.totalActions / monthsWithActions : 0;
        return { ...antenne, averagePerMonth, averagePerYear: antenne.totalActions };
    }).sort((a, b) => b.totalActions - a.totalActions);

    const totalAntennes = actionStatsByAntenne.length;
    const totalActions = actionStatsByAntenne.reduce((sum, antenne) => sum + antenne.totalActions, 0);

    return {
        actionStatsByAntenne,
        averageActionsPerAntenne: totalAntennes > 0 ? totalActions / totalAntennes : 0,
        averageActionsPerMonth: actionStatsByAntenne.reduce((sum, antenne) => sum + antenne.averagePerMonth, 0) / (totalAntennes || 1),
        averageActionsPerYear: actionStatsByAntenne.reduce((sum, antenne) => sum + antenne.averagePerYear, 0) / (totalAntennes || 1)
    };
};
