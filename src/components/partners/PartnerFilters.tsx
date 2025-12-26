/*
Copyright (C) 2025 AC
SocialConnect - Partner Filters Component
*/

import React from 'react';
import {
    MagnifyingGlassIcon,
    XCircleIcon,
    FunnelIcon,
    ChevronDownIcon
} from '@heroicons/react/24/outline';

interface PartnerGroup {
    thematique: string;
    partenaires: any[];
    count: number;
}

interface PartnerFiltersProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    selectedThematique: string | null;
    setSelectedThematique: (thematique: string | null) => void;
    isDropdownOpen: boolean;
    setIsDropdownOpen: (open: boolean) => void;
    groups: PartnerGroup[];
}

export const PartnerFilters: React.FC<PartnerFiltersProps> = ({
    searchQuery,
    setSearchQuery,
    selectedThematique,
    setSelectedThematique,
    isDropdownOpen,
    setIsDropdownOpen,
    groups
}) => {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 md:p-8">
                <div className="flex flex-col md:flex-row items-stretch gap-4">
                    {/* Search Input */}
                    <div className="relative group flex-1">
                        <MagnifyingGlassIcon className={`absolute left-6 top-1/2 -translate-y-1/2 w-7 h-7 transition-colors duration-300 ${searchQuery ? 'text-violet-600' : 'text-slate-400'}`} />
                        <input
                            type="text"
                            placeholder="Rechercher un partenaire, une adresse..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-16 pr-6 py-5 rounded-2xl border-2 border-slate-50 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-violet-100 focus:border-violet-500 transition-all text-xl text-slate-800 placeholder-slate-400 font-medium shadow-inner"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-6 top-1/2 -translate-y-1/2 p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                            >
                                <XCircleIcon className="w-6 h-6" />
                            </button>
                        )}
                    </div>

                    {/* Custom Dropdown */}
                    <div className="relative min-w-[320px]">
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className={`w-full flex items-center justify-between px-6 py-5 rounded-2xl border-2 transition-all duration-300 ${isDropdownOpen
                                ? 'bg-white border-violet-500 ring-4 ring-violet-50'
                                : 'bg-slate-50 border-slate-50 hover:bg-slate-100 hover:border-slate-200'
                                } shadow-inner group/select`}
                        >
                            <div className="flex items-center gap-3">
                                <FunnelIcon className={`w-5 h-5 transition-colors ${selectedThematique ? 'text-violet-600' : 'text-slate-400'}`} />
                                <span className={`text-lg font-bold tracking-tight ${selectedThematique ? 'text-slate-900' : 'text-slate-400'}`}>
                                    {selectedThematique || 'Filtrer par thématique'}
                                </span>
                            </div>
                            <ChevronDownIcon className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isDropdownOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                                <div className="absolute top-full left-0 right-0 mt-3 z-20 bg-white rounded-2xl shadow-2xl border border-slate-100 py-3 animate-fadeIn overflow-hidden max-h-[400px] overflow-y-auto custom-scrollbar">
                                    <button
                                        onClick={() => { setSelectedThematique(null); setIsDropdownOpen(false); }}
                                        className={`w-full text-left px-6 py-3 text-base font-bold transition-all hover:bg-violet-50 flex items-center justify-between ${!selectedThematique ? 'text-violet-700 bg-violet-50/50' : 'text-slate-600'}`}
                                    >
                                        Voir tout
                                        {!selectedThematique && <div className="w-1.5 h-1.5 bg-violet-600 rounded-full" />}
                                    </button>
                                    <div className="h-px bg-slate-100 my-2" />
                                    {groups.map((group) => {
                                        const isSelected = selectedThematique === group.thematique;
                                        return (
                                            <button
                                                key={group.thematique}
                                                onClick={() => { setSelectedThematique(group.thematique); setIsDropdownOpen(false); }}
                                                className={`w-full text-left px-6 py-3.5 transition-all hover:bg-violet-50 flex items-center justify-between group/item ${isSelected ? 'bg-violet-50/50' : ''}`}
                                            >
                                                <div className="flex flex-col">
                                                    <span className={`text-[15px] font-bold tracking-tight leading-tight ${isSelected ? 'text-violet-700' : 'text-slate-800'}`}>
                                                        {group.thematique}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                                                        {group.count} partenaire{group.count > 1 ? 's' : ''}
                                                    </span>
                                                </div>
                                                {isSelected && <div className="w-2 h-2 bg-violet-600 rounded-full" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
