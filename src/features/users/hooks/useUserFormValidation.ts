/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { useState, useCallback, useMemo, useEffect } from 'react';
import { UserFormData } from '@/types/user';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  fieldErrors: Record<string, string>;
}

export interface UseUserFormValidationProps {
  mode?: 'onChange' | 'onBlur' | 'onSubmit';
  validateOnMount?: boolean;
}

export interface UseUserFormValidationReturn {
  errors: ValidationError[];
  fieldErrors: Record<string, string>;
  isValid: boolean;
  isValidating: boolean;
  validateField: (field: keyof UserFormData, value: any) => ValidationError | null;
  validateForm: (data: UserFormData) => ValidationResult;
  clearErrors: () => void;
  clearFieldError: (field: keyof UserFormData) => void;
  setCustomError: (field: keyof UserFormData, message: string) => void;
}

// Règles de validation
// Remplacer les types any par des types spécifiques
type ValidationRule = {
  required?: boolean; // DEPRECATED: Will be overridden by dynamicRequiredFields
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: unknown) => boolean;
};

// TOUS les champs à required: false par défaut, la vraie liste vient de AdminContext
const VALIDATION_RULES: Partial<Record<keyof UserFormData, ValidationRule>> = {
  nom: { required: false, minLength: 2, maxLength: 50 },
  prenom: { required: false, minLength: 2, maxLength: 50 },
  genre: { required: false },
  telephone: { required: false, pattern: /^(?:(?:\+|00)32|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/ }, // Pattern belge
  email: { required: false, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  statutSejour: { required: false },
  gestionnaire: { required: false },
  nationalite: { required: false },
  antenne: { required: false },
  trancheAge: { required: false },
  remarques: { required: false, maxLength: 2500 },
  secteur: { required: false },
  langue: { required: false },
  premierContact: { required: false },
  notesGenerales: { required: false, maxLength: 3000 },
  etat: { required: false },
  dateNaissance: { required: false },
  dateOuverture: { required: false },
  dateCloture: { required: false },
  hasPrevExp: { required: false },
  prevExpDateReception: { required: false },
  prevExpDateRequete: { required: false },
  prevExpDateVad: { required: false },
  prevExpDecision: { required: false },
  prevExpCommentaire: { required: false, maxLength: 1000 }
};

// Validation d'un champ - avec support pour requiredFields dynamiques
const validateSingleField = (
  field: keyof UserFormData,
  value: unknown,
  dynamicRequiredFields: string[] = [] // Liste dynamique depuis AdminContext
): ValidationError | null => {
  const rules = VALIDATION_RULES[field];
  if (!rules) return null;

  const fieldName = String(field);

  // Vérifier si le champ est requis dynamiquement (via les paramètres)
  const isFieldRequired = dynamicRequiredFields.includes(fieldName);

  // Champ requis
  if (isFieldRequired && (!value || (typeof value === 'string' && value.trim() === ''))) {
    return { field: fieldName, message: `Le champ ${fieldName} est obligatoire` };
  }

  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return null;
  }

  // Longueur minimale
  if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
    return { field: fieldName, message: `Le champ ${fieldName} doit contenir au moins ${rules.minLength} caractères` };
  }

  // Longueur maximale
  if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
    return { field: fieldName, message: `Le champ ${fieldName} doit contenir au maximum ${rules.maxLength} caractères` };
  }

  // Pattern regex
  if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
    if (field === 'email') {
      return { field: fieldName, message: 'Format d\'email invalide' };
    }
    if (field === 'telephone') {
      return { field: fieldName, message: 'Format de téléphone invalide' };
    }
    return { field: fieldName, message: `Format du champ ${fieldName} invalide` };
  }

  // Validation dates
  if (field === 'dateNaissance' && value) {
    // Vérifier que value est une chaîne ou un nombre valide avant de créer une Date
    if (typeof value === 'string' || typeof value === 'number' || value instanceof Date) {
      const birthDate = new Date(value);
      // Vérifier que la date est valide
      if (!isNaN(birthDate.getTime())) {
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age < 0 || age > 120) {
          return { field: fieldName, message: 'Date de naissance invalide' };
        }
      } else {
        return { field: fieldName, message: 'Format de date invalide' };
      }
    } else {
      return { field: fieldName, message: 'Format de date invalide' };
    }
  }

  return null;
};

