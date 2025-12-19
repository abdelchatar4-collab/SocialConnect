/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { User } from '@/types/user';

export interface UserStats {
  total: number;
  byStatus: Record<string, number>;
  byNationality: Record<string, number>;
  byAntenne: Record<string, number>;
  byGestionnaire: Record<string, number>;
  byAgeGroup: Record<string, number>;
  bySector: Record<string, number>;
  byMonth: Record<string, number>;
  recentlyAdded: number; // 30 derniers jours
  recentlyUpdated: number; // 30 derniers jours
}

export interface AdvancedFilters {
  dateRange?: {
    start: string;
    end: string;
  };
  statusList?: string[];
  nationalityList?: string[];
  antenneList?: string[];
  gestionnaireList?: string[];
  ageGroups?: string[];
  sectors?: string[];
  hasEmail?: boolean;
  hasPhone?: boolean;
  hasPreviousExperience?: boolean;
}

/**
 * Service étendu pour les analyses et statistiques des utilisateurs
 */
class UserAnalyticsService {

  /**
   * Calcule les statistiques générales des utilisateurs
   */
  calculateStats(users: User[]): UserStats {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const stats: UserStats = {
      total: users.length,
      byStatus: {},
      byNationality: {},
      byAntenne: {},
      byGestionnaire: {},
      byAgeGroup: {},
      bySector: {},
      byMonth: {},
      recentlyAdded: 0,
      recentlyUpdated: 0
    };

    users.forEach(user => {
      // Par statut
      const status = user.etat || 'Non défini';
      stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;

      // Par nationalité
      const nationality = user.nationalite || 'Non définie';
      stats.byNationality[nationality] = (stats.byNationality[nationality] || 0) + 1;

      // Par antenne
      const antenne = user.antenne || 'Non définie';
      stats.byAntenne[antenne] = (stats.byAntenne[antenne] || 0) + 1;

      // Par gestionnaire
      const gestionnaire = typeof user.gestionnaire === 'string'
        ? user.gestionnaire || 'Non assigné'
        : user.gestionnaire
          ? `${user.gestionnaire.prenom || ''} ${user.gestionnaire.nom || ''}`.trim() || 'Non assigné'
          : 'Non assigné';
      stats.byGestionnaire[gestionnaire] = (stats.byGestionnaire[gestionnaire] || 0) + 1;

      // Par tranche d'âge
      const ageGroup = user.trancheAge || 'Non définie';
      stats.byAgeGroup[ageGroup] = (stats.byAgeGroup[ageGroup] || 0) + 1;

      // Par secteur
      const sector = user.secteur || 'Non défini';
      stats.bySector[sector] = (stats.bySector[sector] || 0) + 1;

      // Par mois d'ouverture
      if (user.dateOuverture) {
        const date = new Date(user.dateOuverture);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        stats.byMonth[monthKey] = (stats.byMonth[monthKey] || 0) + 1;

        // Récemment ajoutés
        if (date >= thirtyDaysAgo) {
          stats.recentlyAdded++;
        }
      }

      // Récemment mis à jour
      if (user.derniereModification) {
        const updateDate = new Date(user.derniereModification);
        if (updateDate >= thirtyDaysAgo) {
          stats.recentlyUpdated++;
        }
      }
    });

    return stats;
  }

