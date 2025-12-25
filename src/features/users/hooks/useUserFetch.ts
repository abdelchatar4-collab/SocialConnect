/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - useUserFetch Hook
Extracted from useUser.ts
*/

import { useCallback, Dispatch, SetStateAction } from 'react';
import { User } from '@/types';
import { CachedData } from './useUser.types';

interface UseUserFetchProps {
    apiEndpoint: string;
    cacheKey: string;
    setUsers: Dispatch<SetStateAction<User[]>>;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}

export const useUserFetch = ({
    apiEndpoint,
    cacheKey,
    setUsers,
    setLoading,
    setError
}: UseUserFetchProps) => {

    const fetchUsers = useCallback(async (forceRefresh = false): Promise<User[]> => {
        setLoading(true);
        setError(null);

        try {
            if (!forceRefresh && cacheKey) {
                const cachedData = localStorage.getItem(cacheKey);
                if (cachedData) {
                    const { timestamp, data }: CachedData = JSON.parse(cachedData);
                    if (Date.now() - timestamp < 5 * 60 * 1000) {
                        setUsers(data);
                        setLoading(false);
                        return data;
                    }
                }
            }

            const response = await fetch(apiEndpoint);
            if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);

            const data: User[] = await response.json();

            if (cacheKey) {
                localStorage.setItem(cacheKey, JSON.stringify({
                    timestamp: Date.now(),
                    data
                }));
            }

            setUsers(data);
            setLoading(false);
            return data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
            setError(`Erreur lors de la récupération des utilisateurs: ${errorMessage}`);
            setLoading(false);
            return [];
        }
    }, [apiEndpoint, cacheKey, setLoading, setError, setUsers]);

    return { fetchUsers };
};
