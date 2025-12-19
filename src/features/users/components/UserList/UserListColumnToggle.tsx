/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

/**
 * UserListColumnToggle - Menu for toggling column visibility
 */

import React, { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

interface UserListColumnToggleProps {
    columns: {
        showProblematiques: boolean;
        showActions: boolean;
        showDossier: boolean;
        showPhone: boolean;
        showAdresse: boolean;
    };
    onToggle: (columnName: keyof UserListColumnToggleProps['columns']) => void;
}

export const UserListColumnToggle: React.FC<UserListColumnToggleProps> = ({
    columns,
    onToggle,
}) => {
    const columnOptions = [
        { key: 'showProblematiques' as const, label: 'Problématiques' },
        { key: 'showActions' as const, label: 'Actions/Suivi' },
        { key: 'showDossier' as const, label: 'N° Dossier' },
        { key: 'showPhone' as const, label: 'Téléphone' },
        { key: 'showAdresse' as const, label: 'Adresse' },
    ];

    return (
        <Menu as="div" className="relative inline-block text-left">
            <div>
                <Menu.Button className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                    Colonnes
                    <ChevronDownIcon className="-mr-1 h-5 w-5 text-gray-400" aria-hidden="true" />
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
                <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                        {columnOptions.map((option) => (
                            <Menu.Item key={option.key}>
                                {({ active }) => (
                                    <button
                                        onClick={() => onToggle(option.key)}
                                        className={`
                      ${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}
                      group flex w-full items-center px-4 py-2 text-sm
                    `}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={columns[option.key]}
                                            onChange={() => { }} // Handled by parent button click
                                            className="mr-3 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600 pointer-events-none"
                                        />
                                        {option.label}
                                    </button>
                                )}
                            </Menu.Item>
                        ))}
                    </div>
                </Menu.Items>
            </Transition>
        </Menu>
    );
};
