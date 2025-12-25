/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

/**
 * WidgetBuilder - Modal component for creating custom dashboard widgets
 */

"use client";

import React, { useState, useMemo } from 'react';
import { X, Plus, BarChart3, PieChart, Table2 } from 'lucide-react';
import {
    CustomWidgetConfig,
    ChartType,
    FIELD_SECTIONS,
    FieldSection,
    getFieldsBySection,
    createEmptyWidget
} from '../types/customWidget';
import { User } from '@/types';
import { calculateWidgetData } from '../utils/widgetCalculations';
import { WidgetPreview } from './Dashboard/WidgetPreview';

interface WidgetBuilderProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (widget: Omit<CustomWidgetConfig, 'id' | 'createdAt' | 'order'>) => void;
    users: User[];
    editingWidget?: CustomWidgetConfig;
}

export const WidgetBuilder: React.FC<WidgetBuilderProps> = ({
    isOpen,
    onClose,
    onSave,
    users,
    editingWidget,
}) => {
    const [widget, setWidget] = useState(() =>
        editingWidget ? {
            name: editingWidget.name,
            analyzeField: editingWidget.analyzeField,
            chartType: editingWidget.chartType,
            filters: editingWidget.filters,
        } : createEmptyWidget()
    );

    // Reset when modal opens with different widget
    React.useEffect(() => {
        if (isOpen) {
            setWidget(editingWidget ? {
                name: editingWidget.name,
                analyzeField: editingWidget.analyzeField,
                chartType: editingWidget.chartType,
                filters: editingWidget.filters,
            } : createEmptyWidget());
        }
    }, [isOpen, editingWidget]);

    // Get preview data
    const previewData = useMemo(() => {
        return calculateWidgetData(users, widget.analyzeField, widget.filters);
    }, [users, widget.analyzeField, widget.filters]);

    const handleSave = () => {
        if (!widget.name.trim()) {
            alert('Veuillez donner un nom au widget');
            return;
        }
        onSave(widget);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-teal-50 to-cyan-50">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Plus className="w-5 h-5 text-teal-600" />
                        {editingWidget ? 'Modifier le widget' : 'Créer un widget personnalisé'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nom du widget
                        </label>
                        <input
                            type="text"
                            value={widget.name}
                            onChange={(e) => setWidget({ ...widget, name: e.target.value })}
                            placeholder="Ex: Statut pro des usagers en PrevExp"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                        />
                    </div>

                    {/* Analyze by */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            📊 Analyser par
                        </label>
                        <select
                            value={widget.analyzeField}
                            onChange={(e) => setWidget({ ...widget, analyzeField: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white transition-all"
                        >
                            {(Object.keys(FIELD_SECTIONS) as FieldSection[]).map(section => {
                                const fields = getFieldsBySection(section);
                                if (fields.length === 0) return null;
                                return (
                                    <optgroup key={section} label={FIELD_SECTIONS[section]}>
                                        {fields.map(field => (
                                            <option key={field.id} value={field.id}>
                                                {field.label}
                                            </option>
                                        ))}
                                    </optgroup>
                                );
                            })}
                        </select>
                    </div>

                    {/* Filters */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            🔍 Filtrer (optionnel)
                        </label>
                        <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={widget.filters.hasPrevExp || false}
                                    onChange={(e) => setWidget({
                                        ...widget,
                                        filters: { ...widget.filters, hasPrevExp: e.target.checked || undefined }
                                    })}
                                    className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                                />
                                <span className="text-sm text-gray-700">Prévention Expulsion uniquement</span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={widget.filters.isActive || false}
                                    onChange={(e) => setWidget({
                                        ...widget,
                                        filters: { ...widget.filters, isActive: e.target.checked || undefined }
                                    })}
                                    className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                                />
                                <span className="text-sm text-gray-700">Dossiers actifs uniquement</span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={widget.filters.hasLitige || false}
                                    onChange={(e) => setWidget({
                                        ...widget,
                                        filters: { ...widget.filters, hasLitige: e.target.checked || undefined }
                                    })}
                                    className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                                />
                                <span className="text-sm text-gray-700">Litige logement</span>
                            </label>
                        </div>
                    </div>

                    {/* Chart Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            📈 Type de graphique
                        </label>
                        <div className="flex gap-3">
                            {[
                                { type: 'pie', icon: PieChart, label: 'Camembert' },
                                { type: 'bar', icon: BarChart3, label: 'Barres' },
                                { type: 'table', icon: Table2, label: 'Tableau' },
                            ].map(({ type, icon: Icon, label }) => (
                                <button
                                    key={type}
                                    onClick={() => setWidget({ ...widget, chartType: type as ChartType })}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-all ${widget.chartType === type
                                        ? 'border-teal-500 bg-teal-50 text-teal-700'
                                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="text-sm font-medium">{label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Preview */}
                    <WidgetPreview previewData={previewData} chartType={widget.chartType} />
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 p-4 border-t bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!widget.name.trim()}
                        className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        {editingWidget ? 'Enregistrer' : 'Créer le widget'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WidgetBuilder;
