/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

// src/features/dashboard/types/dashboard.ts

export interface ChartDataItem {
  name: string;
  value: number;
}

export interface TimelineDataItem {
  name: string;
  actions: number;
}

// Nouveaux types pour les statistiques d'actions
export interface ActionStatsItem {
  tsr: string;
  totalActions: number;
  averagePerMonth: number;
  averagePerYear: number;
  actionsByMonth: { [month: string]: number };
}

// Nouveau type pour les statistiques d'actions par antenne
export interface ActionStatsByAntenneItem {
  antenne: string;
  totalActions: number;
  averagePerMonth: number;
  averagePerYear: number;
  actionsByMonth: { [month: string]: number };
  numberOfTSR: number; // Nombre de TSR dans cette antenne
  numberOfUsers: number; // Nombre d'utilisateurs dans cette antenne
}

export interface DashboardStats {
  total: number;
  pourcentageActifs: number;
  totalProblematiques: number;
  parAntenne: ChartDataItem[];
  parProblematique: ChartDataItem[];
  parAge: ChartDataItem[];
  parGenre: ChartDataItem[];
  parSecteur: ChartDataItem[];
  gestionnaireData: ChartDataItem[];
  statutSocialData: ChartDataItem[];
  actionTimelineData: TimelineDataItem[];
  // Nouvelles statistiques d'actions par antenne (remplace actionStatsByTSR)
  actionStatsByAntenne: ActionStatsByAntenneItem[];
  averageActionsPerAntenne: number;
  averageActionsPerMonth: number;
  averageActionsPerYear: number;
  // Statistiques Prévention Expulsion
  prevExpStats?: PrevExpStats | null;
  // Statistiques Logement
  housingStats?: HousingStats | null;
}

export interface PrevExpStats {
  totalPrevExp: number;
  dossiersOuvertsCount: number; // Nouveau KPI
  expulsionsEviteesCount: number; // Nouveau KPI demandé
  tauxMaintien: number; // Nouveau KPI
  solutionData: { name: string; value: number; group: 'positive' | 'negative' | 'neutral' }[];
  cpasData: ChartDataItem[];
  funnelStats: {
    audiencePassed: number;
    jugementPassed: number;
    expulsionFuture: number;
    total: number;
  };
  housingQualityData: ChartDataItem[];
  motifsData: ChartDataItem[]; // Nouveau Graphique
  expulsionTimeline: { date: string; count: number; users: { id: string; nom: string }[] }[]; // Nouvelle Timeline
  profilPublic: { // Nouveau: Profil démographique
    parAge: ChartDataItem[];
    parGenre: ChartDataItem[];
    parCompositionFamiliale: ChartDataItem[];
  };
}

export interface HousingStats {
  totalLogement: number;
  loyerMoyen: number;
  partLogementSocial: number;
  typeLogementData: ChartDataItem[];
  loyerRangeData: ChartDataItem[];
}

export interface DashboardProps {
  users: import('@/types').User[];
}

export interface StatCalculationOptions {
  includeInactive?: boolean;
  filterByDate?: {
    start: Date;
    end: Date;
  };
}

export interface AgeGroups {
  '0-18 ans': number;
  '19-30 ans': number;
  '31-45 ans': number;
  '46-60 ans': number;
  '61+ ans': number;
  'Non spécifié': number;
}

export interface CountByField {
  [key: string]: number;
}

export interface ProblematicApiData {
  problematiqueStats: CountByField;
  totalProblematiquesUniques: number;
}
