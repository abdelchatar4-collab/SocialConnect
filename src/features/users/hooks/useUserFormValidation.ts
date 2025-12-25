/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.
*/

import { useState, useCallback, useMemo } from 'react';
import { UserFormData } from '@/types/user';
import { ValidationError, ValidationResult, UseUserFormValidationReturn } from './form/userFormTypes';
import { validateSingleField, VALIDATION_RULES } from './form/validationCore';

export const useUserFormValidation = (): UseUserFormValidationReturn => {
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const validateForm = useCallback((data: UserFormData, req: string[] = []): ValidationResult => {
    const errs: ValidationError[] = [];
    Object.keys(VALIDATION_RULES).forEach(k => {
      const e = validateSingleField(k as keyof UserFormData, data[k as keyof UserFormData], req);
      if (e) errs.push(e);
    });
    return { isValid: errs.length === 0, errors: errs, fieldErrors: errs.reduce((acc, x) => ({ ...acc, [x.field]: x.message }), {}) };
  }, []);

  return {
    errors, fieldErrors: errors.reduce((acc, x) => ({ ...acc, [x.field]: x.message }), {}),
    isValid: errors.length === 0, isValidating: false,
    validateField: validateSingleField, validateForm,
    clearErrors: () => setErrors([]),
    clearFieldError: (f: keyof UserFormData) => setErrors(p => p.filter(x => x.field !== String(f))),
    setCustomError: (f: keyof UserFormData, m: string) => setErrors(p => [...p.filter(x => x.field !== String(f)), { field: String(f), message: m }])
  };
};

export const useBasicValidation = (data: UserFormData) => {
  const req = ['nom', 'prenom', 'genre', 'telephone', 'email', 'statutSejour', 'gestionnaire', 'nationalite'];
  const v = () => {
    const errs = req.map(f => validateSingleField(f as keyof UserFormData, data[f as keyof UserFormData])).filter(Boolean) as ValidationError[];
    return { isValid: errs.length === 0, errors: errs, fieldErrors: errs.reduce((acc, x) => ({ ...acc, [x.field]: x.message }), {}) };
  };
  return { validateForm: v, ...v() };
};

export const useRealtimeValidation = (data: UserFormData) => {
  const fErr = useMemo(() => {
    const errs: ValidationError[] = [];
    Object.keys(VALIDATION_RULES).forEach(k => {
      const e = validateSingleField(k as keyof UserFormData, data[k as keyof UserFormData]);
      if (e) errs.push(e);
    });
    return errs.reduce((acc: any, x) => ({ ...acc, [x.field]: x.message }), {} as Record<string, string>);
  }, [data]);

  return { validateFieldRealtime: validateSingleField, fieldErrors: fErr, isValid: !Object.keys(fErr).length, hasRealtimeErrors: !!Object.keys(fErr).length };
};
