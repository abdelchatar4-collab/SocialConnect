/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.
*/

import { User } from '@/types/user';
import { UserStats, AdvancedFilters } from './analytics/analyticsTypes';
import { calculateBaseStats } from './analytics/statsCalculators';

class UserAnalyticsService {
  calculateStats(users: User[]): UserStats { return calculateBaseStats(users); }

  applyAdvancedFilters(users: User[], f: AdvancedFilters): User[] {
    return users.filter(u => {
      if (f.dateRange && u.dateOuverture) {
        const d = new Date(u.dateOuverture); if (d < new Date(f.dateRange.start) || d > new Date(f.dateRange.end)) return false;
      }
      if (f.statusList?.length && !f.statusList.includes(u.etat || '')) return false;
      if (f.nationalityList?.length && !f.nationalityList.includes(u.nationalite || '')) return false;
      if (f.antenneList?.length && !f.antenneList.includes(u.antenne || '')) return false;
      if (f.gestionnaireList?.length) {
        const g = typeof u.gestionnaire === 'string' ? u.gestionnaire : (u.gestionnaire ? `${u.gestionnaire.prenom || ''} ${u.gestionnaire.nom || ''}`.trim() : '');
        if (!f.gestionnaireList.includes(g)) return false;
      }
      if (f.ageGroups?.length && !f.ageGroups.includes(u.trancheAge || '')) return false;
      if (f.sectors?.length && !f.sectors.includes(u.secteur || '')) return false;
      if (f.hasEmail !== undefined && !!(u.email?.trim()) !== f.hasEmail) return false;
      if (f.hasPhone !== undefined && !!(u.telephone?.trim()) !== f.hasPhone) return false;
      if (f.hasPreviousExperience !== undefined && u.hasPrevExp !== f.hasPreviousExperience) return false;
      return true;
    });
  }

  generateGestionnaireReport(users: User[]) {
    const report: Record<string, any> = {};
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    users.forEach(u => {
      const g = typeof u.gestionnaire === 'string' ? (u.gestionnaire || 'Non assigné') : (u.gestionnaire ? `${u.gestionnaire.prenom || ''} ${u.gestionnaire.nom || ''}`.trim() : 'Non assigné');
      if (!report[g]) report[g] = { totalUsers: 0, activeUsers: 0, closedUsers: 0, averageProcessingTime: 0, recentActivity: 0 };
      const s = report[g]; s.totalUsers++;
      if (u.etat === 'actif') s.activeUsers++; else if (['fermé', 'cloturé'].includes(u.etat || '')) s.closedUsers++;
      if ((u.derniereModification || u.dateOuverture) && new Date(u.derniereModification || u.dateOuverture!) >= thirtyDaysAgo) s.recentActivity++;
      if (u.dateOuverture && u.dateCloture) {
        const days = (new Date(u.dateCloture).getTime() - new Date(u.dateOuverture).getTime()) / 86400000;
        s.averageProcessingTime = (s.averageProcessingTime + days) / 2;
      }
    });
    return report;
  }

  analyzeTrends(users: User[], months = 12) {
    const start = new Date(); start.setMonth(start.getMonth() - months); start.setDate(1);
    const data: Record<string, any> = {};
    for (let i = 0; i < months; i++) {
      const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
      data[`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`] = { newUsers: 0, closedUsers: 0, totalActive: 0 };
    }
    users.forEach(u => {
      if (u.dateOuverture) {
        const k = `${new Date(u.dateOuverture).getFullYear()}-${String(new Date(u.dateOuverture).getMonth() + 1).padStart(2, '0')}`;
        if (data[k]) data[k].newUsers++;
      }
      if (u.dateCloture) {
        const k = `${new Date(u.dateCloture).getFullYear()}-${String(new Date(u.dateCloture).getMonth() + 1).padStart(2, '0')}`;
        if (data[k]) data[k].closedUsers++;
      }
    });
    return data;
  }

  generateInsights(users: User[]): string[] {
    const i: string[] = [], s = this.calculateStats(users);
    const w = Object.entries(s.byGestionnaire).sort(([, a], [, b]) => b - a);
    if (w.length > 1 && w[0][1] / w[w.length - 1][1] > 2) i.push(`Déséquilibre de charge: ${w[0][0]} (${w[0][1]}) vs ${w[w.length - 1][0]} (${w[w.length - 1][1]}).`);
    const ne = users.filter(u => !u.email?.trim()).length, np = users.filter(u => !u.telephone?.trim()).length;
    if (ne > users.length * 0.1) i.push(`${ne} usagers (${Math.round(ne / users.length * 100)}%) sans email.`);
    if (np > users.length * 0.1) i.push(`${np} usagers (${Math.round(np / users.length * 100)}%) sans téléphone.`);
    return i;
  }
}

export const userAnalyticsService = new UserAnalyticsService();
