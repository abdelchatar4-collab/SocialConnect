/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

/**
 * UserListTable - Main table component displaying user list
 */

import React from 'react';
import { User } from '@/types';
import {
    Table,
    TableHeader,
    TableBody,
    TableHead,
    TableRow,
} from '@/components/ui';
import { UserListRow } from './UserListRow';

interface UserListTableProps {
    users: User[];
    allUsersCount: number;
    selectedUsers: string[];
    showColumns: {
        showProblematiques: boolean;
        showActions: boolean;
        showDossier: boolean;
        showPhone: boolean;
        showAdresse: boolean;
        showAntenne: boolean;
        showDateNaissance: boolean;
    };
    sortField: string | null;
    sortDirection: 'asc' | 'desc';
    onSort: (field: string) => void;
    onSelectUser: (userId: string, checked: boolean) => void;
    onSelectAll: (checked: boolean) => void;
    onRowClick: (userId: string) => void;
    gestionnaireMap: Map<string, any>;
}

export const UserListTable: React.FC<UserListTableProps> = ({
    users,
    allUsersCount,
    selectedUsers,
    showColumns,
    sortField,
    sortDirection,
    onSort,
    onSelectUser,
    onSelectAll,
    onRowClick,
    gestionnaireMap,
}) => {
    const allSelected = allUsersCount > 0 && selectedUsers.length === Math.min(users.length, allUsersCount); // Logic simplified for pagination
    const someSelected = selectedUsers.length > 0 && !allSelected;

    const renderSortIcon = (field: string) => {
        if (sortField !== field) {
            return (
                <svg className="ml-1 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
            );
        }

        return sortDirection === 'asc' ? (
            <svg className="ml-1 h-4 w-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
        ) : (
            <svg className="ml-1 h-4 w-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
        );
    };

    const SortableHeader: React.FC<{ field: string; children: React.ReactNode }> = ({ field, children }) => (
        <TableHead
            className="cursor-pointer hover:bg-slate-200/50 transition-colors select-none py-4 text-xs font-bold tracking-wider text-slate-800 uppercase whitespace-nowrap"
            onClick={() => onSort(field)}
        >
            <div className="flex items-center gap-2">
                {children}
                {renderSortIcon(field)}
            </div>
        </TableHead>
    );

    const StandardTableHead: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
        <TableHead className={`py-4 text-xs font-bold tracking-wider text-slate-800 uppercase whitespace-nowrap ${className || ''}`}>
            {children}
        </TableHead>
    );

    return (
        <div className="relative w-full overflow-auto rounded-xl border border-slate-200/60 bg-white/40 backdrop-blur-sm shadow-xl ring-1 ring-slate-900/5 transition-all duration-300">
            <Table>
                <TableHeader className="bg-slate-50/80 border-b border-slate-200 sticky top-0 z-20 shadow-sm backdrop-blur-sm">
                    <TableRow className="hover:bg-transparent border-none">
                        <TableHead className="w-12 py-4 pl-4">
                            <input
                                type="checkbox"
                                checked={allSelected}
                                ref={(el) => {
                                    if (el) el.indeterminate = someSelected;
                                }}
                                onChange={(e) => onSelectAll(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600 cursor-pointer transition-all mix-blend-multiply"
                            />
                        </TableHead>
                        {showColumns.showDossier && <SortableHeader field="id">N° Dossier</SortableHeader>}
                        <SortableHeader field="nom">Nom</SortableHeader>
                        <SortableHeader field="prenom">Prénom</SortableHeader>
                        {showColumns.showDateNaissance && <SortableHeader field="dateNaissance">Date Naissance</SortableHeader>}
                        {showColumns.showPhone && <StandardTableHead>Téléphone</StandardTableHead>}
                        {showColumns.showAdresse && <StandardTableHead>Adresse</StandardTableHead>}
                        <SortableHeader field="gestionnaire">Gestionnaire</SortableHeader>
                        <SortableHeader field="secteur">Secteur</SortableHeader>
                        {showColumns.showAntenne && <SortableHeader field="antenne">Antenne</SortableHeader>}
                        <SortableHeader field="etat">État</SortableHeader>
                        <SortableHeader field="dateOuverture">Date Ouverture</SortableHeader>
                        {showColumns.showProblematiques && <StandardTableHead>Problématiques</StandardTableHead>}
                        {showColumns.showActions && <StandardTableHead>Actions</StandardTableHead>}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.length === 0 ? (
                        <TableRow>
                            <td colSpan={20} className="text-center py-8 text-gray-500">
                                Aucun usager trouvé
                            </td>
                        </TableRow>
                    ) : (
                        users.map((user) => (
                            <UserListRow
                                key={user.id}
                                user={user}
                                isSelected={selectedUsers.includes(user.id)}
                                showColumns={showColumns}
                                onSelect={onSelectUser}
                                onClick={onRowClick}
                                gestionnaireMap={gestionnaireMap}
                            />
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
};
