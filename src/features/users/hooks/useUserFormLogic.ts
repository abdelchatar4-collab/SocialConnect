/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - User Form Logic Hook
Refactored to use extracted modules for maintainability
*/

import { useState, useCallback, useEffect } from 'react';
import { User, UserFormData, FormErrors } from '@/types';
import { useAdmin } from '@/contexts/AdminContext';
import { defaultUserFormData, STEP_FIELDS, FIELD_LABELS } from '../constants/formDefaults';
import { convertUserToFormData } from '../utils/formDataConversion';

interface UseUserFormLogicProps {
    initialData?: Partial<User>;
    onSubmit: (userData: Partial<User>) => Promise<void>;
    mode: 'create' | 'edit';
    totalSteps: number;
}

export const useUserFormLogic = ({ initialData, onSubmit, mode, totalSteps }: UseUserFormLogicProps) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [gestionnaires, setGestionnaires] = useState<Array<{ id: string; prenom: string; nom: string }>>([]);
    const { requiredFields } = useAdmin();

    // Load gestionnaires
    useEffect(() => {
        const fetchGestionnaires = async () => {
            try {
                const response = await fetch('/api/gestionnaires');
                if (response.ok) {
                    const data = await response.json();
                    const rawGestionnaires = Array.isArray(data) ? data : data.gestionnaires || [];

                    const filtered = rawGestionnaires.filter((g: any) => {
                        const isActive = g.isActive !== false;
                        const isGestionnaireDossier = g.isGestionnaireDossier !== false;
                        if (isActive && isGestionnaireDossier) return true;
                        if (mode === 'edit' && initialData && (
                            String(g.id) === String(initialData.gestionnaire) ||
                            String(g.prenom) === String(initialData.gestionnaire)
                        )) {
                            return true;
                        }
                        return false;
                    });

                    setGestionnaires(filtered.map((g: any) => ({
                        id: g.id || g._id,
                        prenom: g.prenom,
                        nom: g.nom || '',
                        isActive: g.isActive !== false
                    })));
                } else {
                    setGestionnaires([
                        { id: 'gest-1', prenom: 'Houssaine', nom: '' },
                        { id: 'gest-2', prenom: 'Samia', nom: '' },
                        { id: 'gest-3', prenom: 'Mohamed', nom: '' },
                        { id: 'gest-4', prenom: 'Delphine', nom: '' },
                        { id: 'gest-5', prenom: 'Fatima', nom: '' }
                    ]);
                }
            } catch (error) {
                console.error('Error fetching gestionnaires:', error);
            }
        };
        fetchGestionnaires();
    }, []);

    // Initialize form data
    const [formData, setFormData] = useState<UserFormData>(() => {
        if (initialData) {
            return convertUserToFormData(initialData);
        }
        return { ...defaultUserFormData };
    });

    const handleFieldChange = useCallback((field: string, value: any) => {
        setFormData((prev: UserFormData) => {
            if (field.includes('.')) {
                const [parentField, childField] = field.split('.');
                return {
                    ...prev,
                    [parentField]: {
                        ...(prev[parentField as keyof UserFormData] as any),
                        [childField]: value
                    }
                };
            }
            return { ...prev, [field]: value };
        });

        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    }, [errors]);

    const handleNestedInputChange = useCallback((parentField: string, childField: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [parentField]: {
                ...(prev[parentField as keyof UserFormData] as any),
                [childField]: value
            }
        }));
    }, []);

    const validateStep = useCallback((step: number): boolean => {
        if (!requiredFields || requiredFields.length === 0) return true;

        const currentStepFields = STEP_FIELDS[step] || [];
        const requiredForThisStep = requiredFields.filter(f => currentStepFields.includes(f));

        if (requiredForThisStep.length > 0) {
            const missingFields: string[] = [];
            for (const fieldName of requiredForThisStep) {
                let value;
                if (fieldName.includes('.')) {
                    const [parent, child] = fieldName.split('.');
                    value = (formData as any)[parent]?.[child];
                } else {
                    value = (formData as any)[fieldName];
                }
                if (!value || (typeof value === 'string' && value.trim() === '')) {
                    missingFields.push(fieldName);
                }
            }

            if (missingFields.length > 0) {
                const missingLabels = missingFields.map(f => FIELD_LABELS[f] || f);
                alert(
                    `⚠️ Champs obligatoires manquants sur cette étape :\n\n` +
                    `• ${missingLabels.join('\n• ')}\n\n` +
                    `Veuillez remplir ces champs avant de continuer.`
                );
                return false;
            }
        }
        return true;
    }, [formData, requiredFields]);

    const handleNext = useCallback(() => {
        if (currentStep < totalSteps) {
            if (validateStep(currentStep)) {
                setCurrentStep(prev => prev + 1);
            }
        }
    }, [currentStep, totalSteps, validateStep]);

    const handlePrevious = useCallback(() => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    }, [currentStep]);

    const handleSubmit = useCallback(async () => {
        if (requiredFields && requiredFields.length > 0) {
            const missingFields: string[] = [];
            for (const fieldName of requiredFields) {
                let value;
                if (fieldName.includes('.')) {
                    const [parent, child] = fieldName.split('.');
                    value = (formData as any)[parent]?.[child];
                } else {
                    value = (formData as any)[fieldName];
                }
                if (!value || (typeof value === 'string' && value.trim() === '')) {
                    missingFields.push(fieldName);
                }
            }

            if (missingFields.length > 0) {
                const missingLabels = missingFields.map(f => FIELD_LABELS[f] || f);
                alert(
                    `⚠️ Champs obligatoires manquants :\n\n` +
                    `• ${missingLabels.join('\n• ')}\n\n` +
                    `Veuillez remplir ces champs avant de sauvegarder.`
                );
                return;
            }
        }

        if (formData.dateOuverture) {
            const today = new Date();
            const todayStr = today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, "0") + "-" + String(today.getDate()).padStart(2, "0");
            if (formData.dateOuverture > todayStr) {
                const confirmed = window.confirm(
                    "⚠️ Attention : La date d'ouverture indiquée est dans le futur.\n\n" +
                    "Cela placera ce dossier en tête de la liste 'Derniers ajouts'.\n\n" +
                    "Confirmez-vous vouloir conserver cette date ?"
                );
                if (!confirmed) return;
            }
        }

        try {
            setIsSubmitting(true);
            const submissionData = {
                ...formData,
                partenaire: Array.isArray(formData.partenaire) && formData.partenaire.length > 0
                    ? formData.partenaire.map(p => p.nom || p.id).join(', ')
                    : null
            };
            await onSubmit(submissionData as Partial<User>);
        } catch (error) {
            console.error('Error submitting form:', error);
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, onSubmit, requiredFields]);

    return {
        currentStep,
        setCurrentStep,
        isSubmitting,
        errors,
        formData,
        gestionnaires,
        handleFieldChange,
        handleNestedInputChange,
        handleNext,
        handlePrevious,
        handleSubmit
    };
};
