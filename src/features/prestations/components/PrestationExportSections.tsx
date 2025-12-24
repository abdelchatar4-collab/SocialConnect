/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Sections d'export pour les prestations
*/

"use client";

import React from 'react';
import { Button } from '@/components/ui/Button';
import { ArrowDownTrayIcon, DocumentArrowDownIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

interface ExportMessage {
    type: 'success' | 'error';
    text: string;
}

interface PrestationExportSectionProps {
    startDate: string;
    endDate: string;
    onStartDateChange: (date: string) => void;
    onEndDateChange: (date: string) => void;
    onExport: () => void;
    isExporting: boolean;
    exportMessage: ExportMessage | null;
}

export const PrestationExportSection: React.FC<PrestationExportSectionProps> = ({
    startDate,
    endDate,
    onStartDateChange,
    onEndDateChange,
    onExport,
    isExporting,
    exportMessage
}) => {
    return (
        <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 rounded-xl">
                        <DocumentArrowDownIcon className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Export Excel</h3>
                        <p className="text-xs text-gray-500">Générer un fichier Excel structuré</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 flex-1">
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-medium text-gray-600">Du</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => onStartDateChange(e.target.value)}
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-medium text-gray-600">au</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => onEndDateChange(e.target.value)}
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                    </div>

                    <Button
                        onClick={onExport}
                        disabled={isExporting}
                        className="ml-auto flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                    >
                        {isExporting ? (
                            <>
                                <span className="animate-spin">⏳</span>
                                Génération...
                            </>
                        ) : (
                            <>
                                <ArrowDownTrayIcon className="w-5 h-5" />
                                Exporter Excel
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {exportMessage && (
                <div className={`mt-4 p-3 rounded-xl flex items-center gap-2 ${exportMessage.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                    {exportMessage.type === 'success'
                        ? <CheckCircleIcon className="w-5 h-5" />
                        : <ExclamationCircleIcon className="w-5 h-5" />
                    }
                    <span className="text-sm font-medium">{exportMessage.text}</span>
                </div>
            )}
        </div>
    );
};

interface OfficialExportSectionProps {
    exportYear: number;
    onYearChange: (year: number) => void;
    onExport: () => void;
    isExporting: boolean;
}

export const OfficialExportSection: React.FC<OfficialExportSectionProps> = ({
    exportYear,
    onYearChange,
    onExport,
    isExporting
}) => {
    return (
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-xl">
                        <DocumentArrowDownIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Export Format Officiel</h3>
                        <p className="text-xs text-gray-500">Modèle employeur (12 feuilles mensuelles, codes bilingues)</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 flex-1">
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-medium text-gray-600">Année</label>
                        <select
                            value={exportYear}
                            onChange={(e) => onYearChange(parseInt(e.target.value))}
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            {[2026, 2027, 2028].map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>

                    <Button
                        onClick={onExport}
                        disabled={isExporting}
                        className="ml-auto flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                    >
                        {isExporting ? (
                            <>
                                <span className="animate-spin">⏳</span>
                                Génération...
                            </>
                        ) : (
                            <>
                                <ArrowDownTrayIcon className="w-5 h-5" />
                                Format Officiel
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};
