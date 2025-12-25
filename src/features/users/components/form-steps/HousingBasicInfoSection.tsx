/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import React from 'react';
import { FieldWrapper, TextInput, SelectInput, DateInput } from '../shared';
import { useRequiredFields } from '@/hooks/useRequiredFields';
import { UserFormData } from '@/types/user';

interface HousingBasicInfoSectionProps {
    logementDetails: any;
    optionsTypeLogementDyn: Array<{ value: string; label: string }>;
    optionsBailEnregistre: Array<{ value: string; label: string }>;
    optionsDureeContrat: Array<{ value: string; label: string }>;
    onNestedInputChange: (parentField: keyof UserFormData, childField: string, value: any) => void;
    disabled?: boolean;
}

export const HousingBasicInfoSection: React.FC<HousingBasicInfoSectionProps> = ({
    logementDetails,
    optionsTypeLogementDyn,
    optionsBailEnregistre,
    optionsDureeContrat,
    onNestedInputChange,
    disabled
}) => {
    const { isRequired } = useRequiredFields();

    return (
        <>
            {/* Section informations de base */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200 mb-6">
                <h4 className="text-md font-semibold text-blue-900 mb-3 flex items-center">
                    <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Informations de base sur le logement
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FieldWrapper
                        htmlFor="typeLogement"
                        label="Type de logement"
                        required={isRequired('logementDetails.typeLogement')}
                    >
                        <SelectInput
                            id="typeLogement"
                            value={logementDetails.typeLogement || ''}
                            onChange={(value) => onNestedInputChange('logementDetails', 'typeLogement', value)}
                            disabled={disabled}
                            options={optionsTypeLogementDyn}
                        />
                    </FieldWrapper>

                    <FieldWrapper
                        htmlFor="proprietaire"
                        label="Propriétaire"
                        required={isRequired('logementDetails.proprietaire')}
                    >
                        <TextInput
                            id="proprietaire"
                            value={logementDetails.proprietaire || ''}
                            onChange={(value) => onNestedInputChange('logementDetails', 'proprietaire', value)}
                            disabled={disabled}
                            placeholder="Nom du propriétaire"
                        />
                    </FieldWrapper>
                </div>
            </div>

            {/* Section informations contractuelles */}
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-lg border border-emerald-200 mb-6">
                <h4 className="text-md font-semibold text-emerald-900 mb-3 flex items-center">
                    <svg className="w-5 h-5 text-emerald-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Informations contractuelles
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FieldWrapper
                        htmlFor="bailEnregistre"
                        label="Bail enregistré"
                        required={isRequired('logementDetails.bailEnregistre')}
                    >
                        <SelectInput
                            id="bailEnregistre"
                            value={logementDetails.bailEnregistre || ''}
                            onChange={(value) => onNestedInputChange('logementDetails', 'bailEnregistre', value)}
                            disabled={disabled}
                            options={[
                                { value: '', label: '' },
                                ...optionsBailEnregistre
                            ]}
                        />
                    </FieldWrapper>

                    <FieldWrapper
                        htmlFor="dateContrat"
                        label="Date du contrat"
                        required={isRequired('logementDetails.dateContrat')}
                    >
                        <DateInput
                            id="dateContrat"
                            value={logementDetails.dateContrat}
                            onChange={(value) => onNestedInputChange('logementDetails', 'dateContrat', value)}
                            disabled={disabled}
                            className="focus:ring-emerald-500 focus:border-emerald-500"
                        />
                    </FieldWrapper>

                    <FieldWrapper htmlFor="dateEntree" label="Date d'entrée">
                        <DateInput
                            id="dateEntree"
                            value={logementDetails.dateEntree}
                            onChange={(value) => onNestedInputChange('logementDetails', 'dateEntree', value)}
                            disabled={disabled}
                            className="focus:ring-emerald-500 focus:border-emerald-500"
                        />
                    </FieldWrapper>

                    <FieldWrapper htmlFor="dureeContrat" label="Durée du contrat">
                        <SelectInput
                            id="dureeContrat"
                            value={logementDetails.dureeContrat || ''}
                            onChange={(value) => onNestedInputChange('logementDetails', 'dureeContrat', value)}
                            disabled={disabled}
                            options={[
                                { value: '', label: '' },
                                ...optionsDureeContrat
                            ]}
                        />
                    </FieldWrapper>
                </div>
            </div>
        </>
    );
};
