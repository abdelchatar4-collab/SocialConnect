/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import React from 'react';

interface UserFormNavigationProps {
    currentStep: number;
    totalSteps: number;
    isSubmitting: boolean;
    mode: 'create' | 'edit';
    onPrevious: () => void;
    onNext: () => void;
    onSubmit: () => void;
    onCancel?: () => void;
    onDelete?: () => void;
}

export const UserFormNavigation: React.FC<UserFormNavigationProps> = ({
    currentStep,
    totalSteps,
    isSubmitting,
    mode,
    onPrevious,
    onNext,
    onSubmit,
    onCancel,
    onDelete
}) => {
    const isFirstStep = currentStep === 1;
    const isLastStep = currentStep === totalSteps;

    return (
        <div className="mt-6 flex justify-between">
            <button
                type="button"
                onClick={onPrevious}
                disabled={isFirstStep}
                className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300"
            >
                ← Précédent
            </button>

            <div className="space-x-3">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200"
                    >
                        Annuler
                    </button>
                )}

                {mode === 'edit' && onDelete && (
                    <button
                        type="button"
                        onClick={onDelete}
                        className="px-6 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Supprimer
                    </button>
                )}

                {isLastStep ? (
                    <button
                        type="button"
                        onClick={onSubmit}
                        disabled={isSubmitting}
                        className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-indigo-600"
                    >
                        {isSubmitting
                            ? (mode === 'edit' ? 'Mise à jour...' : 'Enregistrement...')
                            : (mode === 'edit' ? '✓ Mettre à jour' : '✓ Enregistrer')
                        }
                    </button>
                ) : (
                    <>
                        {mode === 'edit' && (
                            <button
                                type="button"
                                onClick={onSubmit}
                                disabled={isSubmitting}
                                className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed mr-3"
                            >
                                {isSubmitting ? 'Mise à jour...' : '✓ Mettre à jour'}
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={onNext}
                            className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 transition-colors duration-200"
                        >
                            Suivant →
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};
