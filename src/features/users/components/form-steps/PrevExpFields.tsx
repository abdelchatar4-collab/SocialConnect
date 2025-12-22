/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import React from 'react';
import { UserFormData } from '@/types';
import { FieldWrapper } from '../shared/FieldWrapper';
import { TextInput } from '../shared/TextInput';
import { SelectInput } from '../shared/SelectInput';
import { MultiSelectInput } from '../shared/MultiSelectInput';
import { LisserButton, useAiAvailable } from '@/components/ai/LisserButton';

interface PrevExpFieldsProps {
    formData: UserFormData;
    onInputChange: (field: keyof UserFormData, value: any) => void;
    disabled?: boolean;
    optionsPrevExpDecision: Array<{ value: string; label: string }>;
    optionsPrevExpDemandeCpas: Array<{ value: string; label: string }>;
    optionsPrevExpNegociationProprio: Array<{ value: string; label: string }>;
    optionsPrevExpSolutionRelogement: Array<{ value: string; label: string }>;
    optionsPrevExpTypeFamille: Array<{ value: string; label: string }>;
    optionsPrevExpTypeRevenu: Array<{ value: string; label: string }>;
    optionsPrevExpEtatLogement: Array<{ value: string; label: string }>;
    optionsPrevExpNombreChambre: Array<{ value: string; label: string }>;
    optionsPrevExpAideJuridique: Array<{ value: string; label: string }>;
    optionsPrevExpMotifRequete: Array<{ value: string; label: string }>;
}