  /**
   * Filtre les utilisateurs selon des critères avancés
   */
  applyAdvancedFilters(users: User[], filters: AdvancedFilters): User[] {
    return users.filter(user => {
      // Filtre par plage de dates
      if (filters.dateRange) {
        if (user.dateOuverture) {
          const userDate = new Date(user.dateOuverture);
          const startDate = new Date(filters.dateRange.start);
          const endDate = new Date(filters.dateRange.end);
          if (userDate < startDate || userDate > endDate) {
            return false;
          }
        }
      }

      // Filtre par liste de statuts
      if (filters.statusList && filters.statusList.length > 0) {
        if (!filters.statusList.includes(user.etat || '')) {
          return false;
        }
      }

      // Filtre par liste de nationalités
      if (filters.nationalityList && filters.nationalityList.length > 0) {
        if (!filters.nationalityList.includes(user.nationalite || '')) {
          return false;
        }
      }

      // Filtre par liste d'antennes
      if (filters.antenneList && filters.antenneList.length > 0) {
        if (!filters.antenneList.includes(user.antenne || '')) {
          return false;
        }
      }

      // Filtre par liste de gestionnaires
      if (filters.gestionnaireList && filters.gestionnaireList.length > 0) {
        const gestionnaireStr = typeof user.gestionnaire === 'string'
          ? user.gestionnaire || ''
          : user.gestionnaire
            ? `${user.gestionnaire.prenom || ''} ${user.gestionnaire.nom || ''}`.trim() || ''
            : '';
        if (!filters.gestionnaireList.includes(gestionnaireStr)) {
          return false;
        }
      }

      // Filtre par tranches d'âge
      if (filters.ageGroups && filters.ageGroups.length > 0) {
        if (!filters.ageGroups.includes(user.trancheAge || '')) {
          return false;
        }
      }

      // Filtre par secteurs
      if (filters.sectors && filters.sectors.length > 0) {
        if (!filters.sectors.includes(user.secteur || '')) {
          return false;
        }
      }

      // Filtre par présence d'email
      if (filters.hasEmail !== undefined) {
        const hasEmail = !!(user.email && user.email.trim());
        if (filters.hasEmail !== hasEmail) {
          return false;
        }
      }

      // Filtre par présence de téléphone
      if (filters.hasPhone !== undefined) {
        const hasPhone = !!(user.telephone && user.telephone.trim());
        if (filters.hasPhone !== hasPhone) {
          return false;
        }
      }

      // Filtre par expérience précédente
      if (filters.hasPreviousExperience !== undefined) {
        if (filters.hasPreviousExperience !== user.hasPrevExp) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Génère un rapport de performance par gestionnaire
   */
  generateGestionnaireReport(users: User[]) {
    const gestionnaireStats: Record<string, {
      totalUsers: number;
      activeUsers: number;
      closedUsers: number;
      averageProcessingTime: number;
      recentActivity: number;
    }> = {};

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    users.forEach(user => {
      // Convertir gestionnaire en string pour l'utiliser comme clé d'index
      let gestionnaireKey: string;
      if (!user.gestionnaire) {
        gestionnaireKey = 'Non assigné';
      } else if (typeof user.gestionnaire === 'string') {
        gestionnaireKey = user.gestionnaire;
      } else {
        // Si c'est un objet Gestionnaire
        const gestObj = user.gestionnaire;
        gestionnaireKey = `${gestObj.prenom || ''} ${gestObj.nom || ''}`.trim() || gestObj.id || 'Gestionnaire inconnu';
      }

      if (!gestionnaireStats[gestionnaireKey]) {
        gestionnaireStats[gestionnaireKey] = {
          totalUsers: 0,
          activeUsers: 0,
          closedUsers: 0,
          averageProcessingTime: 0,
          recentActivity: 0
        };
      }

      const stats = gestionnaireStats[gestionnaireKey];
      stats.totalUsers++;

      // Comptage par statut
      if (user.etat === 'actif') {
        stats.activeUsers++;
      } else if (user.etat === 'fermé' || user.etat === 'cloturé') {
        stats.closedUsers++;
      }

      // Activité récente - utiliser derniereModification au lieu de dateMiseAJour
      const updateDate = user.derniereModification || user.dateOuverture;
      if (updateDate) {
        const date = new Date(updateDate);
        if (date >= thirtyDaysAgo) {
          stats.recentActivity++;
        }
      }

      // Temps de traitement moyen (approximatif)
      if (user.dateOuverture && user.dateCloture) {
        const openDate = new Date(user.dateOuverture);
        const closeDate = new Date(user.dateCloture);
        const processingDays = (closeDate.getTime() - openDate.getTime()) / (1000 * 60 * 60 * 24);
        stats.averageProcessingTime = (stats.averageProcessingTime + processingDays) / 2;
      }
    });

    return gestionnaireStats;
  }

  /**
   * Analyse les tendances temporelles
   */
  analyzeTrends(users: User[], periodMonths: number = 12) {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - periodMonths, 1);

    const monthlyData: Record<string, {
      newUsers: number;
      closedUsers: number;
      totalActive: number;
    }> = {};

    // Initialiser les mois
    for (let i = 0; i < periodMonths; i++) {
      const date = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[key] = {
        newUsers: 0,
        closedUsers: 0,
        totalActive: 0
      };
    }

    users.forEach(user => {
      // Nouveaux utilisateurs par mois
      if (user.dateOuverture) {
        const openDate = new Date(user.dateOuverture);
        if (openDate >= startDate) {
          const monthKey = `${openDate.getFullYear()}-${String(openDate.getMonth() + 1).padStart(2, '0')}`;
          if (monthlyData[monthKey]) {
            monthlyData[monthKey].newUsers++;
          }
        }
      }

      // Utilisateurs fermés par mois
      if (user.dateCloture) {
        const closeDate = new Date(user.dateCloture);
        if (closeDate >= startDate) {
          const monthKey = `${closeDate.getFullYear()}-${String(closeDate.getMonth() + 1).padStart(2, '0')}`;
          if (monthlyData[monthKey]) {
            monthlyData[monthKey].closedUsers++;
          }
        }
      }

      // Utilisateurs actifs (approximation)
      if (user.etat === 'actif') {
        Object.keys(monthlyData).forEach(month => {
          const [year, monthNum] = month.split('-').map(Number);
          const monthDate = new Date(year, monthNum - 1, 1);

          const openDate = user.dateOuverture ? new Date(user.dateOuverture) : null;
          const closeDate = user.dateCloture ? new Date(user.dateCloture) : null;

          const wasOpenInMonth = openDate && openDate <= monthDate;
          const wasNotClosedInMonth = !closeDate || closeDate > monthDate;

          if (wasOpenInMonth && wasNotClosedInMonth) {
            monthlyData[month].totalActive++;
          }
        });
      }
    });

    return monthlyData;
  }

  /**
   * Génère des suggestions d'amélioration basées sur l'analyse des données
   */
  generateInsights(users: User[]): string[] {
    const insights: string[] = [];
    const stats = this.calculateStats(users);

    // Analyse de la charge de travail
    const gestionnaireWorkload = Object.entries(stats.byGestionnaire)
      .sort(([, a], [, b]) => b - a);

    if (gestionnaireWorkload.length > 1) {
      const [heaviest, lightest] = [gestionnaireWorkload[0], gestionnaireWorkload[gestionnaireWorkload.length - 1]];
      const ratio = heaviest[1] / lightest[1];

      if (ratio > 2) {
        insights.push(`Déséquilibre de charge: ${heaviest[0]} gère ${heaviest[1]} utilisateurs contre ${lightest[1]} pour ${lightest[0]}. Considérer une redistribution.`);
      }
    }

    // Analyse des données manquantes
    const usersWithoutEmail = users.filter(u => !u.email || !u.email.trim()).length;
    const usersWithoutPhone = users.filter(u => !u.telephone || !u.telephone.trim()).length;

    if (usersWithoutEmail > users.length * 0.1) {
      insights.push(`${usersWithoutEmail} utilisateurs (${Math.round(usersWithoutEmail / users.length * 100)}%) n'ont pas d'email renseigné.`);
    }

    if (usersWithoutPhone > users.length * 0.1) {
      insights.push(`${usersWithoutPhone} utilisateurs (${Math.round(usersWithoutPhone / users.length * 100)}%) n'ont pas de téléphone renseigné.`);
    }

    // Analyse de l'activité récente
    if (stats.recentlyAdded < users.length * 0.05) {
      insights.push('Peu de nouveaux utilisateurs récemment. Vérifier les processus d\'inscription.');
    }

    if (stats.recentlyUpdated < users.length * 0.1) {
      insights.push('Peu de mises à jour récentes des dossiers. Encourager la mise à jour régulière.');
    }

    return insights;
  }
}

export const userAnalyticsService = new UserAnalyticsService();
