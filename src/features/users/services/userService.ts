/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { apiClient } from '@/lib/apiClient';
import type { User, UserFormData, Gestionnaire } from '@/types';
import { UserServiceOptions, UserSearchFilters } from './user/userServiceTypes';
import { validateUserData, generateUserId } from './user/userServiceUtils';

export class UserService {
  private static instance: UserService;
  private constructor() { }
  public static getInstance(): UserService {
    if (!UserService.instance) UserService.instance = new UserService();
    return UserService.instance;
  }

  async getAllUsers(o: UserServiceOptions = {}) { return await apiClient.getUsers({ useCache: o.useCache ?? true }); }
  async getUserById(id: string) { return await apiClient.getUser(id); }
  async createUser(data: UserFormData) {
    if (!validateUserData(data).isValid) throw new Error("Invalid data");
    return await apiClient.createUser({ ...data, id: data.id || generateUserId(data) });
  }
  async updateUser(id: string, data: Partial<UserFormData>) { return await apiClient.updateUser(id, { ...data, id }); }
  async deleteUser(id: string) { return (await apiClient.deleteUser(id)).success; }
  async deleteMultipleUsers(ids: string[]) { return (await apiClient.bulkDeleteUsers({ ids })).success; }
  // deleteAllUsers supprimé pour raisons de sécurité
  async getAllGestionnaires() { return await apiClient.getGestionnaires(); }

  async searchUsers(f: UserSearchFilters, o: UserServiceOptions = {}): Promise<User[]> {
    const users = await this.getAllUsers(o);
    return users.filter(u => {
      if (f.gestionnaire && u.gestionnaire !== f.gestionnaire) return false;
      if (f.secteur && u.secteur !== f.secteur) return false;
      if (f.antenne && u.antenne !== f.antenne) return false;
      if (f.etat && u.etat !== f.etat) return false;
      if (f.search) {
        const s = f.search.toLowerCase();
        return [u.nom, u.prenom, u.telephone, u.email, u.id].some(v => v?.toLowerCase().includes(s));
      }
      return true;
    });
  }

  async getUserStats() {
    const users = await this.getAllUsers({ useCache: false });
    const stats = { total: users.length, byGestionnaire: {} as any, byAntenne: {} as any, byEtat: {} as any };
    users.forEach(u => {
      const g = typeof u.gestionnaire === 'string' ? u.gestionnaire : (u.gestionnaire?.prenom ? `${u.gestionnaire.prenom} ${u.gestionnaire.nom}` : 'Non assigné');
      stats.byGestionnaire[g] = (stats.byGestionnaire[g] || 0) + 1;
      stats.byAntenne[u.antenne || 'Non spécifiée'] = (stats.byAntenne[u.antenne || 'Non spécifiée'] || 0) + 1;
      stats.byEtat[u.etat || 'Non défini'] = (stats.byEtat[u.etat || 'Non défini'] || 0) + 1;
    });
    return stats;
  }

  clearCache() { apiClient.clearCache(); }
  async isServiceAvailable() { return await apiClient.healthCheck(); }
}

export const userService = UserService.getInstance();
export const fetchUsers = () => userService.getAllUsers();
export const fetchUser = (id: string) => userService.getUserById(id);
export const saveUser = (u: UserFormData) => u.id ? userService.updateUser(u.id, u) : userService.createUser(u);
export const deleteUser = (id: string) => userService.deleteUser(id);
export type { User, UserFormData, Gestionnaire };
