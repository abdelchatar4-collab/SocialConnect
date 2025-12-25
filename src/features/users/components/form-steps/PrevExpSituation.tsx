/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Prevention Expulsion Social Situation
Extracted from PrevExpFields.tsx
*/

import React from 'react';
import { UserFormData } from '@/types';
import { FieldWrapper } from '../shared/FieldWrapper';
import { MultiSelectInput } from '../shared/MultiSelectInput';
import { SelectInput } from '../shared/SelectInput';

interface PrevExpSituationProps {
    formData: UserFormData;
    onInputChange: (field: keyof UserFormData, value: any) => void;
    disabled?: boolean;
    optionsPrevExpTypeFamille: Array<{ value: string; label: string }>;
    optionsPrevExpTypeRevenu: Array<{ value: string; label: string }>;
    optionsPrevExpEtatLogement: Array<{ value: string; label: string }>;
    optionsPrevExpNombreChambre: Array<{ value: string; label: string }>;
}

export const PrevExpSituation: React.FC<PrevExpSituationProps> = ({
    formData,
    onInputChange,
    disabled,
    optionsPrevExpTypeFamille,
    optionsPrevExpTypeRevenu,
    optionsPrevExpEtatLogement,
    optionsPrevExpNombreChambre
}) => {
    return (
        <>
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
        </>
    );
};
