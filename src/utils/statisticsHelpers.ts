/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { User } from '@/types';

// Types pour les statistiques
interface GeneralStats {
  total: number;
  actifs: number;
  nouveauxCeMois: number;
  dossiersClotures: number;
  parAntenne: Record<string, number>;
  changeTotal: number;
  changeActifs: number;
  changeNouveaux: number;
  changeClotures: number;
}

interface DemographicStats {
  parGenre: Record<string, number>;
  parAge: Record<string, number>;
  topNationalites: [string, number][];
}

interface ProblematiquesStats {
  total: number;
  repartition: [string, number][];
  moyenneParUsager: string;
}

interface EvolutionStats {
  labels: string[];
  nouveauxParMois: number[];
  cloturesParMois: number[];
}

interface ActionsStats {
  totalActions: number;
  typesActions: [string, number][];
  moyenneParUsager: string;
}

interface ChargeStats {
  parGestionnaire: [string, number][];
}

interface Statistics {
  general: GeneralStats;
  demographic: DemographicStats;
  problematiques: ProblematiquesStats;
  evolution: EvolutionStats;
  actions: ActionsStats;
  charge: ChargeStats;
}

type TimeFilter = 'all' | 'year' | 'quarter' | 'month';

/**
 * Calcule toutes les statistiques nécessaires pour le tableau de bord
 * @param users - Liste des utilisateurs
 * @param timeFilter - Filtre temporel ('all', 'year', 'quarter', 'month')
 * @param antenneFilter - Filtre par antenne ('all' ou nom de l'antenne)
 * @returns Objet contenant toutes les statistiques
 */
export const calculateStatistics = (
  users: User[],
  timeFilter: TimeFilter = 'all',
  antenneFilter: string = 'all'
): Statistics => {
  // Filtrer les utilisateurs selon les critères
  const filteredUsers = filterUsersByTimeAndAntenne(users, timeFilter, antenneFilter);

  // Statistiques générales
  const general = getGeneralStats(filteredUsers, users);

  // Statistiques démographiques
  const demographic = getDemographicStats(filteredUsers);

  // Statistiques sur les problématiques
  const problematiques = getProblematiquesStats(filteredUsers);

  // Statistiques sur l'évolution temporelle
  const evolution = getEvolutionStats(users, timeFilter, antenneFilter);

  // Statistiques sur les actions
  const actions = getActionsStats(filteredUsers);

  // Statistiques sur la charge de travail
  const charge = getChargeStats(filteredUsers);

  return {
    general,
    demographic,
    problematiques,
    evolution,
    actions,
    charge
  };
};

/**
 * Filtre les utilisateurs selon la période et l'antenne
 */
const filterUsersByTimeAndAntenne = (users: User[], timeFilter: TimeFilter, antenneFilter: string): User[] => {
  const now = new Date();
  let filteredUsers = [...users];

  // Filtre temporel
  if (timeFilter !== 'all') {
    const filterDate = new Date();

    if (timeFilter === 'month') {
      filterDate.setMonth(now.getMonth() - 1);
    } else if (timeFilter === 'quarter') {
      filterDate.setMonth(now.getMonth() - 3);
    } else if (timeFilter === 'year') {
      filterDate.setFullYear(now.getFullYear() - 1);
    }

    filteredUsers = filteredUsers.filter(user => {
      if (!user.dateOuverture) return false;
      const dateOuverture = new Date(user.dateOuverture);
      return dateOuverture >= filterDate;
    });
  }

  // Filtre par antenne
  if (antenneFilter !== 'all') {
    filteredUsers = filteredUsers.filter(user => user.antenne === antenneFilter);
  }

  return filteredUsers;
};

/**
 * Calcule les statistiques générales
 */
