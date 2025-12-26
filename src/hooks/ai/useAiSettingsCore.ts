/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - useAiSettings Hook
*/

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { AiSettingsData, AiProvider, AI_SETTINGS_KEY, DEFAULT_SETTINGS } from './aiSettingsConstants';
import { aiClient } from '@/lib/ai-client';

/*
// DANGEROUS IN MULTI-TENANT: Cannot easily get serviceId here
export function getAiSettings(): AiSettingsData {
    try {
        const stored = localStorage.getItem(AI_SETTINGS_KEY);
        if (stored) return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    } catch (e) { }
    return DEFAULT_SETTINGS;
}
*/

export function useAiSettings() {
    const { data: session } = useSession();
    const [settings, setSettings] = useState<AiSettingsData>(DEFAULT_SETTINGS);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const load = async () => {
            const serviceId = (session?.user as any)?.serviceId || 'default';
            const scopedKey = `${AI_SETTINGS_KEY}-${serviceId}`;
            let local: any = {};
            try { const s = localStorage.getItem(scopedKey); if (s) local = JSON.parse(s); } catch (e) { }
            try {
                const res = await fetch('/api/settings');
                if (res.ok) {
                    const db = await res.json();
                    const updated: AiSettingsData = {
                        provider: db.aiProvider as AiProvider || local.provider || DEFAULT_SETTINGS.provider,
                        endpoint: db.aiEndpoint || local.endpoint || DEFAULT_SETTINGS.endpoint,
                        model: db.aiModel || local.model || DEFAULT_SETTINGS.model,
                        temperature: db.aiTemperature ?? local.temperature ?? DEFAULT_SETTINGS.temperature,
                        enabled: db.aiEnabled ?? local.enabled ?? DEFAULT_SETTINGS.enabled,
                        enableAnalysis: db.aiEnableAnalysis ?? local.enableAnalysis ?? DEFAULT_SETTINGS.enableAnalysis,
                        groqApiKey: db.aiGroqApiKey || local.groqApiKey || DEFAULT_SETTINGS.groqApiKey,
                        groqModel: db.aiGroqModel || local.groqModel || DEFAULT_SETTINGS.groqModel,
                        useKeyPool: db.aiUseKeyPool ?? local.useKeyPool ?? DEFAULT_SETTINGS.useKeyPool,
                        geminiApiKey: db.aiGeminiApiKey || local.geminiApiKey || DEFAULT_SETTINGS.geminiApiKey,
                        geminiModel: db.aiGeminiModel || local.geminiModel || DEFAULT_SETTINGS.geminiModel,
                        ollamaEnabled: db.aiOllamaEnabled ?? local.ollamaEnabled ?? DEFAULT_SETTINGS.ollamaEnabled,
                        groqEnabled: db.aiGroqEnabled ?? local.groqEnabled ?? DEFAULT_SETTINGS.groqEnabled,
                        geminiEnabled: db.aiGeminiEnabled ?? local.geminiEnabled ?? DEFAULT_SETTINGS.geminiEnabled,
                        customAnalysisPrompt: db.aiCustomAnalysisPrompt || local.customAnalysisPrompt || DEFAULT_SETTINGS.customAnalysisPrompt,
                        analysisTemperature: db.aiAnalysisTemperature ?? local.analysisTemperature ?? DEFAULT_SETTINGS.analysisTemperature,
                    };
                    setSettings(updated); localStorage.setItem(scopedKey, JSON.stringify(updated));
                    aiClient.refreshSettings(); // Sync global singleton
                } else if (local.provider) { setSettings({ ...DEFAULT_SETTINGS, ...local }); aiClient.refreshSettings(); }
            } catch (e) { if (local.provider) { setSettings({ ...DEFAULT_SETTINGS, ...local }); aiClient.refreshSettings(); } }
            setLoaded(true);
        };
        if (session) load();
    }, [session]);

    const saveSettings = async (newS: Partial<AiSettingsData>) => {
        const updated = { ...settings, ...newS }; setSettings(updated);
        const serviceId = (session?.user as any)?.serviceId || 'default';
        const scopedKey = `${AI_SETTINGS_KEY}-${serviceId}`;
        try { localStorage.setItem(scopedKey, JSON.stringify(updated)); aiClient.refreshSettings(); } catch (e) { }
        try {
            await fetch('/api/settings', {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    aiEnabled: updated.enabled, aiProvider: updated.provider, aiEndpoint: updated.endpoint,
                    aiModel: updated.model, aiTemperature: updated.temperature, aiGroqApiKey: updated.groqApiKey,
                    aiGroqModel: updated.groqModel, aiUseKeyPool: updated.useKeyPool, aiEnableAnalysis: updated.enableAnalysis,
                    aiAnalysisTemperature: updated.analysisTemperature, aiCustomAnalysisPrompt: updated.customAnalysisPrompt,
                    aiGeminiApiKey: updated.geminiApiKey, aiGeminiModel: updated.geminiModel,
                    aiOllamaEnabled: updated.ollamaEnabled, aiGroqEnabled: updated.groqEnabled, aiGeminiEnabled: updated.geminiEnabled,
                })
            });
        } catch (e) { }
        return updated;
    };

    return { settings, saveSettings, loaded };
}
