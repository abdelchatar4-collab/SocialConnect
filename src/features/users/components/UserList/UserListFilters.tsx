/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

/**
 * UserListFilters - Advanced filtering and search component with Glassmorphism
 */

import React from 'react';
import { Button } from '@/components/ui';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { LayoutGrid, List } from 'lucide-react';
import { UserListFiltersProps, FilterType } from './UserListFilters.types';

// Sub-components
import { StatsCardsSection } from './StatsCardsSection';
import { DisplayOptionsDropdown } from './DisplayOptionsDropdown';
import { ProblematiqueDropdown } from './ProblematiqueDropdown';

const searchFields: Array<{ value: FilterType; label: string }> = [
    { value: 'all', label: 'Tous les champs' },
    { value: 'nom', label: 'Nom' },
    { value: 'prenom', label: 'Prénom' },
    { value: 'email', label: 'Email' },
    { value: 'gestionnaire', label: 'Gestionnaire' },
    { value: 'secteur', label: 'Secteur' },
    { value: 'antenne', label: 'Antenne' },
    { value: 'etat', label: 'État' },
    { value: 'adresse', label: 'Adresse' },
];

export const UserListFilters: React.FC<UserListFiltersProps> = (props) => {
    const {
        searchTerm,
        searchField,
        onSearchTermChange,
        onSearchFieldChange,
        viewMode,
        onViewModeChange,
        onAddUser,
    } = props;

    // Calculate active filters count for badge
    const activeFiltersCount = [
        props.showImportantInfoOnly,
        props.showDonneesConfidentielles,
        props.showMissingBirthDate,
        props.showDuplicates,
        props.showProblematiques,
        props.showActions,
        props.showDossier,
        props.showPhone,
        props.showAdresse,
        props.showDateNaissance
    ].filter(Boolean).length;

    return (
        <div className="relative z-10 p-6 bg-slate-50/40 backdrop-blur-md border-b border-slate-200/60 space-y-8">
            {/* SEARCH SECTION - Main Focus */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex flex-1 items-center rounded-xl border border-white/40 bg-white/60 shadow-sm backdrop-blur-md transition-all focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500/50">
                    <div className="relative">
                        <select
                            value={searchField}
                            onChange={(e) => onSearchFieldChange(e.target.value as FilterType)}
                            className="h-full rounded-l-xl border-0 bg-transparent py-2.5 pl-3 pr-8 text-slate-600 text-sm focus:ring-0 cursor-pointer hover:bg-white/40 border-r border-slate-200/60"
                        >
                            {searchFields.map((field) => (
                                <option key={field.value} value={field.value}>{field.label}</option>
                            ))}
                        </select>
                    </div>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => onSearchTermChange(e.target.value)}
                        placeholder="Rechercher par nom, prénom, email..."
                        className="block w-full border-0 bg-transparent py-2.5 pl-3 pr-10 text-slate-900 placeholder:text-slate-400 focus:ring-0 sm:text-sm"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" aria-hidden="true" />
                    </div>
                </div>

                {onAddUser && (
                    <div className="flex-shrink-0">
                        <Button
                            onClick={onAddUser}
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-xl h-full px-6 shadow-md shadow-indigo-200/50 transition-all active:scale-95"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Ajouter un Usager
                        </Button>
                    </div>
                )}
            </div>

            {/* STATS CARDS SECTION */}
            <StatsCardsSection {...props} />

            {/* Toolbar Row: Filters & View Options */}
            <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-t border-slate-200/60 mt-4">

                {/* Left: Filter Popover */}
                <DisplayOptionsDropdown {...props} activeFiltersCount={activeFiltersCount} />

                {/* Right: View Toggles & Problematique */}
                <div className="flex items-center gap-4">
                    <ProblematiqueDropdown {...props} />

                    {/* View Toggles */}
                    <div className="flex items-center bg-slate-200/50 backdrop-blur-sm rounded-xl p-1 shadow-inner border border-white/40">
                        <button
                            onClick={() => onViewModeChange('table')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${viewMode === 'table' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                            <List className="w-4 h-4" />
                            <span className="hidden sm:inline">Tableau</span>
                        </button>
                        <button
                            onClick={() => onViewModeChange('cards')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${viewMode === 'cards' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                            <LayoutGrid className="w-4 h-4" />
                            <span className="hidden sm:inline">Cartes</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
