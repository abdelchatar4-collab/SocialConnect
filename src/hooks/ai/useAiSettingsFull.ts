/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - useAiSettingsFull Hook
*/

import { useState, useEffect } from 'react';
import { useAiSettings } from './useAiSettingsCore';
import { AiSettingsData } from './aiSettingsConstants';

export function useAiSettingsFull() {
    const { settings, saveSettings, loaded } = useAiSettings();
    const [isTesting, setIsTesting] = useState(false);
    const [status, setStatus] = useState<'unknown' | 'connected' | 'error'>('unknown');
    const [models, setModels] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncMsg, setSyncMsg] = useState<string | null>(null);
    const [connError, setConnError] = useState<string | null>(null);

    const testConnection = async () => {
        setIsTesting(true); setStatus('unknown'); setConnError(null);
        const { aiClient } = await import('@/lib/ai-client');
        aiClient.refreshSettings(); // Load newest from localStorage

        try {
            const available = await aiClient.checkAvailability();
            if (available) {
                setStatus('connected');
                const ep = settings.endpoint;
                if (settings.provider === 'groq') {
                    const r = await fetch('https://api.groq.com/openai/v1/models', { headers: { 'Authorization': `Bearer ${settings.groqApiKey}` } });
                    if (r.ok) setModels((await r.json()).data?.map((m: any) => m.id) || []);
                } else if (settings.provider === 'gemini') {
                    const r = await fetch('/api/ai/gemini', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            action: 'models',
                            apiKey: settings.geminiApiKey
                        })
                    });
                    if (r.ok) {
                        const data = await r.json();
                        if (data.status === 'success') {
                            setStatus('connected');
                            setModels(data.models?.map((m: any) => m.name) || []);
                        } else {
                            throw new Error(data.error || 'Erreur inconnue Gemini');
                        }
                    } else {
                        const d = await r.json().catch(() => ({}));
                        throw new Error(d.error || 'Clé API Gemini invalide ou quota dépassé');
                    }
                } else {
                    const fetchTags = async () => {
                        try { const res = await fetch(`${ep}/api/tags`); if (res.ok) return res.json(); } catch (e) { }
                        const res = await fetch('/api/ai/ollama', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'tags' }) });
                        if (res.ok) return res.json();
                    };
                    const data = await fetchTags();
                    if (data?.models) setModels(data.models.map((m: any) => m.name));
                }
            } else { setStatus('error'); setConnError('Serveur inaccessible'); }
        } catch (e: any) { setStatus('error'); setConnError(e.message); } finally { setIsTesting(false); }
    };

    const handleSync = async () => {
        if (!confirm('Synchroniser vers TOUS les services ?')) return;
        setIsSyncing(true); setSyncMsg(null);
        try {
            const res = await fetch('/api/admin/sync-ai-settings', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    aiEnabled: settings.enabled, aiProvider: settings.provider, aiEndpoint: settings.endpoint,
                    aiModel: settings.model, aiTemperature: settings.temperature, aiGroqApiKey: settings.groqApiKey,
                    aiGroqModel: settings.groqModel, aiUseKeyPool: settings.useKeyPool, aiEnableAnalysis: settings.enableAnalysis,
                    aiAnalysisTemperature: settings.analysisTemperature, aiCustomAnalysisPrompt: settings.customAnalysisPrompt,
                    aiGeminiApiKey: settings.geminiApiKey, aiGeminiModel: settings.geminiModel,
                })
            });
            const d = await res.json(); setSyncMsg(res.ok ? `✅ ${d.message}` : `❌ ${d.error}`);
        } catch { setSyncMsg('❌ Erreur'); } finally { setIsSyncing(false); setTimeout(() => setSyncMsg(null), 5000); }
    };

    const handleSave = async () => { setIsSaving(true); await saveSettings(settings); setTimeout(() => setIsSaving(false), 500); };

    useEffect(() => { if (loaded) testConnection(); }, [loaded, settings.provider, settings.endpoint, settings.groqApiKey, settings.geminiApiKey]);

    return {
        settings, saveSettings, loaded, isTestingConnection: isTesting, connectionStatus: status,
        availableModels: models, isSaving, isSyncing, syncMessage: syncMsg, connectionError: connError,
        testConnection, handleSyncToAllServices: handleSync, handleSave
    };
}
