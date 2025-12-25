/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Dashboard Pivot Tables Section
Extracted from DashboardLayout.tsx
*/

import React from 'react';
import { Plus, Grid3X3 } from 'lucide-react';
import { PivotTableConfig } from '../../types/pivotTable';
import { PivotTableWidget } from '../PivotTableWidget';
import { User } from '@/types';

interface PivotTablesSectionProps {
    tables: PivotTableConfig[];
    users: User[];
    onAdd: () => void;
    onEdit: (table: PivotTableConfig) => void;
    onDelete: (id: string) => void;
}

export const PivotTablesSection: React.FC<PivotTablesSectionProps> = ({
    tables,
    users,
    onAdd,
    onEdit,
    onDelete
}) => {
    return (
        <div className="mt-8">
            <div className="flex items-center justify-between mb-4 px-1">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Grid3X3 className="w-5 h-5 text-indigo-600" />
                    Tableaux croisés dynamiques
                    {tables.length > 0 && (
                        <span className="text-sm font-normal text-gray-500">
                            ({tables.length})
                        </span>
                    )}
                </h2>
                <button
                    onClick={onAdd}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                >
                    <Plus className="w-4 h-4" />
                    Nouveau tableau
                </button>
            </div>

            {tables.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <p className="text-gray-500 mb-4">
                        Créez des tableaux croisés pour analyser vos données selon 2 dimensions (lignes × colonnes).
                    </p>
                    <button
                        onClick={onAdd}
                        className="text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                        + Créer mon premier tableau croisé
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {tables.map(pivot => (
                        <PivotTableWidget
                            key={pivot.id}
                            config={pivot}
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
