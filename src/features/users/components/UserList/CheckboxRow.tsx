/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - CheckboxRow Component
Extracted from UserListFilters.tsx
*/

import React from 'react';
import { Check } from 'lucide-react';

interface CheckboxRowProps {
    checked: boolean;
    onChange: (v: boolean) => void;
    label: string;
}

export const CheckboxRow: React.FC<CheckboxRowProps> = ({
    checked,
    onChange,
    label,
}) => (
    <label className="flex items-center gap-3 group cursor-pointer p-2 rounded-xl hover:bg-slate-50 transition-colors">
        <div className={`
            w-5 h-5 rounded-lg border flex items-center justify-center transition-colors
            ${checked ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300 group-hover:border-slate-400'}
        `}>
            {checked && <Check className="w-3.5 h-3.5 text-white" />}
        </div>
        <span className={`text-sm ${checked ? 'text-slate-900 font-semibold' : 'text-slate-600'}`}>
            {label}
        </span>
        <input
            type="checkbox"
            className="hidden"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
        />
    </label>
);
