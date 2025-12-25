/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { User } from '@/types';
import { Statistics, TimeFilter } from './statistics/statsTypes';
import { getGeneralStats, getDemographicStats } from './statistics/demographicStats';
import {
  getEvolutionStats, getProblematiquesStats, getActionsStats, getChargeStats
} from './statistics/evolutionAndOtherStats';

export const calculateStatistics = (
  users: User[],
  timeFilter: TimeFilter = 'all',
  antenneFilter: string = 'all'
): Statistics => {
  const filteredUsers = filterUsersByTimeAndAntenne(users, timeFilter, antenneFilter);
  return {
    general: getGeneralStats(filteredUsers, users),
    demographic: getDemographicStats(filteredUsers),
    problematiques: getProblematiquesStats(filteredUsers),
    evolution: getEvolutionStats(users, antenneFilter),
    actions: getActionsStats(filteredUsers),
    charge: getChargeStats(filteredUsers)
  };
};

const filterUsersByTimeAndAntenne = (users: User[], timeFilter: TimeFilter, antenneFilter: string): User[] => {
  let filtered = antenneFilter === 'all' ? [...users] : users.filter(u => u.antenne === antenneFilter);
  if (timeFilter !== 'all') {
    const d = new Date();
    if (timeFilter === 'month') d.setMonth(d.getMonth() - 1);
    else if (timeFilter === 'quarter') d.setMonth(d.getMonth() - 3);
    else if (timeFilter === 'year') d.setFullYear(d.getFullYear() - 1);
    filtered = filtered.filter(u => u.dateOuverture && new Date(u.dateOuverture) >= d);
  }
  return filtered;
};

export type { Statistics, TimeFilter } from './statistics/statsTypes';
