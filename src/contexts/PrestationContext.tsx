/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.
*/

"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useSession } from 'next-auth/react';

interface HoraireHabituel {
    name: string;
    start: string;
    end: string;
    pause: number;
    standardDuration: number;
}

interface Prestation {
    id: string;
    date: string;
    heureDebut: string;
    heureFin: string;
    pause: number;
    dureeNet: number;
    isOvertime: boolean;
    bonis: number;
    motif: string;
    commentaire?: string;
    gestionnaireId: string;
}

interface PrestationContextType {
    prestations: Prestation[];
    isPrestationLoading: boolean;
    isPrestationOpening: boolean;
    setIsPrestationOpening: (open: boolean) => void;
    horaireHabituel: HoraireHabituel;
    updateHoraireHabituel: (horaire: HoraireHabituel) => Promise<boolean>;
    refreshPrestations: () => Promise<void>;
    addPrestation: (data: any) => Promise<boolean>;
    deletePrestation: (id: string) => Promise<boolean>;
}

const PrestationContext = createContext<PrestationContextType | undefined>(undefined);

const DEFAULT_HORAIRE: HoraireHabituel = {
    name: "Horaire flottant particulier",
    start: "09:00",
    end: "17:00",
    pause: 30,
    standardDuration: 450 // 7h30
};

export const PrestationProvider = ({ children }: { children: ReactNode }) => {
    const { data: session } = useSession();
    const [prestations, setPrestations] = useState<Prestation[]>([]);
    const [isPrestationLoading, setIsPrestationLoading] = useState(false);
    const [isPrestationOpening, setIsPrestationOpening] = useState(false);
    const [horaireHabituel, setHoraireHabituel] = useState<HoraireHabituel>(DEFAULT_HORAIRE);

    const fetchConfig = useCallback(async () => {
        if (!session) return;
        try {
            const response = await fetch('/api/prestations/config');
            if (response.ok) {
                const data = await response.json();
                if (data) {
                    // Force 30 min min even if DB has less
                    if (data.pause < 30) data.pause = 30;
                    setHoraireHabituel(data);
                }
            }
        } catch (error) {
            console.error('Error fetching prestation config:', error);
        }
    }, [session]);

    const refreshPrestations = useCallback(async () => {
        if (!session) return;
        setIsPrestationLoading(true);
        try {
            const response = await fetch('/api/prestations');
            if (response.ok) {
                const data = await response.json();
                setPrestations(data);
            }
        } catch (error) {
            console.error('Error refreshing prestations:', error);
        } finally {
            setIsPrestationLoading(false);
        }
    }, [session]);

    const updateHoraireHabituel = async (horaire: HoraireHabituel) => {
        console.log('[PrestationContext] updateHoraireHabituel called with:', horaire);
        try {
            const fixedHoraire = {
                ...horaire,
                pause: Math.max(30, horaire.pause)
            };
            console.log('[PrestationContext] Sending PATCH to /api/prestations/config with:', fixedHoraire);

            const response = await fetch('/api/prestations/config', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fixedHoraire)
            });

            console.log('[PrestationContext] Response status:', response.status, response.ok);

            if (response.ok) {
                const data = await response.json();
                console.log('[PrestationContext] Response data:', data);
                // Ensure the response also respects the 30 min minimum
                if (data && data.pause < 30) data.pause = 30;
                setHoraireHabituel(data);
                return true;
            } else {
                const errorData = await response.json().catch(() => ({}));
                console.error('[PrestationContext] API Error:', response.status, errorData);
                return false;
            }
        } catch (error) {
            console.error('[PrestationContext] Error updating config:', error);
            return false;
        }
    };


    useEffect(() => {
        if (session) {
            fetchConfig();
            refreshPrestations();
        }
    }, [session, refreshPrestations, fetchConfig]);

    const addPrestation = async (data: any) => {
        try {
            const response = await fetch('/api/prestations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (response.ok) {
                const newPrestation = await response.json();
                // Add directly to state to avoid refresh lag
                setPrestations(prev => [newPrestation, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error adding prestation:', error);
            return false;
        }
    };

    const deletePrestation = async (id: string) => {
        // Optimistic update
        const previousPrestations = [...prestations];
        setPrestations(prev => prev.filter(p => p.id !== id));

        try {
            const response = await fetch(`/api/prestations?id=${id}`, { method: 'DELETE' });
            if (response.ok) {
                // Background refresh to be safe
                refreshPrestations();
                return true;
            } else {
                // Revert
                setPrestations(previousPrestations);
                return false;
            }
        } catch (error) {
            console.error('Error deleting prestation:', error);
            setPrestations(previousPrestations);
            return false;
        }
    };

    return (
        <PrestationContext.Provider value={{
            prestations,
            isPrestationLoading,
            isPrestationOpening,
            setIsPrestationOpening,
            horaireHabituel,
            updateHoraireHabituel,
            refreshPrestations,
            addPrestation,
            deletePrestation
        }}>
            {children}
        </PrestationContext.Provider>
    );
};

export const usePrestations = () => {
    const context = useContext(PrestationContext);
    if (context === undefined) {
        throw new Error('usePrestations must be used within a PrestationProvider');
    }
    return context;
};
