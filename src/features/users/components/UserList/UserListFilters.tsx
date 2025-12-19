/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

/**
 * UserListFilters - Advanced filtering and search component
 */

import React, { Fragment } from 'react';
import { Popover, Transition, Menu } from '@headlessui/react';
import { SearchInput, Button } from '@/components/ui';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { SlidersHorizontal, ChevronDown, Check, LayoutGrid, List, AlertCircle } from 'lucide-react';
import { User } from '@/types/user';

export type FilterType = 'all' | 'nom' | 'prenom' | 'email' | 'gestionnaire' | 'secteur' | 'antenne' | 'etat' | 'adresse';

interface UserListFiltersProps {
    searchTerm: string;
    searchField: FilterType;
    onSearchTermChange: (value: string) => void;
    onSearchFieldChange: (field: FilterType) => void;
    problematiqueFilter: string;
    onProblematiqueFilterChange: (filter: string) => void;
    problematiquesOptions: Array<{ value: string; label: string }>;
    showImportantInfoOnly: boolean;
    onShowImportantInfoOnlyChange: (value: boolean) => void;
    showDonneesConfidentielles: boolean;
    onShowDonneesConfidentiellesChange: (value: boolean) => void;
    showMissingBirthDate: boolean;
    onShowMissingBirthDateChange: (value: boolean) => void;
    showDuplicates: boolean;
    onShowDuplicatesChange: (value: boolean) => void;
    importantInfoCount: number;
    donneesConfidentiellesCount: number;
    missingBirthDateCount: number;
    duplicatesCount: number;

    // Dashboard Stats
    totalUsersCount: number;
    lastAddedUser: User | null;
    myDossiersCount: number;
    currentUserIdentifier?: string;

    // Additional toggles for specific columns
    showProblematiques: boolean;
    onShowProblematiquesChange: (value: boolean) => void;
    showActions: boolean;
    onShowActionsChange: (value: boolean) => void;
    showDossier: boolean;
    onShowDossierChange: (value: boolean) => void;
    showPhone: boolean;
    onShowPhoneChange: (value: boolean) => void;
    showAdresse: boolean;
    onShowAdresseChange: (value: boolean) => void;

    // View mode
    viewMode: 'table' | 'cards';
    onViewModeChange: (mode: 'table' | 'cards') => void;
    onAddUser?: () => void;
    onLastAddedClick?: (userId: string) => void;
}

