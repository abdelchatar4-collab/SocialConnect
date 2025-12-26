/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

/**
 * useUserActions - Custom hook for user CRUD operations
 */

import { useState, useCallback } from 'react';
import { User } from '@/types';

interface UseUserActionsProps {
    users: User[];
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
    selectedUsers: string[];
    setSelectedUsers: React.Dispatch<React.SetStateAction<string[]>>;
    isAdmin: boolean;
    onRefresh: () => void;
}

export const useUserActions = ({
    users,
    setUsers,
    selectedUsers,
    setSelectedUsers,
    isAdmin,
    onRefresh,
}: UseUserActionsProps) => {

    /**
     * Delete a single user
     */
    const handleDelete = useCallback(async (id: string) => {
        console.log('handleDelete appelé avec userId:', id);

        try {
            const response = await fetch(`/api/users/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-auth': 'true',
                },
            });

            console.log('Réponse DELETE:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Erreur lors de la suppression: ${response.status} ${response.statusText} - ${errorText}`);
            }

            // Mise à jour de l'état local
            setUsers(users.filter(user => user.id !== id));
            alert('Utilisateur supprimé avec succès.');
            onRefresh();

        } catch (error) {
            console.error('Erreur DELETE:', error);
            alert(`Erreur: ${error instanceof Error ? error.message : String(error)}`);
        }
    }, [users, setUsers, onRefresh]);

    /**
     * Bulk delete selected users
     */
    const handleBulkDelete = useCallback(async () => {
        if (selectedUsers.length === 0) return;

        if (!confirm(`Êtes-vous sûr de vouloir supprimer ${selectedUsers.length} utilisateur(s) ?`)) {
            return;
        }

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (isAdmin) {
            headers['x-admin-auth'] = 'true';
        }

        try {
            const response = await fetch('/api/users/bulk-delete', {
                method: 'DELETE',
                headers: headers,
                body: JSON.stringify({ ids: selectedUsers }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Erreur lors de la suppression en bloc: ${response.status} ${response.statusText} - ${errorText}`);
            }

            setUsers(users.filter(user => !selectedUsers.includes(user.id)));
            setSelectedUsers([]);
            alert('Utilisateurs supprimés avec succès.');
            onRefresh();

        } catch (error) {
            console.error('Message d\'erreur:', error);
            alert(`Erreur: ${error instanceof Error ? error.message : String(error)}`);
        }
    }, [selectedUsers, isAdmin, users, setUsers, setSelectedUsers, onRefresh]);

    // handleDeleteAll a été supprimé pour des raisons de sécurité
    // Utilisez handleBulkDelete pour supprimer plusieurs utilisateurs

    return {
        handleDelete,
        handleBulkDelete,
    };
};
