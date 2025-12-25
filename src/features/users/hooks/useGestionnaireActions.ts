/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Gestionnaire Actions Hook
Extracted from useUserFormActions.ts for maintainability
*/

import { useState, useCallback } from 'react';
import { userService } from '../services/userService';

/**
 * Hook for gestionnaire-specific operations
 */
export const useGestionnaireActions = () => {
    const [isLoading, setIsLoading] = useState(false);

    const assignGestionnaire = useCallback(async (userIds: string[], gestionnaireId: string) => {
        setIsLoading(true);
        try {
            const promises = userIds.map(id =>
                userService.updateUser(id, { gestionnaire: gestionnaireId })
            );
            await Promise.all(promises);
            console.log(`Gestionnaire assigné à ${userIds.length} utilisateurs`);
        } catch (error) {
            console.error('Erreur lors de l\'assignation du gestionnaire:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const getUsersByGestionnaire = useCallback(async (gestionnaireId: string) => {
        setIsLoading(true);
        try {
            const users = await userService.getAllUsers();
            return users.filter(user =>
                typeof user.gestionnaire === 'string' ?
                    user.gestionnaire === gestionnaireId :
                    user.gestionnaire?.id === gestionnaireId
            );
        } catch (error) {
            console.error('Erreur lors de la récupération des utilisateurs par gestionnaire:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const transferUsers = useCallback(async (userIds: string[], fromGestionnaireId: string, toGestionnaireId: string) => {
        setIsLoading(true);
        try {
            const promises = userIds.map(id =>
                userService.updateUser(id, { gestionnaire: toGestionnaireId })
            );
            await Promise.all(promises);
            console.log(`${userIds.length} utilisateurs transférés de ${fromGestionnaireId} vers ${toGestionnaireId}`);
        } catch (error) {
            console.error('Erreur lors du transfert des utilisateurs:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { isLoading, assignGestionnaire, getUsersByGestionnaire, transferUsers };
};
