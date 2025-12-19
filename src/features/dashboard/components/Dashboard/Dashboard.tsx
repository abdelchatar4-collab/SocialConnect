/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

"use client";
/**
 * Dashboard Component - ACTIVE VERSION (TypeScript)
 * --------------------------------------------------
 * This is the currently active Dashboard component used in the application.
 * It utilizes the 'recharts' library for data visualization.
 *
 * Converted from JavaScript to TypeScript for better type safety.
 * Location: src/features/dashboard/components/Dashboard/Dashboard.tsx
 */

import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { User, Gestionnaire } from '@/types';
import {
  DashboardProps,
  DashboardStats,
  ChartDataItem,
  TimelineDataItem,
  AgeGroups,
  CountByField,
  ProblematicApiData,
  ActionStatsItem,
  ActionStatsByAntenneItem
} from '../../types/dashboard';
import { extractActionsFromNotes as extractActionsFromNotesUtils, deduplicateActions, deduplicateActionsSuivi, getLastThreeActions } from '@/utils/actionUtils';
import { PASQ_COLORS, RECHARTS_COLORS } from '../../constants/pasqTheme';

// Use PASQ color palette for all charts
const COLORS = RECHARTS_COLORS;

// Helper function to generate PASQ gradient colors for bar charts
// Each bar gets a different shade from the PASQ palette (like in the HTML report)
const getPasqBarColors = (count: number): string[] => {
  const pasqGradient = [
    PASQ_COLORS.clair,      // #66D1C9 - Light
    PASQ_COLORS.interClair, // #33C7B6 - Medium-light
    PASQ_COLORS.normal,     // #00B4A7 - Standard
    PASQ_COLORS.interFonce, // #009F8D - Medium-dark
    PASQ_COLORS.fonce,      // #008C7A - Dark
  ];

  // Repeat pattern if more colors needed
  const colors: string[] = [];
  for (let i = 0; i < count; i++) {
    colors.push(pasqGradient[i % pasqGradient.length]);
  }
  return colors;
};

const getUserActionsWithDeduplication = (user: any): any[] => {
  if (user.actions && user.actions.length > 0) {
    return deduplicateActions(user.actions);
  } else if (user.actionsSuivi && user.actionsSuivi.length > 0) {
    return deduplicateActionsSuivi(user.actionsSuivi);
  } else if (user.notesGenerales) {
    return deduplicateActions(extractActionsFromNotesUtils(user.notesGenerales));
  }
  return [];
};

// Puis utiliser un cache pour éviter les recalculs
const userActionsCache = new Map<string, any[]>();

const getCachedUserActions = (user: any): any[] => {
  // Use a more robust user ID, e.g., combining ID, nom, and prenom if ID can be null
  const userId = user.id || `${user.nom || ''}-${user.prenom || ''}`;

  if (!userActionsCache.has(userId)) {
    userActionsCache.set(userId, getUserActionsWithDeduplication(user));
  }

  return userActionsCache.get(userId)!;
};

// Fonction pour tronquer le texte de synthèse
const getTruncatedSummary = (fullText: string, maxLength: number = 300): { text: string; isTruncated: boolean } => {
  if (fullText.length <= maxLength) {
    return { text: fullText, isTruncated: false };
  }

  // Trouver le dernier espace avant la limite pour éviter de couper un mot
  const truncateIndex = fullText.lastIndexOf(' ', maxLength);
  const truncatedText = fullText.substring(0, truncateIndex > 0 ? truncateIndex : maxLength);

  return { text: truncatedText, isTruncated: true };
};

