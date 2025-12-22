/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import React, { useState, useEffect } from 'react';
import { User, Gestionnaire } from '@/types';
import { DashboardProps } from '../../types/dashboard';
import {
  calculatePrevExpStats,
  calculateHousingStats,
  getUrgentActions,
  calculateStatistics,
  generateSummaryText
} from '../../utils/dashboardCalculations';

// Components
import DashboardHeader from './DashboardHeader';
import DashboardAntenneStats from './DashboardAntenneStats';
import DashboardCharts from './DashboardCharts';
import PrevExpDashboard from './PrevExpDashboard';
import HousingDashboard from './HousingDashboard';

const Dashboard: React.FC<DashboardProps> = ({ users }) => {
  // États
  const [gestionnaires, setGestionnaires] = useState<Gestionnaire[]>([]);

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

  // Calculer les statistiques
  const stats = calculateStatistics(users, gestionnaires);
  const fullSummary = generateSummaryText(stats);

  // Calculer les statistiques spécifiques
  const prevExpStats = calculatePrevExpStats(users);
  const housingStats = calculateHousingStats(users);
  const urgentActions = getUrgentActions(users);

  return (
    <div className="space-y-8">
      {/* Synthèse des statistiques */}
      <DashboardHeader fullSummary={fullSummary} />

      {/* Statistiques des actions par antenne */}
      <DashboardAntenneStats
        actionStatsByAntenne={stats.actionStatsByAntenne}
        averageActionsPerAntenne={stats.averageActionsPerAntenne}
        averageActionsPerMonth={stats.averageActionsPerMonth}
        averageActionsPerYear={stats.averageActionsPerYear}
      />

      {/* Graphiques principaux (Démographie et Secteurs) */}
      <DashboardCharts stats={stats} />

      {/* Section Prévention Expulsion */}
      {prevExpStats && (
        <PrevExpDashboard
          prevExpStats={prevExpStats}
          urgentActions={urgentActions}
          gestionnaires={gestionnaires}
        />
      )}

      {/* Section Analyse Logement */}
      {housingStats && (
        <HousingDashboard housingStats={housingStats} />
      )}
    </div>
  );
};

export default Dashboard;
