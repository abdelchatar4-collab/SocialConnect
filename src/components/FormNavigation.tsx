/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';

interface FormNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  className?: string;
}

export const FormNavigation: React.FC<FormNavigationProps> = ({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onSubmit,
  onCancel,
  isSubmitting = false,
  className = ''
}) => {
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  return (
    <div className={`flex justify-between items-center ${className}`}>
      <div className="flex space-x-4">
        {/* Cancel button */}
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={isSubmitting}
          >
            Annuler
          </button>
        )}

        {/* Previous button */}
        <button
          type="button"
          onClick={onPrevious}
          disabled={isFirstStep || isSubmitting}
          className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium ${
            isFirstStep || isSubmitting
              ? 'text-gray-500 bg-gray-100 cursor-not-allowed'
              : 'text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          }`}
        >
          <ChevronLeftIcon className="h-4 w-4 mr-1" />
          Précédent
        </button>
      </div>

      <div className="flex items-center space-x-4">
        {/* Step indicator */}
        <span className="text-sm text-gray-600">
          Étape {currentStep} sur {totalSteps}
        </span>

        {/* Next/Submit button */}
        {isLastStep ? (
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
            className={`inline-flex items-center px-6 py-2 border border-transparent rounded-md text-sm font-medium text-white ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
            }`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enregistrement...
              </>
            ) : (
              'Enregistrer'
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={onNext}
            disabled={isSubmitting}
            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }`}
          >
            Suivant
            <ChevronRightIcon className="h-4 w-4 ml-1" />
          </button>
        )}
      </div>
    </div>
  );
};
