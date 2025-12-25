/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

"use client";

import { useState, useEffect, useCallback } from 'react';
import { User } from '@/types';
import { createNewUser, validateUser } from '../utils/userUtils';
import { UseUserOptions, ValidationResult } from './useUser.types';
import { useUserFetch } from './useUserFetch';
import { useUserOperations } from './useUserOperations';
import { useUserMigration } from './useUserMigration';

/**
 * Hook personnalisé pour la gestion des utilisateurs
 * Refactorisé pour la maintenabilité (décomposition en sous-hooks)
 */
const useUser = (options: UseUserOptions = {}) => {
  const {
    apiEndpoint = '/api/users',
    fetchOnMount = true,
    cacheKey = 'users_cache'
  } = options;

  // États partagés
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Sous-hook pour la récupération
  const { fetchUsers } = useUserFetch({
    apiEndpoint,
    cacheKey,
    setUsers,
    setLoading,
    setError
  });

  // Sous-hook pour les opérations CRUD
  const { createUser, updateUser, deleteUser } = useUserOperations({
    apiEndpoint,
    cacheKey,
    users,
    setUsers,
    setLoading,
    setError,
    setValidationErrors
  });

  // Sous-hook pour la migration
  const { migrationStatus, migrateUsers } = useUserMigration(fetchUsers, updateUser);

  // Actions de l'état d'édition
  const selectUserForEdit = useCallback((userId: string) => {
    const user = users.find(u => u.id === userId || ('_id' in u && (u as any)._id === userId));
    if (user) {
      setCurrentUser(user);
      setValidationErrors({});
    } else {
      setError(`Utilisateur avec ID ${userId} non trouvé`);
    }
  }, [users]);

  const createNewUserForEdit = useCallback(() => {
    setCurrentUser(createNewUser());
    setValidationErrors({});
  }, []);

  const resetCurrentUser = useCallback(() => {
    setCurrentUser(null);
    setValidationErrors({});
  }, []);

  // Montage
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
export * from './useUser.types';
