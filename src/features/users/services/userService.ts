/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

/**
 * Service de gestion des utilisateurs utilisant l'API Client centralisé
 * 
 * Ce service remplace l'ancien userService.js et utilise le nouvel apiClient
 * pour toutes les opérations CRUD sur les utilisateurs.
 * 
 * @version 2.0.0
 * @author Équipe Refactorisation
 */

import { apiClient, type ApiResponse } from '@/lib/apiClient';
import type { User, UserFormData, Gestionnaire } from '@/types';

// Types spécifiques au service
export interface UserServiceOptions {
  useCache?: boolean;
  throwOnError?: boolean;
}

export interface UserValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface UserSearchFilters {
  gestionnaire?: string;
  secteur?: string;
  antenne?: string;
  etat?: string;
  search?: string;
}

/**
 * Classe de service pour la gestion des utilisateurs
 */
export class UserService {
  private static instance: UserService;

  private constructor() {}

  /**
   * Singleton pattern
   */
  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  // ===================
  // OPÉRATIONS DE BASE
  // ===================

  /**
   * Récupérer tous les utilisateurs
   */
  async getAllUsers(options: UserServiceOptions = {}): Promise<User[]> {
    const { useCache = true, throwOnError = true } = options;
    
    try {
      return await apiClient.getUsers({ useCache });
    } catch (error) {
      console.error('UserService.getAllUsers:', error);
      if (throwOnError) throw error;
      return [];
    }
  }

  /**
   * Récupérer un utilisateur par ID
   */
  async getUserById(id: string, options: UserServiceOptions = {}): Promise<User | null> {
    const { throwOnError = true } = options;
    
    try {
      return await apiClient.getUser(id);
    } catch (error) {
      console.error(`UserService.getUserById(${id}):`, error);
      if (throwOnError) throw error;
      return null;
    }
  }

  /**
   * Créer un nouvel utilisateur
   */
  async createUser(userData: UserFormData, options: UserServiceOptions = {}): Promise<User | null> {
    const { throwOnError = true } = options;
    
    try {
      // Validation des données
      const validation = this.validateUserData(userData);
      if (!validation.isValid) {
        throw new Error(`Données invalides: ${validation.errors.join(', ')}`);
      }

      // Assurer que l'utilisateur a un ID unique
      if (!userData.id) {
        userData.id = this.generateUserId(userData);
      }

      return await apiClient.createUser(userData);
    } catch (error) {
      console.error('UserService.createUser:', error);
      if (throwOnError) throw error;
      return null;
    }
  }

  /**
   * Mettre à jour un utilisateur
   */
  async updateUser(id: string, userData: Partial<UserFormData>, options: UserServiceOptions = {}): Promise<User | null> {
    const { throwOnError = true } = options;
    
    try {
      // S'assurer que l'ID est préservé
      const dataWithId = { ...userData, id };
      
      return await apiClient.updateUser(id, dataWithId);
    } catch (error) {
      console.error(`UserService.updateUser(${id}):`, error);
      if (throwOnError) throw error;
      return null;
    }
  }

  /**
   * Supprimer un utilisateur
   */
  async deleteUser(id: string, options: UserServiceOptions = {}): Promise<boolean> {
    const { throwOnError = true } = options;
    
    try {
      const result = await apiClient.deleteUser(id);
      return result.success;
    } catch (error) {
      console.error(`UserService.deleteUser(${id}):`, error);
      if (throwOnError) throw error;
      return false;
    }
  }

  /**
   * Supprimer plusieurs utilisateurs
   */
  async deleteMultipleUsers(ids: string[], options: UserServiceOptions = {}): Promise<boolean> {
    const { throwOnError = true } = options;
    
    try {
      const result = await apiClient.bulkDeleteUsers({ ids });
      return result.success;
    } catch (error) {
      console.error('UserService.deleteMultipleUsers:', error);
      if (throwOnError) throw error;
      return false;
    }
  }

  /**
   * Supprimer tous les utilisateurs
   */
  async deleteAllUsers(options: UserServiceOptions = {}): Promise<boolean> {
    const { throwOnError = true } = options;
    
    try {
      const result = await apiClient.deleteAllUsers();
      return result.success;
    } catch (error) {
      console.error('UserService.deleteAllUsers:', error);
      if (throwOnError) throw error;
      return false;
    }
  }

  // ========================
  // OPÉRATIONS GESTIONNAIRES
  // ========================

  /**
   * Récupérer tous les gestionnaires
   */
  async getAllGestionnaires(options: UserServiceOptions = {}): Promise<Gestionnaire[]> {
    const { throwOnError = true } = options;
    
    try {
      return await apiClient.getGestionnaires();
    } catch (error) {
      console.error('UserService.getAllGestionnaires:', error);
      if (throwOnError) throw error;
      return [];
    }
  }

  // ====================
  // FONCTIONS UTILITAIRES
  // ====================