const Dashboard: React.FC<DashboardProps> = ({ users }) => {
  // États
  const [gestionnaires, setGestionnaires] = useState<Gestionnaire[]>([]);
  // Nouvel état pour gérer l'expansion de la synthèse
  const [isAnalysisExpanded, setIsAnalysisExpanded] = useState(false);

  // Charger les gestionnaires
  useEffect(() => {
    const fetchGestionnaires = async () => {
      try {
        const response = await fetch('/api/gestionnaires');
        if (response.ok) {
          const data = await response.json();
          setGestionnaires(data);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des gestionnaires:', error);
      }
    };
    fetchGestionnaires();
  }, []);

  // Fonction getGestionnaireDisplayName (AVANT calculateStatistics)
  const getGestionnaireDisplayName = (gestionnaireId: string | null | undefined): string => {
    if (!gestionnaireId) return 'Non assigné';

    const gestionnaire = gestionnaires.find(g => g.id === gestionnaireId);
    if (gestionnaire) {
      return `${gestionnaire.prenom || ''} ${gestionnaire.nom || ''}`.trim();
    }

    return `Gestionnaire ${gestionnaireId.slice(0, 8)}...`;
  };

  // Fonctions utilitaires
  const safeArrayAccess = <T,>(array: T[] | undefined): T[] => {
    return Array.isArray(array) ? array : [];
  };

  const safePercent = (numerator: number, denominator: number): number => {
    return denominator > 0 ? (numerator / denominator) * 100 : 0;
  };



  // Nouvelle fonction pour calculer les statistiques par TSR
  const calculateActionStatsByTSR = (users: User[]): {
    actionStatsByTSR: ActionStatsItem[];
    averageActionsPerTSR: number;
    averageActionsPerMonth: number;
    averageActionsPerYear: number;
  } => {
    const tsrActionStats: { [tsrId: string]: ActionStatsItem } = {};
    const gestionnaireAnalysis: {
      [tsrId: string]: {
        users: number;
        totalActions: number;
        userDetails: {
          nom: string;
          prenom: string;
          actionsCount: number;
          gestionnaire: any;
          tsrId: string;
          tsrName: string;
        }[];
      }
    } = {};
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    // Vider le cache pour recalculer les actions à chaque fois
    userActionsCache.clear();

    // Logs de débogage pour identifier le problème
    console.log('=== DÉBOGAGE CALCUL ACTIONS PAR TSR ===');
    console.log('Nombre total d\'utilisateurs:', users.length);

    // Rechercher spécifiquement Pauline
    const pauline = users.find(user =>
      user.gestionnaire &&
      (typeof user.gestionnaire === 'string'
        ? getGestionnaireDisplayName(user.gestionnaire).toLowerCase().includes('pauline')
        : user.gestionnaire.prenom?.toLowerCase().includes('pauline')
      )
    );

    if (pauline) {
      console.log('🔍 ANALYSE SPÉCIFIQUE DE PAULINE:');
      console.log('- Gestionnaire:', pauline.gestionnaire);
      console.log('- Nombre d\'actions récupérées (actions):', pauline.actions?.length || 0);
      console.log('- Nombre d\'actions récupérées (actionsSuivi):', pauline.actionsSuivi?.length || 0);
      console.log('- Détail des actions:', pauline.actions);
      console.log('- Détail des actionsSuivi:', pauline.actionsSuivi);
      console.log('- Structure complète de l\'utilisateur:', JSON.stringify(pauline, null, 2));

      // Vérifier quelle propriété contient réellement les données
      const actionsToUse = (pauline.actions?.length ?? 0) > 0 ? pauline.actions : pauline.actionsSuivi;
      console.log('- Actions à utiliser:', actionsToUse);
      console.log('- Nombre final d\'actions:', actionsToUse?.length || 0);
    } else {
      console.log('❌ Pauline non trouvée dans les données');
      console.log('Gestionnaires disponibles:', users.map(u => ({
        gestionnaire: u.gestionnaire,
        nom: getGestionnaireDisplayName(typeof u.gestionnaire === 'string' ? u.gestionnaire : u.gestionnaire?.id || 'non-assigne')
      })));
    }

    // Analyser les gestionnaires et leurs actions
    users.forEach((user, index) => {
      const tsrId = typeof user.gestionnaire === 'string'
        ? user.gestionnaire
        : user.gestionnaire?.id || 'non-assigne';

      const tsrName = getGestionnaireDisplayName(tsrId);

      const userActions = getCachedUserActions(user);

      // Initialiser l'analyse pour ce gestionnaire
      if (!gestionnaireAnalysis[tsrId]) {
        gestionnaireAnalysis[tsrId] = {
          users: 0,
          totalActions: 0,
          userDetails: []
        };
      }

      gestionnaireAnalysis[tsrId].users++;
      gestionnaireAnalysis[tsrId].totalActions += userActions.length;
      gestionnaireAnalysis[tsrId].userDetails.push({
        nom: user.nom || '',
        prenom: user.prenom || '',
        actionsCount: userActions.length,
        gestionnaire: user.gestionnaire,
        tsrId: tsrId,
        tsrName: tsrName
      });

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

    // Afficher l'analyse détaillée
    console.log('Analyse par gestionnaire:');
    Object.entries(gestionnaireAnalysis).forEach(([tsrId, analysis]) => {
      console.log(`\n--- ${getGestionnaireDisplayName(tsrId)} (ID: ${tsrId}) ---`);
      console.log(`Nombre d'utilisateurs: ${analysis.users}`);
      console.log(`Total actions: ${analysis.totalActions}`);
      console.log('Détail des utilisateurs:');
      analysis.userDetails.forEach((user: {
        nom: string;
        prenom: string;
        actionsCount: number;
        gestionnaire: any;
        tsrId: string;
        tsrName: string;
      }) => {
        console.log(`  - ${user.nom} ${user.prenom}: ${user.actionsCount} actions`);
        if (user.actionsCount === 0) {
          console.log(`    ⚠️ Utilisateur sans actions détecté!`);
        }
      });
    });

    console.log('\nRésultat final tsrActionStats:');
    Object.entries(tsrActionStats).forEach(([tsrId, stats]) => {
      console.log(`${stats.tsr}: ${stats.totalActions} actions`);
    });
    console.log('=====================================');

    // Calculer les moyennes pour chaque TSR
    const actionStatsByTSR: ActionStatsItem[] = Object.values(tsrActionStats).map(tsr => {
      const monthsWithActions = Object.keys(tsr.actionsByMonth).length;
      const averagePerMonth = monthsWithActions > 0 ? tsr.totalActions / monthsWithActions : 0;
      const averagePerYear = tsr.totalActions; // ou une autre logique selon vos besoins

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

  // Nouvelle fonction pour calculer les statistiques par antenne
  const calculateActionStatsByAntenne = (users: User[]): {
    actionStatsByAntenne: ActionStatsByAntenneItem[];
    averageActionsPerAntenne: number;
    averageActionsPerMonth: number;
    averageActionsPerYear: number;
  } => {
    const antenneActionStats: { [antenneName: string]: ActionStatsByAntenneItem } = {};
    const antenneAnalysis: {
      [antenneName: string]: {
        users: number;
        totalActions: number;
        tsrSet: Set<string>;
        userDetails: {
          nom: string;
          prenom: string;
          actionsCount: number;
          antenne: string;
          gestionnaire: any;
        }[];
      }
    } = {};

    console.log('=== CALCUL ACTIONS PAR ANTENNE ===');
    console.log('Nombre total d\'utilisateurs:', users.length);

    // Analyser les antennes et leurs actions
    users.forEach((user) => {
      const antenneName = user.antenne || 'Non spécifiée';
      const tsrId = typeof user.gestionnaire === 'string'
        ? user.gestionnaire
        : user.gestionnaire?.id || 'non-assigne';

      // Récupérer les actions de l'utilisateur via la fonction utilitaire et le cache
      const userActions: any[] = getCachedUserActions(user);

      // Initialiser l'analyse pour cette antenne
      if (!antenneAnalysis[antenneName]) {
        antenneAnalysis[antenneName] = {
          users: 0,
          totalActions: 0,
          tsrSet: new Set(),
          userDetails: []
        };
      }

      antenneAnalysis[antenneName].users++;
      antenneAnalysis[antenneName].totalActions += userActions.length;
      antenneAnalysis[antenneName].tsrSet.add(tsrId);
      antenneAnalysis[antenneName].userDetails.push({
        nom: user.nom || '',
        prenom: user.prenom || '',
        actionsCount: userActions.length,
        antenne: antenneName,
        gestionnaire: user.gestionnaire
      });

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

      console.log(`\n--- ${antenneName} ---`);
      console.log(`Nombre d'utilisateurs: ${analysis.users}`);
      console.log(`Nombre de TSR: ${analysis.tsrSet.size}`);
      console.log(`Total actions: ${analysis.totalActions}`);
    });

    // Calculer les moyennes pour chaque antenne
    const actionStatsByAntenne: ActionStatsByAntenneItem[] = Object.values(antenneActionStats).map(antenne => {
      const monthsWithActions = Object.keys(antenne.actionsByMonth).length;
      const averagePerMonth = monthsWithActions > 0 ? antenne.totalActions / monthsWithActions : 0;
      const averagePerYear = antenne.totalActions; // ou une autre logique selon vos besoins

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

    console.log('=== RÉSULTATS PAR ANTENNE ===');
    actionStatsByAntenne.forEach(antenne => {
      console.log(`${antenne.antenne}: ${antenne.totalActions} actions, ${antenne.numberOfTSR} TSR, ${antenne.numberOfUsers} utilisateurs`);
    });

    return {
      actionStatsByAntenne,
      averageActionsPerAntenne,
      averageActionsPerMonth,
      averageActionsPerYear
    };
  };

  // Nouvelle fonction pour calculer les statistiques PrevExp
  // Nouvelle fonction pour calculer les statistiques PrevExp
  const calculatePrevExpStats = (users: User[]): import('../../types/dashboard').PrevExpStats | null => {
    console.log('=== CALCUL STATS PREVEXP ===');
    const prevExpUsers = users.filter(u => u.hasPrevExp);

    if (prevExpUsers.length === 0) {
      return null;
    }

    // KPI: Dossiers Ouverts (Nouveau champ)
    const dossiersOuvertsCount = prevExpUsers.filter(u => u.prevExpDossierOuvert === 'OUI').length;

    // KPI: Taux de Maintien (sur les dossiers fermés)
    const dossiersFermes = prevExpUsers.filter(u => u.prevExpDossierOuvert === 'NON');
    const dossiersMaintenus = dossiersFermes.filter(u => u.prevExpMaintienLogement === 'Oui').length;
    const tauxMaintien = dossiersFermes.length > 0 ? (dossiersMaintenus / dossiersFermes.length) * 100 : 0;

    // KPI: Motifs d'Expulsion
    const motifsCount: { [key: string]: number } = {};
    prevExpUsers.forEach(user => {
      if (user.prevExpMotifRequete) {
        // Gérer les motifs multiples séparés par des virgules
        const motifs = user.prevExpMotifRequete.split(',').map(m => m.trim()).filter(Boolean);
        motifs.forEach(motif => {
          motifsCount[motif] = (motifsCount[motif] || 0) + 1;
        });
      }
    });
    const motifsData = Object.entries(motifsCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Top 8 motifs

    // KPI: Timeline des Expulsions (3 prochains mois)
    const now = new Date();
    const threeMonthsLater = new Date();
    threeMonthsLater.setMonth(now.getMonth() + 3);

    const expulsionTimelineMap: { [key: string]: { count: number; users: { id: string; nom: string }[] } } = {};

    prevExpUsers.forEach(user => {
      if (user.prevExpDateExpulsion) {
        const date = new Date(user.prevExpDateExpulsion);
        if (date >= now && date <= threeMonthsLater) {
          const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
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


    // KPI A: Issue des Dossiers (Solutions de relogement)
    const solutionCount: { [key: string]: number } = {};
    prevExpUsers.forEach(user => {
      if (user.prevExpSolutionRelogement) {
        const solutions = user.prevExpSolutionRelogement.split(',').map(s => s.trim()).filter(Boolean);
        solutions.forEach(solution => {
          solutionCount[solution] = (solutionCount[solution] || 0) + 1;
        });
      }
    });

    // Groupement intelligent des solutions
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

    // KPI B: Demandes CPAS
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

    // KPI C: Entonnoir Juridique
    const funnelStats = {
      audiencePassed: prevExpUsers.filter(u => u.prevExpDateAudience && new Date(u.prevExpDateAudience) < now).length,
      jugementPassed: prevExpUsers.filter(u => u.prevExpDateJugement && new Date(u.prevExpDateJugement) < now).length,
      expulsionFuture: prevExpUsers.filter(u => u.prevExpDateExpulsion && new Date(u.prevExpDateExpulsion) > now).length,
      total: prevExpUsers.length
    };

    // KPI D: Qualité du Logement
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
      '0-18 ans': 0,
      '19-30 ans': 0,
      '31-45 ans': 0,
      '46-60 ans': 0,
      '61+ ans': 0,
      'Non spécifié': 0
    };

    const genreCount: { [key: string]: number } = {};

    prevExpUsers.forEach(user => {
      // Âge
      if (user.dateNaissance) {
        const age = new Date().getFullYear() - new Date(user.dateNaissance).getFullYear();
        if (age <= 18) ageGroups['0-18 ans']++;
        else if (age <= 30) ageGroups['19-30 ans']++;
        else if (age <= 45) ageGroups['31-45 ans']++;
        else if (age <= 60) ageGroups['46-60 ans']++;
        else ageGroups['61+ ans']++;
      } else {
        ageGroups['Non spécifié']++;
      }

      // Genre
      if (user.genre) {
        genreCount[user.genre] = (genreCount[user.genre] || 0) + 1;
      }
    });

    const profilPublic = {
      parAge: Object.entries(ageGroups)
        .map(([name, value]) => ({ name, value }))
        .filter(item => item.value > 0),
      parGenre: Object.entries(genreCount)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value),
      parCompositionFamiliale: [] as ChartDataItem[] // Empty for now, can be populated later if field is added
    };

    return {
      totalPrevExp: prevExpUsers.length,
      dossiersOuvertsCount,
      expulsionsEviteesCount: dossiersMaintenus, // Nombre absolu d'expulsions évitées
      tauxMaintien,
      solutionData,
      cpasData,
      funnelStats,
      housingQualityData,
      motifsData,
      expulsionTimeline,
      profilPublic
    };
  };

  // Nouvelle fonction pour calculer les statistiques Logement
  const calculateHousingStats = (users: User[]): import('../../types/dashboard').HousingStats | null => {
    console.log('=== CALCUL STATS LOGEMENT ===');
    const housingUsers = users.filter(u => u.logementDetails && typeof u.logementDetails === 'object');

    if (housingUsers.length === 0) {
      return null;
    }

    let totalLoyer = 0;
    let countLoyer = 0;
    let countSocial = 0;
    const typeLogementCount: { [key: string]: number } = {};
    const loyerRanges = {
      '0-300€': 0,
      '301-500€': 0,
      '501-700€': 0,
      '701-900€': 0,
      '901€+': 0
    };

    housingUsers.forEach(user => {
      const details = user.logementDetails as any; // Cast as any to access fields safely

      // Loyer
      if (details.loyer) {
        const loyer = parseFloat(details.loyer.toString().replace(',', '.').replace(/[^\d.-]/g, ''));
        if (!isNaN(loyer) && loyer > 0) {
          totalLoyer += loyer;
          countLoyer++;

          if (loyer <= 300) loyerRanges['0-300€']++;
          else if (loyer <= 500) loyerRanges['301-500€']++;
          else if (loyer <= 700) loyerRanges['501-700€']++;
          else if (loyer <= 900) loyerRanges['701-900€']++;
          else loyerRanges['901€+']++;
        }
      }

      // Type Logement
      if (details.typeLogement) {
        const type = details.typeLogement.trim();
        typeLogementCount[type] = (typeLogementCount[type] || 0) + 1;
        if (type.toLowerCase().includes('social') || type.toLowerCase().includes('ais')) {
          countSocial++;
        }
      }
    });

    const loyerMoyen = countLoyer > 0 ? totalLoyer / countLoyer : 0;
    const partLogementSocial = housingUsers.length > 0 ? (countSocial / housingUsers.length) * 100 : 0;

    const typeLogementData = Object.entries(typeLogementCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const loyerRangeData = Object.entries(loyerRanges)
      .map(([name, value]) => ({ name, value }));

    return {
      totalLogement: housingUsers.length,
      loyerMoyen,
      partLogementSocial,
      typeLogementData,
      loyerRangeData
    };
  };

  // Nouvelle fonction pour récupérer les actions urgentes
  const getUrgentActions = (users: User[]) => {
    const now = new Date();
    return users
      .filter(u => {
        const isDossierOuvert = u.prevExpDossierOuvert === 'OUI';
        const hasFutureExpulsion = u.prevExpDateExpulsion && new Date(u.prevExpDateExpulsion) > now;
        return isDossierOuvert || hasFutureExpulsion;
      })
      .map(u => ({
        id: u.id,
        nom: u.nom,
        prenom: u.prenom,
        dossierOuvert: u.prevExpDossierOuvert,
        dateExpulsion: u.prevExpDateExpulsion,
        gestionnaire: u.gestionnaire
      }))
      .sort((a, b) => {
        // Priorité aux dates d'expulsion proches
        if (a.dateExpulsion && b.dateExpulsion) {
          return new Date(a.dateExpulsion).getTime() - new Date(b.dateExpulsion).getTime();
        }
        // Ensuite dossiers ouverts
        if (a.dossierOuvert === 'OUI' && b.dossierOuvert !== 'OUI') return -1;
        if (a.dossierOuvert !== 'OUI' && b.dossierOuvert === 'OUI') return 1;
        return 0;
      })
      .slice(0, 5); // Top 5 urgences
  };

  // Statistiques par défaut
  const defaultStats: DashboardStats = {
    total: 0,
    pourcentageActifs: 0,
    totalProblematiques: 0,
    parAntenne: [],
    parProblematique: [],
    parAge: [],
    parGenre: [],
    parSecteur: [],
    gestionnaireData: [],
    statutSocialData: [],
    actionTimelineData: [],
    actionStatsByAntenne: [],
    averageActionsPerAntenne: 0,
    averageActionsPerMonth: 0,
    averageActionsPerYear: 0
  };

  // Fonction calculateStatistics avec types
  const calculateStatistics = (users: User[]): DashboardStats => {
    if (!users?.length) {
      return defaultStats;
    }

    // Statistiques de base
    const total = users.length;
    const actifs = users.filter(u => u.etat === "Actif").length;
    const clotures = users.filter(u => u.etat === "Clôturé").length;
    const pourcentageActifs = safePercent(actifs, total);

    // Répartition par secteur
    const secteurCount: CountByField = {};
    users.forEach(user => {
      const secteur = user.secteur || 'Non spécifié';
      secteurCount[secteur] = (secteurCount[secteur] || 0) + 1;
    });

    const parSecteur: ChartDataItem[] = Object.entries(secteurCount)
      .map(([name, value]) => ({ name, value }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);

    // S'assurer que le secteur Industrie apparaisse toujours dans le graphique
    if (!parSecteur.some(item => item.name === "Industrie")) {
      parSecteur.push({ name: "Industrie", value: 0 });
      parSecteur.sort((a, b) => b.value - a.value);
    }

    // Répartition par problématique
    const problematicApiData: ProblematicApiData = {
      problematiqueStats: users.reduce((acc: CountByField, user) => {
        user.problematiques?.forEach(prob => {
          if (prob.type) {
            acc[prob.type] = (acc[prob.type] || 0) + 1;
          }
        });
        return acc;
      }, {}),
      totalProblematiquesUniques: new Set(
        users
          .filter(user => user.problematiques?.some(p => p.type === "Administratif" || p.type === "Logement"))
          .map(user => user.id)
      ).size
    };

    const parProblematique: ChartDataItem[] = Object.entries(problematicApiData.problematiqueStats)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const totalProblematiques = problematicApiData.totalProblematiquesUniques;

    // Répartition par genre
    const genreCount: CountByField = users.reduce((acc, user) => {
      const genre = user.genre || 'Non spécifié';
      const normalizedGenre =
        genre.toLowerCase() === 'homme' ? 'Homme' :
          genre.toLowerCase() === 'femme' ? 'Femme' :
            'Non spécifié';
      acc[normalizedGenre] = (acc[normalizedGenre] || 0) + 1;
      return acc;
    }, {} as CountByField);

    // Répartition par antenne
    const antenneCount: CountByField = {};
    users.forEach(user => {
      const antenne = user.antenne || 'Non spécifié';
      antenneCount[antenne] = (antenneCount[antenne] || 0) + 1;
    });
    const parAntenne: ChartDataItem[] = Object.entries(antenneCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Répartition par gestionnaire - VERSION CORRIGÉE
    const gestionnaireCount: CountByField = {};
    if (Array.isArray(users) && users.length > 0) {
      users.forEach(user => {
        let gestionnaireId: string | null = null;

        if (user && typeof user === 'object') {
          // Gestion du type union: string | Gestionnaire
          if (typeof user.gestionnaire === 'string') {
            gestionnaireId = user.gestionnaire;
          } else if (user.gestionnaire && typeof user.gestionnaire === 'object') {
            gestionnaireId = user.gestionnaire.id;
          }
        }

        if (gestionnaireId) {
          const displayName = getGestionnaireDisplayName(gestionnaireId);
          gestionnaireCount[displayName] = (gestionnaireCount[displayName] || 0) + 1;
        } else {
          gestionnaireCount['Non assigné'] = (gestionnaireCount['Non assigné'] || 0) + 1;
        }
      });
    }

    const gestionnaireData: ChartDataItem[] = Object.entries(gestionnaireCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Répartition par âge
    const ageGroups: AgeGroups = {
      '0-18 ans': 0,
      '19-30 ans': 0,
      '31-45 ans': 0,
      '46-60 ans': 0,
      '61+ ans': 0,
      'Non spécifié': 0
    };

    users.forEach(user => {
      if (user.dateNaissance) {
        const birthDate = typeof user.dateNaissance === 'string'
          ? new Date(user.dateNaissance)
          : user.dateNaissance;
        const age = new Date().getFullYear() - birthDate.getFullYear();

        if (age <= 18) ageGroups['0-18 ans']++;
        else if (age <= 30) ageGroups['19-30 ans']++;
        else if (age <= 45) ageGroups['31-45 ans']++;
        else if (age <= 60) ageGroups['46-60 ans']++;
        else ageGroups['61+ ans']++;
      } else {
        ageGroups['Non spécifié']++;
      }
    });

    const parAge: ChartDataItem[] = Object.entries(ageGroups)
      .map(([name, value]) => ({ name, value }));

    // Statut social
    const statutSocialCount: CountByField = users.reduce((acc, user) => {
      const statut = user.statutSejour || 'Non spécifié';
      acc[statut] = (acc[statut] || 0) + 1;
      return acc;
    }, {} as CountByField);

    const statutSocialData: ChartDataItem[] = Object.entries(statutSocialCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Données pour la timeline
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    const currentYear = new Date().getFullYear();
    const actionTimelineData: TimelineDataItem[] = months.map(month => ({
      name: month,
      actions: users.filter(user => {
        if (!user.dateOuverture) return false;
        const date = typeof user.dateOuverture === 'string'
          ? new Date(user.dateOuverture)
          : user.dateOuverture;
        return date.getFullYear() === currentYear && months[date.getMonth()] === month;
      }).length
    }));

    // Vers la ligne 662, dans calculateStatistics
    // Calculer les statistiques d'actions par antenne (remplace TSR)
    const actionStats = calculateActionStatsByAntenne(users);

    console.log('ActionStats par antenne calculées:', actionStats);

    // Debug: Vérifier les adresses et secteurs
    console.log("Vérification adresses et secteurs:", users.map(user => ({
      id: user.id,
      adresse: user.adresse,
      secteur: user.secteur,
      // mapping: user.adresse?.secteur, // Si le secteur est censé venir du mapping
    })).filter(data => data.adresse)); // Ne montrer que les entrées avec une adresse

    return {
      total,
      pourcentageActifs: Math.min(pourcentageActifs, 100), // Cap at 100%
      totalProblematiques,
      parAntenne,
      parProblematique,
      parAge,
      parGenre: Object.entries(genreCount).map(([name, value]) => ({ name, value })),
      parSecteur,
      gestionnaireData,
      statutSocialData,
      actionTimelineData,
      ...actionStats
    };
  };

  // Calculer les statistiques
  const stats = calculateStatistics(users);

  // Fonction generateSummaryText améliorée
  const generateSummaryText = (stats: DashboardStats): string => {
    if (!stats) return "Aucune donnée disponible pour générer une synthèse.";

    const summaryParts: string[] = [];

    // Introduction générale
    summaryParts.push(`📊 **Synthèse analytique du tableau de bord**`);
    summaryParts.push(`\n\n**Vue d'ensemble :** Le système de gestion des usagers compte actuellement **${stats.total} dossiers** au total, constituant notre base de données opérationnelle.`);

    // Analyse de l'activité
    if (stats.pourcentageActifs) {
      const tauxActivite = stats.pourcentageActifs.toFixed(1);
      const interpretation = parseFloat(tauxActivite) > 70 ? "excellent" : parseFloat(tauxActivite) > 50 ? "satisfaisant" : "nécessitant une attention particulière";
      summaryParts.push(`\n\n**Taux d'activité :** ${tauxActivite}% des dossiers sont actuellement actifs, ce qui représente un niveau d'engagement ${interpretation}.`);
    }



    // Performance par antenne
    if (stats.actionStatsByAntenne?.length > 0 && stats.averageActionsPerAntenne !== undefined) {
      const topAntenne = stats.actionStatsByAntenne[0];
      summaryParts.push(`\n\n**Performance par antenne :** En moyenne, chaque antenne gère **${stats.averageActionsPerAntenne.toFixed(1)} actions**. L'antenne la plus active (${topAntenne.antenne}) a traité **${topAntenne.totalActions} actions** avec **${topAntenne.numberOfTSR} TSR** et **${topAntenne.numberOfUsers} utilisateurs**.`);
    }

    // Répartition géographique et sectorielle
    if (stats.parSecteur?.length > 0) {
      const topSectors = stats.parSecteur.slice(0, 3);
      const sectorSummary = topSectors
        .map(s => `**${s.name}** (${s.value} usagers, ${((s.value / stats.total) * 100).toFixed(1)}%)`)
        .join(", ");
      summaryParts.push(`\n\n**Répartition sectorielle :** Les secteurs d'intervention prioritaires sont : ${sectorSummary}.`);
    }

    // Analyse des problématiques
    if (stats.parProblematique?.length > 0) {
      const topIssues = stats.parProblematique.slice(0, 3);
      const issuesSummary = topIssues
        .map(p => `**${p.name}** (${p.value} cas)`)
        .join(", ");
      summaryParts.push(`\n\n**Problématiques dominantes :** Les enjeux les plus fréquemment rencontrés sont : ${issuesSummary}. Ces données orientent nos priorités d'intervention et de formation.`);
    }

    // Répartition par antenne
    if (stats.parAntenne?.length > 0) {
      const totalAntennes = stats.parAntenne.length;
      const antennesPrincipales = stats.parAntenne.slice(0, 2)
        .map(a => `**${a.name}** (${a.value} dossiers)`)
        .join(" et ");
      summaryParts.push(`\n\n**Couverture territoriale :** Notre réseau d'antennes assure une présence territoriale équilibrée, avec ${antennesPrincipales} concentrant la majorité de l'activité.`);
    }

    // Conclusion et recommandations
    summaryParts.push(`\n\n**Recommandations :** Ces indicateurs permettent d'optimiser l'allocation des ressources, d'identifier les besoins de formation et d'ajuster les stratégies d'intervention selon les spécificités territoriales et sectorielles.`);

    return summaryParts.join("");
  };

  // Calculer la hauteur du graphique (exemple : 35px par secteur, minimum 300px)
  const sectorChartHeight = Math.max(300, stats.parSecteur.length * 35);

  // Calculer les statistiques PrevExp
  const prevExpStats = calculatePrevExpStats(users);

  // Calculer les statistiques Logement
  const housingStats = calculateHousingStats(users);

  // Récupérer les actions urgentes
  const urgentActions = getUrgentActions(users);

  return (
    <div>
      {/* Synthèse des statistiques améliorée */}
      <div className="pasq-glass-box mb-8" style={{ background: 'var(--pasq-gradient-soft)', border: '1px solid rgba(102, 209, 201, 0.2)' }}>
        <h3 className="pasq-h2 flex items-center">
          <span className="mr-3">📈</span>
          Synthèse analytique
        </h3>
        <div className="pasq-body-text max-w-none">
          {(() => {
            const fullSummary = generateSummaryText(stats);
            const { text: displayText, isTruncated } = isAnalysisExpanded
              ? { text: fullSummary, isTruncated: false }
              : getTruncatedSummary(fullSummary, 300);

            return (
              <>
                <div dangerouslySetInnerHTML={{
                  __html: displayText.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                }} />
                {(isTruncated || isAnalysisExpanded) && (
                  <>
                    {!isAnalysisExpanded && <span>...</span>}
                    <button
                      onClick={() => setIsAnalysisExpanded(!isAnalysisExpanded)}
                      className="ml-2 inline-flex items-center px-3 py-1 text-sm font-medium text-blue-600 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                    >
                      {isAnalysisExpanded ? (
                        <>
                          <span>Voir moins</span>
                          <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        </>
                      ) : (
                        <>
                          <span>Voir plus</span>
                          <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </>
                      )}
                    </button>
                  </>
                )}
              </>
            );
          })()}
        </div>
      </div>



      {/* Statistiques des actions par antenne */}
      <div className="pasq-glass-box mb-8 pasq-hover-lift">
        <h2 className="pasq-h2 mb-6">
          Statistiques des actions par antenne
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-6">
          <div className="pasq-stat-card pasq-hover-lift">
            <p className="text-sm font-medium" style={{ color: '#008C7A' }}>Moyenne par antenne</p>
            <p className="pasq-stat-number">{(stats.averageActionsPerAntenne || 0).toFixed(1)}</p>
            <p className="pasq-stat-label">actions par antenne</p>
          </div>
          <div className="pasq-stat-card pasq-hover-lift" style={{ animationDelay: '0.1s' }}>
            <p className="text-sm font-medium" style={{ color: '#00B4A7' }}>Moyenne mensuelle</p>
            <p className="pasq-stat-number">{(stats.averageActionsPerMonth || 0).toFixed(1)}</p>
            <p className="pasq-stat-label">actions par mois</p>
          </div>
          <div className="pasq-stat-card pasq-hover-lift" style={{ animationDelay: '0.2s' }}>
            <p className="text-sm font-medium" style={{ color: '#009F8D' }}>Moyenne annuelle</p>
            <p className="pasq-stat-number">{(stats.averageActionsPerYear || 0).toFixed(0)}</p>
            <p className="pasq-stat-label">actions par an</p>
          </div>
        </div>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={stats.actionStatsByAntenne}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis
                dataKey="antenne"
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
                fontSize={12}
                tick={{ fill: '#374151', fontSize: 12 }}
              />
              <YAxis
                fontSize={12}
                tick={{ fill: '#6B7280' }}
              />
              <Tooltip
                formatter={(value, name) => {
                  if (name === 'totalActions') return [`${value} actions`, 'Total des actions'];
                  if (name === 'numberOfTSR') return [`${value} TSR`, 'Nombre de TSR'];
                  if (name === 'numberOfUsers') return [`${value} utilisateurs`, 'Nombre d\'utilisateurs'];
                  return [value, name];
                }}
                labelFormatter={(label) => `Antenne: ${label}`}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid rgba(0, 180, 167, 0.2)',
                  borderRadius: '8px',
                  boxShadow: 'var(--pasq-shadow-md)',
                  fontFamily: 'Source Sans Pro, sans-serif'
                }}
              />
              <Bar dataKey="totalActions" fill="#008C7A" name="totalActions" radius={[6, 6, 0, 0]} />
              <Bar dataKey="numberOfTSR" fill="#00B4A7" name="numberOfTSR" radius={[6, 6, 0, 0]} />
              <Bar dataKey="numberOfUsers" fill="#33C7B6" name="numberOfUsers" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Graphiques existants */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Évolution temporelle - Style HTML Report */}
        <div className="pasq-glass-box lg:col-span-2 pasq-hover-lift">
          <h2 className="pasq-h3 mb-4 flex items-center">
            <span className="mr-2">📈</span>
            Évolution des ouvertures de dossiers (2025)
          </h2>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">

              <LineChart
                data={safeArrayAccess(stats.actionTimelineData)}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  stroke="#e5e7eb"
                  tickLine={false}
                  axisLine={{ stroke: '#e5e7eb' }}
                  style={{ fontFamily: 'Source Sans Pro, sans-serif' }}
                  dy={10}
                />
                <YAxis
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  stroke="#e5e7eb"
                  tickLine={false}
                  axisLine={false}
                  style={{ fontFamily: 'Source Sans Pro, sans-serif' }}
                />
                <Tooltip
                  formatter={(value) => [`${value} ouvertures`, 'Nombre']}
                  labelFormatter={(label) => `Mois: ${label}`}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid rgba(0, 180, 167, 0.2)',
                    borderRadius: '8px',
                    boxShadow: 'var(--pasq-shadow-md)',
                    fontFamily: 'Source Sans Pro, sans-serif'
                  }}
                  labelStyle={{ color: '#008C7A', fontWeight: 600 }}
                />
                <Line
                  type="monotone"
                  dataKey="actions"
                  stroke="#008C7A"
                  strokeWidth={3}
                  fill="rgba(0, 140, 122, 0.1)"
                  fillOpacity={1}
                  dot={{ fill: '#008C7A', stroke: '#ffffff', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#00B4A7', stroke: '#ffffff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Répartition par antenne */}
        <div className="pasq-chart-box pasq-hover-lift">
          <h2 className="pasq-h2 mb-4">
            Répartition par antenne
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={safeArrayAccess(stats.parAntenne)}
                  cx="50%"
                  cy="45%"
                  labelLine={false}
                  outerRadius={90}
                  innerRadius={30}
                  fill="#00B4A7"
                  dataKey="value"
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {safeArrayAccess(stats.parAntenne).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value} usagers`, 'Nombre']}
                  labelFormatter={(label) => `Antenne: ${label}`}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid rgba(0, 180, 167, 0.2)',
                    borderRadius: '8px',
                    boxShadow: 'var(--pasq-shadow-md)',
                    fontFamily: 'Source Sans Pro, sans-serif'
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ fontSize: '16px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Répartition par gestionnaire */}
        <div className="pasq-chart-box pasq-hover-lift">
          <h2 className="pasq-h2 mb-4">
            Répartition par gestionnaire
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={safeArrayAccess(stats.gestionnaireData)}
                margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={70}
                  interval={0}
                  tick={{ fill: '#6B7280', fontSize: 11 }}
                  stroke="#e5e7eb"
                  tickLine={false}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  stroke="#e5e7eb"
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(value) => [`${value} usagers`, 'Nombre']}
                  labelFormatter={(label) => `Gestionnaire: ${label}`}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid rgba(0, 180, 167, 0.2)',
                    borderRadius: '8px',
                    boxShadow: 'var(--pasq-shadow-md)',
                    fontFamily: 'Source Sans Pro, sans-serif'
                  }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {safeArrayAccess(stats.gestionnaireData).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getPasqBarColors(safeArrayAccess(stats.gestionnaireData).length)[index]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Répartition par tranche d'âge */}
        <div className="pasq-chart-box pasq-hover-lift">
          <h2 className="pasq-h2 mb-4">
            Répartition par tranche d&apos;âge
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={safeArrayAccess(stats.parAge)}
                margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  stroke="#e5e7eb"
                  tickLine={false}
                  axisLine={{ stroke: '#e5e7eb' }}
                  interval={0}
                  dy={5}
                />
                <YAxis
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  stroke="#e5e7eb"
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(value) => [`${value} usagers`, 'Nombre']}
                  labelFormatter={(label) => `Tranche d'âge: ${label}`}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid rgba(0, 180, 167, 0.2)',
                    borderRadius: '8px',
                    boxShadow: 'var(--pasq-shadow-md)',
                    fontFamily: 'Source Sans Pro, sans-serif'
                  }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {safeArrayAccess(stats.parAge).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getPasqBarColors(safeArrayAccess(stats.parAge).length)[index]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Répartition par genre */}
        <div className="pasq-chart-box pasq-hover-lift">
          <h2 className="pasq-h2 mb-4">
            Répartition par genre
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={safeArrayAccess(stats.parGenre)}
                  cx="50%"
                  cy="45%"
                  labelLine={false}
                  outerRadius={90}
                  innerRadius={30}
                  fill="#33C7B6"
                  dataKey="value"
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {safeArrayAccess(stats.parGenre).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value} usagers`, 'Nombre']}
                  labelFormatter={(label) => `Genre: ${label}`}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid rgba(0, 180, 167, 0.2)',
                    borderRadius: '8px',
                    boxShadow: 'var(--pasq-shadow-md)',
                    fontFamily: 'Source Sans Pro, sans-serif'
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ fontSize: '16px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Répartition par secteur */}
        <div className="pasq-chart-box pasq-hover-lift">
          <h2 className="pasq-h2 mb-4">
            Répartition par secteur
          </h2>
          <div style={{ height: `${Math.max(450, stats.parSecteur.length * 40)}px` }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={safeArrayAccess(stats.parSecteur)}
                margin={{ top: 20, right: 30, left: 160, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fill: '#6B7280', fontSize: 11 }}
                  stroke="#e5e7eb"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={150}
                  interval={0}
                  tick={{ fill: '#4B5563', fontSize: 12, fontWeight: 500 }}
                  stroke="#e5e7eb"
                  tickLine={false}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <Tooltip
                  formatter={(value) => [`${value} usagers`, 'Nombre']}
                  labelFormatter={(label) => `Secteur: ${label}`}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid rgba(0, 180, 167, 0.2)',
                    borderRadius: '8px',
                    boxShadow: 'var(--pasq-shadow-md)',
                    fontFamily: 'Source Sans Pro, sans-serif'
                  }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {safeArrayAccess(stats.parSecteur).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getPasqBarColors(safeArrayAccess(stats.parSecteur).length)[index]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Répartition par problématique */}
        <div className="pasq-chart-box lg:col-span-2 pasq-hover-lift">
          <h2 className="pasq-h2 mb-4">
            Répartition par problématique (filtrée)
          </h2>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={safeArrayAccess(stats.parProblematique).slice(0, 10)}
                margin={{ top: 20, right: 30, left: 20, bottom: 120 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={0}
                  tick={{ fill: '#6B7280', fontSize: 11 }}
                  stroke="#e5e7eb"
                  tickLine={false}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  stroke="#e5e7eb"
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(value) => [`${value} occurrences`, 'Nombre']}
                  labelFormatter={(label) => `Problématique: ${label}`}
                  contentStyle={{
                    backgroundColor: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: 'var(--pasq-shadow-md)',
                    fontFamily: 'Source Sans Pro, sans-serif',
                    maxWidth: '300px'
                  }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {safeArrayAccess(stats.parProblematique).slice(0, 10).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getPasqBarColors(Math.min(10, safeArrayAccess(stats.parProblematique).length))[index]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {safeArrayAccess(stats.parProblematique).length > 10 && (
            <p className="text-base text-gray-600 mt-2 text-center font-medium">
              Affichage des 10 problématiques les plus fréquentes sur {stats.parProblematique.length} au total
            </p>
          )}
        </div>
      </div>

      {/* Section Prévention Expulsion - CONDITIONNEL */}
      {/* Section Prévention Expulsion - AMÉLIORÉE */}
      {
        prevExpStats && (
          <div className="pasq-glass-box mb-8 pasq-hover-lift" style={{ borderTop: '4px solid #008C7A', boxShadow: 'var(--pasq-shadow-lg)' }}>
            <h2 className="pasq-h2 mb-6 flex items-center justify-between">
              <div className="flex items-center">
                <span className="mr-2 text-3xl">🏠</span>
                <div className="flex flex-col">
                  <span className="leading-tight text-[#008C7A]">Analyse Prévention Expulsion</span>
                  <span className="text-base font-normal text-[#009F8D] mt-1">Suivi des procédures et du maintien dans le logement</span>
                </div>
              </div>
              <span className="px-4 py-1 bg-red-100 text-red-800 rounded-full text-sm font-bold">
                {prevExpStats.totalPrevExp} dossiers suivis
              </span>
            </h2>

            {/* Table Actions Requises - NOUVEAU */}
            {urgentActions.length > 0 && (
              <div className="mb-8 overflow-hidden rounded-xl shadow-sm pasq-glass-box" style={{ border: '1px solid rgba(0, 180, 167, 0.2)' }}>
                <div className="pasq-table-header px-6 py-4 border-b flex items-center justify-between">
                  <h3 className="font-bold flex items-center" style={{ color: '#008C7A' }}>
                    <span className="mr-2">🚨</span>
                    Actions Requises (Top 5 Urgences)
                  </h3>
                  <span className="pasq-badge">
                    Priorité Haute
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y" style={{ borderColor: 'rgba(0, 180, 167, 0.1)' }}>
                    <thead className="bg-white">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usager</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dossier Ouvert ?</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Expulsion</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gestionnaire</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-red-50">
                      {urgentActions.map((action) => (
                        <tr key={action.id} className="pasq-table-row">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">{action.nom} {action.prenom}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {action.dossierOuvert === 'OUI' ? (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                OUI
                              </span>
                            ) : (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                NON
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {action.dateExpulsion ? (
                              <span className="font-bold text-red-600">
                                {new Date(action.dateExpulsion).toLocaleDateString('fr-FR')}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {getGestionnaireDisplayName(typeof action.gestionnaire === 'string' ? action.gestionnaire : action.gestionnaire?.id)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <a href={`/users/${action.id}/edit`} className="text-indigo-600 hover:text-indigo-900 font-bold">
                              Gérer →
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* KPI Cards Row - NOUVEAU */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              {/* Dossiers Ouverts */}
              <div className="pasq-stat-card pasq-animate-in">
                <h4 className="text-sm font-bold uppercase tracking-wide mb-2" style={{ color: '#008C7A' }}>Dossiers Ouverts</h4>
                <div className="flex items-center justify-center">
                  <span className="pasq-stat-number">{prevExpStats.dossiersOuvertsCount}</span>
                </div>
                <p className="pasq-stat-label">actifs</p>
                <p className="text-xs mt-2" style={{ color: '#4a5568' }}>Nécessitent une attention immédiate</p>
              </div>

              {/* Expulsions Évitées - NOUVEAU KPI */}
              <div className="pasq-stat-card pasq-animate-in" style={{ animationDelay: '0.1s' }}>
                <h4 className="text-sm font-bold uppercase tracking-wide mb-2" style={{ color: '#00B4A7' }}>Expulsions Évitées</h4>
                <div className="flex items-center justify-center">
                  <span className="pasq-stat-number">{prevExpStats.expulsionsEviteesCount}</span>
                </div>
                <p className="pasq-stat-label">familles</p>
                <p className="text-xs mt-2" style={{ color: '#4a5568' }}>Maintien dans le logement assuré</p>
              </div>

              {/* Taux de Maintien */}
              <div className="pasq-stat-card pasq-animate-in" style={{ animationDelay: '0.2s' }}>
                <h4 className="text-sm font-bold uppercase tracking-wide mb-2" style={{ color: '#009F8D' }}>Taux de Maintien</h4>
                <div className="flex items-center justify-center">
                  <span className="pasq-stat-number">{prevExpStats.tauxMaintien.toFixed(0)}%</span>
                </div>
                <p className="pasq-stat-label">réussite</p>
                <p className="text-xs mt-2" style={{ color: '#4a5568' }}>Sur les dossiers clôturés</p>
              </div>

              {/* Expulsions Futures */}
              <div className="pasq-stat-card pasq-animate-in" style={{ animationDelay: '0.3s' }}>
                <h4 className="text-sm font-bold uppercase tracking-wide mb-2" style={{ color: '#008C7A' }}>Expulsions à venir</h4>
                <div className="flex items-center justify-center">
                  <span className="pasq-stat-number">{prevExpStats.funnelStats.expulsionFuture}</span>
                </div>
                <p className="pasq-stat-label">dossiers</p>
                <p className="text-xs mt-2" style={{ color: '#4a5568' }}>Date d&apos;expulsion dépassée ou future</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* KPI: Motifs d'Expulsion (Bar Chart) - NOUVEAU */}
              <div className="pasq-chart-box">
                <h3 className="pasq-h3 mb-4 flex items-center">
                  <span className="mr-2">📋</span>
                  Motifs d&apos;Expulsion Principaux
                </h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={prevExpStats.motifsData}
                      margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" horizontal={false} />
                      <XAxis type="number" hide />
                      <YAxis
                        dataKey="name"
                        type="category"
                        width={90}
                        tick={{ fontSize: 11, fill: '#4B5563' }}
                      />
                      <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                        cursor={{ fill: '#F3F4F6' }}
                      />
                      <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={20}>
                        {prevExpStats.motifsData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={getPasqBarColors(prevExpStats.motifsData.length)[index]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* KPI: Timeline Expulsions (Area Chart) - NOUVEAU */}
              <div className="pasq-chart-box">
                <h3 className="pasq-h3 mb-4 flex items-center">
                  <span className="mr-2">📅</span>
                  Calendrier des Expulsions (3 mois)
                </h3>
                <div className="h-72">
                  {prevExpStats.expulsionTimeline.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={prevExpStats.expulsionTimeline}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                        <XAxis
                          dataKey="date"
                          tickFormatter={(date) => new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis allowDecimals={false} />
                        <Tooltip
                          labelFormatter={(date) => new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                          formatter={(value: number) => [`${value} expulsion(s)`, 'Nombre']}
                        />
                        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                          {prevExpStats.expulsionTimeline.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={getPasqBarColors(prevExpStats.expulsionTimeline.length)[index]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 italic">
                      Aucune expulsion prévue dans les 3 prochains mois
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* KPI A: Issue des Dossiers (Donut Chart) */}
              {/* KPI A: Issue des Dossiers (Donut Chart) */}
              <div className="pasq-chart-box lg:col-span-1">
                <h3 className="pasq-h3 mb-4 text-center !mt-0">
                  Issue des Dossiers
                </h3>
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={prevExpStats.solutionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {prevExpStats.solutionData.map((entry: any, index: number) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              entry.group === 'positive' ? '#34D399' : // Green
                                entry.group === 'negative' ? '#F87171' : // Red
                                  '#FBBF24' // Amber
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} iconSize={10} wrapperStyle={{ fontSize: '11px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* KPI C: Entonnoir Juridique (Funnel like) */}
              <div className="pasq-chart-box lg:col-span-2">
                <h3 className="pasq-h3 mb-4 !mt-0">
                  Entonnoir Juridique
                </h3>
                <div className="space-y-4">
                  <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-200">
                          Audience Passée
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold inline-block text-indigo-600">
                          {prevExpStats.funnelStats.audiencePassed} dossiers
                        </span>
                      </div>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-100">
                      <div style={{ width: `${(prevExpStats.funnelStats.audiencePassed / prevExpStats.totalPrevExp) * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"></div>
                    </div>
                  </div>

                  <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-purple-600 bg-purple-200">
                          Jugement Rendu
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold inline-block text-purple-600">
                          {prevExpStats.funnelStats.jugementPassed} dossiers
                        </span>
                      </div>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-purple-100">
                      <div style={{ width: `${(prevExpStats.funnelStats.jugementPassed / prevExpStats.totalPrevExp) * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-500"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Profil du Public - NOUVEAU */}
            <div className="pasq-glass-box mt-8" style={{ borderTop: '4px solid #8B5CF6' }}>
              <h3 className="pasq-h2 mb-6 flex items-center">
                <span className="mr-2">👥</span>
                Profil du Public Concerné
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Par Âge */}
                <div className="pasq-chart-box">
                  <h4 className="text-sm font-bold text-purple-800 mb-3 text-center">Répartition par Âge</h4>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={prevExpStats.profilPublic.parAge}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {prevExpStats.profilPublic.parAge.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Par Genre */}
                <div className="pasq-chart-box">
                  <h4 className="text-sm font-bold text-purple-800 mb-3 text-center">Répartition par Genre</h4>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={prevExpStats.profilPublic.parGenre}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                          {prevExpStats.profilPublic.parGenre.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={getPasqBarColors(prevExpStats.profilPublic.parGenre.length)[index]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      }
      {/* Section Analyse Logement - NOUVEAU */}
      {
        housingStats && (
          <div className="pasq-glass-box mb-8 pasq-hover-lift" style={{ borderTop: '4px solid #00B4A7', boxShadow: 'var(--pasq-shadow-lg)' }}>
            <h2 className="pasq-h2 mb-6 flex items-center justify-between">
              <div className="flex items-center">
                <span className="mr-2 text-3xl">🏙️</span>
                <div className="flex flex-col">
                  <span className="leading-tight text-[#008C7A]">Analyse Logement</span>
                  <span className="text-base font-normal text-[#009F8D] mt-1">Données sur le parc locatif et les conditions de logement</span>
                </div>
              </div>
              <span className="px-4 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-bold">
                {housingStats.totalLogement} logements renseignés
              </span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* KPI Cards */}
              <div className="pasq-stat-card flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium mb-2" style={{ color: '#00B4A7' }}>Logement Social</p>
                  <p className="pasq-stat-number">{housingStats.partLogementSocial.toFixed(1)}%</p>
                  <p className="pasq-stat-label">Part du parc social / AIS</p>
                </div>
                <span className="text-5xl" style={{ color: 'rgba(0, 180, 167, 0.2)' }}>🏢</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Chart: Type de Logement */}
              <div className="pasq-chart-box">
                <h3 className="pasq-h3 mb-4 flex items-center">
                  <span className="mr-2">🏘️</span>
                  Typologie des Logements
                </h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={housingStats.typeLogementData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {housingStats.typeLogementData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} iconSize={10} wrapperStyle={{ fontSize: '11px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart: Répartition des Loyers */}
              <div className="pasq-chart-box">
                <h3 className="pasq-h3 mb-4 flex items-center">
                  <span className="mr-2">📊</span>
                  Distribution des Loyers
                </h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={housingStats.loyerRangeData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        cursor={{ fill: '#F3F4F6' }}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                      />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                        {housingStats.loyerRangeData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={getPasqBarColors(housingStats.loyerRangeData.length)[index]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default Dashboard;
