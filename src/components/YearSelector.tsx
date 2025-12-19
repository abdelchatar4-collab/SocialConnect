/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

"use client";

import React from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { cn } from '@/lib/utils';

interface YearSelectorProps {
    variant?: 'default' | 'minimal';
    className?: string;
}

export const YearSelector = ({ variant = 'default', className }: YearSelectorProps) => {
    const { selectedYear, setSelectedYear, availableYears } = useAdmin();

    if (variant === 'minimal') {
        return (
            <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                className={cn(
                    "appearance-none bg-transparent text-slate-700 font-bold text-sm focus:outline-none cursor-pointer hover:text-blue-700 transition-colors",
                    className
                )}
                style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
            >
                {availableYears.map((year) => (
                    <option key={year} value={year} className="text-slate-900 bg-white">
                        {year}
                    </option>
                ))}
            </select>
        );
    }

    return (
        <div className={cn("flex items-center gap-2 px-3 py-2 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all duration-200", className)}>
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs text-blue-700 font-semibold uppercase tracking-wide">Exercice</span>
            <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                className="appearance-none bg-transparent text-blue-900 font-bold text-base focus:outline-none cursor-pointer pr-1"
                style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
            >
                {availableYears.map((year) => (
                    <option key={year} value={year} className="text-slate-900 bg-white">
                        {year}
                    </option>
                ))}
            </select>
        </div>
    );
};
