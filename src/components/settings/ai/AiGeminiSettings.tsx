/*
Copyright (C) 2025 AC
SocialConnect - Gemini AI Settings Component
*/

import React from 'react';
import { KeyIcon, CpuChipIcon, SparklesIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { GEMINI_MODELS } from '@/lib/ai/ai-types';

interface AiGeminiSettingsProps {
    geminiApiKey: string;
    geminiModel: string;
    geminiEnabled: boolean;
    isTesting?: boolean;
    connectionStatus?: 'unknown' | 'connected' | 'error';
    availableModels?: string[];
    onChange: (field: string, value: any) => void;
    onTest: () => void;
}

const AiGeminiSettings: React.FC<AiGeminiSettingsProps> = ({
    geminiApiKey,
    geminiModel,
    geminiEnabled,
    isTesting,
    connectionStatus,
    availableModels,
    onChange,
    onTest
}) => {
    return (
        <div className="space-y-4">
            {/* Enable Gemini Individual Toggle */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <SparklesIcon className="w-5 h-5 text-gray-400 mr-2" />
                        <h4 className="font-medium text-gray-900">Activer Gemini</h4>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={geminiEnabled}
                            onChange={(e) => onChange('geminiEnabled', e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                </div>
                {!geminiEnabled && (
                    <p className="text-xs text-amber-600 mt-2 italic">
                        Gemini est désactivé. Il ne sera pas utilisé pour la recherche web ou la vérification.
                    </p>
                )}
            </div>
            {/* API Key */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center mb-3">
                    <KeyIcon className="w-5 h-5 text-gray-400 mr-2" />
                    <h4 className="font-medium text-gray-900">Clé API Gemini</h4>
                </div>
                <input
                    type="password"
                    value={geminiApiKey}
                    onChange={(e) => onChange('geminiApiKey', e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                    Obtenez votre clé sur <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">Google AI Studio</a> (gratuit)
                </p>
            </div>

            {/* Gemini Model Selection */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                        <CpuChipIcon className="w-5 h-5 text-gray-400 mr-2" />
                        <h4 className="font-medium text-gray-900">Modèle Gemini</h4>
                    </div>
                    {connectionStatus === 'connected' && (
                        <span className="text-xs font-semibold px-2 py-0.5 bg-green-100 text-green-700 rounded-full flex items-center gap-1">
                            <ArrowPathIcon className="w-3 h-3" /> Connecté
                        </span>
                    )}
                </div>
                <select
                    value={geminiModel}
                    onChange={(e) => onChange('geminiModel', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                    {(availableModels && availableModels.length > 0) ? (
                        availableModels.map((m) => (
                            <option key={m} value={m}>{m}</option>
                        ))
                    ) : (
                        GEMINI_MODELS.map((model) => (
                            <option key={model.value} value={model.value}>
                                {model.label} ({model.tokens})
                            </option>
                        ))
                    )}
                </select>
            </div>

            {/* Features Info */}
            <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-lg border border-purple-200">
                <div className="flex items-start gap-3">
                    <SparklesIcon className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div>
                        <h4 className="font-medium text-purple-900">Fonctionnalités Gemini</h4>
                        <ul className="text-sm text-purple-700 mt-1 space-y-1">
                            <li>• Recherche web intégrée (grounding)</li>
                            <li>• Fenêtre de contexte jusqu'à 2M tokens</li>
                            <li>• Vérification des partenaires</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Test Button */}
            <button
                onClick={onTest}
                disabled={isTesting}
                className="w-full py-2 px-4 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-violet-700 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 disabled:opacity-70"
            >
                {isTesting ? (
                    <>
                        <ArrowPathIcon className="w-5 h-5 animate-spin" />
                        Vérification en cours...
                    </>
                ) : (
                    'Tester la connexion Gemini'
                )}
            </button>
        </div>
    );
};

export default AiGeminiSettings;
