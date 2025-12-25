/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - useAiSettings Hook
*/

import { useState, useEffect } from 'react';
import { AiSettingsData, AiProvider, AI_SETTINGS_KEY, DEFAULT_SETTINGS } from './aiSettingsConstants';

export function getAiSettings(): AiSettingsData {
    try {
        const stored = localStorage.getItem(AI_SETTINGS_KEY);
        if (stored) return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    } catch (e) { }
    return DEFAULT_SETTINGS;
}

export function useAiSettings() {
    const [settings, setSettings] = useState<AiSettingsData>(DEFAULT_SETTINGS);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const load = async () => {
            let local: any = {};
            try { const s = localStorage.getItem(AI_SETTINGS_KEY); if (s) local = JSON.parse(s); } catch (e) { }
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
                        customAnalysisPrompt: db.aiCustomAnalysisPrompt || local.customAnalysisPrompt || DEFAULT_SETTINGS.customAnalysisPrompt,
                        analysisTemperature: db.aiAnalysisTemperature ?? local.analysisTemperature ?? DEFAULT_SETTINGS.analysisTemperature,
                    };
                    setSettings(updated); localStorage.setItem(AI_SETTINGS_KEY, JSON.stringify(updated));
                } else if (local.provider) setSettings({ ...DEFAULT_SETTINGS, ...local });
            } catch (e) { if (local.provider) setSettings({ ...DEFAULT_SETTINGS, ...local }); }
            setLoaded(true);
        };
        load();
    }, []);

    const saveSettings = async (newS: Partial<AiSettingsData>) => {
        const updated = { ...settings, ...newS }; setSettings(updated);
        try { localStorage.setItem(AI_SETTINGS_KEY, JSON.stringify(updated)); } catch (e) { }
        try {
            await fetch('/api/settings', {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    aiEnabled: updated.enabled, aiProvider: updated.provider, aiEndpoint: updated.endpoint,
                    aiModel: updated.model, aiTemperature: updated.temperature, aiGroqApiKey: updated.groqApiKey,
                    aiGroqModel: updated.groqModel, aiUseKeyPool: updated.useKeyPool, aiEnableAnalysis: updated.enableAnalysis,
                    aiAnalysisTemperature: updated.analysisTemperature, aiCustomAnalysisPrompt: updated.customAnalysisPrompt,
                })
            });
        } catch (e) { }
        return updated;
    };

    return { settings, saveSettings, loaded };
}
