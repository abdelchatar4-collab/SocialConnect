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
    dateNaissance?: string | Date | null;
    antenne?: string;
    gestionnaire?: string;
}

interface UseDuplicateCheckProps {
    mode: 'create' | 'edit';
    nom?: string;
    prenom?: string;
    dateNaissance?: string | Date | null;
}

export const useDuplicateCheck = ({ mode, nom, prenom, dateNaissance }: UseDuplicateCheckProps) => {
    const [duplicates, setDuplicates] = useState<DuplicateInfo[]>([]);
    const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);
    const [includeDateOfBirth, setIncludeDateOfBirth] = useState(false);

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
            const payload: { nom: string; prenom: string; dateNaissance?: string | null; includeDateOfBirth?: boolean } = {
                nom: trimmedNom,
                prenom: trimmedPrenom,
                includeDateOfBirth
            };

            // Add date only if includeDateOfBirth is true and date is available
            if (includeDateOfBirth && dateNaissance) {
                try {
                    const d = new Date(dateNaissance);
                    if (!isNaN(d.getTime())) {
                        payload.dateNaissance = d.toISOString().split('T')[0];
                    }
                } catch (e) {
                    console.warn('Invalid date in duplicate check:', dateNaissance);
                }
            }

            const response = await fetch('/api/users/check-duplicate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
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
    }, [nom, prenom, dateNaissance, mode, includeDateOfBirth]);

    const clearDuplicates = useCallback(() => {
        setDuplicates([]);
    }, []);

    return {
        duplicates,
        isCheckingDuplicates,
        checkDuplicates,
        clearDuplicates,
        includeDateOfBirth,
        setIncludeDateOfBirth
    };
};
