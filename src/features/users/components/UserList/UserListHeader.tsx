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
    onDeleteAll?: () => Promise<void>;
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
    onDeleteAll,
    selectedCount,
    loading = false
}) => {
    return (
        <div className="border-b border-gray-200 bg-white px-4 py-5 sm:px-6">
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
                            <Menu.Button className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white border border-gray-300 shadow-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 hover:border-blue-300 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                <span className="sr-only">Options</span>
                                <MenuIcon className="h-5 w-5" strokeWidth={2.5} />
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
                            <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-20">
                                <div className="px-1 py-1">
                                    {/* Rafraichir */}
                                    <Menu.Item>
                                        {({ active }) => (
                                            <button
                                                onClick={onRefresh}
                                                disabled={loading}
                                                className={`${active ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                                                    } group flex w-full items-center rounded-lg px-2 py-2 text-sm transition-colors`}
                                            >
                                                <RefreshCw className={`mr-2 h-4 w-4 ${active ? 'text-blue-600' : 'text-gray-400'} ${loading ? 'animate-spin' : ''}`} />
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
                                                    className={`${active ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                                                        } group flex w-full items-center rounded-lg px-2 py-2 text-sm transition-colors`}
                                                >
                                                    <Download className={`mr-2 h-4 w-4 ${active ? 'text-blue-600' : 'text-gray-400'}`} />
                                                    Exporter la liste
                                                </button>
                                            )}
                                        </Menu.Item>
                                    )}
                                </div>

                                {/* Admin Actions */}
                                {isAdmin && (
                                    <div className="px-1 py-1">
                                        {onImport && (
                                            <Menu.Item>
                                                {({ active }) => (
                                                    <button
                                                        onClick={onImport}
                                                        className={`${active ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                                                            } group flex w-full items-center rounded-lg px-2 py-2 text-sm transition-colors`}
                                                    >
                                                        <Upload className={`mr-2 h-4 w-4 ${active ? 'text-blue-600' : 'text-gray-400'}`} />
                                                        Importer des usagers
                                                    </button>
                                                )}
                                            </Menu.Item>
                                        )}

                                        {onDeleteAll && users.length > 0 && (
                                            <Menu.Item>
                                                {({ active }) => (
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            if (window.confirm('Êtes-vous sûr de vouloir tout supprimer ? Cette action est irréversible.')) {
                                                                onDeleteAll();
                                                            }
                                                        }}
                                                        className={`${active ? 'bg-red-50 text-red-700' : 'text-red-600'
                                                            } group flex w-full items-center rounded-lg px-2 py-2 text-sm transition-colors`}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Tout supprimer
                                                    </button>
                                                )}
                                            </Menu.Item>
                                        )}
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
