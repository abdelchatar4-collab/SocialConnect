/*
Copyright (C) 2025 ABDEL KADER CHATAR
*/

import React from 'react';

interface AiEnabledToggleProps {
    enabled: boolean;
    onChange: (enabled: boolean) => void;
}

const AiEnabledToggle: React.FC<AiEnabledToggleProps> = ({ enabled, onChange }) => {
    return (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
                <div>
                    <h4 className="font-medium text-gray-900">Activer l'IA</h4>
                    <p className="text-sm text-gray-500">Active les fonctionnalités d'assistance IA dans l'application</p>
                </div>
                <button
                    onClick={() => onChange(!enabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? 'bg-purple-600' : 'bg-gray-300'
                        }`}
                >
                    <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                    />
                </button>
            </div>
        </div>
    );
};

export default AiEnabledToggle;