// Hook principal
export const useUserFormValidation = (
  props: UseUserFormValidationProps = {}
): UseUserFormValidationReturn => {
  const { mode = 'onSubmit', validateOnMount = false } = props;
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  const fieldErrors = useMemo(() => {
    return errors.reduce((acc, error) => {
      acc[error.field] = error.message;
      return acc;
    }, {} as Record<string, string>);
  }, [errors]);

  const validateField = useCallback((field: keyof UserFormData, value: any, requiredFields: string[] = []): ValidationError | null => {
    return validateSingleField(field, value, requiredFields);
  }, []);

  const validateForm = useCallback((data: UserFormData, requiredFields: string[] = []): ValidationResult => {
    const validationErrors: ValidationError[] = [];

    Object.keys(VALIDATION_RULES).forEach((fieldKey) => {
      const field = fieldKey as keyof UserFormData;
      const error = validateSingleField(field, data[field], requiredFields);
      if (error) {
        validationErrors.push(error);
      }
    });

    const fieldErrorsMap = validationErrors.reduce((acc, error) => {
      acc[error.field] = error.message;
      return acc;
    }, {} as Record<string, string>);

    return {
      isValid: validationErrors.length === 0,
      errors: validationErrors,
      fieldErrors: fieldErrorsMap
    };
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const clearFieldError = useCallback((field: keyof UserFormData) => {
    setErrors(prev => prev.filter(error => error.field !== String(field)));
  }, []);

  const setCustomError = useCallback((field: keyof UserFormData, message: string) => {
    const newError: ValidationError = { field: String(field), message };
    setErrors(prev => {
      const filtered = prev.filter(error => error.field !== String(field));
      return [...filtered, newError];
    });
  }, []);

  const isValid = errors.length === 0;

  return {
    errors,
    fieldErrors,
    isValid,
    isValidating,
    validateField,
    validateForm,
    clearErrors,
    clearFieldError,
    setCustomError
  };
};

// Hook de validation simple
export const useBasicValidation = (formData: UserFormData) => {
  const validateForm = useCallback((data: UserFormData): ValidationResult => {
    const validationErrors: ValidationError[] = [];

    // Champs requis seulement
    const requiredFields = ['nom', 'prenom', 'genre', 'telephone', 'email', 'statutSejour', 'gestionnaire', 'nationalite'] as const;

    requiredFields.forEach(field => {
      const error = validateSingleField(field, data[field]);
      if (error) {
        validationErrors.push(error);
      }
    });

    const fieldErrorsMap = validationErrors.reduce((acc, error) => {
      acc[error.field] = error.message;
      return acc;
    }, {} as Record<string, string>);

    return {
      isValid: validationErrors.length === 0,
      errors: validationErrors,
      fieldErrors: fieldErrorsMap
    };
  }, []);

  return {
    validateForm,
    isValid: validateForm(formData).isValid,
    errors: validateForm(formData).errors,
    fieldErrors: validateForm(formData).fieldErrors
  };
};

// Hook validation temps réel
export const useRealtimeValidation = (formData: UserFormData) => {
  const validateField = useCallback((field: keyof UserFormData, value: any) => {
    return validateSingleField(field, value);
  }, []);

  const validateForm = useCallback((data: UserFormData): ValidationResult => {
    const validationErrors: ValidationError[] = [];

    Object.keys(VALIDATION_RULES).forEach((fieldKey) => {
      const field = fieldKey as keyof UserFormData;
      const error = validateSingleField(field, data[field]);
      if (error) {
        validationErrors.push(error);
      }
    });

    const fieldErrorsMap = validationErrors.reduce((acc, error) => {
      acc[error.field] = error.message;
      return acc;
    }, {} as Record<string, string>);

    return {
      isValid: validationErrors.length === 0,
      errors: validationErrors,
      fieldErrors: fieldErrorsMap
    };
  }, []);

  const fieldErrors = useMemo(() => {
    const result = validateForm(formData);
    return result.fieldErrors;
  }, [formData, validateForm]);

  const isValid = useMemo(() => {
    return Object.keys(fieldErrors).length === 0;
  }, [fieldErrors]);

  const validateFieldRealtime = useCallback((field: keyof UserFormData, value: any) => {
    return validateField(field, value);
  }, [validateField]);

  const [debouncedValidation, setDebouncedValidation] = useState<ValidationResult | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const result = validateForm(formData);
      setDebouncedValidation(result);
    }, 300);

    return () => clearTimeout(timer);
  }, [formData, validateForm]);

  return {
    validateFieldRealtime,
    fieldErrors,
    isValid,
    debouncedValidation,
    hasRealtimeErrors: Object.keys(fieldErrors).length > 0
  };
};