export const PrevExpFields: React.FC<PrevExpFieldsProps> = ({
    formData,
    onInputChange,
    disabled,
    optionsPrevExpDecision,
    optionsPrevExpDemandeCpas,
    optionsPrevExpNegociationProprio,
    optionsPrevExpSolutionRelogement,
    optionsPrevExpTypeFamille,
    optionsPrevExpTypeRevenu,
    optionsPrevExpEtatLogement,
    optionsPrevExpNombreChambre,
    optionsPrevExpAideJuridique,
    optionsPrevExpMotifRequete
}) => {
    const isAiAvailable = useAiAvailable();

    return (
        <div className="bg-gradient-to-r from-red-50 to-rose-50 p-4 rounded-lg border border-red-200">
            <div className="flex items-center mb-4">
                <input
                    type="checkbox"
                    id="hasPrevExp"
                    checked={formData.hasPrevExp || false}
                    onChange={(e) => onInputChange('hasPrevExp', e.target.checked)}
                    disabled={disabled}
                    className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <label htmlFor="hasPrevExp" className="ml-3 text-md font-semibold text-red-900 flex items-center">
                    <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    Prévention expulsion
                </label>
            </div>

            {formData.hasPrevExp && (
                <div className="bg-white/50 p-4 rounded-md border border-red-200">
                    <h5 className="text-sm font-semibold text-red-900 mb-3 flex items-center">
                        <svg className="w-4 h-4 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Détails de la procédure
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FieldWrapper htmlFor="prevExpDateReception" label="Date de réception">
                            <input
                                type="date"
                                id="prevExpDateReception"
                                value={formData.prevExpDateReception || ''}
                                onChange={e => onInputChange('prevExpDateReception', e.target.value)}
                                disabled={disabled}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                            />
                        </FieldWrapper>

                        <FieldWrapper htmlFor="prevExpDateRequete" label="Date de requête">
                            <input
                                type="date"
                                id="prevExpDateRequete"
                                value={formData.prevExpDateRequete || ''}
                                onChange={e => onInputChange('prevExpDateRequete', e.target.value)}
                                disabled={disabled}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                            />
                        </FieldWrapper>

                        <FieldWrapper htmlFor="prevExpDateVad" label="Date VAD">
                            <input
                                type="date"
                                id="prevExpDateVad"
                                value={formData.prevExpDateVad || ''}
                                onChange={e => onInputChange('prevExpDateVad', e.target.value)}
                                disabled={disabled}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                            />
                        </FieldWrapper>

                        <FieldWrapper htmlFor="prevExpMotifRequete" label="Motif de la requête">
                            <MultiSelectInput
                                id="prevExpMotifRequete"
                                value={(() => {
                                    const val = formData.prevExpMotifRequete;
                                    if (!val || val === '') return [];
                                    if (val.includes(',')) {
                                        return val.split(',').filter(Boolean);
                                    }
                                    return [val];
                                })()}
                                onChange={(values) => onInputChange('prevExpMotifRequete', values.join(','))}
                                disabled={disabled}
                                options={optionsPrevExpMotifRequete}
                                placeholder="Sélectionner un ou plusieurs motifs..."
                            />
                        </FieldWrapper>

                        <FieldWrapper htmlFor="prevExpDossierOuvert" label="Dossier ouvert ?">
                            <SelectInput
                                id="prevExpDossierOuvert"
                                value={formData.prevExpDossierOuvert || ''}
                                onChange={(value) => onInputChange('prevExpDossierOuvert', value)}
                                disabled={disabled}
                                options={[
                                    { value: '', label: '' },
                                    { value: 'OUI', label: 'OUI' },
                                    { value: 'NON', label: 'NON' }
                                ]}
                            />
                        </FieldWrapper>

                        <FieldWrapper htmlFor="prevExpTypeFamille" label="Type de famille">
                            <SelectInput
                                id="prevExpTypeFamille"
                                value={formData.prevExpTypeFamille || ''}
                                onChange={(value) => onInputChange('prevExpTypeFamille', value)}
                                disabled={disabled}
                                options={[
                                    { value: '', label: '' },
                                    ...optionsPrevExpTypeFamille
                                ]}
                            />
                        </FieldWrapper>

                        <FieldWrapper htmlFor="prevExpTypeRevenu" label="Type de revenu">
                            <MultiSelectInput
                                id="prevExpTypeRevenu"
                                value={(() => {
                                    const val = formData.prevExpTypeRevenu;
                                    if (!val || val === '') return [];
                                    if (val.includes(',')) {
                                        return val.split(',').filter(Boolean);
                                    }
                                    return [val];
                                })()}
                                onChange={(values) => onInputChange('prevExpTypeRevenu', values.join(','))}
                                disabled={disabled}
                                options={optionsPrevExpTypeRevenu}
                                placeholder="Sélectionner un ou plusieurs revenus..."
                            />
                        </FieldWrapper>

                        <FieldWrapper htmlFor="prevExpEtatLogement" label="État du logement">
                            <MultiSelectInput
                                id="prevExpEtatLogement"
                                value={(() => {
                                    const val = formData.prevExpEtatLogement;
                                    if (!val || val === '') return [];
                                    if (val.includes(',')) {
                                        return val.split(',').filter(Boolean);
                                    }
                                    return [val];
                                })()}
                                onChange={(values) => onInputChange('prevExpEtatLogement', values.join(','))}
                                disabled={disabled}
                                options={optionsPrevExpEtatLogement}
                                placeholder="Sélectionner un ou plusieurs états..."
                            />
                        </FieldWrapper>

                        <FieldWrapper htmlFor="prevExpNombreChambre" label="Nombre de chambres">
                            <SelectInput
                                id="prevExpNombreChambre"
                                value={formData.prevExpNombreChambre || ''}
                                onChange={(value) => onInputChange('prevExpNombreChambre', value)}
                                disabled={disabled}
                                options={[
                                    { value: '', label: '' },
                                    ...optionsPrevExpNombreChambre
                                ]}
                            />
                        </FieldWrapper>

                        <FieldWrapper htmlFor="prevExpDateAudience" label="Date d'audience">
                            <input
                                type="date"
                                id="prevExpDateAudience"
                                value={formData.prevExpDateAudience || ''}
                                onChange={e => onInputChange('prevExpDateAudience', e.target.value)}
                                disabled={disabled}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                            />
                        </FieldWrapper>

                        <FieldWrapper htmlFor="prevExpDateSignification" label="Date de signification">
                            <input
                                type="date"
                                id="prevExpDateSignification"
                                value={formData.prevExpDateSignification || ''}
                                onChange={e => onInputChange('prevExpDateSignification', e.target.value)}
                                disabled={disabled}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                            />
                        </FieldWrapper>

                        <FieldWrapper htmlFor="prevExpDateJugement" label="Date du jugement">
                            <input
                                type="date"
                                id="prevExpDateJugement"
                                value={formData.prevExpDateJugement || ''}
                                onChange={e => onInputChange('prevExpDateJugement', e.target.value)}
                                disabled={disabled}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                            />
                        </FieldWrapper>

                        <FieldWrapper htmlFor="prevExpDateExpulsion" label="Date d'expulsion">
                            <input
                                type="date"
                                id="prevExpDateExpulsion"
                                value={formData.prevExpDateExpulsion || ''}
                                onChange={e => onInputChange('prevExpDateExpulsion', e.target.value)}
                                disabled={disabled}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                            />
                        </FieldWrapper>

                        <FieldWrapper htmlFor="prevExpAideJuridique" label="Aide juridique">
                            <MultiSelectInput
                                id="prevExpAideJuridique"
                                value={(() => {
                                    const val = formData.prevExpAideJuridique;
                                    if (!val || val === '') return [];
                                    if (val.includes(',')) {
                                        return val.split(',').filter(Boolean);
                                    }
                                    return [val];
                                })()}
                                onChange={(values) => onInputChange('prevExpAideJuridique', values.join(','))}
                                disabled={disabled}
                                options={optionsPrevExpAideJuridique}
                                placeholder="Sélectionner une ou plusieurs options..."
                            />
                        </FieldWrapper>

                        <FieldWrapper htmlFor="prevExpDecision" label="Issue de l'accompagnement">
                            <MultiSelectInput
                                id="prevExpDecision"
                                value={(() => {
                                    const val = formData.prevExpDecision;
                                    if (!val || val === '') return [];
                                    if (val.includes(',')) {
                                        return val.split(',').filter(Boolean);
                                    }
                                    return [val];
                                })()}
                                onChange={(values) => onInputChange('prevExpDecision', values.join(','))}
                                disabled={disabled}
                                options={optionsPrevExpDecision}
                                placeholder="Sélectionner une ou plusieurs issues..."
                            />
                        </FieldWrapper>

                        <FieldWrapper htmlFor="prevExpDemandeCpas" label="Demande de prise en charge CPAS">
                            <MultiSelectInput
                                id="prevExpDemandeCpas"
                                value={(() => {
                                    const val = formData.prevExpDemandeCpas;
                                    if (!val || val === '') return [];
                                    // Si la valeur contient une virgule, c'est un multi-select
                                    if (val.includes(',')) {
                                        return val.split(',').filter(Boolean);
                                    }
                                    // Sinon, c'est une valeur unique (ancien format)
                                    return [val];
                                })()}
                                onChange={(values) => onInputChange('prevExpDemandeCpas', values.join(','))}
                                disabled={disabled}
                                options={optionsPrevExpDemandeCpas}
                                placeholder="Sélectionner une ou plusieurs options..."
                            />
                        </FieldWrapper>

                        <FieldWrapper htmlFor="prevExpNegociationProprio" label="Négociation avec propriétaire">
                            <MultiSelectInput
                                id="prevExpNegociationProprio"
                                value={(() => {
                                    const val = formData.prevExpNegociationProprio;
                                    if (!val || val === '') return [];
                                    if (val.includes(',')) {
                                        return val.split(',').filter(Boolean);
                                    }
                                    return [val];
                                })()}
                                onChange={(values) => onInputChange('prevExpNegociationProprio', values.join(','))}
                                disabled={disabled}
                                options={optionsPrevExpNegociationProprio}
                                placeholder="Sélectionner une ou plusieurs options..."
                            />
                        </FieldWrapper>

                        <FieldWrapper htmlFor="prevExpSolutionRelogement" label="Solution de relogement">
                            <MultiSelectInput
                                id="prevExpSolutionRelogement"
                                value={(() => {
                                    const val = formData.prevExpSolutionRelogement;
                                    if (!val || val === '') return [];
                                    if (val.includes(',')) {
                                        return val.split(',').filter(Boolean);
                                    }
                                    return [val];
                                })()}
                                onChange={(values) => onInputChange('prevExpSolutionRelogement', values.join(','))}
                                disabled={disabled}
                                options={optionsPrevExpSolutionRelogement}
                                placeholder="Sélectionner une ou plusieurs options..."
                            />
                        </FieldWrapper>

                        <FieldWrapper htmlFor="prevExpMaintienLogement" label="Maintien dans le logement ?">
                            <SelectInput
                                id="prevExpMaintienLogement"
                                value={formData.prevExpMaintienLogement || ''}
                                onChange={(value) => onInputChange('prevExpMaintienLogement', value)}
                                disabled={disabled}
                                options={[
                                    { value: '', label: '' },
                                    { value: 'Oui', label: 'OUI' },
                                    { value: 'Non', label: 'NON' }
                                ]}
                            />
                        </FieldWrapper>

                        <div className="col-span-2">
                            <div className="flex items-center justify-between mb-1">
                                <label htmlFor="prevExpCommentaire" className="block text-sm font-medium text-gray-700">
                                    Commentaire
                                </label>
                                {isAiAvailable && formData.prevExpCommentaire && formData.prevExpCommentaire.trim() && (
                                    <LisserButton
                                        text={formData.prevExpCommentaire}
                                        onAccept={(text) => onInputChange('prevExpCommentaire', text)}
                                        disabled={disabled}
                                        colorScheme="purple"
                                    />
                                )}
                            </div>
                            <textarea
                                id="prevExpCommentaire"
                                value={formData.prevExpCommentaire || ''}
                                onChange={(e) => onInputChange('prevExpCommentaire', e.target.value)}
                                disabled={disabled}
                                rows={3}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 text-sm text-gray-900 bg-white transition-colors"
                                placeholder="Commentaires concernant l'expulsion..."
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
