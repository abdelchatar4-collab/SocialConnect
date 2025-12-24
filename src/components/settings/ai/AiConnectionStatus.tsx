/*
Copyright (C) 2025 ABDEL KADER CHATAR
*/

import React from 'react';
import { CheckCircleIcon, XCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { AiProvider } from '@/hooks/useAiSettings';

interface AiConnectionStatusProps {
    connectionStatus: 'unknown' | 'connected' | 'error';
    isTestingConnection: boolean;
    onTest: () => void;
    provider: AiProvider;
    availableModelsCount: number;
    connectionError: string | null;
}

const AiConnectionStatus: React.FC<AiConnectionStatusProps> = ({
    connectionStatus,
    isTestingConnection,
    onTest,
    provider,
    availableModelsCount,
    connectionError
}) => {
    return (
        <div className={`p-4 rounded-lg border ${connectionStatus === 'connected' ? 'bg-green-50 border-green-200' :
            connectionStatus === 'error' ? 'bg-red-50 border-red-200' :
                'bg-gray-50 border-gray-200'
            }`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    {connectionStatus === 'connected' ? (
                        <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                    ) : connectionStatus === 'error' ? (
                        <XCircleIcon className="w-5 h-5 text-red-500 mr-2" />
                    ) : (
                        <div className="w-5 h-5 rounded-full bg-gray-300 mr-2" />
                    )}
                    <div>
                        <span className={`font-medium ${connectionStatus === 'connected' ? 'text-green-800' :
                            connectionStatus === 'error' ? 'text-red-800' :
                                'text-gray-600'
                            }`}>
                            {connectionStatus === 'connected' ? `Connecté à ${provider === 'groq' ? 'Groq' : 'Ollama'}` :
                                connectionStatus === 'error' ? 'Connexion impossible' :
                                    'Statut inconnu'}
                        </span>
                        {connectionStatus === 'connected' && availableModelsCount > 0 && (
                            <p className="text-sm text-green-600">{availableModelsCount} modèle(s) disponible(s)</p>
                        )}
                    </div>
                </div>
                <button
                    onClick={onTest}
                    disabled={isTestingConnection}
                    className="px-3 py-1.5 text-sm font-medium text-purple-700 bg-purple-100 rounded-lg hover:bg-purple-200 disabled:opacity-50"
                >
                    {isTestingConnection ? (
                        <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    ) : (
                        'Tester'
                    )}
                </button>
            </div>
            {connectionError && (
                <p className="text-xs text-red-600 mt-2">{connectionError}</p>
            )}
        </div>
    );
};

export default AiConnectionStatus;
