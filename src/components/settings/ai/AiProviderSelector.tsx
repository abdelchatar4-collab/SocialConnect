/*
Copyright (C) 2025 ABDEL KADER CHATAR
*/

import React from 'react';
import { ServerIcon, CloudIcon } from '@heroicons/react/24/outline';
import { AiProvider } from '@/hooks/useAiSettings';

interface AiProviderSelectorProps {
    provider: AiProvider;
    onChange: (provider: AiProvider) => void;
}

const AiProviderSelector: React.FC<AiProviderSelectorProps> = ({ provider, onChange }) => {
    return (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3">Fournisseur IA</h4>
            <div className="grid grid-cols-2 gap-3">
                {/* Ollama Option */}
                <button
                    onClick={() => onChange('ollama')}
                    className={`p-4 rounded-lg border-2 transition-all ${provider === 'ollama'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                >
                    <ServerIcon className={`w-8 h-8 mx-auto mb-2 ${provider === 'ollama' ? 'text-purple-600' : 'text-gray-400'}`} />
                    <p className={`font-medium ${provider === 'ollama' ? 'text-purple-900' : 'text-gray-700'}`}>Ollama (Local)</p>
                    <p className="text-xs text-gray-500 mt-1">Serveur local, gratuit, privé</p>
                </button>

                {/* Groq Option */}
                <button
                    onClick={() => onChange('groq')}
                    className={`p-4 rounded-lg border-2 transition-all ${provider === 'groq'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                >
                    <CloudIcon className={`w-8 h-8 mx-auto mb-2 ${provider === 'groq' ? 'text-green-600' : 'text-gray-400'}`} />
                    <p className={`font-medium ${provider === 'groq' ? 'text-green-900' : 'text-gray-700'}`}>Groq (Cloud)</p>
                    <p className="text-xs text-gray-500 mt-1">Ultra-rapide ⚡, gratuit (1000/jour)</p>
                </button>
            </div>
        </div>
    );
};

export default AiProviderSelector;
