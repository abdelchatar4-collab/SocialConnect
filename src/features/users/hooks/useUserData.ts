/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { useState, useEffect, useCallback } from 'react';
import { userService } from '../services/userService';
import { User, UserFormData } from '@/types/user';

interface UseUserDataProps {
  userId?: string;
  autoFetch?: boolean;
}

interface UseUserDataReturn {
  user: User | null;
  users: User[];
  loading: boolean;
  error: string | null;
  // Actions sur un utilisateur
  fetchUser: (id: string) => Promise<void>;
  createUser: (userData: UserFormData) => Promise<User | null>;
  updateUser: (id: string, userData: Partial<UserFormData>) => Promise<User | null>;
  deleteUser: (id: string) => Promise<boolean>;
  // Actions sur plusieurs utilisateurs
  fetchUsers: (params?: any) => Promise<void>;
  refreshUsers: () => Promise<void>;
  bulkDeleteUsers: (ids: string[]) => Promise<boolean>;
  // Utilitaires
  clearError: () => void;
  clearUser: () => void;
}

/**
 * Hook principal pour la gestion des données utilisateur
 * Fournit toutes les opérations CRUD et la gestion d'état
 */
export const useUserData = (props: UseUserDataProps = {}): UseUserDataReturn => {
  const { userId, autoFetch = true } = props;

  // États
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Récupération d'un utilisateur spécifique
  const fetchUser = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const userData = await userService.getUserById(id);
      setUser(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la récupération de l\'utilisateur');
    } finally {
      setLoading(false);
    }
  }, []);

  // Récupération de la liste des utilisateurs
  const fetchUsers = useCallback(async (params?: any) => {
    setLoading(true);
    setError(null);
    try {
      const usersData = await userService.getAllUsers(params);
      setUsers(usersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la récupération des utilisateurs');
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualisation de la liste
  const refreshUsers = useCallback(async () => {
    await fetchUsers();
  }, [fetchUsers]);

  // Création d'un utilisateur
  const createUser = useCallback(async (userData: UserFormData): Promise<User | null> => {
    setLoading(true);
    setError(null);
    try {
      const newUser = await userService.createUser(userData);
      if (newUser) {
        setUsers(prev => [newUser, ...prev]);
      }
      return newUser;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création de l\'utilisateur');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Mise à jour d'un utilisateur
  const updateUser = useCallback(async (id: string, userData: Partial<UserFormData>): Promise<User | null> => {
    setLoading(true);
    setError(null);
    try {
      const updatedUser = await userService.updateUser(id, userData);

      if (updatedUser) {
        // Mise à jour de l'utilisateur courant si c'est le même
        if (user && user.id === id) {
          setUser(updatedUser);
        }

        // Mise à jour dans la liste
        setUsers(prev => prev.map(u => u.id === id ? updatedUser : u));
      }

      return updatedUser;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour de l\'utilisateur');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Suppression d'un utilisateur
  const deleteUser = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await userService.deleteUser(id);

      // Nettoyage de l'utilisateur courant si c'est le même
      if (user && user.id === id) {
        setUser(null);
      }

      // Suppression de la liste
      setUsers(prev => prev.filter(u => u.id !== id));

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression de l\'utilisateur');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Suppression en lot
  const bulkDeleteUsers = useCallback(async (ids: string[]): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      // Appels parallèles pour supprimer tous les utilisateurs
      await Promise.all(ids.map(id => userService.deleteUser(id)));

      // Nettoyage de l'utilisateur courant si il est dans la liste
      if (user && ids.includes(user.id)) {
        setUser(null);
      }

      // Suppression de la liste
      setUsers(prev => prev.filter(u => !ids.includes(u.id)));

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression des utilisateurs');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Utilitaires
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearUser = useCallback(() => {
    setUser(null);
  }, []);

  // Effet pour le chargement automatique
  useEffect(() => {
    if (autoFetch && userId) {
      fetchUser(userId);
    }
  }, [userId, autoFetch, fetchUser]);

  return {
    user,
    users,
    loading,
    error,
    fetchUser,
    createUser,
    updateUser,
    deleteUser,
    fetchUsers,
    refreshUsers,
    bulkDeleteUsers,
    clearError,
    clearUser
  };
};

/**
 * Hook pour récupérer un seul utilisateur (wrapper simple)
 */
export const useSingleUser = (userId: string) => {
  return useUserData({ userId, autoFetch: true });
};

/**
 * Hook pour récupérer la liste des utilisateurs
 */
export const useUsers = () => {
  const hook = useUserData({ autoFetch: false });

  useEffect(() => {
    hook.fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return hook;
};
