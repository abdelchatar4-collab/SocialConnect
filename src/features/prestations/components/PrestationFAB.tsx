/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.
*/

"use client";

import React, { useEffect } from 'react';
import { ClockIcon, PlusIcon } from '@heroicons/react/24/outline';
import { usePrestations } from '@/contexts/PrestationContext';
import { useSession } from 'next-auth/react';
import { useAdmin } from '@/contexts/AdminContext';

export const PrestationFAB: React.FC = () => {
    const { data: session } = useSession();
    const { setIsPrestationOpening } = usePrestations();
    const { primaryColor } = useAdmin();

    // Listen for custom event from reminder banner
    useEffect(() => {
        const handleOpenForm = () => setIsPrestationOpening(true);
        window.addEventListener('openPrestationForm', handleOpenForm);
        return () => window.removeEventListener('openPrestationForm', handleOpenForm);
    }, [setIsPrestationOpening]);

    if (!session) {
        return null;
    }

    // Attempt to get manager color if stored
    const managerColor = primaryColor; // Fallback to primary

    return (
        <button
            onClick={() => setIsPrestationOpening(true)}
            className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95 group"
            style={{ backgroundColor: managerColor }}
            aria-label="Mes Prestations"
            title="Mes Prestations"
        >
            <ClockIcon className="w-7 h-7 text-white group-hover:scale-110 transition-transform" />
            <div className="absolute -top-1 -right-1 bg-white rounded-full p-1 shadow-sm">
                <PlusIcon className="w-3 h-3" style={{ color: managerColor }} />
            </div>
        </button>
    );
};
