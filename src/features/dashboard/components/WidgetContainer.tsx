/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

/**
 * WidgetContainer - Generic wrapper for dashboard widgets
 * Provides consistent styling, headers, and loading states
 */

"use client";

import React from 'react';
import { WidgetConfig } from '../types/modernDashboard';

interface WidgetContainerProps {
    config: WidgetConfig;
    children: React.ReactNode;
    isLoading?: boolean;
    actions?: React.ReactNode;
    noPadding?: boolean;
}

export const WidgetContainer: React.FC<WidgetContainerProps> = ({
    config,
    children,
    isLoading = false,
    actions,
    noPadding = false,
}) => {
    const sizeClass = {
        small: 'widget-card--small',
        medium: 'widget-card--medium',
        large: 'widget-card--large',
        full: 'widget-card--full',
    }[config.size];

    if (!config.visible) {
        return null;
    }

    return (
        <div className={`widget-card ${sizeClass} animate-fadeIn`}>
            <div className="widget-header">
                <h3 className="widget-title">{config.title}</h3>
                {actions && <div className="flex items-center gap-2">{actions}</div>}
            </div>
            <div className={noPadding ? '' : 'widget-content'}>
                {isLoading ? (
                    <div className="skeleton skeleton--chart" />
                ) : (
                    children
                )}
            </div>
        </div>
    );
};

export default WidgetContainer;
