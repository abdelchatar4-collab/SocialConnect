/*
Copyright (C) 2025 ABDEL KADER CHATAR
*/

import React from 'react';
import { KeyIcon, CpuChipIcon } from '@heroicons/react/24/outline';
import { GROQ_MODELS } from '@/lib/ai-client';
import ApiKeyPoolManager from '../ApiKeyPoolManager';

interface AiGroqSettingsProps {
    groqApiKey: string;
    groqModel: string;
    useKeyPool: boolean;
    onChange: (field: string, value: any) => void;
    onTest: () => void;
}

const AiGroqSettings: React.FC<AiGroqSettingsProps> = ({
    groqApiKey,
    groqModel,
    useKeyPool,
    onChange,
    onTest
}) => {
    return (
        <>
            {/* API Key */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center mb-3">
                    <KeyIcon className="w-5 h-5 text-gray-400 mr-2" />
                    <h4 className="font-medium text-gray-900">Clé API Groq</h4>
                </div>
                <input
                    type="password"
                    value={groqApiKey}
                    onChange={(e) => onChange('groqApiKey', e.target.value)}
                    placeholder="gsk_..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                    Obtenez votre clé sur <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">console.groq.com</a> (gratuit)
                </p>
            </div>

            {/* Groq Model Selection */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center mb-3">
                    <CpuChipIcon className="w-5 h-5 text-gray-400 mr-2" />
                    <h4 className="font-medium text-gray-900">Modèle Groq</h4>
                </div>
                <select
                    value={groqModel}
                    onChange={(e) => onChange('groqModel', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                    {GROQ_MODELS.map((model) => (
                        <option key={model.value} value={model.value}>
                            {model.label} ({model.tokens})
                        </option>
                    ))}
                </select>
            </div>

            {/* Key Pool Toggle */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="font-medium text-gray-900">Mode Pool de Clés</h4>
                        <p className="text-sm text-gray-500">Utiliser plusieurs clés API avec rotation automatique</p>
                    </div>
                    <button
                        onClick={() => onChange('useKeyPool', !useKeyPool)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${useKeyPool ? 'bg-green-600' : 'bg-gray-300'
                            }`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${useKeyPool ? 'translate-x-6' : 'translate-x-1'
                                }`}
                        />
                    </button>
                </div>
            </div>

            {/* Key Pool Manager (if enabled) */}
            {useKeyPool && (
                <ApiKeyPoolManager onPoolChange={onTest} />
            )}
        </>
    );
};

export default AiGroqSettings;