const getGeneralStats = (filteredUsers: User[], allUsers: User[]): GeneralStats => {
  // Total d'utilisateurs (filtrés)
  const total = filteredUsers.length;

  // Dossiers actifs (état "Ouvert")
  const actifs = filteredUsers.filter(user => user.etat === "Ouvert").length;

  // Calcul pour les nouveaux ce mois
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  const nouveauxCeMois = filteredUsers.filter(user => {
    if (!user.dateOuverture) return false;
    const dateOuverture = new Date(user.dateOuverture);
    return dateOuverture >= oneMonthAgo;
  }).length;

  // Dossiers clôturés
  const dossiersClotures = filteredUsers.filter(user => user.dateCloture).length;

  // Taux de changement (pour les cartes avec tendances)
  const twoMonthsAgo = new Date();
  twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
  const oneMonthAgoDate = new Date();
  oneMonthAgoDate.setMonth(oneMonthAgoDate.getMonth() - 1);

  const nouveauxMoisPrecedent = allUsers.filter(user => {
    if (!user.dateOuverture) return false;
    const dateOuverture = new Date(user.dateOuverture);
    return dateOuverture >= twoMonthsAgo && dateOuverture < oneMonthAgo;
  }).length;

  // Calcul du pourcentage de changement
  const changeNouveaux = nouveauxMoisPrecedent !== 0
    ? Math.round((nouveauxCeMois - nouveauxMoisPrecedent) / nouveauxMoisPrecedent * 100)
    : 100;

  // Calcul du changement pour le total et les actifs (utilisation de valeurs précédentes fictives pour l'exemple)
  // Dans un cas réel, vous auriez à stocker les valeurs antérieures pour faire une vraie comparaison
  const changeTotal = 5; // Exemple: augmentation de 5%
  const changeActifs = 2; // Exemple: augmentation de 2%
  const changeClotures = -3; // Exemple: diminution de 3%

  // Répartition par antenne
  const parAntenne: Record<string, number> = {};
  filteredUsers.forEach(user => {
    const antenne = user.antenne || 'Non spécifié';
    parAntenne[antenne] = (parAntenne[antenne] || 0) + 1;
  });

  return {
    total,
    actifs,
    nouveauxCeMois,
    dossiersClotures,
    parAntenne,
    changeTotal,
    changeActifs,
    changeNouveaux,
    changeClotures
  };
};

/**
 * Calcule les statistiques démographiques
 */
const getDemographicStats = (users: User[]): DemographicStats => {
  // Répartition par genre
  const parGenre: Record<string, number> = {};
  users.forEach(user => {
    const genre = user.genre || 'Non spécifié';
    parGenre[genre] = (parGenre[genre] || 0) + 1;
  });

  // Répartition par âge
  const parAge: Record<string, number> = {
    'Moins de 18 ans': 0,
    '18-30 ans': 0,
    '31-45 ans': 0,
    '46-60 ans': 0,
    'Plus de 60 ans': 0,
    'Non spécifié': 0
  };

  users.forEach(user => {
    if (!user.dateNaissance) {
      parAge['Non spécifié']++;
      return;
    }

    const birthDate = new Date(user.dateNaissance);
    if (isNaN(birthDate.getTime())) {
      parAge['Non spécifié']++;
      return;
    }

    const ageDifMs = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDifMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);

    if (age < 18) parAge['Moins de 18 ans']++;
    else if (age < 31) parAge['18-30 ans']++;
    else if (age < 46) parAge['31-45 ans']++;
    else if (age < 61) parAge['46-60 ans']++;
    else parAge['Plus de 60 ans']++;
  });

  // Nationalités les plus courantes
  const nationalites: Record<string, number> = {};
  users.forEach(user => {
    if (user.nationalite) {
      nationalites[user.nationalite] = (nationalites[user.nationalite] || 0) + 1;
    }
  });

  const topNationalites = Object.entries(nationalites)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return {
    parGenre,
    parAge,
    topNationalites
  };
};

/**
 * Calcule les statistiques sur les problématiques
 */
