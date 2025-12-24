/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import React from 'react';
import { FieldWrapper } from '../shared/FieldWrapper';
import { TextInput } from '../shared/TextInput';
import { displayError } from '@/types/errors';
import { FormErrors } from '@/types';
import { DuplicateInfo } from '../../hooks/useDuplicateCheck';

interface IdentitySectionProps {
    nom: string;
    prenom: string;
    dateNaissance?: string | Date | null;
    onInputChange: (field: 'nom' | 'prenom' | 'dateNaissance', value: any) => void;
    onBlur: () => void;
    errors: FormErrors;
    isRequired: (field: string) => boolean;
    disabled?: boolean;
    duplicates: DuplicateInfo[];
    isCheckingDuplicates: boolean;
    includeDateOfBirth: boolean;
    setIncludeDateOfBirth: (value: boolean) => void;
}

export const IdentitySection: React.FC<IdentitySectionProps> = ({
    nom,
    prenom,
    dateNaissance,
    onInputChange,
    onBlur,
    errors,
    isRequired,
    disabled,
    duplicates,
    isCheckingDuplicates,
    includeDateOfBirth,
    setIncludeDateOfBirth
}) => {
    // Format date for display
    const formatDateForDisplay = (date: string | Date | null | undefined): string => {
        if (!date) return 'N/A';
        const d = new Date(date);
        return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString('fr-BE');
    };

    // Safe date value for input[type="date"]
    const safeDateValue = (date: string | Date | null | undefined): string => {
        if (!date) return '';
        try {
            const d = new Date(date);
            if (isNaN(d.getTime())) return '';
            return d.toISOString().split('T')[0];
        } catch (e) {
            return '';
        }
    };

    return (
        <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-lg border border-purple-200 mb-6">
            <h4 className="text-md font-semibold text-purple-900 mb-3 flex items-center">
                <svg className="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
                Identité
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nom */}
                <FieldWrapper
                    htmlFor="nom"
                    label="Nom"
                    error={displayError(errors.nom)}
                    required={isRequired('nom')}
                >
                    <TextInput
                        id="nom"
                        value={nom || ''}
                        onChange={(value) => onInputChange('nom', value)}
                        onBlur={onBlur}
                        disabled={disabled}
                        placeholder="Nom de famille"
                    />
                </FieldWrapper>

                {/* Prénom */}
                <FieldWrapper
                    htmlFor="prenom"
                    label="Prénom"
                    error={displayError(errors.prenom)}
                    required={isRequired('prenom')}
                >
                    <TextInput
                        id="prenom"
                        value={prenom || ''}
                        onChange={(value) => onInputChange('prenom', value)}
                        onBlur={onBlur}
                        disabled={disabled}
                        placeholder="Prénom"
                    />
                </FieldWrapper>

                {/* Date de Naissance */}
                <FieldWrapper
                    htmlFor="dateNaissance"
                    label="Date de naissance"
                    error={displayError(errors.dateNaissance)}
                    required={isRequired('dateNaissance')}
                >
                    <TextInput
                        id="dateNaissance"
                        type="date"
                        value={(() => {
                            try {
                                return safeDateValue(dateNaissance);
                            } catch (e) {
                                console.error('SafeDate crash prevented:', e);
                                return '';
                            }
                        })()}
                        onChange={(value) => onInputChange('dateNaissance', value)}
                        onBlur={onBlur}
                        disabled={disabled}
                    />
                </FieldWrapper>
            </div>

            {/* Date filter toggle */}
            <div className="mt-3 flex items-center">
                <label className="flex items-center text-sm text-purple-700 cursor-pointer hover:text-purple-900">
                    <input
                        type="checkbox"
                        checked={includeDateOfBirth}
                        onChange={(e) => setIncludeDateOfBirth(e.target.checked)}
                        className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 mr-2"
                    />
                    <span>Filtrer les doublons par date de naissance</span>
                    {includeDateOfBirth && dateNaissance && (
                        <span className="ml-2 text-xs text-purple-500">
                            ({formatDateForDisplay(dateNaissance)})
                        </span>
                    )}
                    {includeDateOfBirth && !dateNaissance && (
                        <span className="ml-2 text-xs text-amber-600">
                            (Entrez une date de naissance ci-dessus)
                        </span>
                    )}
                </label>
            </div>

            {/* Duplicate Warning Banner */}
            {duplicates.length > 0 && (
                <div className="mt-4 p-4 bg-amber-50 border border-amber-300 rounded-lg">
                    <div className="flex items-start">
                        <svg className="w-6 h-6 text-amber-600 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div>
                            <h5 className="font-semibold text-amber-800">⚠️ Doublon potentiel détecté !</h5>
                            <p className="text-sm text-amber-700 mt-1">
                                {duplicates.length === 1 ? 'Un usager' : `${duplicates.length} usagers`} avec ce nom existe{duplicates.length > 1 ? 'nt' : ''} déjà :
                            </p>
                            <ul className="mt-2 space-y-1">
                                {duplicates.map((d) => (
                                    <li key={d.id} className="text-sm text-amber-800 bg-amber-100 p-2 rounded">
                                        <strong>{d.prenom} {d.nom}</strong>
                                        {d.dateNaissance && (
                                            <span className="text-amber-700 ml-2">
                                                (né(e) le {formatDateForDisplay(d.dateNaissance)})
                                            </span>
                                        )}
                                        <span className="text-amber-600 ml-2">
                                            (ID: {d.id}{d.antenne ? `, ${d.antenne}` : ''}{d.gestionnaire ? ` - Gestionnaire: ${d.gestionnaire}` : ''})
                                        </span>
                                    </li>
                                ))}
                            </ul>
                            <p className="text-xs text-amber-600 mt-2">
                                Vous pouvez continuer la création si c&apos;est bien un nouvel usager distinct.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {isCheckingDuplicates && (
                <div className="mt-2 text-sm text-gray-500 flex items-center">
                    <svg className="animate-spin h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Vérification des doublons...
                </div>
            )}
        </div>
    );
};
