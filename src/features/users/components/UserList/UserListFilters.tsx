/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

/**
 * UserListFilters - Advanced filtering and search component with Glassmorphism
 */

import React, { Fragment } from 'react';
import { Popover, Transition, Menu } from '@headlessui/react';
import { Button } from '@/components/ui';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { SlidersHorizontal, ChevronDown, Check, LayoutGrid, List, AlertCircle, Users, UserCheck, Copy } from 'lucide-react';
import { UserListFiltersProps, FilterType } from './UserListFilters.types';
import { CheckboxRow } from './CheckboxRow';

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
    includeDateInDuplicates,
    onIncludeDateInDuplicatesChange,
    importantInfoCount,
    duplicatesCount,
    totalUsersCount,
    myDossiersCount,
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
    showDateNaissance,
    onShowDateNaissanceChange,
    viewMode,
    onViewModeChange,
    onAddUser,
}) => {

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
        showAdresse,
        showDateNaissance
    ].filter(Boolean).length;

    return (
        <div className="relative z-10 p-6 bg-slate-50/40 backdrop-blur-md border-b border-slate-200/60 space-y-8">
            {/* SEARCH SECTION - Main Focus */}
            <div className="flex flex-col sm:flex-row gap-4">
                {/* Search Input Group */}
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

                {/* Add User Button */}
                {onAddUser && (
                    <div className="flex-shrink-0">
                        <Button
                            onClick={onAddUser}
                            className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl h-full px-6 shadow-md transition-all active:scale-95"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white/60 backdrop-blur-md p-5 rounded-2xl border border-white/40 shadow-sm flex items-center gap-4 transition-all hover:shadow-md hover:bg-white/80 group">
                    <div className="bg-blue-500/10 p-3 rounded-xl group-hover:scale-110 transition-transform">
                        <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Usagers</p>
                        <p className="text-2xl font-bold text-slate-900">{totalUsersCount}</p>
                    </div>
                </div>

                <div className="bg-white/60 backdrop-blur-md p-5 rounded-2xl border border-white/40 shadow-sm flex items-center gap-4 transition-all hover:shadow-md hover:bg-white/80 group">
                    <div className="bg-teal-500/10 p-3 rounded-xl group-hover:scale-110 transition-transform">
                        <UserCheck className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mes Dossiers</p>
                        <p className="text-2xl font-bold text-slate-900">{myDossiersCount}</p>
                    </div>
                </div>

                <div
                    className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-sm flex items-center gap-4 group ${showImportantInfoOnly
                        ? 'bg-amber-100/80 border-amber-300 shadow-amber-100'
                        : 'bg-white/60 backdrop-blur-md border-white/40 hover:bg-white/80'
                        }`}
                    onClick={() => onShowImportantInfoOnlyChange(!showImportantInfoOnly)}
                >
                    <div className={`p-3 rounded-xl group-hover:scale-110 transition-transform ${showImportantInfoOnly ? 'bg-amber-500/20' : 'bg-amber-500/10'}`}>
                        <AlertCircle className={`w-6 h-6 ${showImportantInfoOnly ? 'text-amber-700' : 'text-amber-600'}`} />
                    </div>
                    <div>
                        <p className={`text-xs font-semibold uppercase tracking-wider ${showImportantInfoOnly ? 'text-amber-700' : 'text-slate-500'}`}>Infos Importantes</p>
                        <p className={`text-2xl font-bold ${showImportantInfoOnly ? 'text-amber-700' : 'text-slate-900'}`}>{importantInfoCount}</p>
                    </div>
                </div>

                <div className="relative group">
                    <div
                        className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-sm flex items-center gap-4 ${showDuplicates
                            ? 'bg-rose-100/80 border-rose-300 shadow-rose-100'
                            : 'bg-white/60 backdrop-blur-md border-white/40 hover:bg-white/80'
                            }`}
                        onClick={() => onShowDuplicatesChange(!showDuplicates)}
                    >
                        <div className={`p-3 rounded-xl group-hover:scale-110 transition-transform ${showDuplicates ? 'bg-rose-500/20' : 'bg-rose-500/10'}`}>
                            <Copy className={`w-6 h-6 ${showDuplicates ? 'text-rose-700' : 'text-rose-600'}`} />
                        </div>
                        <div>
                            <p className={`text-xs font-semibold uppercase tracking-wider ${showDuplicates ? 'text-rose-700' : 'text-slate-500'}`}>Doublons</p>
                            <p className={`text-2xl font-bold ${showDuplicates ? 'text-rose-700' : 'text-slate-900'}`}>{duplicatesCount}</p>
                        </div>
                    </div>

                    {/* Checkbox "Sans date de naissance" en dessous */}
                    <div className="absolute -bottom-6 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <label className="flex items-center space-x-2 text-xs text-slate-500 cursor-pointer bg-white/80 px-2 py-1 rounded shadow-sm border border-slate-200">
                            <input
                                type="checkbox"
                                checked={!includeDateInDuplicates}
                                onChange={(e) => onIncludeDateInDuplicatesChange(!e.target.checked)}
                                className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 h-3 w-3"
                            />
                            <span>Ignorer date naiss.</span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Toolbar Row: Filters & View Options */}
            <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-t border-slate-200/60 mt-4">

                {/* Left: Filter Popover */}
                <Popover className="relative">
                    {({ open }) => (
                        <>
                            <Popover.Button className={`
                                inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all shadow-sm backdrop-blur-sm
                                ${open || activeFiltersCount > 0
                                    ? 'bg-blue-600 border-blue-600 text-white shadow-blue-200'
                                    : 'bg-white/60 border-slate-200 text-slate-700 hover:bg-white'}
                            `}>
                                <SlidersHorizontal className="w-4 h-4" />
                                <span>Options d'affichage</span>
                                {activeFiltersCount > 0 && (
                                    <span className="ml-1 inline-flex items-center justify-center bg-white/20 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
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
                                <Popover.Panel className="absolute z-40 left-0 mt-3 w-80 origin-top-left rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 focus:outline-none p-5">
                                    <div className="space-y-6">

                                        {/* Section: Affichage */}
                                        <div>
                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                                                Colonnes du tableau
                                            </h4>
                                            <div className="space-y-3">
                                                <CheckboxRow checked={showPhone} onChange={onShowPhoneChange} label="Téléphone" />
                                                <CheckboxRow checked={showDateNaissance} onChange={onShowDateNaissanceChange} label="Date de naissance" />
                                                <CheckboxRow checked={showAdresse} onChange={onShowAdresseChange} label="Adresse" />
                                                <CheckboxRow checked={showDossier} onChange={onShowDossierChange} label="Numéro de dossier" />
                                                <CheckboxRow checked={showProblematiques} onChange={onShowProblematiquesChange} label="Problématique principale" />
                                                <CheckboxRow checked={showActions} onChange={onShowActionsChange} label="Dernière action" />
                                            </div>
                                        </div>

                                        <div className="h-px bg-slate-100" />

                                        {/* Section: Autres Options */}
                                        <div>
                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                                                Autres filtres
                                            </h4>
                                            <div className="space-y-3">
                                                <CheckboxRow checked={showDonneesConfidentielles} onChange={onShowDonneesConfidentiellesChange} label="Données confidentielles" />
                                                <CheckboxRow checked={showMissingBirthDate} onChange={onShowMissingBirthDateChange} label="Date de naissance manquante" />
                                            </div>
                                        </div>

                                    </div>
                                </Popover.Panel>
                            </Transition>
                        </>
                    )}
                </Popover>

                {/* Right: View Toggles & Problematique */}
                <div className="flex items-center gap-4">

                    {/* Problematique Dropdown */}
                    <Menu as="div" className="relative inline-block text-left min-w-[240px]">
                        {({ open }) => (
                            <>
                                <Menu.Button className={`
                                    inline-flex w-full items-center justify-between gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all shadow-sm backdrop-blur-sm
                                    ${open || (problematiqueFilter && problematiqueFilter !== 'all')
                                        ? 'bg-blue-50 border-blue-200 text-blue-700 ring-1 ring-blue-200'
                                        : 'bg-white/60 border-slate-200 text-slate-700 hover:bg-white'}
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
                                    <Menu.Items className="absolute right-0 mt-3 w-full origin-top-right divide-y divide-slate-100 rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 focus:outline-none z-50 max-h-80 overflow-auto">
                                        <div className="p-1.5">
                                            {problematiquesOptions.map((opt) => (
                                                <Menu.Item key={opt.value}>
                                                    {({ active }) => (
                                                        <button
                                                            onClick={() => onProblematiqueFilterChange(opt.value)}
                                                            className={`
                                                                group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-left transition-colors
                                                                ${active ? 'bg-blue-50' : 'hover:bg-slate-50'}
                                                            `}
                                                        >
                                                            <div className={`
                                                                w-5 h-5 rounded-lg border flex items-center justify-center transition-colors flex-shrink-0
                                                                ${problematiqueFilter === opt.value ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300 group-hover:border-slate-400'}
                                                            `}>
                                                                {problematiqueFilter === opt.value && <Check className="w-3.5 h-3.5 text-white" />}
                                                            </div>
                                                            <span className={`truncate ${problematiqueFilter === opt.value ? 'text-blue-700 font-semibold' : 'text-slate-700'}`}>
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