export const UserListFilters: React.FC<UserListFiltersProps> = ({
    searchTerm,
    searchField,
    onSearchTermChange,
    onSearchFieldChange,
    problematiqueFilter,
    onProblematiqueFilterChange,
    problematiquesOptions,
    showImportantInfoOnly,
    onShowImportantInfoOnlyChange,
    showDonneesConfidentielles,
    onShowDonneesConfidentiellesChange,
    showMissingBirthDate,
    onShowMissingBirthDateChange,
    showDuplicates,
    onShowDuplicatesChange,
    importantInfoCount,
    donneesConfidentiellesCount,
    missingBirthDateCount,
    duplicatesCount,
    totalUsersCount,
    lastAddedUser,
    myDossiersCount,
    currentUserIdentifier,
    showProblematiques,
    onShowProblematiquesChange,
    showActions,
    onShowActionsChange,
    showDossier,
    onShowDossierChange,
    showPhone,
    onShowPhoneChange,
    showAdresse,
    onShowAdresseChange,
    viewMode,
    onViewModeChange,
    onAddUser,
    onLastAddedClick,
}) => {
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

    // Helper to format date
    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Aucun dossier récent';
        return new Date(dateString).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    // Calculate active filters count for badge
    const activeFiltersCount = [
        showImportantInfoOnly,
        showDonneesConfidentielles,
        showMissingBirthDate,
        showDuplicates,
        showProblematiques,
        showActions,
        showDossier,
        showPhone,
        showAdresse
    ].filter(Boolean).length;

    return (
        <div className="space-y-6">
            {/* Top Row: Search Bar and Add Button */}
            <div className="flex flex-col sm:flex-row gap-4">
                {/* Search Input Group */}
                <div className="relative flex flex-1 items-center rounded-md border border-gray-300 bg-white shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary-600 focus-within:border-primary-600">
                    <div className="relative">
                        <select
                            value={searchField}
                            onChange={(e) => onSearchFieldChange(e.target.value as FilterType)}
                            className="h-full rounded-l-md border-0 bg-transparent py-2.5 pl-3 pr-8 text-gray-500 text-sm focus:ring-0 cursor-pointer hover:bg-gray-50 border-r border-gray-200"
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
                        placeholder="Rechercher..."
                        className="block w-full border-0 bg-transparent py-2.5 pl-3 pr-10 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                </div>

                {/* Add User Button */}
                {onAddUser && (
                    <div className="flex-shrink-0">
                        <Button
                            onClick={onAddUser}
                            className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Ajouter un Usager
                        </Button>
                    </div>
                )}
            </div>

            {/* Stats Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Total Dossiers */}
                <div className="bg-purple-50 rounded-lg p-4 flex items-center gap-4">
                    <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-600">Total des dossiers</p>
                        <p className="text-2xl font-bold text-gray-900">{totalUsersCount}</p>
                    </div>
                </div>

                {/* Dernier ajout - CLICKABLE */}
                <div
                    onClick={() => lastAddedUser && onLastAddedClick && onLastAddedClick(lastAddedUser.id)}
                    className={`bg-blue-50 rounded-lg p-4 flex items-center gap-4 transition-all duration-200
                        ${lastAddedUser && onLastAddedClick ? 'cursor-pointer hover:bg-blue-100 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]' : ''}
                    `}
                    role={lastAddedUser && onLastAddedClick ? "button" : undefined}
                    tabIndex={lastAddedUser && onLastAddedClick ? 0 : undefined}
                >
                    <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-600">Dernier ajout de {
                            (lastAddedUser?.gestionnaire && typeof lastAddedUser.gestionnaire === 'object')
                                ? ('initiales' in lastAddedUser.gestionnaire ? (lastAddedUser.gestionnaire as any).initiales : (lastAddedUser.gestionnaire.prenom ? lastAddedUser.gestionnaire.prenom[0] : '') + (lastAddedUser.gestionnaire.nom ? lastAddedUser.gestionnaire.nom[0] : ''))
                                : 'System'
                        }</p>
                        <p className="text-lg font-bold text-gray-900 leading-tight">
                            {lastAddedUser ? `${lastAddedUser.prenom} ${lastAddedUser.nom}` : 'Aucun dossier récent'}
                        </p>
                        {lastAddedUser && <p className="text-xs text-gray-500">{formatDate(lastAddedUser.dateOuverture ? new Date(lastAddedUser.dateOuverture).toISOString() : undefined)}</p>}
                    </div>
                </div>

                {/* Mes dossiers gérés */}
                <div className="bg-green-50 rounded-lg p-4 flex items-center gap-4">
                    <div className="p-3 bg-green-100 rounded-lg text-green-600">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-600">Mes dossiers gérés</p>
                        <p className="text-2xl font-bold text-gray-900">{myDossiersCount}</p>
                        <p className="text-xs text-gray-500">Gestionnaire: {currentUserIdentifier || 'Moi'}</p>
                    </div>
                </div>
            </div>

            {/* Toolbar Row: Filters & View Options */}
            <div className="flex flex-wrap items-center justify-between gap-4 py-2 border-t border-gray-100 mt-4">

                {/* Left: Filter Popover */}
                <Popover className="relative">
                    {({ open }) => (
                        <>
                            <Popover.Button className={`
                                inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all shadow-sm
                                ${open || activeFiltersCount > 0
                                    ? 'bg-blue-50 border-blue-200 text-blue-700 ring-1 ring-blue-200'
                                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}
                            `}>
                                <SlidersHorizontal className="w-4 h-4" />
                                <span>Filtres</span>
                                {activeFiltersCount > 0 && (
                                    <span className="ml-1 inline-flex items-center justify-center bg-blue-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                                        {activeFiltersCount}
                                    </span>
                                )}
                                <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${open ? 'rotate-180' : ''}`} />
                            </Popover.Button>

                            <Transition
                                as={Fragment}
                                enter="transition ease-out duration-200"
                                enterFrom="opacity-0 translate-y-1"
                                enterTo="opacity-100 translate-y-0"
                                leave="transition ease-in duration-150"
                                leaveFrom="opacity-100 translate-y-0"
                                leaveTo="opacity-0 translate-y-1"
                            >
                                <Popover.Panel className="absolute z-10 left-0 mt-2 w-80 origin-top-left rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none p-4">
                                    <div className="space-y-6">

                                        {/* Section: Affichage */}
                                        <div>
                                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                                Colonnes affichées
                                            </h4>
                                            <div className="space-y-2">
                                                <CheckboxRow checked={showPhone} onChange={onShowPhoneChange} label="Téléphone" />
                                                <CheckboxRow checked={showAdresse} onChange={onShowAdresseChange} label="Adresse" />
                                                <CheckboxRow checked={showDossier} onChange={onShowDossierChange} label="Numéro de dossier" />
                                                <CheckboxRow checked={showProblematiques} onChange={onShowProblematiquesChange} label="Problématique principale" />
                                                <CheckboxRow checked={showActions} onChange={onShowActionsChange} label="Dernière action" />
                                            </div>
                                        </div>

                                        <div className="h-px bg-gray-100" />

                                        {/* Section: Filtres Spéciaux */}
                                        <div>
                                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                                Filtres avancés
                                            </h4>
                                            <div className="space-y-2">
                                                <CheckboxRow
                                                    checked={showImportantInfoOnly}
                                                    onChange={onShowImportantInfoOnlyChange}
                                                    label="Notes importantes"
                                                    badge={importantInfoCount}
                                                    badgeColor="bg-amber-100 text-amber-700"
                                                />
                                                <CheckboxRow
                                                    checked={showDonneesConfidentielles}
                                                    onChange={onShowDonneesConfidentiellesChange}
                                                    label="Données confidentielles"
                                                    badge={donneesConfidentiellesCount}
                                                    badgeColor="bg-purple-100 text-purple-700"
                                                />
                                                <CheckboxRow
                                                    checked={showMissingBirthDate}
                                                    onChange={onShowMissingBirthDateChange}
                                                    label="Date de naissance manquante"
                                                    badge={missingBirthDateCount}
                                                    badgeColor="bg-red-100 text-red-700"
                                                />
                                                <CheckboxRow
                                                    checked={showDuplicates}
                                                    onChange={onShowDuplicatesChange}
                                                    label="Doublons potentiels"
                                                    badge={duplicatesCount}
                                                    badgeColor="bg-orange-100 text-orange-700"
                                                />
                                            </div>
                                        </div>

                                    </div>
                                </Popover.Panel>
                            </Transition>
                        </>
                    )}
                </Popover>

                {/* Right: View Toggles & Problematique */}
                <div className="flex items-center gap-3">

                    {/* Problematique Dropdown - NOW MATCHING FILTERS BUTTON */}
                    <Menu as="div" className="relative inline-block text-left min-w-[240px]">
                        {({ open }) => (
                            <>
                                <Menu.Button className={`
                                    inline-flex w-full items-center justify-between gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all shadow-sm
                                    ${open || (problematiqueFilter && problematiqueFilter !== 'all')
                                        ? 'bg-blue-50 border-blue-200 text-blue-700 ring-1 ring-blue-200'
                                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}
                                `}>
                                    <div className="flex items-center gap-2 truncate">
                                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                        <span className="truncate">
                                            {problematiquesOptions.find(o => o.value === problematiqueFilter)?.label || 'Toutes problématiques'}
                                        </span>
                                    </div>
                                    <ChevronDown className={`w-4 h-4 ml-1 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
                                </Menu.Button>

                                <Transition
                                    as={Fragment}
                                    enter="transition ease-out duration-100"
                                    enterFrom="transform opacity-0 scale-95"
                                    enterTo="transform opacity-100 scale-100"
                                    leave="transition ease-in duration-75"
                                    leaveFrom="transform opacity-100 scale-100"
                                    leaveTo="transform opacity-0 scale-95"
                                >
                                    <Menu.Items className="absolute right-0 mt-2 w-full origin-top-right divide-y divide-gray-100 rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-20 max-h-80 overflow-auto">
                                        <div className="p-1">
                                            {/* Default Option */}
                                            <Menu.Item>
                                                {({ active }) => (
                                                    <button
                                                        onClick={() => onProblematiqueFilterChange('')}
                                                        className={`
                                                            group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-left transition-colors
                                                            ${active ? 'bg-blue-50' : 'hover:bg-gray-50'}
                                                        `}
                                                    >
                                                        <div className={`
                                                            w-5 h-5 rounded border flex items-center justify-center transition-colors flex-shrink-0
                                                            ${problematiqueFilter === '' ? 'bg-primary-600 border-primary-600' : 'bg-white border-gray-300 group-hover:border-gray-400'}
                                                        `}>
                                                            {problematiqueFilter === '' && <Check className="w-3.5 h-3.5 text-white" />}
                                                        </div>
                                                        <span className={`truncate ${problematiqueFilter === '' ? 'text-gray-900 font-medium' : 'text-gray-700'}`}>
                                                            Toutes problématiques
                                                        </span>
                                                    </button>
                                                )}
                                            </Menu.Item>

                                            {/* Other Options */}
                                            {problematiquesOptions.map((opt) => (
                                                <Menu.Item key={opt.value}>
                                                    {({ active }) => (
                                                        <button
                                                            onClick={() => onProblematiqueFilterChange(opt.value)}
                                                            className={`
                                                                group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-left transition-colors
                                                                ${active ? 'bg-blue-50' : 'hover:bg-gray-50'}
                                                            `}
                                                        >
                                                            <div className={`
                                                                w-5 h-5 rounded border flex items-center justify-center transition-colors flex-shrink-0
                                                                ${problematiqueFilter === opt.value ? 'bg-primary-600 border-primary-600' : 'bg-white border-gray-300 group-hover:border-gray-400'}
                                                            `}>
                                                                {problematiqueFilter === opt.value && <Check className="w-3.5 h-3.5 text-white" />}
                                                            </div>
                                                            <span className={`truncate ${problematiqueFilter === opt.value ? 'text-gray-900 font-medium' : 'text-gray-700'}`}>
                                                                {opt.label}
                                                            </span>
                                                        </button>
                                                    )}
                                                </Menu.Item>
                                            ))}
                                        </div>
                                    </Menu.Items>
                                </Transition>
                            </>
                        )}
                    </Menu>

                    {/* View Toggles */}
                    <div className="flex items-center bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => onViewModeChange('table')}
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'table' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            title="Vue Tableau"
                        >
                            <List className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => onViewModeChange('cards')}
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'cards' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            title="Vue Cartes"
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

