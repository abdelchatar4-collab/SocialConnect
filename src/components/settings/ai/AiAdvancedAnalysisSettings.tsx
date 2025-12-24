/*
Copyright (C) 2025 ABDEL KADER CHATAR
*/

import React from 'react';
import { AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import { DEFAULT_SYSTEM_PROMPT } from '@/hooks/useAiSettings';

interface AiAdvancedAnalysisSettingsProps {
    enableAnalysis: boolean;
    analysisTemperature: number;
    customAnalysisPrompt: string;
    onChange: (field: string, value: any) => void;
}

const AiAdvancedAnalysisSettings: React.FC<AiAdvancedAnalysisSettingsProps> = ({
    enableAnalysis,
    analysisTemperature,
    customAnalysisPrompt,
    onChange
}) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mt-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="p-2 bg-purple-50 rounded-lg">
                    <AdjustmentsHorizontalIcon className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-slate-800">Configuration Avancée de l'Analyse</h3>
                    <p className="text-sm text-slate-500">Personnalisez le comportement de l'IA pour l'analyse des notes</p>
                </div>
            </div>

            {/* Enable Analysis Toggle */}
            <div className="flex items-center justify-between py-2 border-b border-gray-100 pb-4">
                <div>
                    <label className="text-sm font-medium text-slate-700">Activer l'extraction automatique</label>
                    <p className="text-xs text-slate-500">Détecte actions et problématiques (si désactivé, seuls les mots-clés prédéfinis fonctionnent)</p>
                </div>
                <button
                    onClick={() => onChange('enableAnalysis', !enableAnalysis)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enableAnalysis ? 'bg-purple-600' : 'bg-gray-200'}`}
                >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enableAnalysis ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
            </div>

            {/* Analysis Temperature */}
            <div>
                <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-slate-700">
                        Température (Créativité) : {analysisTemperature}
                    </label>
                    <span className={`text-xs px-2 py-1 rounded ${analysisTemperature === 0 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                        {analysisTemperature === 0 ? 'Strict (Défaut)' : 'Plus créatif'}
                    </span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={analysisTemperature}
                    onChange={(e) => onChange('analysisTemperature', parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                <div className="flex justify-between mt-1 text-xs text-slate-400">
                    <span>0.0 (Logique pure)</span>
                    <span>0.5 (Équilibré)</span>
                    <span>1.0 (Imaginatif)</span>
                </div>
            </div>

            {/* Custom System Prompt */}
            <div>
                <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        Prompt Système Personnalisé
                        <div className="group relative pointer-events-auto">
                            <span className="cursor-help text-purple-600 font-bold border border-purple-200 bg-purple-50 rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-purple-600 hover:text-white transition-colors">?</span>

                            <div className="absolute left-0 bottom-full mb-2 w-80 p-4 bg-slate-800 text-white text-xs rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                                <div className="font-bold mb-2 text-sm text-purple-300">Guide Prompting</div>
                                <p className="mb-2">Ce texte définit l'identité (Persona) de l'IA.</p>
                                <div className="bg-slate-900 p-2 rounded border border-slate-700 mb-2 font-mono text-xs opacity-80">
                                    {/* Using placeholders to avoid issues with template literals in JSX */}
                                    {'${validActions}'}<br />
                                    {'${validProblematiques}'}
                                </div>
                                <p>⚠️ Ces variables sont <strong>OBLIGATOIRES</strong> pour que l'IA connaisse les catégories possibles.</p>
                            </div>
                        </div>
                    </label>
                    <button
                        onClick={() => onChange('customAnalysisPrompt', '')}
                        className="text-xs text-slate-500 hover:text-red-500 transition-colors underline"
                    >
                        Restaurer le défaut
                    </button>
                </div>

                <textarea
                    value={customAnalysisPrompt || DEFAULT_SYSTEM_PROMPT}
                    onChange={(e) => onChange('customAnalysisPrompt', e.target.value)}
                    rows={12}
                    className="w-full px-4 py-3 text-sm border-2 border-slate-100 rounded-xl focus:border-purple-500 focus:ring-0 font-mono bg-slate-50 text-slate-700 leading-relaxed resize-none"
                    placeholder="Entrez votre prompt système..."
                />
                <p className="text-xs text-slate-500 mt-2 italic">
                    Astuce : Donnez des exemples concrets à l'IA. Ex: "Si tu lis 'dettes loyer', coche 'Logement' et 'Dettes'."
                </p>
            </div>
        </div>
    );
};

export default AiAdvancedAnalysisSettings;
