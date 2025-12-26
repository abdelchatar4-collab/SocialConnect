/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Import Mapping Step Component
Permet l'utilisateur de lier les colonnes Excel aux champs du système.
*/

"use client";
import React, { useState, useEffect } from 'react';
import { IMPORT_CATEGORIES } from './MappingConfig';
import { COMMON_FIELDS_MAP } from '@/utils/import/importConstants';
import { useSession } from 'next-auth/react';
import { AlertCircle, ArrowRight, Check } from 'lucide-react';

interface ImportMappingStepProps {
    headers: string[];
    sampleData: Record<string, any>;
    onConfirm: (mapping: Record<string, string>) => void;
    onCancel: () => void;
}

export const ImportMappingStep: React.FC<ImportMappingStepProps> = ({ headers, sampleData, onConfirm, onCancel }) => {
    const { data: session } = useSession();
    const [mapping, setMapping] = useState<Record<string, string>>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [showAllCategories, setShowAllCategories] = useState(false);

    const categories = IMPORT_CATEGORIES;
    const allFields = categories.flatMap(c => c.fields);

    // Initialisation intelligente
    useEffect(() => {
        const serviceId = (session?.user as any)?.serviceId || 'default';
        const savedMapping = localStorage.getItem(`last_import_mapping-${serviceId}`);
        const initialMapping: Record<string, string> = savedMapping ? JSON.parse(savedMapping) : {};

        allFields.forEach(field => {
            const possibleKeys = (COMMON_FIELDS_MAP[field.key as keyof typeof COMMON_FIELDS_MAP] || [field.key])
                .map(k => k.toLowerCase().trim());

            let foundHeader = headers.find(h => possibleKeys.includes(h.toLowerCase().trim()));

            if (!foundHeader) {
                foundHeader = headers.find(h => {
                    const hClean = h.toLowerCase().replace(/[^a-z0-9]/g, '');
                    return possibleKeys.some(k => {
                        const kClean = k.toLowerCase().replace(/[^a-z0-9]/g, '');
                        return hClean === kClean || (hClean.length > 3 && kClean.includes(hClean));
                    });
                });
            }

            if (foundHeader) {
                initialMapping[field.key] = foundHeader;
            } else if (!initialMapping[field.key] || !headers.includes(initialMapping[field.key])) {
                delete initialMapping[field.key];
            }
        });

        setMapping(initialMapping);
    }, [headers]);

    const handleSelectChange = (fieldKey: string, header: string) => {
        const newMapping = { ...mapping, [fieldKey]: header };
        setMapping(newMapping);
        const serviceId = (session?.user as any)?.serviceId || 'default';
        localStorage.setItem(`last_import_mapping-${serviceId}`, JSON.stringify(newMapping));
    };

    const isReady = allFields.filter(f => f.required).every(f => mapping[f.key]);
    const mappedCount = Object.keys(mapping).filter(k => mapping[k]).length;

    const filteredCategories = categories.map(cat => {
        const fields = cat.fields.filter(f =>
            f.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
            f.key.toLowerCase().includes(searchTerm.toLowerCase())
        );
        const hasMappedFields = fields.some(f => mapping[f.key]);
        return { ...cat, fields, hasMappedFields };
    }).filter(cat => cat.fields.length > 0);

    const activeCategories = filteredCategories.filter(cat =>
        showAllCategories || cat.isCore || cat.hasMappedFields || searchTerm.length > 0
    );

    return (
        <div className="bg-white shadow-2xl rounded-2xl p-6 border border-gray-100 animate-in fade-in slide-in-from-bottom-4 flex flex-col max-h-[90vh] w-full border-t-4 border-t-blue-600">
            <div className="flex items-center justify-between mb-6 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-gray-800 tracking-tight">Vérification Automatique</h3>
                        <p className="text-sm text-gray-500 font-medium">
                            {mappedCount === 0 ? (
                                <span className="text-red-500 font-bold">Aucune colonne reconnue automatiquement !</span>
                            ) : (
                                <span>L&apos;outil a détecté <span className="text-blue-600 font-bold">{mappedCount} colonnes</span> correspondantes.</span>
                            )}
                        </p>
                    </div>
                </div>

                {isReady && mappedCount > 0 && (
                    <button
                        onClick={() => onConfirm(mapping)}
                        className="group relative flex items-center gap-3 px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-black rounded-2xl shadow-xl shadow-green-200 transition-all hover:scale-105 active:scale-95"
                    >
                        <Check className="w-6 h-6" />
                        <span>TOUT EST PRÊT : IMPORTER</span>
                        <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full animate-ping"></div>
                    </button>
                )}
            </div>

            {mappedCount < 5 && (
                <div className="mb-6 p-4 bg-orange-50 rounded-2xl border-2 border-orange-100 animate-in fade-in">
                    <p className="text-xs text-orange-700 font-bold mb-2 uppercase tracking-wider text-center">Diagnostic : En-têtes détectés sur la ligne choisie</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                        {headers.map((h, i) => (
                            <span key={i} className="px-2 py-1 bg-white border border-orange-200 rounded text-[10px] font-mono text-orange-400">{h}</span>
                        ))}
                    </div>
                </div>
            )}

            <div className="mb-6 flex gap-3 shrink-0">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Rechercher un champ spécifique..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-12 pr-4 py-3 border-2 border-gray-100 rounded-2xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-base transition-all font-medium"
                    />
                </div>
                <button
                    onClick={() => setShowAllCategories(!showAllCategories)}
                    className={`px-6 py-2 rounded-2xl text-sm font-bold transition-all border-2 ${showAllCategories ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white border-gray-100 text-gray-500 hover:border-blue-200 hover:text-blue-600'}`}
                >
                    {showAllCategories ? 'Masquer les options avancées' : 'Afficher toutes les options'}
                </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-3 custom-scrollbar space-y-10 py-2">
                {activeCategories.map((category) => (
                    <div key={category.name} className="animate-in fade-in duration-500">
                        <div className="flex items-center gap-4 mb-4">
                            <h4 className="text-xs font-black text-blue-400 uppercase tracking-[0.2em] whitespace-nowrap">{category.name}</h4>
                            <div className="h-px w-full bg-gradient-to-r from-blue-50 to-transparent"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {category.fields.map((field) => (
                                <div key={field.key} className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${mapping[field.key] ? 'border-green-100 bg-green-50/30' : 'border-gray-50 bg-white hover:border-blue-100 hover:shadow-sm'}`}>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-sm font-bold truncate ${mapping[field.key] ? 'text-green-800' : 'text-gray-700'}`}>
                                                {field.label}
                                            </span>
                                            {field.required && <span className="w-1.5 h-1.5 rounded-full bg-red-500" title="Obligatoire"></span>}
                                        </div>
                                        <div className="text-[10px] font-mono text-gray-400 mt-0.5 truncate italic">
                                            {mapping[field.key] ? `Lien: ${mapping[field.key]}` : 'Ignoré'}
                                        </div>
                                    </div>

                                    <div className="relative w-1/2">
                                        <select
                                            value={mapping[field.key] || ''}
                                            onChange={(e) => handleSelectChange(field.key, e.target.value)}
                                            className={`w-full text-xs font-bold rounded-xl border-2 p-2 outline-none appearance-none transition-all pr-8 ${mapping[field.key] ? 'border-green-500 bg-white text-green-700' : 'border-gray-100 bg-gray-50/50 text-gray-400 hover:border-blue-200'}`}
                                        >
                                            <option value="">-- Non lié --</option>
                                            {headers.map(h => (
                                                <option key={h} value={h}>{h}</option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                                            {mapping[field.key] ? <Check className="w-4 h-4 text-green-500" /> : <ArrowRight className="w-3 h-3 text-gray-300" />}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-between items-center mt-8 pt-8 border-t border-gray-100 shrink-0">
                <div className="flex items-center gap-4 text-gray-400 text-xs font-medium">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div> Obligatoires (Nom, Prénom)
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div> Liés automatiquement
                    </div>
                </div>
                <div className="flex gap-4">
                    <button onClick={onCancel} className="px-8 py-3 text-sm font-bold text-gray-400 hover:text-gray-800 rounded-2xl transition-all">Tout annuler</button>
                    <button
                        disabled={!isReady}
                        onClick={() => onConfirm(mapping)}
                        className={`px-10 py-3 rounded-2xl text-sm font-black transition-all shadow-xl ${isReady ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                    >
                        Lancer l&apos;importation ({mappedCount} champs)
                    </button>
                </div>
            </div>
        </div>
    );
};

