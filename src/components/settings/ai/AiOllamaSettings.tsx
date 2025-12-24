/*
Copyright (C) 2025 ABDEL KADER CHATAR
*/

import React from 'react';
import { ServerIcon, CpuChipIcon } from '@heroicons/react/24/outline';
import { AVAILABLE_MODELS } from '@/hooks/useAiSettings';

interface AiOllamaSettingsProps {
    endpoint: string;
    model: string;
    availableModels: string[];
    onChange: (field: string, value: any) => void;
}

const AiOllamaSettings: React.FC<AiOllamaSettingsProps> = ({
    endpoint,
    model,
    availableModels,
    onChange
}) => {
    return (
        <>
            {/* Endpoint Configuration */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center mb-3">
                    <ServerIcon className="w-5 h-5 text-gray-400 mr-2" />
                    <h4 className="font-medium text-gray-900">Serveur Ollama</h4>
                </div>
                <input
                    type="text"
                    value={endpoint}
                    onChange={(e) => onChange('endpoint', e.target.value)}
                    placeholder="http://192.168.2.147:11434"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                    URL du serveur Ollama (ex: http://192.168.2.147:11434)
                </p>
            </div>

            {/* Model Selection */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center mb-3">
                    <CpuChipIcon className="w-5 h-5 text-gray-400 mr-2" />
                    <h4 className="font-medium text-gray-900">Modèle</h4>
                </div>

                {/* Quick Select */}
                <select
                    value={model}
                    onChange={(e) => onChange('model', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 mb-2"
                >
                    {AVAILABLE_MODELS.map((m) => (
                        <option key={m.value} value={m.value}>
                            {m.label} ({m.ram})
                        </option>
                    ))}
                    {/* Show installed models from server */}
                    {availableModels.filter(m => !AVAILABLE_MODELS.some(am => am.value === m)).map((m) => (
                        <option key={m} value={m}>
                            {m} (installé)
                        </option>
                    ))}
                </select>

                {/* Manual input */}
                <input
                    type="text"
                    value={model}
                    onChange={(e) => onChange('model', e.target.value)}
                    placeholder="Ou entrez un nom de modèle..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
            </div>
        </>
    );
};

export default AiOllamaSettings;
