/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

/**
 * DashboardLayout - Main layout component for the modern dashboard
 * Orchestrates all widgets in a responsive grid
 */

"use client";

import React, { useState } from 'react';
import { User } from '@/types';

// Context
import { DashboardProvider, useDashboard } from './DashboardProvider';

// Components
import { DashboardHeader } from './DashboardHeader';
import { SettingsPanel } from './SettingsPanel';
import { WidgetBuilder } from './WidgetBuilder';
import { PivotTableBuilder } from './PivotTableBuilder';

// Sections
import { StandardWidgetsGrid } from './Dashboard/StandardWidgetsGrid';
import { CustomWidgetsSection } from './Dashboard/CustomWidgetsSection';
import { PivotTablesSection } from './Dashboard/PivotTablesSection';
import { DashboardSkeleton } from './Dashboard/DashboardSkeleton';

// Styles
import '../styles/dashboard-modern.css';

// Types
import { CustomWidgetConfig } from '../types/customWidget';
import { PivotTableConfig } from '../types/pivotTable';

interface DashboardLayoutProps {
    users: User[];
}

const DashboardContent: React.FC = () => {
    const {
        state, stats, users,
        addCustomWidget, updateCustomWidget, removeCustomWidget,
        addPivotTable, updatePivotTable, removePivotTable
    } = useDashboard();

    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isWidgetBuilderOpen, setIsWidgetBuilderOpen] = useState(false);
    const [editingWidget, setEditingWidget] = useState<CustomWidgetConfig | undefined>(undefined);
    const [isPivotBuilderOpen, setIsPivotBuilderOpen] = useState(false);
    const [editingPivot, setEditingPivot] = useState<PivotTableConfig | undefined>(undefined);

    if (state.isLoading && !stats) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="dashboard-container">
            <DashboardHeader
                onOpenSettings={() => setIsSettingsOpen(true)}
                onCreateWidget={() => {
                    setEditingWidget(undefined);
                    setIsWidgetBuilderOpen(true);
                }}
                onCreatePivot={() => {
                    setEditingPivot(undefined);
                    setIsPivotBuilderOpen(true);
                }}
            />

            <StandardWidgetsGrid widgets={state.widgets} stats={stats} />

            <CustomWidgetsSection
                widgets={state.customWidgets}
                users={users}
                onAdd={() => {
                    setEditingWidget(undefined);
                    setIsWidgetBuilderOpen(true);
                }}
                onEdit={(w) => {
                    setEditingWidget(w);
                    setIsWidgetBuilderOpen(true);
                }}
                onDelete={removeCustomWidget}
            />

            <PivotTablesSection
                tables={state.pivotTables}
                users={users}
                onAdd={() => {
                    setEditingPivot(undefined);
                    setIsPivotBuilderOpen(true);
                }}
                onEdit={(p) => {
                    setEditingPivot(p);
                    setIsPivotBuilderOpen(true);
                }}
                onDelete={removePivotTable}
            />

            {/* Modals & Panels */}
            <SettingsPanel
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
            />

            <WidgetBuilder
                isOpen={isWidgetBuilderOpen}
                onClose={() => {
                    setIsWidgetBuilderOpen(false);
                    setEditingWidget(undefined);
                }}
                onSave={(widget) => {
                    if (editingWidget) {
                        updateCustomWidget({ ...editingWidget, ...widget });
                    } else {
                        addCustomWidget(widget);
                    }
                }}
                users={users}
                editingWidget={editingWidget}
            />

            <PivotTableBuilder
                isOpen={isPivotBuilderOpen}
                onClose={() => {
                    setIsPivotBuilderOpen(false);
                    setEditingPivot(undefined);
                }}
                onSave={(config) => {
                    if (editingPivot) {
                        updatePivotTable({ ...editingPivot, ...config });
                    } else {
                        addPivotTable(config);
                    }
                }}
                users={users}
                editingPivot={editingPivot}
            />
        </div>
    );
};

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ users }) => {
    return (
        <DashboardProvider users={users}>
            <DashboardContent />
        </DashboardProvider>
    );
};

export default DashboardLayout;
