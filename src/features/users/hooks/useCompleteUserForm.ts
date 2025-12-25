/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.
*/

import { useCallback, useMemo } from 'react';
import { UserFormData, User } from '@/types/user';
import { useUserFormState } from './useUserFormState';
import { useUserFormActions } from './useUserFormActions';
import { UseCompleteUserFormProps, UseCompleteUserFormReturn } from './form/userFormTypes';
import { validateField, validateForm } from './form/userFormValidation';

export const useCompleteUserForm = (props: UseCompleteUserFormProps = {}): UseCompleteUserFormReturn => {
  const { initialData = {}, mode = 'create', userId, onSuccess, onError, validationMode = 'onSubmit' } = props;
  const { formData, updateField, updateFields, resetForm, isDirty, hasChanges } = useUserFormState({ initialData });
  const currentValidation = useMemo(() => validateForm(formData), [formData]);
  const { createUser, updateUser, deleteUser, exportUser, loading, error: actionError } = useUserFormActions();

  const canSubmit = useMemo(() => {
    const req = ['nom', 'prenom', 'email', 'telephone', 'gestionnaire', 'nationalite'];
    return req.every(f => formData[f as keyof UserFormData]?.toString().trim()) && currentValidation.isValid;
  }, [formData, currentValidation.isValid]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm(formData).isValid) return false;
    try {
      const res = mode === 'create' ? await createUser(formData) : (userId ? await updateUser(userId, formData) : null);
      if (res) { onSuccess?.(res); if (mode === 'create') resetForm(); return true; }
      return false;
    } catch (e: any) { onError?.(e.message); return false; }
  }, [formData, mode, userId, createUser, updateUser, onSuccess, onError, resetForm]);

  const handleDelete = useCallback(async () => {
    if (!userId) return false;
    try { await deleteUser(userId); onSuccess?.(null as any); return true; }
    catch (e: any) { onError?.(e.message); return false; }
  }, [userId, deleteUser, onSuccess, onError]);

  const handleExport = useCallback(async () => {
    if (userId) await exportUser({ id: userId, ...formData, createdAt: new Date(), updatedAt: new Date(), status: 'active' } as User).catch(e => onError?.(e.message));
  }, [userId, formData, exportUser, onError]);

  return {
    formData, updateField: (f, v) => { updateField(f, v); if (validationMode === 'onChange') validateField(f, v); },
    updateFields, resetForm, isDirty, hasChanges,
    errors: currentValidation.errors, fieldErrors: currentValidation.fieldErrors, isValid: currentValidation.isValid, isValidating: false,
    validateField, validateForm, clearErrors: () => { }, clearFieldError: () => { },
    handleSubmit, handleSave: handleSubmit, handleDelete, handleExport,
    isSaving: loading, isDeleting: loading, isExporting: loading, actionError,
    canSubmit, canSave: canSubmit && hasChanges, hasUnsavedChanges: isDirty && !loading
  };
};

export const useNewUserFormComplete = (onSuccess?: (user: User) => void, onError?: (error: string) => void) =>
  useCompleteUserForm({ mode: 'create', onSuccess, onError, validationMode: 'onChange' });

export const useEditUserFormComplete = (userId: string, data: Partial<UserFormData>, onSuccess?: (user: User) => void, onError?: (error: string) => void) =>
  useCompleteUserForm({ initialData: data, mode: 'edit', userId, onSuccess, onError, validationMode: 'onBlur' });
