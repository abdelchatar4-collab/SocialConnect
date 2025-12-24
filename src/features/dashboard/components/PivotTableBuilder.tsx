/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Modal pour créer des tableaux croisés dynamiques
*/

"use client";

import React, { useState, useMemo } from 'react';
import { X, Plus, Trash2, Percent, Grid3X3, Filter } from 'lucide-react';
import { PivotTableConfig, DynamicFilter, createEmptyPivotTable } from '../types/pivotTable';
import { FIELD_SECTIONS, FieldSection, getFieldsBySection, CustomWidgetFilters } from '../types/customWidget';
import { User } from '@/types';
import { calculateWidgetData } from './WidgetBuilder';
import { PivotTablePreview } from './PivotTablePreview';
import { calculatePivotData } from '../utils/pivotCalculations';

// ============ Field Select Component ============
interface FieldSelectProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    excludeField?: string;
}

const FieldSelect: React.FC<FieldSelectProps> = ({ label, value, onChange, excludeField }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white cursor-pointer"
        >
            {(Object.keys(FIELD_SECTIONS) as FieldSection[]).map(section => {
                const fields = getFieldsBySection(section).filter(f => f.id !== excludeField);
                if (fields.length === 0) return null;
                return (
                    <optgroup key={section} label={FIELD_SECTIONS[section]}>
                        {fields.map(field => (
                            <option key={field.id} value={field.id}>{field.label}</option>
                        ))}
                    </optgroup>
                );
            })}
        </select>
    </div>
);

// ============ Main Component ============
interface PivotTableBuilderProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (config: Omit<PivotTableConfig, 'id' | 'createdAt' | 'order'>) => void;
    users: User[];
    editingPivot?: PivotTableConfig;
}

