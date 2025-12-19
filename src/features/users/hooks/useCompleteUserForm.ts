/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { useCallback, useMemo } from 'react';
import { UserFormData, User } from '@/types/user';
import { useUserFormState } from './useUserFormState';
import { useUserFormActions } from './useUserFormActions';

// Validation simple intégrée pour éviter le problème de module
interface ValidationError {
  field: string;
  message: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  fieldErrors: Record<string, string>;
}

const validateField = (field: keyof UserFormData, value: any): ValidationError | null => {
  const fieldName = String(field);

  // Champs requis
  const requiredFields = ['nom', 'prenom', 'genre', 'telephone', 'email', 'statutSejour', 'gestionnaire', 'nationalite'];

  if (requiredFields.includes(fieldName) && (!value || (typeof value === 'string' && value.trim() === ''))) {
    return { field: fieldName, message: `Le champ ${fieldName} est obligatoire` };
  }

  // Validation email
  if (field === 'email' && value && typeof value === 'string') {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(value)) {
      return { field: fieldName, message: 'Format d\'email invalide' };
    }
  }

  // Validation téléphone
  if (field === 'telephone' && value && typeof value === 'string') {
    const phonePattern = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
    if (!phonePattern.test(value)) {
      return { field: fieldName, message: 'Format de téléphone invalide' };
    }
  }

  return null;
};

const validateForm = (data: UserFormData): ValidationResult => {
  const errors: ValidationError[] = [];

  Object.keys(data).forEach((key) => {
    const field = key as keyof UserFormData;
    const error = validateField(field, data[field]);
    if (error) {
      errors.push(error);
    }
  });

  const fieldErrors = errors.reduce((acc, error) => {
    acc[error.field] = error.message;
    return acc;
  }, {} as Record<string, string>);

  return {
    isValid: errors.length === 0,
    errors,
    fieldErrors
  };
};

interface UseCompleteUserFormProps {
  initialData?: Partial<UserFormData>;
  mode?: 'create' | 'edit';
  userId?: string;
  onSuccess?: (user: User) => void;
  onError?: (error: string) => void;
  validationMode?: 'onChange' | 'onBlur' | 'onSubmit';
  autoSave?: boolean;
  autoSaveDelay?: number;
}

interface UseCompleteUserFormReturn {
  // État du formulaire
  formData: UserFormData;
  updateField: (field: keyof UserFormData, value: any) => void;
  updateFields: (fields: Partial<UserFormData>) => void;
  resetForm: () => void;
  isDirty: boolean;
  hasChanges: boolean;

  // Validation
  errors: any[];
  fieldErrors: Record<string, string>;
  isValid: boolean;
  isValidating: boolean;
  validateField: (field: keyof UserFormData, value: any) => any;
  validateForm: (data: UserFormData) => any;
  clearErrors: () => void;
  clearFieldError: (field: keyof UserFormData) => void;

  // Actions
  handleSubmit: () => Promise<boolean>;
  handleSave: () => Promise<boolean>;
  handleDelete: () => Promise<boolean>;
  handleExport: () => Promise<void>;

  // États des actions
  isSaving: boolean;
  isDeleting: boolean;
  isExporting: boolean;
  actionError: string | null;

  // Utilitaires
  canSubmit: boolean;
  canSave: boolean;
  hasUnsavedChanges: boolean;
}

/**
 * Hook complet qui combine état, validation et actions pour un formulaire utilisateur
 * C'est le hook principal à utiliser dans les composants de formulaire
 */
