/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { useAiSettingsFull, AiSettingsData } from '@/hooks/useAiSettings';

// Sub-components
import AiHeader from './ai/AiHeader';
import AiProviderSelector from './ai/AiProviderSelector';
import AiConnectionStatus from './ai/AiConnectionStatus';
import AiEnabledToggle from './ai/AiEnabledToggle';
import AiGroqSettings from './ai/AiGroqSettings';
import AiOllamaSettings from './ai/AiOllamaSettings';
import AiAdvancedAnalysisSettings from './ai/AiAdvancedAnalysisSettings';
import AiFooterActions from './ai/AiFooterActions';

/**
 * Main AI Settings Component
 * Refactored to use a modular architecture (hook + sub-components)
 */
export default function AiSettings() {
    const {
        settings,
        saveSettings,
        loaded,
        isTestingConnection,
        connectionStatus,
        availableModels,
        isSaving,
        isSyncing,
        syncMessage,
        connectionError,
        testConnection,
        handleSyncToAllServices,
        handleSave
    } = useAiSettingsFull();

    const { data: session } = useSession();
    const isSuperAdmin = (session?.user as any)?.role === 'SUPER_ADMIN';

    // Handle field changes with immediate state update and debounced/manual save
    const handleChange = (field: string, value: any) => {
        saveSettings({ [field]: value } as Partial<AiSettingsData>);
    };

    if (!loaded) {
        return (
            <div className="flex items-center justify-center p-8">
                <ArrowPathIcon className="w-6 h-6 animate-spin text-purple-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <AiHeader />

            <AiProviderSelector
                provider={settings.provider}
                onChange={(p) => handleChange('provider', p)}
            />

            <AiConnectionStatus
                connectionStatus={connectionStatus}
                isTestingConnection={isTestingConnection}
                onTest={testConnection}
                provider={settings.provider}
                availableModelsCount={availableModels.length}
                connectionError={connectionError}
            />

            <AiEnabledToggle
                enabled={settings.enabled}
                onChange={(e) => handleChange('enabled', e)}
            />

            {/* Provider-specific settings */}
            {settings.provider === 'groq' && (
                <AiGroqSettings
                    groqApiKey={settings.groqApiKey}
                    groqModel={settings.groqModel}
                    useKeyPool={settings.useKeyPool}
                    onChange={handleChange}
                    onTest={testConnection}
                />
            )}

            {settings.provider === 'ollama' && (
                <AiOllamaSettings
                    endpoint={settings.endpoint}
                    model={settings.model}
                    availableModels={availableModels}
                    onChange={handleChange}
                />
            )}

            <AiAdvancedAnalysisSettings
                enableAnalysis={settings.enableAnalysis}
                analysisTemperature={settings.analysisTemperature ?? 0}
                customAnalysisPrompt={settings.customAnalysisPrompt ?? ''}
                onChange={handleChange}
            />

            <AiFooterActions
                isSaving={isSaving}
                isSyncing={isSyncing}
                isSuperAdmin={isSuperAdmin}
                onSave={handleSave}
                onSync={handleSyncToAllServices}
            />

            {/* Sync feedback message */}
            {syncMessage && (
                <div className={`mt-3 p-3 rounded-lg text-center text-sm ${syncMessage.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                    {syncMessage}
                </div>
            )}
        </div>
    );
}
