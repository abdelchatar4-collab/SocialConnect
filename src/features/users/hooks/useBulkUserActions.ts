/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Bulk User Actions Hook
Extracted from useUserFormActions.ts for maintainability
*/

import { useState, useCallback } from 'react';
import { UserFormData } from '@/types/user';
import { userService } from '../services/userService';

/**
 * Hook for bulk operations on multiple users
 */
export const useBulkUserActions = () => {
    const [isLoading, setIsLoading] = useState(false);

    const bulkDelete = useCallback(async (userIds: string[]) => {
        setIsLoading(true);
        try {
            const promises = userIds.map(id => userService.deleteUser(id));
            await Promise.all(promises);
            console.log(`${userIds.length} utilisateurs supprimés avec succès`);
        } catch (error) {
            console.error('Erreur lors de la suppression en lot:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const bulkUpdate = useCallback(async (updates: Array<{ id: string; data: Partial<UserFormData> }>) => {
        setIsLoading(true);
        try {
            const promises = updates.map(({ id, data }) => userService.updateUser(id, data));
            await Promise.all(promises);
            console.log(`${updates.length} utilisateurs mis à jour avec succès`);
        } catch (error) {
            console.error('Erreur lors de la mise à jour en lot:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const bulkExport = useCallback(async (userIds: string[]) => {
        setIsLoading(true);
        try {
            const promises = userIds.map(id => userService.getUserById(id));
            const users = await Promise.all(promises);
            const csvData = users.map(user => ({
                nom: user?.nom || '',
                prenom: user?.prenom || '',
                email: user?.email || '',
                telephone: user?.telephone || '',
                gestionnaire: typeof user?.gestionnaire === 'object' ? user.gestionnaire?.nom : user?.gestionnaire
            }));
            console.log('Export en lot terminé:', csvData);
            return csvData;
        } catch (error) {
            console.error('Erreur lors de l\'export en lot:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { isLoading, bulkDelete, bulkUpdate, bulkExport };
};
