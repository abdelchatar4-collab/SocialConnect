/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - User Form Types
*/

import { UserFormData, User } from '@/types/user';

export interface ValidationError { field: string; message: string; }
export interface ValidationResult { isValid: boolean; errors: ValidationError[]; fieldErrors: Record<string, string>; }

export interface UseCompleteUserFormProps {
    initialData?: Partial<UserFormData>;
    mode?: 'create' | 'edit';
    userId?: string;
    onSuccess?: (user: User) => void;
    onError?: (error: string) => void;
    validationMode?: 'onChange' | 'onBlur' | 'onSubmit';
    autoSave?: boolean;
    autoSaveDelay?: number;
}

export interface UseCompleteUserFormReturn {
    formData: UserFormData;
    updateField: (field: keyof UserFormData, value: any) => void;
    updateFields: (fields: Partial<UserFormData>) => void;
    resetForm: () => void;
    isDirty: boolean;
    hasChanges: boolean;
    errors: any[];
    fieldErrors: Record<string, string>;
    isValid: boolean;
    isValidating: boolean;
    validateField: (field: keyof UserFormData, value: any) => any;
    validateForm: (data: UserFormData) => any;
    clearErrors: () => void;
    clearFieldError: (field: keyof UserFormData) => void;
    handleSubmit: () => Promise<boolean>;
    handleSave: () => Promise<boolean>;
    handleDelete: () => Promise<boolean>;
    handleExport: () => Promise<void>;
    isSaving: boolean;
    isDeleting: boolean;
    isExporting: boolean;
    actionError: string | null;
    canSubmit: boolean;
    canSave: boolean;
    hasUnsavedChanges: boolean;
}

export interface UseUserFormValidationReturn {
    errors: ValidationError[];
    fieldErrors: Record<string, string>;
    isValid: boolean;
    isValidating: boolean;
    validateField: (field: keyof UserFormData, value: any, req?: string[]) => ValidationError | null;
    validateForm: (data: UserFormData, req?: string[]) => ValidationResult;
    clearErrors: () => void;
    clearFieldError: (field: keyof UserFormData) => void;
    setCustomError: (field: keyof UserFormData, message: string) => void;
}

