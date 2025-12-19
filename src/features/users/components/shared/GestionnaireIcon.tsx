/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

/**
 * GestionnaireIcon Component - Reusable gestionnaire icon with gradient background
 */

import React, { memo } from 'react';
import { getGestionnaireColor } from '@/features/users/utils/userUtils';
import { type IconSize } from '@/config/constants';

interface GestionnaireIconProps {
    gestionnaire: any;
    size?: IconSize;
    showTooltip?: boolean;
}

const ICON_SIZE_CLASSES = {
    sm: { container: 'w-6 h-6', icon: 'w-3 h-3' },
    md: { container: 'w-8 h-8', icon: 'w-4 h-4' },
    lg: { container: 'w-10 h-10', icon: 'w-5 h-5' },
} as const;

export const GestionnaireIcon = memo<GestionnaireIconProps>(({
    gestionnaire,
    size = 'md',
    showTooltip = true
}) => {
    const { container, icon } = ICON_SIZE_CLASSES[size];
    const tooltipText = showTooltip
        ? `Gestionnaire: ${gestionnaire?.prenom || ''} ${gestionnaire?.nom || ''}`.trim()
        : undefined;

    return (
        <div
            className={`${container} rounded-full flex items-center justify-center shadow-lg border-2 border-white/30 backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:shadow-xl`}
            style={{ background: getGestionnaireColor(gestionnaire) }}
            title={tooltipText}
        >
            <svg
                className={`${icon} text-white drop-shadow-sm`}
                fill="currentColor"
                viewBox="0 0 24 24"
            >
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
        </div>
    );
});

GestionnaireIcon.displayName = 'GestionnaireIcon';
