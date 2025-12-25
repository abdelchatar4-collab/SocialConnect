/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Widget Preview Component
Extracted from WidgetBuilder.tsx
*/

import React from 'react';
import { Eye } from 'lucide-react';
import { PieChartWidget, BarChartWidget } from '../../widgets';
import { ChartType } from '../../types/customWidget';

interface WidgetPreviewProps {
    previewData: { name: string; value: number }[];
    chartType: ChartType;
}

export const WidgetPreview: React.FC<WidgetPreviewProps> = ({
    previewData,
    chartType,
}) => {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Aperçu ({previewData.length} valeurs, {previewData.reduce((acc, d) => acc + d.value, 0)} usagers)
            </label>
            <div className="bg-gray-50 rounded-lg p-4 min-h-[200px]">
                {previewData.length === 0 ? (
                    <div className="flex items-center justify-center h-48 text-gray-400">
                        Aucune donnée pour les filtres sélectionnés
                    </div>
                ) : chartType === 'table' ? (
                    <div className="overflow-auto max-h-48">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-2 text-gray-600">Valeur</th>
                                    <th className="text-right py-2 text-gray-600">Nombre</th>
                                </tr>
                            </thead>
                            <tbody>
                                {previewData.slice(0, 10).map((row, i) => (
                                    <tr key={i} className="border-b border-gray-100">
                                        <td className="py-2">{row.name}</td>
                                        <td className="text-right py-2 font-medium">{row.value}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : chartType === 'pie' ? (
                    <PieChartWidget data={previewData.slice(0, 8)} height={200} />
                ) : (
                    <BarChartWidget data={previewData.slice(0, 8)} height={200} />
                )}
            </div>
        </div>
    );
};
