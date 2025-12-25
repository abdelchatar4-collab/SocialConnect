/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Custom Dashboard Widgets Section
Extracted from DashboardLayout.tsx
*/

import React from 'react';
import { Plus } from 'lucide-react';
import { CustomWidgetConfig } from '../../types/customWidget';
import { CustomWidget } from '../CustomWidget';
import { User } from '@/types';

interface CustomWidgetsSectionProps {
    widgets: CustomWidgetConfig[];
    users: User[];
    onAdd: () => void;
    onEdit: (widget: CustomWidgetConfig) => void;
    onDelete: (id: string) => void;
}

export const CustomWidgetsSection: React.FC<CustomWidgetsSectionProps> = ({
    widgets,
    users,
    onAdd,
    onEdit,
    onDelete
}) => {
    return (
        <div className="mt-8">
            <div className="flex items-center justify-between mb-4 px-1">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    📊 Widgets personnalisés
                    {widgets.length > 0 && (
                        <span className="text-sm font-normal text-gray-500">
                            ({widgets.length})
                        </span>
                    )}
                </h2>
                <button
                    onClick={onAdd}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
                >
                    <Plus className="w-4 h-4" />
                    Nouveau widget
                </button>
            </div>

            {widgets.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <p className="text-gray-500 mb-4">
                        Créez des widgets personnalisés pour analyser vos données avec des filtres spécifiques.
                    </p>
                    <button
                        onClick={onAdd}
                        className="text-teal-600 hover:text-teal-700 font-medium"
                    >
                        + Créer mon premier widget
                    </button>
                </div>
            ) : (
                <div className="dashboard-grid">
                    {widgets.map(widget => (
                        <CustomWidget
                            key={widget.id}
                            config={widget}
                            users={users}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
