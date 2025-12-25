/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - useUserOperations Hook
Extracted from useUser.ts
*/

import { useCallback, Dispatch, SetStateAction } from 'react';
import { User } from '@/types';
import {
    UserOperationResult,
    ValidationResult
} from './useUser.types';
import {
    createNewUser,
    mergeUserData,
    validateUser
} from '../utils/userUtils';

interface UseUserOperationsProps {
    apiEndpoint: string;
    cacheKey: string;
    users: User[];
    setUsers: Dispatch<SetStateAction<User[]>>;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    setValidationErrors: (errors: Record<string, string>) => void;
}

export const useUserOperations = ({
    apiEndpoint,
    cacheKey,
    users,
    setUsers,
    setLoading,
    setError,
    setValidationErrors
}: UseUserOperationsProps) => {

    const generateUserId = useCallback(() => {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const counter = String(Math.floor(Math.random() * 9999)).padStart(4, '0');
        return `${year}${month}${day}-${counter}`;
    }, []);

    const normalizeMutuelle = useCallback((userData: Partial<User>) => {
        if (userData.mutuelle !== undefined) {
            if (typeof userData.mutuelle === 'string') {
                userData.mutuelle = {
                    id: null,
                    nom: userData.mutuelle,
                    numeroAdherent: "",
                    dateAdhesion: null,
                    options: []
                };
            } else if (typeof userData.mutuelle === 'object' && userData.mutuelle !== null) {
                if (!userData.mutuelle.id) {
                    userData.mutuelle.id = null;
                }
            }
        }
    }, []);

    const createUser = useCallback(async (userData: Partial<User> = {}): Promise<UserOperationResult> => {
        setLoading(true);
        setError(null);

        try {
            if (!userData.id && !('_id' in userData)) {
                userData.id = generateUserId();
            }

            normalizeMutuelle(userData);

            const newUser = createNewUser(userData);
            const { isValid, errors }: ValidationResult = validateUser(newUser);

            if (!isValid) {
                setValidationErrors(errors);
                setLoading(false);
                return { success: false, errors };
            }

            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser)
            });

            if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);

            const savedUser: User = await response.json();
            setUsers(prevUsers => [...prevUsers, savedUser]);

            if (cacheKey) localStorage.removeItem(cacheKey);

            setLoading(false);
            return { success: true, user: savedUser };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
            setError(`Erreur lors de la création de l'utilisateur: ${errorMessage}`);
            setLoading(false);
            return { success: false, error: errorMessage };
        }
    }, [apiEndpoint, cacheKey, generateUserId, normalizeMutuelle, setLoading, setError, setValidationErrors, setUsers]);

    const updateUser = useCallback(async (userId: string, userData: Partial<User>): Promise<UserOperationResult> => {
        setLoading(true);
        setError(null);

        try {
            const existingUser = users.find(user =>
                (user.id === userId) || ('_id' in user && (user as any)._id === userId)
            );

            if (!existingUser) throw new Error(`Utilisateur avec ID ${userId} non trouvé`);

            const updatedUser = mergeUserData(existingUser, userData);
            const { isValid, errors }: ValidationResult = validateUser(updatedUser);

            if (!isValid) {
                setValidationErrors(errors);
                setLoading(false);
                return { success: false, errors };
            }

            const response = await fetch(`${apiEndpoint}/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedUser)
            });

            if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);

            const savedUser: User = await response.json();
            setUsers(prevUsers =>
                prevUsers.map(user =>
                    (user.id === userId || ('_id' in user && (user as any)._id === userId)) ? savedUser : user
                )
            );

            if (cacheKey) localStorage.removeItem(cacheKey);

            setLoading(false);
            return { success: true, user: savedUser };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
            setError(`Erreur lors de la mise à jour de l'utilisateur: ${errorMessage}`);
            setLoading(false);
            return { success: false, error: errorMessage };
        }
    }, [apiEndpoint, cacheKey, users, setLoading, setError, setValidationErrors, setUsers]);

    const deleteUser = useCallback(async (userId: string): Promise<UserOperationResult> => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${apiEndpoint}/${userId}`, { method: 'DELETE' });
            if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);

            setUsers(prevUsers =>
                prevUsers.filter(user => user.id !== userId && !('_id' in user && (user as any)._id === userId))
            );

            if (cacheKey) localStorage.removeItem(cacheKey);

            setLoading(false);
            return { success: true };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
            setError(`Erreur lors de la suppression de l'utilisateur: ${errorMessage}`);
            setLoading(false);
            return { success: false, error: errorMessage };
        }
    }, [apiEndpoint, cacheKey, setLoading, setError, setUsers]);

    return { createUser, updateUser, deleteUser };
};
