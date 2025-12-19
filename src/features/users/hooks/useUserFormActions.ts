/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { useCallback, useState } from 'react';
import { User, UserFormData, Gestionnaire } from '@/types/user';
import { userService } from '../services/userService';
import { validateEssentialFields, ValidationResult } from '@/utils/validateEssentialFields';

interface UseUserFormActionsProps {
  user?: User | null;
  onSuccess?: (user: User | null) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
  onValidationWarning?: (validationResult: ValidationResult) => Promise<boolean>; // Returns true if user wants to continue
}

interface UseUserFormActionsReturn {
  isSubmitting: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  isDuplicating: boolean;
  loading: boolean;
  error: string | null;

  // Actions principales
  handleSubmit: (formData: UserFormData) => Promise<void>;
  handleSave: (formData: UserFormData) => Promise<void>;
  handleDelete: (userId: string) => Promise<void>;
  handleDuplicate: (user: User) => Promise<void>;
  handleCancel: () => void;

  // Actions attendues par useCompleteUserForm
  createUser: (data: UserFormData) => Promise<User>;
  updateUser: (id: string, data: UserFormData) => Promise<User>;
  deleteUser: (id: string) => Promise<void>;
  exportUser: (user: User) => Promise<void>;
  clearError: () => void;
}

export const useUserFormActions = ({
  user,
  onSuccess,
  onError,
  onCancel,
  onValidationWarning
}: UseUserFormActionsProps = {}): UseUserFormActionsReturn => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculer l'état de chargement global
  const loading = isSubmitting || isSaving || isDeleting || isDuplicating;

  // Fonction pour nettoyer les erreurs
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Fonction utilitaire pour afficher les messages
  const showSuccess = (message: string) => {
    console.log('Success:', message);
    // Ici on pourrait utiliser une librairie de toast si installée
  };

  const showError = (message: string) => {
    console.error('Error:', message);
    // Ici on pourrait utiliser une librairie de toast si installée
  };

  // Action principale de soumission
  const handleSubmit = useCallback(async (formData: UserFormData) => {
    setIsSubmitting(true);
    try {
      // Valider les champs essentiels
      const validationResult = validateEssentialFields(formData);

      // Si des champs sont manquants et qu'un callback de validation est fourni
      if (!validationResult.isValid && onValidationWarning) {
        const shouldContinue = await onValidationWarning(validationResult);

        // Si l'utilisateur ne veut pas continuer, annuler la soumission
        if (!shouldContinue) {
          setIsSubmitting(false);
          return;
        }
      }

      let result: User | null;

      if (user?.id) {
        // Mise à jour d'un utilisateur existant
        result = await userService.updateUser(user.id, formData);
        showSuccess('Utilisateur mis à jour avec succès');
      } else {
        // Création d'un nouvel utilisateur
        result = await userService.createUser(formData);
        showSuccess('Utilisateur créé avec succès');
      }

      onSuccess?.(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
      showError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [user, onSuccess, onError, onValidationWarning]);

  // Action de sauvegarde (brouillon)
  const handleSave = useCallback(async (formData: UserFormData) => {
    setIsSaving(true);
    try {
      let result: User | null;

      // Marquer comme brouillon
      const draftData = { ...formData, status: 'draft' as const };

      if (user?.id) {
        result = await userService.updateUser(user.id, draftData);
        showSuccess('Brouillon sauvegardé');
      } else {
        result = await userService.createUser(draftData);
        showSuccess('Brouillon créé');
      }

      onSuccess?.(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la sauvegarde';
      showError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsSaving(false);
    }
  }, [user, onSuccess, onError]);

  // Action de suppression
  const handleDelete = useCallback(async (userId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      return;
    }

    setIsDeleting(true);
    try {
      await userService.deleteUser(userId);
      showSuccess('Utilisateur supprimé avec succès');
      onSuccess?.(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la suppression';
      showError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  }, [onSuccess, onError]);

  // Action de duplication
  const handleDuplicate = useCallback(async (userToDuplicate: User) => {
    setIsDuplicating(true);
    try {
      // Créer une copie partielle pour la duplication
      const duplicatedData = {
        ...userToDuplicate,
        id: undefined, // Supprimer l'ID pour créer un nouvel utilisateur
        nom: userToDuplicate.nom ? `${userToDuplicate.nom} (Copie)` : 'Copie',
        email: '', // Email doit être unique
        telephone: '',
        etat: 'brouillon' // Marquer comme brouillon
      };

      const result = await userService.createUser(duplicatedData as UserFormData);
      showSuccess('Utilisateur dupliqué avec succès');
      onSuccess?.(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la duplication';
      showError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsDuplicating(false);
    }
  }, [onSuccess, onError]);

  // Action d'annulation
  const handleCancel = useCallback(() => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler ? Les modifications non sauvegardées seront perdues.')) {
      onCancel?.();
    }
  }, [onCancel]);

  // Actions directes pour l'API
  const createUser = useCallback(async (data: UserFormData): Promise<User> => {
    setError(null);
    try {
      const result = await userService.createUser(data);
      if (!result) {
        throw new Error('Erreur lors de la création de l\'utilisateur');
      }
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la création';
      setError(errorMessage);
      throw error;
    }
  }, []);

  const updateUser = useCallback(async (id: string, data: UserFormData): Promise<User> => {
    setError(null);
    try {
      const result = await userService.updateUser(id, data);
      if (!result) {
        throw new Error('Erreur lors de la mise à jour de l\'utilisateur');
      }
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la mise à jour';
      setError(errorMessage);
      throw error;
    }
  }, []);

  const deleteUser = useCallback(async (id: string): Promise<void> => {
    setError(null);
    try {
      await userService.deleteUser(id);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la suppression';
      setError(errorMessage);
      throw error;
    }
  }, []);

  const exportUser = useCallback(async (user: User): Promise<void> => {
    setError(null);
    try {
      // Simulation d'export - dans un vrai projet, cela ferait appel à un service d'export
      const dataStr = JSON.stringify(user, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `user-${user.id || 'export'}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'export';
      setError(errorMessage);
      throw error;
    }
  }, []);

  return {
    // États de chargement
    isSubmitting,
    isSaving,
    isDeleting,
    isDuplicating,
    loading,
    error,

    // Actions principales
    handleSubmit,
    handleSave,
    handleDelete,
    handleDuplicate,
    handleCancel,
    clearError,

    // Actions directes pour l'API
    createUser,
    updateUser,
    deleteUser,
    exportUser
  };
};

// Hook simplifié pour les actions de base
export const useBasicUserActions = (onSuccess?: (user: User | null) => void) => {
  return useUserFormActions({ onSuccess });
};

// Hook pour les actions en lot sur plusieurs utilisateurs
export const useBulkUserActions = () => {
  const [isLoading, setIsLoading] = useState(false);

  const bulkDelete = useCallback(async (userIds: string[]) => {
    setIsLoading(true);
    try {
      const promises = userIds.map(id => userService.deleteUser(id));
      await Promise.all(promises);
      console.log(`${userIds.length} utilisateurs supprimés avec succès`);
    } catch (error) {
      console.error('Erreur lors de la suppression en lot:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const bulkUpdate = useCallback(async (updates: Array<{ id: string; data: Partial<UserFormData> }>) => {
    setIsLoading(true);
    try {
      const promises = updates.map(({ id, data }) => userService.updateUser(id, data));
      await Promise.all(promises);
      console.log(`${updates.length} utilisateurs mis à jour avec succès`);
    } catch (error) {
      console.error('Erreur lors de la mise à jour en lot:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const bulkExport = useCallback(async (userIds: string[]) => {
    setIsLoading(true);
    try {
      // Récupérer les données des utilisateurs
      const promises = userIds.map(id => userService.getUserById(id));
      const users = await Promise.all(promises);

      // Générer le CSV ou Excel (logique simplifiée)
      const csvData = users.map(user => ({
        nom: user?.nom || '',
        prenom: user?.prenom || '',
        email: user?.email || '',
        telephone: user?.telephone || '',
        gestionnaire: typeof user?.gestionnaire === 'object' ? user.gestionnaire?.nom : user?.gestionnaire
      }));

      console.log('Export en lot terminé:', csvData);
      return csvData;
    } catch (error) {
      console.error('Erreur lors de l\'export en lot:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    bulkDelete,
    bulkUpdate,
    bulkExport
  };
};

// Hook pour les actions spécifiques aux gestionnaires
export const useGestionnaireActions = () => {
  const [isLoading, setIsLoading] = useState(false);

  const assignGestionnaire = useCallback(async (userIds: string[], gestionnaireId: string) => {
    setIsLoading(true);
    try {
      const promises = userIds.map(id =>
        userService.updateUser(id, { gestionnaire: gestionnaireId })
      );
      await Promise.all(promises);
      console.log(`Gestionnaire assigné à ${userIds.length} utilisateurs`);
    } catch (error) {
      console.error('Erreur lors de l\'assignation du gestionnaire:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getUsersByGestionnaire = useCallback(async (gestionnaireId: string) => {
    setIsLoading(true);
    try {
      const users = await userService.getAllUsers();
      const filteredUsers = users.filter(user =>
        typeof user.gestionnaire === 'string' ?
          user.gestionnaire === gestionnaireId :
          user.gestionnaire?.id === gestionnaireId
      );
      return filteredUsers;
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs par gestionnaire:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const transferUsers = useCallback(async (userIds: string[], fromGestionnaireId: string, toGestionnaireId: string) => {
    setIsLoading(true);
    try {
      const promises = userIds.map(id =>
        userService.updateUser(id, { gestionnaire: toGestionnaireId })
      );
      await Promise.all(promises);
      console.log(`${userIds.length} utilisateurs transférés de ${fromGestionnaireId} vers ${toGestionnaireId}`);
    } catch (error) {
      console.error('Erreur lors du transfert des utilisateurs:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    assignGestionnaire,
    getUsersByGestionnaire,
    transferUsers
  };
};

export default useUserFormActions;
