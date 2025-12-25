/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, XMarkIcon } from '@heroicons/react/20/solid';

interface MultiSelectInputProps {
    id: string;
    value: string[]; // Array of selected values
    onChange: (values: string[]) => void;
    options: Array<{ value: string; label: string }>;
    disabled?: boolean;
    placeholder?: string;
}

export const MultiSelectInput: React.FC<MultiSelectInputProps> = ({
    id,
    value = [],
    onChange,
    options,
    disabled = false,
    placeholder = 'Sélectionner...'
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleToggle = (optionValue: string) => {
        if (disabled) return;

        const newValue = value.includes(optionValue)
            ? value.filter(v => v !== optionValue)
            : [...value, optionValue];

        onChange(newValue);
    };

    const handleRemove = (optionValue: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (disabled) return;
        onChange(value.filter(v => v !== optionValue));
    };

    const getSelectedLabels = () => {
        return value
            .map(v => options.find(opt => opt.value === v)?.label)
            .filter(Boolean);
    };

    return (
        <div ref={dropdownRef} className="relative">
            <div
                id={id}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`
                    w-full min-h-[42px] px-3 py-2 border border-gray-300 rounded-md shadow-sm
                    bg-white cursor-pointer flex items-center justify-between gap-2
                    ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'hover:border-gray-400'}
                    ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''}
                `}
            >
                <div className="flex-1 flex flex-wrap gap-1">
                    {value.length === 0 ? (
                        <span className="text-gray-400 text-sm">{placeholder}</span>
                    ) : (
                        getSelectedLabels().map((label, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-800 text-sm rounded-md"
                            >
                                {label}
                                <button
                                    type="button"
                                    onClick={(e) => handleRemove(value[index], e)}
                                    className="hover:bg-blue-200 rounded-full p-0.5"
                                >
                                    <XMarkIcon className="h-3 w-3" />
                                </button>
                            </span>
                        ))
                    )}
                </div>
                <ChevronDownIcon
                    className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            </div>

            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {options.filter(opt => opt.value !== '').map((option) => (
                        <div
                            key={option.value}
                            onClick={() => handleToggle(option.value)}
                            className={`
                                px-3 py-2 cursor-pointer flex items-center gap-2
                                ${value.includes(option.value) ? 'bg-blue-50 text-blue-900' : 'hover:bg-gray-100'}
                            `}
                        >
                            <input
                                type="checkbox"
                                checked={value.includes(option.value)}
                                onChange={() => { }} // Handled by parent div onClick
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm">{option.label}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
