/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { useState, useCallback } from 'react';

export interface DuplicateInfo {
    id: string;
    nom: string;
    prenom: string;
    antenne?: string;
    gestionnaire?: string;
}

interface UseDuplicateCheckProps {
    mode: 'create' | 'edit';
    nom?: string;
    prenom?: string;
}

export const useDuplicateCheck = ({ mode, nom, prenom }: UseDuplicateCheckProps) => {
    const [duplicates, setDuplicates] = useState<DuplicateInfo[]>([]);
    const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);

    const checkDuplicates = useCallback(async () => {
        // Only check in create mode
        if (mode !== 'create') return;

        const trimmedNom = nom?.trim();
        const trimmedPrenom = prenom?.trim();

        // Need both fields to check
        if (!trimmedNom || !trimmedPrenom || trimmedNom.length < 2 || trimmedPrenom.length < 2) {
            setDuplicates([]);
            return;
        }

        setIsCheckingDuplicates(true);
        try {
            const response = await fetch('/api/users/check-duplicate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nom: trimmedNom, prenom: trimmedPrenom }),
            });

            if (response.ok) {
                const data = await response.json();
                setDuplicates(data.duplicates || []);
            } else {
                setDuplicates([]);
            }
        } catch (error) {
            console.error('Error checking duplicates:', error);
            setDuplicates([]);
        } finally {
            setIsCheckingDuplicates(false);
        }
    }, [nom, prenom, mode]);

    const clearDuplicates = useCallback(() => {
        setDuplicates([]);
    }, []);

    return {
        duplicates,
        isCheckingDuplicates,
        checkDuplicates,
        clearDuplicates
    };
};
