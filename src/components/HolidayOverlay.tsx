/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

"use client";

import React from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { ChristmasTheme } from './Holiday/themes/ChristmasTheme';
import { NewYearTheme } from './Holiday/themes/NewYearTheme';
import { HalloweenTheme } from './Holiday/themes/HalloweenTheme';
import { RamadanTheme } from './Holiday/themes/RamadanTheme';

export const HolidayOverlay: React.FC = () => {
    const { activeHolidayTheme } = useAdmin();

    switch (activeHolidayTheme) {
        case 'CHRISTMAS':
            return <ChristmasTheme />;
        case 'NEW_YEAR':
            return <NewYearTheme />;
        case 'HALLOWEEN':
            return <HalloweenTheme />;
        case 'RAMADAN':
            return <RamadanTheme />;
        default:
            return null;
    }
};