export const useCompleteUserForm = (props: UseCompleteUserFormProps = {}): UseCompleteUserFormReturn => {
  const {
    initialData = {},
    mode = 'create',
    userId,
    onSuccess,
    onError,
    validationMode = 'onSubmit',
    autoSave = false,
    autoSaveDelay = 2000
  } = props;

  // Hook d'état du formulaire
  const {
    formData,
    updateField,
    updateFields,
    resetForm,
    isDirty,
    hasChanges
  } = useUserFormState({ initialData });

  // Validation intégrée
  const currentValidation = useMemo(() => validateForm(formData), [formData]);
  const errors = currentValidation.errors;
  const fieldErrors = currentValidation.fieldErrors;
  const isValid = currentValidation.isValid;
  const isValidating = false;

  const clearErrors = useCallback(() => {
    // Pour l'instant, pas d'état d'erreur local à nettoyer
  }, []);

  const clearFieldError = useCallback((field: keyof UserFormData) => {
    // Pour l'instant, pas d'état d'erreur local à nettoyer
  }, []);

  // Hook d'actions
  const {
    createUser,
    updateUser,
    deleteUser,
    exportUser,
    loading: actionLoading,
    error: actionError,
    clearError: clearActionError
  } = useUserFormActions();

  // États dérivés pour les actions spécifiques
  const isSaving = actionLoading;
  const isDeleting = actionLoading;
  const isExporting = actionLoading;

  // Validation avant soumission
  const canSubmit = useMemo(() => {
    if (!formData) return false;

    // Validation des champs requis minimaux
    const requiredFields = ['nom', 'prenom', 'email', 'telephone', 'gestionnaire', 'nationalite'];
    const hasRequiredFields = requiredFields.every(field =>
      formData[field as keyof UserFormData] &&
      String(formData[field as keyof UserFormData]).trim() !== ''
    );

    return hasRequiredFields && Object.keys(fieldErrors).length === 0;
  }, [formData, fieldErrors]);

  const canSave = canSubmit && hasChanges;
  const hasUnsavedChanges = isDirty && !actionLoading;

  // Fonction de soumission principale
  const handleSubmit = useCallback(async (): Promise<boolean> => {
    // Validation complète avant soumission
    const validationResult = validateForm(formData);
    if (!validationResult.isValid) {
      return false;
    }

    try {
      let result: User | null = null;

      if (mode === 'create') {
        result = await createUser(formData);
      } else if (mode === 'edit' && userId) {
        result = await updateUser(userId, formData);
      }

      if (result) {
        onSuccess?.(result);
        if (mode === 'create') {
          resetForm(); // Reset uniquement après création réussie
        }
        return true;
      }

      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la soumission';
      onError?.(errorMessage);
      return false;
    }
  }, [formData, mode, userId, createUser, updateUser, onSuccess, onError, resetForm]);

  // Fonction de sauvegarde (alias pour handleSubmit)
  const handleSave = useCallback(async (): Promise<boolean> => {
    return await handleSubmit();
  }, [handleSubmit]);

  // Fonction de suppression
  const handleDelete = useCallback(async (): Promise<boolean> => {
    if (!userId) return false;

    try {
      await deleteUser(userId);
      onSuccess?.(null as any); // Signal que l'utilisateur a été supprimé
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la suppression';
      onError?.(errorMessage);
      return false;
    }
  }, [userId, deleteUser, onSuccess, onError]);

  // Fonction d'export
  const handleExport = useCallback(async (): Promise<void> => {
    if (!userId) return;

    try {
      // Si on a le formData complet, on peut l'utiliser pour créer un objet User temporaire
      const userToExport: User = {
        id: userId,
        ...formData,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'active'
      } as User;

      await exportUser(userToExport);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'export';
      onError?.(errorMessage);
    }
  }, [userId, formData, exportUser, onError]);

  // Mise à jour de champ avec validation temps réel
  const updateFieldWithValidation = useCallback((field: keyof UserFormData, value: any) => {
    updateField(field, value);

    // Validation en temps réel si configurée
    if (validationMode === 'onChange') {
      const error = validateField(field, value);
      if (error) {
        // L'erreur est gérée automatiquement par le hook de validation
      } else {
        clearFieldError(field);
      }
    }
  }, [updateField, validationMode, clearFieldError]);

  return {
    // État du formulaire
    formData,
    updateField: updateFieldWithValidation,
    updateFields,
    resetForm,
    isDirty,
    hasChanges,

    // Validation
    errors,
    fieldErrors,
    isValid,
    isValidating,
    validateField: validateField,
    validateForm: validateForm,
    clearErrors,
    clearFieldError,

    // Actions
    handleSubmit,
    handleSave,
    handleDelete,
    handleExport,

    // États des actions
    isSaving,
    isDeleting,
    isExporting,
    actionError,

    // Utilitaires
    canSubmit,
    canSave,
    hasUnsavedChanges
  };
};

/**
 * Hook simplifié pour la création d'un nouvel utilisateur
 */
export const useNewUserFormComplete = (onSuccess?: (user: User) => void, onError?: (error: string) => void) => {
  return useCompleteUserForm({
    mode: 'create',
    onSuccess,
    onError,
    validationMode: 'onChange'
  });
};

/**
 * Hook simplifié pour l'édition d'un utilisateur existant
 */
export const useEditUserFormComplete = (
  userId: string,
  userData: Partial<UserFormData>,
  onSuccess?: (user: User) => void,
  onError?: (error: string) => void
) => {
  return useCompleteUserForm({
    initialData: userData,
    mode: 'edit',
    userId,
    onSuccess,
    onError,
    validationMode: 'onBlur'
  });
};