// Helper for Popover Checkboxes
const CheckboxRow = ({
    checked,
    onChange,
    label,
    badge,
    badgeColor
}: {
    checked: boolean;
    onChange: (v: boolean) => void;
    label: string;
    badge?: number;
    badgeColor?: string;
}) => (
    <label className="flex items-center justify-between group cursor-pointer p-1 rounded hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-3">
            <div className={`
                w-5 h-5 rounded border flex items-center justify-center transition-colors
                ${checked ? 'bg-primary-600 border-primary-600' : 'bg-white border-gray-300 group-hover:border-gray-400'}
            `}>
                {checked && <Check className="w-3.5 h-3.5 text-white" />}
            </div>
            <span className={`text-sm ${checked ? 'text-gray-900 font-medium' : 'text-gray-700'}`}>
                {label}
            </span>
        </div>

        <input
            type="checkbox"
            className="hidden"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
        />

        {badge !== undefined && badge > 0 && (
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badgeColor || 'bg-gray-100 text-gray-600'}`}>
                {badge}
            </span>
        )}
    </label>
);


// Helper component for filter chips
const FilterChip = ({
    label,
    checked, // Keeping for back-compat or mapping
    active,  // New prop
    onChange, // Keeping for back-compat
    onClick, // New prop
    color,    // Keeping for back-compat
    activeColor, // Keeping for back-compat
    count,
    variant
}: {
    label: string;
    checked?: boolean;
    active?: boolean;
    onChange?: (checked: boolean) => void;
    onClick?: () => void;
    color?: string;
    activeColor?: string;
    count?: number;
    variant?: 'neutral' | 'warning' | 'danger' | 'success';
}) => {
    const isChecked = active !== undefined ? active : checked;
    const handleChange = onClick ? onClick : () => onChange?.(!isChecked);

    // Determine colors based on variant or custom colors
    let baseClass = "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100";
    let activeClass = "bg-primary-50 text-primary-700 border-primary-200 ring-1 ring-primary-200";

    if (variant === 'neutral') {
        baseClass = "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100";
        activeClass = "bg-gray-100 text-gray-900 border-gray-300 ring-1 ring-gray-300";
    } else if (color && activeColor) {
        baseClass = color.replace('text-', 'text-opacity-80 text-').replace('bg-', 'bg-opacity-50 bg-');
        activeClass = activeColor;
    }

    return (
        <button
            onClick={handleChange}
            className={`
                inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border transition-all
                ${isChecked ? activeClass : baseClass}
            `}
        >
            {label}
            {count !== undefined && count > 0 && (
                <span className={`
                    ml-1 inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-xs font-bold
                    ${isChecked ? 'bg-white bg-opacity-30' : 'bg-gray-200 text-gray-700'}
                `}>
                    {count}
                </span>
            )}
        </button>
    );
};
