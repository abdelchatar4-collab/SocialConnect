/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

/**
 * useUserList - Custom hook for fetching and managing users data
 */

import { useState, useEffect, useCallback } from 'react';
import { User, Gestionnaire } from '@/types';
import { useAdmin } from '@/contexts/AdminContext';

export const useUserList = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [gestionnaires, setGestionnaires] = useState<Gestionnaire[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const { selectedYear } = useAdmin();

    // Fetch users and gestionnaires
    useEffect(() => {
        setLoading(true);
        const yearParam = selectedYear ? `?annee=${selectedYear}` : '';

        Promise.all([
            fetch(`/api/users${yearParam}`)
                .then(res => {
                    if (!res.ok) {
                        throw new Error(`Erreur HTTP (users): ${res.status}`);
                    }
                    return res.json();
                })
                .then(data => (Array.isArray(data) ? data : data.users || [])),
            fetch('/api/gestionnaires')
                .then(res => {
                    if (!res.ok) {
                        throw new Error(`Erreur HTTP (gestionnaires): ${res.status}`);
                    }
                    return res.json();
                })
                .then(data => (Array.isArray(data) ? data : data.gestionnaires || []))
        ])
            .then(([usersData, gestionnairesData]) => {
                setUsers(usersData);
                setGestionnaires(gestionnairesData);
                setLoading(false);
            })
            .catch(error => {
                console.error("Erreur lors du fetch des données (users ou gestionnaires):", error);
                setLoading(false);
            });
    }, [refreshTrigger, selectedYear]);

    const refresh = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
    }, []);

    return {
        users,
        setUsers,
        gestionnaires,
        loading,
        refresh,
    };
};
