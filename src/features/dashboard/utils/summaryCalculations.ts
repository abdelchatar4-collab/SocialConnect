/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Dashboard Summary Generation
Extracted from dashboardCalculations.ts for maintainability
*/

import { DashboardStats } from '../types/dashboard';

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
        const interpretation = parseFloat(tauxActivite) > 70 ? "excellent" :
            parseFloat(tauxActivite) > 50 ? "satisfaisant" : "nécessitant une attention particulière";
        summaryParts.push(`\n\n**Taux d'activité :** ${tauxActivite}% des dossiers sont actuellement actifs, ce qui représente un niveau d'engagement ${interpretation}.`);
    }

    if (stats.actionStatsByAntenne?.length > 0 && stats.averageActionsPerAntenne !== undefined) {
        const topAntenne = stats.actionStatsByAntenne[0];
        summaryParts.push(`\n\n**Performance par antenne :** En moyenne, chaque antenne gère **${stats.averageActionsPerAntenne.toFixed(1)} actions**. L'antenne la plus active (${topAntenne.antenne}) a traité **${topAntenne.totalActions} actions**.`);
    }

    if (stats.parSecteur?.length > 0) {
        const topSectors = stats.parSecteur.slice(0, 3);
        const sectorSummary = topSectors.map(s =>
            `**${s.name}** (${s.value} usagers, ${((s.value / stats.total) * 100).toFixed(1)}%)`
        ).join(", ");
        summaryParts.push(`\n\n**Répartition sectorielle :** Les secteurs d'intervention prioritaires sont : ${sectorSummary}.`);
    }

    if (stats.parProblematique?.length > 0) {
        const topIssues = stats.parProblematique.slice(0, 3);
        const issuesSummary = topIssues.map(p => `**${p.name}** (${p.value} cas)`).join(", ");
        summaryParts.push(`\n\n**Problématiques dominantes :** Les enjeux les plus fréquemment rencontrés sont : ${issuesSummary}.`);
    }

    return summaryParts.join("");
};
