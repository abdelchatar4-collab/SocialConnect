/*
Copyright (C) 2025 ABDEL KADER CHATAR
Licence GPLv3+
*/

import React, { useState, useEffect, useCallback } from 'react';
import { normalizeToISODate, formatToFrenchDate, isValidDate } from '@/utils/dateUtils';

interface DateInputProps {
    id: string;
    value: string | Date | null | undefined;
    onChange: (isoValue: string) => void;
    onBlur?: () => void;
    disabled?: boolean;
    placeholder?: string;
    error?: string;
    className?: string;
}

export const DateInput: React.FC<DateInputProps> = ({
    id,
    value,
    onChange,
    onBlur,
    disabled = false,
    placeholder = 'JJ/MM/AAAA',
    error,
    className = ''
}) => {
    // État interne pour gérer la saisie libre (incluant les slashs)
    const [inputValue, setInputValue] = useState('');

    // Synchronisation de l'état interne avec la prop value
    useEffect(() => {
        if (!value) {
            setInputValue('');
            return;
        }

        const isoValue = typeof value === 'string' ? value : value.toISOString().split('T')[0];
        const formatted = formatToFrenchDate(isoValue);

        // On ne met à jour l'input que si ce n'est pas déjà le même (pour éviter de casser le curseur pendant la frappe)
        if (normalizeToISODate(inputValue) !== isoValue) {
            setInputValue(formatted);
        }
    }, [value, inputValue]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let text = e.target.value;

        // Empêcher les caractères non numériques (sauf slash)
        text = text.replace(/[^0-9/]/g, '');

        // Auto-formatage (ajout de slashs)
        // Cas : l'utilisateur tape des chiffres à la suite
        if (text.length > inputValue.length) {
            if (text.length === 2 || text.length === 5) {
                text += '/';
            }
        }

        // Limiter à 10 caractères (DD/MM/YYYY)
        if (text.length <= 10) {
            setInputValue(text);
        }
    };

    const handleBlur = () => {
        if (!inputValue) {
            onChange('');
            if (onBlur) onBlur();
            return;
        }

        // Tenter de normaliser l'entrée (JJ/MM/AAAA ou JJMMAAAA)
        const isoValue = normalizeToISODate(inputValue);

        if (isValidDate(isoValue)) {
            onChange(isoValue);
            setInputValue(formatToFrenchDate(isoValue));
        } else {
            // Si invalide, on laisse l'input tel quel (pour que l'utilisateur voit son erreur)
            // Mais on peut notifier le parent d'une valeur vide ou invalide pour déclencher la validation
            onChange(isoValue); // On passe la valeur brute normalisée pour la validation
        }

        if (onBlur) onBlur();
    };

    return (
        <div className="relative">
            <input
                id={id}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onBlur={handleBlur}
                disabled={disabled}
                placeholder={placeholder}
                className={`
                    form-input block w-full rounded-md shadow-sm transition-all duration-150
                    ${error
                        ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500'
                        : 'border-slate-300 text-slate-900 focus:ring-purple-500 focus:border-purple-500'
                    }
                    ${disabled ? 'bg-slate-50 cursor-not-allowed text-slate-500' : 'bg-white'}
                    ${className}
                `}
                style={{
                    color: '#1e293b',
                    fontSize: '0.875rem',
                    padding: '0.625rem 0.75rem'
                }}
            />

            {/* Petit indicateur de format si vide */}
            {!inputValue && !disabled && (
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 pointer-events-none uppercase">
                    jj/mm/aaaa
                </span>
            )}
        </div>
    );
};
