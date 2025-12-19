/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import React from 'react';

export const SocialConnectLogo = ({ className }: { className?: string }) => (
    <svg
        viewBox="0 0 200 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-label="SocialConnect Logo"
    >
        {/* Logo SC Stylisé */}
        <g transform="translate(10, 10)">
            {/* S shape */}
            <path
                d="M25 10 C 15 10, 5 18, 5 28 C 5 38, 15 42, 20 44 C 25 46, 30 48, 30 52 C 30 56, 25 58, 20 58 C 12 58, 8 54, 6 52"
                stroke="#1e40af"
                strokeWidth="6"
                strokeLinecap="round"
                fill="none"
            />
            {/* C shape - Interlocking */}
            <path
                d="M55 18 C 52 14, 48 10, 40 10 C 28 10, 20 20, 20 35 C 20 50, 30 60, 42 60 C 50 60, 55 56, 58 52"
                stroke="#1e40af"
                strokeWidth="6"
                strokeLinecap="round"
                fill="none"
            />
            {/* Petit accent ou point de connexion si nécessaire */}
        </g>

        {/* Texte SocialConnect */}
        <text x="70" y="42" fontFamily="Arial, Helvetica, sans-serif" fontWeight="bold" fontSize="32" fill="#1e3a8a">
            SocialConnect
        </text>
    </svg>
);