export const PivotTableBuilder: React.FC<PivotTableBuilderProps> = ({
    isOpen, onClose, onSave, users, editingPivot,
}) => {
    const [config, setConfig] = useState(() =>
        editingPivot ? {
            name: editingPivot.name,
            rowField: editingPivot.rowField,
            columnField: editingPivot.columnField,
            filters: editingPivot.filters,
            dynamicFilters: editingPivot.dynamicFilters || [],
            showPercentages: editingPivot.showPercentages,
            showTotals: editingPivot.showTotals,
            showHeatmap: editingPivot.showHeatmap,
        } : createEmptyPivotTable()
    );

    React.useEffect(() => {
        if (isOpen) {
            setConfig(editingPivot ? {
                name: editingPivot.name,
                rowField: editingPivot.rowField,
                columnField: editingPivot.columnField,
                filters: editingPivot.filters,
                dynamicFilters: editingPivot.dynamicFilters || [],
                showPercentages: editingPivot.showPercentages,
                showTotals: editingPivot.showTotals,
                showHeatmap: editingPivot.showHeatmap,
            } : createEmptyPivotTable());
        }
    }, [isOpen, editingPivot]);

    const getFieldValues = (fieldId: string): string[] => {
        const data = calculateWidgetData(users, fieldId, {});
        return data.map(d => d.name).slice(0, 50);
    };

    const addDynamicFilter = () => {
        setConfig(prev => ({ ...prev, dynamicFilters: [...prev.dynamicFilters, { field: 'genre', value: '' }] }));
    };

    const removeDynamicFilter = (index: number) => {
        setConfig(prev => ({ ...prev, dynamicFilters: prev.dynamicFilters.filter((_, i) => i !== index) }));
    };

    const updateDynamicFilter = (index: number, update: Partial<DynamicFilter>) => {
        setConfig(prev => ({
            ...prev,
            dynamicFilters: prev.dynamicFilters.map((f, i) => i === index ? { ...f, ...update } : f)
        }));
    };

    const pivotData = useMemo(() =>
        calculatePivotData(users, config.rowField, config.columnField, config.filters, config.dynamicFilters),
        [users, config.rowField, config.columnField, config.filters, config.dynamicFilters]
    );

    const handleSave = () => {
        if (!config.name.trim()) { alert('Veuillez donner un nom au tableau'); return; }
        onSave(config);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-indigo-50 to-purple-50">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Grid3X3 className="w-5 h-5 text-indigo-600" />
                        {editingPivot ? 'Modifier le tableau croisé' : 'Créer un tableau croisé dynamique'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nom du tableau</label>
                        <input type="text" value={config.name} onChange={(e) => setConfig({ ...config, name: e.target.value })}
                            placeholder="Ex: Langues par antenne (PrevExp)" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                    </div>

                    {/* Row and Column Fields */}
                    <div className="grid grid-cols-2 gap-4">
                        <FieldSelect label="📊 Lignes (dimension 1)" value={config.rowField} onChange={(v) => setConfig(prev => ({ ...prev, rowField: v }))} excludeField={config.columnField} />
                        <FieldSelect label="📈 Colonnes (dimension 2)" value={config.columnField} onChange={(v) => setConfig(prev => ({ ...prev, columnField: v }))} excludeField={config.rowField} />
                    </div>

                    {/* Filters */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">🔍 Filtrer (optionnel)</label>
                        <div className="flex gap-6 bg-gray-50 p-4 rounded-lg">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={config.filters.hasPrevExp || false}
                                    onChange={(e) => setConfig({ ...config, filters: { ...config.filters, hasPrevExp: e.target.checked || undefined } })}
                                    className="w-4 h-4 text-indigo-600 rounded" />
                                <span className="text-sm">PrevExp uniquement</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={config.filters.isActive || false}
                                    onChange={(e) => setConfig({ ...config, filters: { ...config.filters, isActive: e.target.checked || undefined } })}
                                    className="w-4 h-4 text-indigo-600 rounded" />
                                <span className="text-sm">Dossiers actifs</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={config.filters.hasLitige || false}
                                    onChange={(e) => setConfig({ ...config, filters: { ...config.filters, hasLitige: e.target.checked || undefined } })}
                                    className="w-4 h-4 text-indigo-600 rounded" />
                                <span className="text-sm">Litige logement</span>
                            </label>
                        </div>
                    </div>

                    {/* Dynamic Filters */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <Filter className="w-4 h-4" /> Filtres avancés ({config.dynamicFilters.length})
                            </label>
                            <button type="button" onClick={addDynamicFilter} className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                                <Plus className="w-3 h-3" /> Ajouter un filtre
                            </button>
                        </div>
                        {config.dynamicFilters.length > 0 && (
                            <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                                {config.dynamicFilters.map((filter, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <select value={filter.field} onChange={(e) => updateDynamicFilter(idx, { field: e.target.value, value: '' })}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
                                            {(Object.keys(FIELD_SECTIONS) as FieldSection[]).map(section => {
                                                const fields = getFieldsBySection(section);
                                                if (fields.length === 0) return null;
                                                return (
                                                    <optgroup key={section} label={FIELD_SECTIONS[section]}>
                                                        {fields.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                                                    </optgroup>
                                                );
                                            })}
                                        </select>
                                        <span className="text-gray-400">=</span>
                                        <select value={filter.value} onChange={(e) => updateDynamicFilter(idx, { value: e.target.value })}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
                                            <option value="">-- Choisir --</option>
                                            {getFieldValues(filter.field).map(val => <option key={val} value={val}>{val}</option>)}
                                        </select>
                                        <button type="button" onClick={() => removeDynamicFilter(idx)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Options */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">⚙️ Options</label>
                        <div className="flex gap-6 bg-gray-50 p-4 rounded-lg">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={config.showTotals} onChange={(e) => setConfig({ ...config, showTotals: e.target.checked })} className="w-4 h-4 text-indigo-600 rounded" />
                                <span className="text-sm">Afficher les totaux</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={config.showPercentages} onChange={(e) => setConfig({ ...config, showPercentages: e.target.checked })} className="w-4 h-4 text-indigo-600 rounded" />
                                <span className="text-sm flex items-center gap-1"><Percent className="w-3 h-3" /> Pourcentages</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={config.showHeatmap} onChange={(e) => setConfig({ ...config, showHeatmap: e.target.checked })} className="w-4 h-4 text-indigo-600 rounded" />
                                <span className="text-sm">Coloration (heatmap)</span>
                            </label>
                        </div>
                    </div>

                    {/* Preview */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Aperçu ({pivotData.grandTotal} usagers)</label>
                        <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
                            <PivotTablePreview data={pivotData} showTotals={config.showTotals} showPercentages={config.showPercentages} showHeatmap={config.showHeatmap} />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 p-4 border-t bg-gray-50">
                    <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800">Annuler</button>
                    <button onClick={handleSave} disabled={!config.name.trim()} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        {editingPivot ? 'Enregistrer' : 'Créer le tableau'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PivotTableBuilder;
