/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

/**
 * useFormSteps - Hook for managing form step navigation
 */

import { useState, useCallback } from 'react';

export const FORM_STEPS = [
  { id: 1, title: 'Identification & Contact', description: 'Nom, prénom, téléphone, email, premier contact, adresse' },
  { id: 2, title: 'Informations personnelles', description: 'Date de naissance, genre, nationalité, statut de séjour, langue' },
  { id: 3, title: 'Gestion administrative', description: 'Gestionnaire, antenne, état du dossier, dates, partenaire' },
  { id: 4, title: 'Logement & Situation', description: 'Détails du logement, situation financière et administrative' },
  { id: 5, title: 'Problématiques & Actions', description: 'Suivi des problématiques et actions de suivi' },
  { id: 6, title: 'Notes & Bilan Social', description: 'Bilan social, notes générales et informations importantes' }
];

export const useFormSteps = (initialStep: number = 1) => {
  const [currentStep, setCurrentStep] = useState(initialStep);

  const goToStep = useCallback((stepNumber: number) => {
    if (stepNumber >= 1 && stepNumber <= FORM_STEPS.length) {
      setCurrentStep(stepNumber);
    }
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < FORM_STEPS.length) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === FORM_STEPS.length;
  const isStepCompleted = useCallback((stepId: number) => stepId < currentStep, [currentStep]);

  const getStepIcon = useCallback((stepId: number): string => {
    if (stepId < currentStep) return '✓';
    return stepId.toString();
  }, [currentStep]);

  return {
    currentStep,
    totalSteps: FORM_STEPS.length,
    goToStep,
    nextStep,
    prevStep,
    isFirstStep,
    isLastStep,
    isStepCompleted,
    getStepIcon,
    steps: FORM_STEPS,
  };
};
