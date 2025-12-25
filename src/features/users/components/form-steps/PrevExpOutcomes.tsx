/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Prevention Expulsion Outcomes
Extracted from PrevExpFields.tsx
*/

import React from 'react';
import { UserFormData } from '@/types';
import { FieldWrapper } from '../shared/FieldWrapper';
import { MultiSelectInput } from '../shared/MultiSelectInput';
import { SelectInput } from '../shared/SelectInput';

interface PrevExpOutcomesProps {
    formData: UserFormData;
    onInputChange: (field: keyof UserFormData, value: any) => void;
    disabled?: boolean;
    optionsPrevExpAideJuridique: Array<{ value: string; label: string }>;
    optionsPrevExpDecision: Array<{ value: string; label: string }>;
    optionsPrevExpDemandeCpas: Array<{ value: string; label: string }>;
    optionsPrevExpNegociationProprio: Array<{ value: string; label: string }>;
    optionsPrevExpSolutionRelogement: Array<{ value: string; label: string }>;
}

export const PrevExpOutcomes: React.FC<PrevExpOutcomesProps> = ({
    formData,
    onInputChange,
    disabled,
    optionsPrevExpAideJuridique,
    optionsPrevExpDecision,
    optionsPrevExpDemandeCpas,
    optionsPrevExpNegociationProprio,
    optionsPrevExpSolutionRelogement
}) => {
    return (
        <>
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
                        if (val.includes(',')) {
                            return val.split(',').filter(Boolean);
                        }
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
        </>
    );
};
