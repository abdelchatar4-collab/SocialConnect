/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { useState, useEffect, useCallback } from 'react';
import { migrateExistingUsers } from '@/utils/migrationFunction';
import { User } from '@/types';
import {
  createNewUser,
  validateUserData,
  mergeUserData,
  validateUser
} from '../utils/userUtils';

// Interfaces TypeScript pour le hook
interface UseUserOptions {
  apiEndpoint?: string;
  fetchOnMount?: boolean;
  debounceTime?: number;
  validateOnChange?: boolean;
  autoSave?: boolean;
  cacheKey?: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

interface MigrationStatus {
  done: boolean;
  inProgress: boolean;
  results: {
    totalMigrated: number;
    totalSaved: number;
    errors: string[];
  } | null;
}

interface UserOperationResult {
  success: boolean;
  user?: User;
  errors?: Record<string, string>;
  error?: string;
}

interface MigrationResult {
  success: boolean;
  totalMigrated?: number;
  totalSaved?: number;
  error?: string;
}

interface CachedData {
  timestamp: number;
  data: User[];
}

/**
 * Hook personnalisé pour la gestion des utilisateurs
 * @param options - Options de configuration
 * @returns Méthodes et état pour la gestion des utilisateurs
 */
const useUser = (options: UseUserOptions = {}) => {
  const {
    apiEndpoint = '/api/users',
    fetchOnMount = true,
    debounceTime = 300,
    validateOnChange = false,
    autoSave = false,
    cacheKey = 'users_cache'
  } = options;

  // État pour stocker la liste des utilisateurs
  const [users, setUsers] = useState<User[]>([]);

  // État pour l'utilisateur actuel en édition
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // État pour les erreurs de validation
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // État pour le statut de chargement et les erreurs
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // État pour suivre si la migration a été effectuée
  const [migrationStatus, setMigrationStatus] = useState<MigrationStatus>({
    done: false,
    inProgress: false,
    results: null
  });

  // Récupérer les utilisateurs depuis l'API
  const fetchUsers = useCallback(async (forceRefresh = false): Promise<User[]> => {
    setLoading(true);
    setError(null);

    try {
      // Vérifier le cache si autorisé
      if (!forceRefresh && cacheKey) {
        const cachedData = localStorage.getItem(cacheKey);
        if (cachedData) {
          const { timestamp, data }: CachedData = JSON.parse(cachedData);
          // Utiliser le cache si moins de 5 minutes
          if (Date.now() - timestamp < 5 * 60 * 1000) {
            setUsers(data);
            setLoading(false);
            return data;
          }
        }
      }

      // Sinon, appeler l'API
      const response = await fetch(apiEndpoint);

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data: User[] = await response.json();

      // Mettre en cache les données si autorisé
      if (cacheKey) {
        localStorage.setItem(cacheKey, JSON.stringify({
          timestamp: Date.now(),
          data
        }));
      }

      setUsers(data);
      setLoading(false);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(`Erreur lors de la récupération des utilisateurs: ${errorMessage}`);
      setLoading(false);
      return [];
    }
  }, [apiEndpoint, cacheKey]);

  // Créer un nouvel utilisateur
  const createUser = useCallback(async (userData: Partial<User> = {}): Promise<UserOperationResult> => {
    setLoading(true);
    setError(null);

    try {
      // S'assurer que l'ID est généré pour un nouvel utilisateur
      if (!userData.id && !('_id' in userData)) {
        // Générer un ID plus convivial basé sur la date et un numéro séquentiel
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        // Utiliser un compteur pour les dossiers créés le même jour
        // Ici, on utilise les millisecondes et un nombre aléatoire pour simuler un compteur
        const counter = String(Math.floor(Math.random() * 9999)).padStart(4, '0');

        userData.id = `${year}${month}${day}-${counter}`;
      }

      // Normaliser la mutuelle si présente
      if (userData.mutuelle !== undefined) {
        if (typeof userData.mutuelle === 'string') {
          userData.mutuelle = {
            id: null,
            nom: userData.mutuelle,
            numeroAdherent: "",
            dateAdhesion: null,
            options: []
          };
        } else if (typeof userData.mutuelle === 'object' && userData.mutuelle !== null) {
          // S'assurer que l'ID est présent
          if (!userData.mutuelle.id) {
            userData.mutuelle.id = null;
          }
        }
      }

      // Créer un nouvel utilisateur en utilisant notre modèle
      const newUser = createNewUser(userData);

      // Valider l'utilisateur
      const { isValid, errors }: ValidationResult = validateUser(newUser);

      if (!isValid) {
        setValidationErrors(errors);
        setLoading(false);
        return { success: false, errors };
      }

      // Envoyer à l'API
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newUser)
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const savedUser: User = await response.json();

      // Mettre à jour la liste des utilisateurs
      setUsers(prevUsers => [...prevUsers, savedUser]);

      // Invalider le cache
      if (cacheKey) {
        localStorage.removeItem(cacheKey);
      }

      setLoading(false);
      return { success: true, user: savedUser };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(`Erreur lors de la création de l'utilisateur: ${errorMessage}`);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  }, [apiEndpoint, cacheKey]);

  // Mettre à jour un utilisateur existant
  const updateUser = useCallback(async (userId: string, userData: Partial<User>): Promise<UserOperationResult> => {
    setLoading(true);
    setError(null);

    try {
      // Trouver l'utilisateur existant
      const existingUser = users.find(user => {
        if ('id' in user && user.id === userId) return true;
        if ('_id' in user && user._id === userId) return true;
        return false;
      });

      if (!existingUser) {
        throw new Error(`Utilisateur avec ID ${userId} non trouvé`);
      }

      // Fusionner les nouvelles données avec l'utilisateur existant
      const updatedUser = mergeUserData(existingUser, userData);

      // Valider l'utilisateur
      const { isValid, errors }: ValidationResult = validateUser(updatedUser);

      if (!isValid) {
        setValidationErrors(errors);
        setLoading(false);
        return { success: false, errors };
      }

      // Envoyer à l'API
      const response = await fetch(`${apiEndpoint}/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedUser)
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const savedUser: User = await response.json();

      // Mettre à jour la liste des utilisateurs
      setUsers(prevUsers =>
        prevUsers.map(user =>
          (user.id === userId || ('_id' in user && (user as any)._id === userId)) ? savedUser : user
        )
      );

      // Invalider le cache
      if (cacheKey) {
        localStorage.removeItem(cacheKey);
      }

      setLoading(false);
      return { success: true, user: savedUser };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(`Erreur lors de la mise à jour de l'utilisateur: ${errorMessage}`);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  }, [apiEndpoint, cacheKey, users]);

  // Supprimer un utilisateur
  const deleteUser = useCallback(async (userId: string): Promise<UserOperationResult> => {
    setLoading(true);
    setError(null);

    try {
      // Envoyer à l'API
      const response = await fetch(`${apiEndpoint}/${userId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      // Mettre à jour la liste des utilisateurs
      setUsers(prevUsers =>
        prevUsers.filter(user => user.id !== userId && !('_id' in user && (user as any)._id === userId))
      );

      // Invalider le cache
      if (cacheKey) {
        localStorage.removeItem(cacheKey);
      }

      setLoading(false);
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(`Erreur lors de la suppression de l'utilisateur: ${errorMessage}`);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  }, [apiEndpoint, cacheKey]);

  // Effectuer la migration des utilisateurs existants
  const migrateUsers = useCallback(async (): Promise<MigrationResult> => {
    setMigrationStatus({
      done: false,
      inProgress: true,
      results: null
    });

    try {
      // Récupérer tous les utilisateurs
      const allUsers = await fetchUsers(true);

      // Options de migration
      const migrationOptions = {
        createBackup: true,
        validateAfterMigration: true,
        fixInconsistencies: true,
        logProgress: true
      };

      // Effectuer la migration
      const results = migrateExistingUsers(allUsers, migrationOptions);

      // Mise à jour de tous les utilisateurs migrés
      let successCount = 0;

      for (const user of results.migratedUsers) {
        try {
          const userId = user.id || (user as any)._id;
          const updateResult = await updateUser(userId, user);

          if (updateResult.success) {
            successCount++;
          }
        } catch (err) {
          console.error("Erreur lors de la mise à jour de l'utilisateur:", err);
        }
      }

      setMigrationStatus({
        done: true,
        inProgress: false,
        results: {
          totalMigrated: results.migrated,
          totalSaved: successCount,
          errors: results.errors.map(err => err.message)
        }
      });

      return {
        success: true,
        totalMigrated: results.migrated,
        totalSaved: successCount
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setMigrationStatus({
        done: true,
        inProgress: false,
        results: {
          totalMigrated: 0,
          totalSaved: 0,
          errors: [errorMessage]
        }
      });

      return {
        success: false,
        error: errorMessage
      };
    }
  }, [fetchUsers, updateUser]);

  // Gérer la sélection d'un utilisateur pour édition
  const selectUserForEdit = useCallback((userId: string) => {
    const user = users.find(user => user.id === userId || ('_id' in user && (user as any)._id === userId));

    if (user) {
      setCurrentUser(user);
      setValidationErrors({});
    } else {
      setError(`Utilisateur avec ID ${userId} non trouvé`);
    }
  }, [users]);

  // Créer un nouvel utilisateur vide pour édition
  const createNewUserForEdit = useCallback(() => {
    setCurrentUser(createNewUser());
    setValidationErrors({});
  }, []);

  // Réinitialiser l'utilisateur en cours d'édition
  const resetCurrentUser = useCallback(() => {
    setCurrentUser(null);
    setValidationErrors({});
  }, []);

  // Effet pour charger les utilisateurs au montage si nécessaire
  useEffect(() => {
    if (fetchOnMount) {
      fetchUsers();
    }
  }, [fetchOnMount, fetchUsers]);

  return {
    // État
    users,
    currentUser,
    loading,
    error,
    validationErrors,
    migrationStatus,

    // Actions
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    migrateUsers,
    selectUserForEdit,
    createNewUserForEdit,
    resetCurrentUser,

    // Helper functions
    validateUser: (user: User): ValidationResult => validateUser(user)
  };
};

export default useUser;
