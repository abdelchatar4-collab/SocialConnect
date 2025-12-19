/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { HomeIcon } from '@heroicons/react/24/solid';

/**
 * FloatingHomeButton - A fixed floating button that navigates to the home/dashboard page
 * Appears on all pages in the bottom-left corner
 */
export function FloatingHomeButton() {
    const router = useRouter();

    const handleClick = () => {
        router.push('/users');
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            className="fixed bottom-6 left-6 z-50 flex items-center justify-center w-14 h-14
        bg-gradient-to-br from-teal-500 to-teal-600 text-white
        rounded-full shadow-lg shadow-teal-500/30
        hover:from-teal-400 hover:to-teal-500 hover:shadow-xl hover:shadow-teal-500/40
        active:scale-95
        transition-all duration-200 ease-out
        group"
            aria-label="Retour à l'accueil"
            title="Retour à l'accueil"
        >
            <HomeIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />

            {/* Tooltip on hover */}
            <span className="absolute left-full ml-3 px-3 py-1.5
        bg-gray-900 text-white text-sm font-medium rounded-lg
        opacity-0 group-hover:opacity-100 pointer-events-none
        whitespace-nowrap shadow-lg
        transition-opacity duration-200">
                Accueil
            </span>
        </button>
    );
}

export default FloatingHomeButton;
