/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Problematique Filter Dropdown
Extracted from UserListFilters.tsx
*/

import React, { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { AlertCircle, ChevronDown, Check } from 'lucide-react';

interface ProblematiqueDropdownProps {
    problematiqueFilter: string;
    onProblematiqueFilterChange: (value: string) => void;
    problematiquesOptions: Array<{ value: string; label: string }>;
}

export const ProblematiqueDropdown: React.FC<ProblematiqueDropdownProps> = ({
    problematiqueFilter,
    onProblematiqueFilterChange,
    problematiquesOptions
}) => {
    return (
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
    );
};
