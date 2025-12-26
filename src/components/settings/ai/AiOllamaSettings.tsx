/*
Copyright (C) 2025 ABDEL KADER CHATAR
*/

import React from 'react';
import { ServerIcon, CpuChipIcon } from '@heroicons/react/24/outline';
import { AVAILABLE_MODELS } from '@/hooks/useAiSettings';

interface AiOllamaSettingsProps {
    endpoint: string;
    model: string;
    ollamaEnabled: boolean;
    availableModels: string[];
    onChange: (field: string, value: any) => void;
}

const AiOllamaSettings: React.FC<AiOllamaSettingsProps> = ({
    endpoint,
    model,
    ollamaEnabled,
    availableModels,
    onChange
}) => {
    return (
        <div className="space-y-4">
            {/* Enable Ollama Individual Toggle */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <ServerIcon className="w-5 h-5 text-gray-400 mr-2" />
                        <h4 className="font-medium text-gray-900">Activer Ollama</h4>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={ollamaEnabled}
                            onChange={(e) => onChange('ollamaEnabled', e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                </div>
                {!ollamaEnabled && (
                    <p className="text-xs text-amber-600 mt-2 italic">
                        Ollama est désactivé. L'IA locale ne sera pas utilisée.
                    </p>
                )}
            </div>
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
        </div>
    );
};

export default AiOllamaSettings;