const getProblematiquesStats = (users: User[]): ProblematiquesStats => {
  // Nombre total de problématiques
  let total = 0;

  // Répartition par type de problématique
  const types: Record<string, number> = {};

  users.forEach(user => {
    if (user.problematiques && Array.isArray(user.problematiques)) {
      total += user.problematiques.length;

      user.problematiques.forEach(prob => {
        if (prob.type) {
          types[prob.type] = (types[prob.type] || 0) + 1;
        }
      });
    }
  });

  // Trier les problématiques par occurrence
  const repartition = Object.entries(types).sort((a, b) => b[1] - a[1]);

  // Moyenne de problématiques par usager
  const moyenneParUsager = users.length > 0 ? (total / users.length).toFixed(1) : "0";

  return {
    total,
    repartition,
    moyenneParUsager
  };
};

/**
 * Calcule les statistiques d'évolution sur les 12 derniers mois
 */
const getEvolutionStats = (allUsers: User[], timeFilter: TimeFilter, antenneFilter: string): EvolutionStats => {
  const now = new Date();
  const months: string[] = [];
  const nouveauxParMois: number[] = [];
  const cloturesParMois: number[] = [];

  // Générer les 12 derniers mois
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setMonth(now.getMonth() - i);

    const monthName = d.toLocaleString('fr-FR', { month: 'short' });
    const year = d.getFullYear();
    months.push(`${monthName} ${year}`);

    const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
    const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);

    // Filtrer par antenne si nécessaire
    let usersToCount = allUsers;
    if (antenneFilter !== 'all') {
      usersToCount = allUsers.filter(user => user.antenne === antenneFilter);
    }

    // Compter les nouveaux dossiers pour ce mois
    const nouveaux = usersToCount.filter(user => {
      if (!user.dateOuverture) return false;
      const dateOuverture = new Date(user.dateOuverture);
      return dateOuverture >= monthStart && dateOuverture <= monthEnd;
    }).length;

    // Compter les dossiers clôturés pour ce mois
    const clotures = usersToCount.filter(user => {
      if (!user.dateCloture) return false;
      const dateCloture = new Date(user.dateCloture);
      return dateCloture >= monthStart && dateCloture <= monthEnd;
    }).length;

    nouveauxParMois.push(nouveaux);
    cloturesParMois.push(clotures);
  }

  return {
    labels: months,
    nouveauxParMois,
    cloturesParMois
  };
};

/**
 * Calcule les statistiques sur les actions
 */
const getActionsStats = (users: User[]): ActionsStats => {
  // Types d'actions
  const types: Record<string, number> = {};
  let totalActions = 0;

  users.forEach(user => {
    if (user.actions && Array.isArray(user.actions)) {
      totalActions += user.actions.length;

      user.actions.forEach(action => {
        if (action.type) {
          types[action.type] = (types[action.type] || 0) + 1;
        }
      });
    }
  });

  // Trier les types d'actions par occurrence
  const typesActions = Object.entries(types).sort((a, b) => b[1] - a[1]);

  // Moyenne d'actions par usager
  const moyenneParUsager = users.length > 0 ? (totalActions / users.length).toFixed(1) : "0";

  return {
    totalActions,
    typesActions,
    moyenneParUsager
  };
};

/**
 * Calcule les statistiques sur la charge de travail
 */
const getChargeStats = (users: User[]): ChargeStats => {
  // Charge par gestionnaire
  const parGestionnaire: Record<string, number> = {};

  users.forEach(user => {
    if (user.gestionnaire && user.etat === "Ouvert") {
      const gestionnaireNom = typeof user.gestionnaire === 'string'
        ? user.gestionnaire
        : user.gestionnaire.prenom || 'Non spécifié';
      parGestionnaire[gestionnaireNom] = (parGestionnaire[gestionnaireNom] || 0) + 1;
    }
  });

  // Trier les gestionnaires par nombre de dossiers
  const sorted = Object.entries(parGestionnaire).sort((a, b) => b[1] - a[1]);

  return {
    parGestionnaire: sorted
  };
};

// Export des types pour l'utilisation dans d'autres fichiers
export type {
  Statistics,
  GeneralStats,
  DemographicStats,
  ProblematiquesStats,
  EvolutionStats,
  ActionsStats,
  ChargeStats,
  TimeFilter
};
