/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

/**
 * API Client centralisé pour l'application Gestion Usagers
 *
 * Ce module centralise tous les appels API et la logique de gestion des données
 * pour éliminer les duplications et améliorer la maintenabilité.
 *
 * @version 1.0.0
 * @author Équipe Refactorisation
 */

import type { User, UserFormData, Gestionnaire } from '@/types';

// Configuration API
const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://192.168.2.147:3001',
  TIMEOUT: 5000,
  STORAGE_KEY: 'gestionUsagers_users',
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
} as const;

// Types pour les réponses API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface BulkDeleteRequest {
  ids: string[];
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Types pour les options de requête
interface RequestOptions extends RequestInit {
  timeout?: number;
  useCache?: boolean;
  cacheKey?: string;
}

/**
 * Classe principale du client API centralisé
 */
export class ApiClient {
  private static instance: ApiClient;
  private baseURL: string;
  private timeout: number;

  private constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  /**
   * Singleton pattern pour garantir une seule instance
   */
  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  /**
   * Utilitaire pour les requêtes avec timeout et gestion d'erreurs
   */
  private async fetchWithTimeout(url: string, options: RequestOptions = {}): Promise<Response> {
    const { timeout = this.timeout, ...fetchOptions } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...fetchOptions.headers,
        },
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error(`Request timeout after ${timeout}ms`);
        }
        if (error.message === 'Failed to fetch') {
          throw new Error(`Network error: Could not reach ${this.baseURL}. Please check your connection.`);
        }
      }
      throw error;
    }
  }

  /**
   * Gestion du cache localStorage
   */
  private getFromCache(key: string): any | null {
    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;

      const { timestamp, data } = JSON.parse(cached);
      const isExpired = Date.now() - timestamp > API_CONFIG.CACHE_DURATION;

      if (isExpired) {
        localStorage.removeItem(key);
        return null;
      }

      return data;
    } catch {
      return null;
    }
  }

  private setCache(key: string, data: any): void {
    try {
      localStorage.setItem(key, JSON.stringify({
        timestamp: Date.now(),
        data
      }));
    } catch (error) {
      console.warn('Failed to cache data:', error);
    }
  }

  /**
   * Méthode pour déterminer si on utilise localStorage (dev) ou API (prod)
   */
  private isLocalStorageMode(): boolean {
    return process.env.NODE_ENV === 'development';
  }

  // =================
  // OPÉRATIONS USERS
  // =================

  /**
   * Récupérer tous les utilisateurs
   */
  async getUsers(options: { useCache?: boolean; pagination?: PaginationParams } = {}): Promise<User[]> {
    const { useCache = true, pagination } = options;

    try {
      if (this.isLocalStorageMode()) {
        // Mode développement : localStorage
        const cacheKey = API_CONFIG.STORAGE_KEY;
        const cached = this.getFromCache(cacheKey);

        if (useCache && cached) {
          return cached;
        }

        const savedUsers = localStorage.getItem(cacheKey);
        const users = savedUsers ? JSON.parse(savedUsers) : [];

        if (useCache) {
          this.setCache(cacheKey, users);
        }

        return users;
      } else {
        // Mode production : API
        const url = new URL('/api/users', this.baseURL);

        if (pagination) {
          Object.entries(pagination).forEach(([key, value]) => {
            if (value !== undefined) {
              url.searchParams.append(key, String(value));
            }
          });
        }

        const response = await this.fetchWithTimeout(url.toString());

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return Array.isArray(data) ? data : data.users || [];
      }
    } catch (error) {
      console.error('Erreur récupération utilisateurs:', error);
      throw error;
    }
  }

  /**
   * Récupérer un utilisateur spécifique
   */
  async getUser(id: string): Promise<User> {
    try {
      if (this.isLocalStorageMode()) {
        const users = await this.getUsers({ useCache: false });
        const user = users.find(u => u.id === id);

        if (!user) {
          throw new Error(`Utilisateur avec ID ${id} non trouvé`);
        }

        return user;
      } else {
        const response = await this.fetchWithTimeout(`${this.baseURL}/api/users/${id}`);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
      }
    } catch (error) {
      console.error(`Erreur récupération utilisateur ${id}:`, error);
      throw error;
    }
  }

  /**
   * Convertir UserFormData vers User format pour le stockage
   */
  private convertUserFormDataToUser(userData: UserFormData): User {
    return {
      ...userData,
      partenaire: userData.partenaire ? JSON.stringify(userData.partenaire) : null,
    } as User;
  }

  /**
   * Convertir des données partielles UserFormData vers User format
   */
  private convertPartialUserFormDataToUser(userData: Partial<UserFormData>): Partial<User> {
    // Créer une copie sans le champ partenaire
    const { partenaire, ...restUserData } = userData;

    // Commencer avec les données sans partenaire
    const converted: Partial<User> = { ...restUserData };

    // Convertir le champ partenaire si présent
    if (partenaire !== undefined) {
      converted.partenaire = partenaire ? JSON.stringify(partenaire) : null;
    }

    return converted;
  }

  /**
   * Créer un nouvel utilisateur
   */
  async createUser(userData: UserFormData): Promise<User> {
    try {
      if (this.isLocalStorageMode()) {
        const users = await this.getUsers({ useCache: false });
        const convertedUserData = this.convertUserFormDataToUser(userData);
        const newUser = { ...convertedUserData, id: userData.id || this.generateUserId() };

        users.push(newUser);
        localStorage.setItem(API_CONFIG.STORAGE_KEY, JSON.stringify(users));

        return newUser;
      } else {
        const response = await this.fetchWithTimeout(`${this.baseURL}/api/users`, {
          method: 'POST',
          body: JSON.stringify(userData),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
      }
    } catch (error) {
      console.error('Erreur création utilisateur:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour un utilisateur
   */
  async updateUser(id: string, userData: Partial<UserFormData>): Promise<User> {
    try {
      if (this.isLocalStorageMode()) {
        const users = await this.getUsers({ useCache: false });
        const userIndex = users.findIndex(u => u.id === id);

        if (userIndex === -1) {
          throw new Error(`Utilisateur avec ID ${id} non trouvé`);
        }

        // Convertir les données partielles avec la nouvelle fonction
        const convertedUserData = this.convertPartialUserFormDataToUser(userData);

        users[userIndex] = { ...users[userIndex], ...convertedUserData, id };
        localStorage.setItem(API_CONFIG.STORAGE_KEY, JSON.stringify(users));

        return users[userIndex];
      } else {
        const response = await this.fetchWithTimeout(`${this.baseURL}/api/users/${id}`, {
          method: 'PUT',
          body: JSON.stringify(userData),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
      }
    } catch (error) {
      console.error(`Erreur mise à jour utilisateur ${id}:`, error);
      throw error;
    }
  }

  /**
   * Supprimer un utilisateur
   */
  async deleteUser(id: string): Promise<ApiResponse> {
    try {
      if (this.isLocalStorageMode()) {
        const users = await this.getUsers({ useCache: false });
        const filteredUsers = users.filter(u => u.id !== id);

        localStorage.setItem(API_CONFIG.STORAGE_KEY, JSON.stringify(filteredUsers));

        return { success: true, message: 'Utilisateur supprimé avec succès' };
      } else {
        const response = await this.fetchWithTimeout(`${this.baseURL}/api/users/${id}`, {
          method: 'DELETE',
          headers: {
            'x-admin-auth': 'true',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return { success: true, message: 'Utilisateur supprimé avec succès' };
      }
    } catch (error) {
      console.error(`Erreur suppression utilisateur ${id}:`, error);
      throw error;
    }
  }

  /**
   * Suppression en masse d'utilisateurs
   */
  async bulkDeleteUsers(request: BulkDeleteRequest): Promise<ApiResponse> {
    try {
      if (this.isLocalStorageMode()) {
        const users = await this.getUsers({ useCache: false });
        const filteredUsers = users.filter(u => !request.ids.includes(u.id));

        localStorage.setItem(API_CONFIG.STORAGE_KEY, JSON.stringify(filteredUsers));

        return {
          success: true,
          message: `${request.ids.length} utilisateur(s) supprimé(s) avec succès`
        };
      } else {
        const response = await this.fetchWithTimeout(`${this.baseURL}/api/users/bulk-delete`, {
          method: 'DELETE',
          headers: {
            'x-admin-auth': 'true',
          },
          body: JSON.stringify(request),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return {
          success: true,
          message: `${request.ids.length} utilisateur(s) supprimé(s) avec succès`
        };
      }
    } catch (error) {
      console.error('Erreur suppression en masse:', error);
      throw error;
    }
  }

  /**
   * Supprimer tous les utilisateurs
   */
  async deleteAllUsers(): Promise<ApiResponse> {
    try {
      if (this.isLocalStorageMode()) {
        localStorage.setItem(API_CONFIG.STORAGE_KEY, JSON.stringify([]));

        return { success: true, message: 'Tous les utilisateurs ont été supprimés' };
      } else {
        const response = await this.fetchWithTimeout(`${this.baseURL}/api/users/delete-all`, {
          method: 'DELETE',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return { success: true, message: 'Tous les utilisateurs ont été supprimés' };
      }
    } catch (error) {
      console.error('Erreur suppression tous utilisateurs:', error);
      throw error;
    }
  }

  // =======================
  // OPÉRATIONS GESTIONNAIRES
  // =======================

  /**
   * Récupérer tous les gestionnaires
   */
  async getGestionnaires(): Promise<Gestionnaire[]> {
    try {
      if (this.isLocalStorageMode()) {
        // En mode dev, retourner des gestionnaires par défaut
        // ou les extraire des utilisateurs existants
        const users = await this.getUsers({ useCache: false });
        const gestionnairesSet = new Set<string>();
        const gestionnaires: Gestionnaire[] = [];

        users.forEach(user => {
          if (user.gestionnaire) {
            const gestionnaireStr = typeof user.gestionnaire === 'string'
              ? user.gestionnaire
              : `${user.gestionnaire.prenom} ${user.gestionnaire.nom}`;

            if (!gestionnairesSet.has(gestionnaireStr)) {
              gestionnairesSet.add(gestionnaireStr);
              gestionnaires.push({
                id: this.generateId(),
                nom: gestionnaireStr.split(' ').pop() || '',
                prenom: gestionnaireStr.split(' ').slice(0, -1).join(' ') || gestionnaireStr,
              });
            }
          }
        });

        // Ajouter des gestionnaires par défaut si la liste est vide
        if (gestionnaires.length === 0) {
          gestionnaires.push(
            { id: '1', nom: 'Admin', prenom: 'Houssaine' },
            { id: '2', nom: 'Admin', prenom: 'Samia' },
            { id: '3', nom: 'Admin', prenom: 'Delphine' }
          );
        }

        return gestionnaires;
      } else {
        const response = await this.fetchWithTimeout(`${this.baseURL}/api/gestionnaires`);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return Array.isArray(data) ? data : data.gestionnaires || [];
      }
    } catch (error) {
      console.error('Erreur récupération gestionnaires:', error);
      throw error;
    }
  }

  // ===================
  // MÉTHODES UTILITAIRES
  // ===================

  /**
   * Générer un ID unique pour un utilisateur
   */
  private generateUserId(): string {
    const prefix = 'USR';
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${timestamp}-${random}`;
  }

  /**
   * Générer un ID générique
   */
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  /**
   * Invalider le cache
   */
  public clearCache(key?: string): void {
    if (key) {
      localStorage.removeItem(key);
    } else {
      // Nettoyer tous les caches de l'application
      Object.keys(localStorage).forEach(storageKey => {
        if (storageKey.startsWith('gestionUsagers_')) {
          localStorage.removeItem(storageKey);
        }
      });
    }
  }

  /**
   * Vérifier la santé de l'API
   */
  async healthCheck(): Promise<boolean> {
    try {
      if (this.isLocalStorageMode()) {
        return true; // localStorage toujours disponible
      }

      const response = await this.fetchWithTimeout(`${this.baseURL}/api/health`, {
        timeout: 3000,
      });

      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Obtenir les statistiques de l'API
   */
  async getStats(): Promise<{
    totalUsers: number;
    totalGestionnaires: number;
    mode: 'localStorage' | 'api';
  }> {
    try {
      const users = await this.getUsers({ useCache: false });
      const gestionnaires = await this.getGestionnaires();

      return {
        totalUsers: users.length,
        totalGestionnaires: gestionnaires.length,
        mode: this.isLocalStorageMode() ? 'localStorage' : 'api',
      };
    } catch (error) {
      console.error('Erreur récupération statistiques:', error);
      return {
        totalUsers: 0,
        totalGestionnaires: 0,
        mode: this.isLocalStorageMode() ? 'localStorage' : 'api',
      };
    }
  }
}

// Instance singleton exportée
export const apiClient = ApiClient.getInstance();

// Export des types pour une utilisation externe
export type { User, UserFormData, Gestionnaire };
