/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Display Options Dropdown for User List
Extracted from UserListFilters.tsx
*/

import React, { Fragment } from 'react';
import { Popover, Transition } from '@headlessui/react';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';
import { CheckboxRow } from './CheckboxRow';

interface DisplayOptionsDropdownProps {
    showPhone: boolean;
    onShowPhoneChange: (show: boolean) => void;
    showDateNaissance: boolean;
    onShowDateNaissanceChange: (show: boolean) => void;
    showAdresse: boolean;
    onShowAdresseChange: (show: boolean) => void;
    showDossier: boolean;
    onShowDossierChange: (show: boolean) => void;
    showProblematiques: boolean;
    onShowProblematiquesChange: (show: boolean) => void;
    showActions: boolean;
    onShowActionsChange: (show: boolean) => void;
    showDonneesConfidentielles: boolean;
    onShowDonneesConfidentiellesChange: (show: boolean) => void;
    showMissingBirthDate: boolean;
    onShowMissingBirthDateChange: (show: boolean) => void;
    activeFiltersCount: number;
}

export const DisplayOptionsDropdown: React.FC<DisplayOptionsDropdownProps> = ({
    showPhone,
    onShowPhoneChange,
    showDateNaissance,
    onShowDateNaissanceChange,
    showAdresse,
    onShowAdresseChange,
    showDossier,
    onShowDossierChange,
    showProblematiques,
    onShowProblematiquesChange,
    showActions,
    onShowActionsChange,
    showDonneesConfidentielles,
    onShowDonneesConfidentiellesChange,
    showMissingBirthDate,
    onShowMissingBirthDateChange,
    activeFiltersCount
}) => {
    return (
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
    );
};
