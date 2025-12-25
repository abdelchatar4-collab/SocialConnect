/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Prevention Expulsion Legal Timeline
Extracted from PrevExpFields.tsx
*/

import React from 'react';
import { UserFormData } from '@/types';
import { FieldWrapper, DateInput } from '../shared';

interface PrevExpLegalTimelineProps {
    formData: UserFormData;
    onInputChange: (field: keyof UserFormData, value: any) => void;
    disabled?: boolean;
}

export const PrevExpLegalTimeline: React.FC<PrevExpLegalTimelineProps> = ({
    formData,
    onInputChange,
    disabled
}) => {
    return (
        <>
            <FieldWrapper htmlFor="prevExpDateAudience" label="Date d'audience">
                <DateInput
                    id="prevExpDateAudience"
                    value={formData.prevExpDateAudience}
                    onChange={(value) => onInputChange('prevExpDateAudience', value)}
                    disabled={disabled}
                    className="focus:ring-red-500 focus:border-red-500"
                />
            </FieldWrapper>

            <FieldWrapper htmlFor="prevExpDateSignification" label="Date de signification">
                <DateInput
                    id="prevExpDateSignification"
                    value={formData.prevExpDateSignification}
                    onChange={(value) => onInputChange('prevExpDateSignification', value)}
                    disabled={disabled}
                    className="focus:ring-red-500 focus:border-red-500"
                />
            </FieldWrapper>

            <FieldWrapper htmlFor="prevExpDateJugement" label="Date du jugement">
                <DateInput
                    id="prevExpDateJugement"
                    value={formData.prevExpDateJugement}
                    onChange={(value) => onInputChange('prevExpDateJugement', value)}
                    disabled={disabled}
                    className="focus:ring-red-500 focus:border-red-500"
                />
            </FieldWrapper>

            <FieldWrapper htmlFor="prevExpDateExpulsion" label="Date d'expulsion">
                <DateInput
                    id="prevExpDateExpulsion"
                    value={formData.prevExpDateExpulsion}
                    onChange={(value) => onInputChange('prevExpDateExpulsion', value)}
                    disabled={disabled}
                    className="focus:ring-red-500 focus:border-red-500"
                />
            </FieldWrapper>
        </>
    );
};
