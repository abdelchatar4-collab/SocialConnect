/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

/**
 * Settings Types and Configuration
 */

import { ComponentType } from 'react';

// Section configuration
export interface SettingsSection {
    id: string;
    label: string;
    icon: string;
    description: string;
    component: ComponentType;
    keywords: string[]; // For search
}

// Common section props
export interface SettingsSectionProps {
    onSave?: () => void;
    onSaveSuccess?: (message: string) => void;
    onSaveError?: (message: string) => void;
}

// Toast notification
export interface ToastState {
    show: boolean;
    type: 'success' | 'error';
    message: string;
}