  /**
   * Rechercher des utilisateurs avec filtres
   */
  async searchUsers(filters: UserSearchFilters, options: UserServiceOptions = {}): Promise<User[]> {
    try {
      const allUsers = await this.getAllUsers(options);
      
      return allUsers.filter(user => {
        // Filtre par gestionnaire
        if (filters.gestionnaire && user.gestionnaire !== filters.gestionnaire) {
          return false;
        }
        
        // Filtre par secteur
        if (filters.secteur && user.secteur !== filters.secteur) {
          return false;
        }
        
        // Filtre par antenne
        if (filters.antenne && user.antenne !== filters.antenne) {
          return false;
        }
        
        // Filtre par état
        if (filters.etat && user.etat !== filters.etat) {
          return false;
        }
        
        // Filtre par recherche textuelle
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          const searchFields = [
            user.nom,
            user.prenom,
            user.telephone,
            user.email,
            user.id
          ];
          
          const matches = searchFields.some(field => 
            field && field.toLowerCase().includes(searchLower)
          );
          
          if (!matches) return false;
        }
        
        return true;
      });
    } catch (error) {
      console.error('UserService.searchUsers:', error);
      return [];
    }
  }

  /**
   * Valider les données d'un utilisateur
   */
  validateUserData(userData: Partial<UserFormData>): UserValidationResult {
    const errors: string[] = [];
    
    // Validation des champs obligatoires
    if (!userData.nom || userData.nom.trim().length === 0) {
      errors.push('Le nom est obligatoire');
    }
    
    if (!userData.prenom || userData.prenom.trim().length === 0) {
      errors.push('Le prénom est obligatoire');
    }
    
    // Validation de l'email si fourni
    if (userData.email && !this.isValidEmail(userData.email)) {
      errors.push('Format d\'email invalide');
    }
    
    // Validation du téléphone si fourni
    if (userData.telephone && !this.isValidPhone(userData.telephone)) {
      errors.push('Format de téléphone invalide');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Générer un ID unique pour un utilisateur
   */
  generateUserId(userData: Partial<UserFormData>): string {
    // Logique de génération d'ID basée sur l'antenne et la date
    const antenne = userData.antenne || 'GEN';
    const year = new Date().getFullYear();
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    // Mapping des antennes vers des préfixes
    const antenneMap: { [key: string]: string } = {
      'Antenne Centre': 'CEN',
      'Antenne Cureghem': 'CUR',
      'Permanence Bizet': 'BIZ',
      'Ouest': 'OUE',
      'PILDA': 'PIL'
    };
    
    const prefix = antenneMap[antenne] || 'GEN';
    
    return `${prefix}-${year}-${random}`;
  }

  /**
   * Obtenir les statistiques des utilisateurs
   */
  async getUserStats(): Promise<{
    total: number;
    byGestionnaire: { [key: string]: number };
    byAntenne: { [key: string]: number };
    byEtat: { [key: string]: number };
  }> {
    try {
      const users = await this.getAllUsers({ useCache: false });
      
      const stats = {
        total: users.length,
        byGestionnaire: {} as { [key: string]: number },
        byAntenne: {} as { [key: string]: number },
        byEtat: {} as { [key: string]: number }
      };
      
      users.forEach(user => {
        // Par gestionnaire
        const gestionnaireStr = typeof user.gestionnaire === 'string' 
          ? user.gestionnaire 
          : user.gestionnaire 
            ? `${user.gestionnaire.prenom} ${user.gestionnaire.nom}` 
            : 'Non assigné';
        stats.byGestionnaire[gestionnaireStr] = (stats.byGestionnaire[gestionnaireStr] || 0) + 1;
        
        // Par antenne
        const antenne = user.antenne || 'Non spécifiée';
        stats.byAntenne[antenne] = (stats.byAntenne[antenne] || 0) + 1;
        
        // Par état
        const etat = user.etat || 'Non défini';
        stats.byEtat[etat] = (stats.byEtat[etat] || 0) + 1;
      });
      
      return stats;
    } catch (error) {
      console.error('UserService.getUserStats:', error);
      return {
        total: 0,
        byGestionnaire: {},
        byAntenne: {},
        byEtat: {}
      };
    }
  }

  /**
   * Nettoyer le cache
   */
  clearCache(): void {
    apiClient.clearCache();
  }

  /**
   * Vérifier la disponibilité du service
   */
  async isServiceAvailable(): Promise<boolean> {
    return await apiClient.healthCheck();
  }

  // ======================
  // MÉTHODES PRIVÉES
  // ======================

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPhone(phone: string): boolean {
    // Regex simple pour les numéros belges et internationaux
    const phoneRegex = /^(\+|00)?[0-9\s\-\(\)]{8,15}$/;
    return phoneRegex.test(phone);
  }
}

// Instance singleton exportée
export const userService = UserService.getInstance();

// Fonctions helper pour rétrocompatibilité avec l'ancien userService.js
export const fetchUsers = () => userService.getAllUsers();
export const fetchUser = (id: string) => userService.getUserById(id);
export const saveUser = (userData: UserFormData) => {
  if (userData.id) {
    return userService.updateUser(userData.id, userData);
  } else {
    return userService.createUser(userData);
  }
};
export const deleteUser = (id: string) => userService.deleteUser(id);

// Export des types
export type { 
  User,
  UserFormData,
  Gestionnaire
};
