/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

/**
 * UserListHeader - Modern Header component with grouped actions menu
 */

import React, { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { Button } from '@/components/ui';
import {
    Upload,
    Download,
    Trash2,
    RefreshCw,
    Menu as MenuIcon,
    MoreVertical
} from 'lucide-react';

import { User } from '@/types';

interface UserListHeaderProps {
    users: User[];
    title: string;
    subtitle: string;
    isAdmin?: boolean;
    onRefresh: () => void;
    onImport?: () => void;
    onExport?: () => void;
    onBulkDelete?: () => void;
    selectedCount: number;
    loading?: boolean;
}

export const UserListHeader: React.FC<UserListHeaderProps> = ({
    users,
    title,
    subtitle,
    isAdmin,
    onRefresh,
    onImport,
    onExport,
    onBulkDelete,
    selectedCount,
    loading = false
}) => {
    return (
        <div className="border-b border-slate-200/60 bg-white/70 backdrop-blur-md px-4 py-5 sm:px-6 sticky top-0 z-30 shadow-sm first:rounded-t-xl">
            <div className="flex flex-wrap items-center justify-between sm:flex-nowrap">
                <div className="flex-1">
                    <h3 className="text-xl font-semibold leading-6 text-gray-900">
                        {title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                        {subtitle}
                        {selectedCount > 0 && (
                            <span className="ml-2 text-primary-600 font-medium animate-in fade-in">
                                • {selectedCount} sélectionné{selectedCount > 1 ? 's' : ''}
                            </span>
                        )}
                    </p>
                </div>

                <div className="ml-4 mt-4 flex flex-shrink-0 gap-2 sm:mt-0 items-center">

                    {/* ACTIONS MENU (The Burger) */}
                    <Menu as="div" className="relative inline-block text-left">
                        <div>
                            <Menu.Button className="flex items-center justify-center w-10 h-10 rounded-xl bg-white hover:bg-slate-50 transition-all duration-200 border border-slate-200 shadow-sm text-slate-600 hover:text-blue-600 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 group">
                                <span className="sr-only">Options</span>
                                <MenuIcon className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" strokeWidth={2} />
                            </Menu.Button>
                        </div>

                        <Transition
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                        >
                            <Menu.Items className="absolute right-0 mt-3 w-64 origin-top-right bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 focus:outline-none z-50 overflow-hidden">
                                <div className="p-2">
                                    <p className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Actions</p>

                                    {/* Rafraichir */}
                                    <Menu.Item>
                                        {({ active }) => (
                                            <button
                                                onClick={onRefresh}
                                                disabled={loading}
                                                className={`group flex items-center gap-3 w-full px-3 py-2 text-sm rounded-xl transition-all duration-150 font-medium
                                                    ${active ? 'bg-blue-50 text-blue-700 translate-x-1' : 'text-slate-700'}
                                                `}
                                            >
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                                                    ${active ? 'bg-blue-100' : 'bg-slate-100 group-hover:bg-blue-100'}`}>
                                                    <RefreshCw className={`w-4 h-4 ${active ? 'text-blue-600' : 'text-slate-500 group-hover:text-blue-600'} ${loading ? 'animate-spin' : ''}`} />
                                                </div>
                                                Actualiser
                                            </button>
                                        )}
                                    </Menu.Item>

                                    {/* Exporter */}
                                    {onExport && (
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button
                                                    onClick={onExport}
                                                    className={`group flex items-center gap-3 w-full px-3 py-2 text-sm rounded-xl transition-all duration-150 font-medium
                                                        ${active ? 'bg-blue-50 text-blue-700 translate-x-1' : 'text-slate-700'}
                                                    `}
                                                >
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                                                        ${active ? 'bg-blue-100' : 'bg-slate-100 group-hover:bg-blue-100'}`}>
                                                        <Download className={`w-4 h-4 ${active ? 'text-blue-600' : 'text-slate-500 group-hover:text-blue-600'}`} />
                                                    </div>
                                                    Exporter la liste
                                                </button>
                                            )}
                                        </Menu.Item>
                                    )}
                                </div>

                                {/* Admin Actions */}
                                {isAdmin && (
                                    <div className="p-2 border-t border-slate-100 bg-slate-50/50">
                                        <p className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Administration</p>

                                        {onImport && (
                                            <Menu.Item>
                                                {({ active }) => (
                                                    <button
                                                        onClick={onImport}
                                                        className={`group flex items-center gap-3 w-full px-3 py-2 text-sm rounded-xl transition-all duration-150 font-medium
                                                            ${active ? 'bg-indigo-50 text-indigo-700 translate-x-1' : 'text-slate-700'}
                                                        `}
                                                    >
                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                                                            ${active ? 'bg-indigo-100' : 'bg-white group-hover:bg-indigo-100'} border border-slate-100 shadow-sm`}>
                                                            <Upload className={`w-4 h-4 ${active ? 'text-indigo-600' : 'text-slate-500 group-hover:text-indigo-600'}`} />
                                                        </div>
                                                        Importer des usagers
                                                    </button>
                                                )}
                                            </Menu.Item>
                                        )}

                                        {/* Bouton "Tout supprimer" supprimé pour raisons de sécurité */}
                                    </div>
                                )}
                            </Menu.Items>
                        </Transition>
                    </Menu>
                </div>
            </div>
        </div>
    );
};
