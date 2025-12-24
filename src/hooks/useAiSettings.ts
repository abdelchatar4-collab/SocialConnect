/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

'use client';

import { useState, useEffect } from 'react';
import { GROQ_MODELS, DEFAULT_GROQ_MODEL } from '@/lib/ai-client';

// Constants for localStorage keys
export const AI_SETTINGS_KEY = 'ai_settings';

// Provider type
export type AiProvider = 'ollama' | 'groq';

export interface AiSettingsData {
    provider: AiProvider;
    endpoint: string;
    model: string;
    temperature: number;
    enabled: boolean;
    enableAnalysis: boolean;
    groqApiKey: string;
    groqModel: string;
    useKeyPool: boolean;
    customAnalysisPrompt?: string;
    analysisTemperature?: number;
}

// Default settings
export const DEFAULT_SETTINGS: AiSettingsData = {
    provider: 'ollama',
    endpoint: 'http://192.168.2.147:11434',
    model: 'ministral-3:3b',
    temperature: 0.7,
    enabled: true,
    groqApiKey: '',
    groqModel: DEFAULT_GROQ_MODEL,
    useKeyPool: false,
    customAnalysisPrompt: '',
    analysisTemperature: 0,
    enableAnalysis: true,
};

// Default system prompt with semantic rules
export const DEFAULT_SYSTEM_PROMPT = `Tu es un assistant social expert en Belgique. Ta mission est de structurer les notes de suivi.

ANALYSE SÉMANTIQUE ET RÈGLES DE CLASSEMENT :

1. [Endettement/Surendettement]
   - Mots-clés : "dettes", "huissier", "saisie", "commandement", "facture impayée", "rappel", "mise en demeure", "plan d'apurement", "médiation", "RCD", "créancier".

2. [Logement]
   - Mots-clés : "bail", "propriétaire", "loyer", "garantie locative", "préavis", "expulsion", "insalubrité", "humidité", "moisissure", "travaux", "AIS".

3. [Santé (physique; handicap; autonomie)]
   - Mots-clés : "médecin", "hôpital", "urgence", "mutuelle", "certificat", "incapacité", "invalidité", "vierge noire", "pension handicap", "traitement", "pharmacie".

4. [Energie (eau;gaz;électricité)]
   - Mots-clés : "Sibelga", "Engie", "TotalEnergies", "compteur", "index", "coupure", "limiteur", "régularisation", "facture".

5. [CPAS]
   - Mots-clés : "CPAS", "RIS", "revenu d'intégration", "aide sociale", "carte médicale", "article 60", "réquisitoire", "enquête sociale".

6. [Juridique]
   - Mots-clés : "avocat", "pro deo", "aide juridique", "tribunal", "justice de paix", "police", "plainte", "audition", "convocation".

7. [Scolarité]
   - Mots-clés : "école", "inscription", "frais scolaires", "cantine", "bulletin", "PMS", "absentéisme".

8. [Fiscalité]
   - Mots-clés : "impôts", "SPF Finances", "taxe", "avertissement-extrait de rôle", "précompte".

9. [ISP] (Insertion Socioprofessionnelle)
   - Mots-clés : "chômage", "ONEM", "CAPAC", "syndicat", "Actiris", "VDAB", "formation", "CV", "recherche emploi".

INSTRUCTIONS DE SORTIE :
- Extrais les ACTIONS et PROBLÉMATIQUES en te basant sur ces règles.
- Réponds UNIQUEMENT avec un objet JSON valide.
- Si un terme correspond à une règle ci-dessus, tu DOIS cocher la catégorie correspondante.

CONTEXTE OBLIGATOIRE (Ne pas changer) :
VOCABULAIRE AUTORISÉ pour les actions: \${validActions}
VOCABULAIRE AUTORISÉ pour les problématiques: \${validProblematiques}`;

// Available models for quick selection (Ollama)
export const AVAILABLE_MODELS = [
    { value: 'ministral-3:3b', label: 'Ministral 3B (Rapide & Performant)', ram: '~3-4 Go' },
    { value: 'qwen2.5:0.5b', label: 'Qwen2.5 0.5B (Ultra rapide)', ram: '~1 Go' },
    { value: 'qwen2.5:1.5b', label: 'Qwen2.5 1.5B (Rapide)', ram: '~2-3 Go' },
    { value: 'qwen2.5:3b', label: 'Qwen2.5 3B (Ancien défaut)', ram: '~4-5 Go' },
    { value: 'gemma:2b', label: 'Gemma 2B', ram: '~3-4 Go' },
    { value: 'phi3:mini', label: 'Phi-3 Mini (3.8B)', ram: '~5-6 Go' },
    { value: 'mistral:7b', label: 'Mistral 7B', ram: '~8-10 Go' },
    { value: 'mistral-nemo:latest', label: 'Mistral Nemo 12B ⭐ (Meilleur FR)', ram: '~7-8 Go' },
];

// Hook to get/set AI settings with persistence (DB + localStorage sync)
export function useAiSettings() {
    const [settings, setSettings] = useState<AiSettingsData>(DEFAULT_SETTINGS);
    const [loaded, setLoaded] = useState(false);

    // Load from API on mount, then sync to localStorage for ai-client compatibility
    useEffect(() => {
        const loadSettings = async () => {
            // First, get existing localStorage values (if any)
            let localSettings: Partial<AiSettingsData> = {};
            try {
                const stored = localStorage.getItem(AI_SETTINGS_KEY);
                if (stored) {
                    localSettings = JSON.parse(stored);
                }
            } catch (e) {
                console.warn('Failed to parse localStorage AI settings:', e);
            }

            try {
                // Then load from API (database)
                const response = await fetch('/api/settings');
                if (response.ok) {
                    const dbSettings = await response.json();

                    // Map DB fields to frontend fields
                    const loadedSettings: AiSettingsData = {
                        provider: (dbSettings.aiProvider as AiProvider) || localSettings.provider || DEFAULT_SETTINGS.provider,
                        endpoint: dbSettings.aiEndpoint || localSettings.endpoint || DEFAULT_SETTINGS.endpoint,
                        model: dbSettings.aiModel || localSettings.model || DEFAULT_SETTINGS.model,
                        temperature: dbSettings.aiTemperature ?? localSettings.temperature ?? DEFAULT_SETTINGS.temperature,
                        enabled: dbSettings.aiEnabled ?? localSettings.enabled ?? DEFAULT_SETTINGS.enabled,
                        enableAnalysis: dbSettings.aiEnableAnalysis ?? localSettings.enableAnalysis ?? DEFAULT_SETTINGS.enableAnalysis,
                        groqApiKey: dbSettings.aiGroqApiKey || localSettings.groqApiKey || DEFAULT_SETTINGS.groqApiKey,
                        groqModel: dbSettings.aiGroqModel || localSettings.groqModel || DEFAULT_SETTINGS.groqModel,
                        useKeyPool: dbSettings.aiUseKeyPool ?? localSettings.useKeyPool ?? DEFAULT_SETTINGS.useKeyPool,
                        customAnalysisPrompt: dbSettings.aiCustomAnalysisPrompt || localSettings.customAnalysisPrompt || DEFAULT_SETTINGS.customAnalysisPrompt,
                        analysisTemperature: dbSettings.aiAnalysisTemperature ?? localSettings.analysisTemperature ?? DEFAULT_SETTINGS.analysisTemperature,
                    };

                    setSettings(loadedSettings);
                    // Sync to localStorage for ai-client.ts compatibility
                    localStorage.setItem(AI_SETTINGS_KEY, JSON.stringify(loadedSettings));
                }
            } catch (e) {
                console.error('Failed to load AI settings from API:', e);
                // Fallback to localStorage if API fails
                try {
                    const stored = localStorage.getItem(AI_SETTINGS_KEY);
                    if (stored) {
                        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) });
                    }
                } catch (le) {
                    console.error('Failed to load AI settings from localStorage:', le);
                }
            }
            setLoaded(true);
        };
        loadSettings();
    }, []);

    // Save to API (database) + localStorage
    const saveSettings = async (newSettings: Partial<AiSettingsData>) => {
        const updated = { ...settings, ...newSettings };
        setSettings(updated);

        // Save to localStorage immediately for ai-client.ts
        try {
            localStorage.setItem(AI_SETTINGS_KEY, JSON.stringify(updated));
        } catch (e) {
            console.error('Failed to save AI settings to localStorage:', e);
        }

        // Save to database via API
        try {
            const response = await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    aiEnabled: updated.enabled,
                    aiProvider: updated.provider,
                    aiEndpoint: updated.endpoint,
                    aiModel: updated.model,
                    aiTemperature: updated.temperature,
                    aiGroqApiKey: updated.groqApiKey,
                    aiGroqModel: updated.groqModel,
                    aiUseKeyPool: updated.useKeyPool,
                    aiEnableAnalysis: updated.enableAnalysis,
                    aiAnalysisTemperature: updated.analysisTemperature,
                    aiCustomAnalysisPrompt: updated.customAnalysisPrompt,
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Failed to save AI settings to database:', response.status, errorData);
            }
        } catch (e) {
            console.error('Failed to save AI settings to database:', e);
        }

        return updated;
    };

    return { settings, saveSettings, loaded };
}

// Full hook with extra features (test components, etc)
export function useAiSettingsFull() {
    const { settings, saveSettings, loaded } = useAiSettings();
    const [isTestingConnection, setIsTestingConnection] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'error'>('unknown');
    const [availableModels, setAvailableModels] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncMessage, setSyncMessage] = useState<string | null>(null);
    const [connectionError, setConnectionError] = useState<string | null>(null);

    // Test connection based on provider
    const testConnection = async () => {
        setIsTestingConnection(true);
        setConnectionStatus('unknown');
        setConnectionError(null);

        // Import singleton instance
        const { aiClient } = await import('@/lib/ai-client');

        // Apply current form settings to client for testing
        aiClient.provider = settings.provider;
        aiClient.setEndpoint(settings.endpoint);
        aiClient.groqApiKey = settings.groqApiKey;
        aiClient.model = settings.model;

        if (settings.provider === 'groq') {
            if (!settings.groqApiKey || settings.groqApiKey.length < 10) {
                setConnectionStatus('error');
                setConnectionError('Clé API Groq invalide ou manquante');
                setIsTestingConnection(false);
                return;
            }

            const available = await aiClient.checkAvailability();
            if (available) {
                try {
                    const response = await fetch('https://api.groq.com/openai/v1/models', {
                        headers: { 'Authorization': `Bearer ${settings.groqApiKey}` }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setAvailableModels(data.data?.map((m: any) => m.id) || []);
                    }
                } catch (e) {
                    console.warn('Could not fetch Groq models list, but auth worked.');
                }
                setConnectionStatus('connected');
            } else {
                setConnectionStatus('error');
                setConnectionError('Impossible de se connecter à Groq (Vérifiez la clé API)');
            }
            setIsTestingConnection(false);
            return;
        }

        try {
            const isAvailable = await aiClient.checkAvailability();

            if (isAvailable) {
                setConnectionStatus('connected');
                try {
                    const fetchTags = async () => {
                        try {
                            const res = await fetch(`${settings.endpoint}/api/tags`);
                            if (res.ok) return await res.json();
                        } catch (e) { }

                        const res = await fetch('/api/ai/ollama', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ action: 'tags' })
                        });
                        if (res.ok) return await res.json();
                        throw new Error('Could not fetch tags');
                    };

                    const data = await fetchTags();
                    const models = data.models?.map((m: any) => m.name) || [];
                    setAvailableModels(models);
                } catch (e) {
                    console.warn('Connected to Ollama but could not list models:', e);
                }
            } else {
                setConnectionStatus('error');
                setConnectionError('Serveur inaccessible. Vérifiez l\'URL et que Ollama tourne bien.');
            }
        } catch (e: any) {
            console.error('Connection test failed:', e);
            setConnectionStatus('error');
            setConnectionError(e.message || 'Erreur inconnue');
        } finally {
            setIsTestingConnection(false);
        }
    };

    const handleSyncToAllServices = async () => {
        if (!confirm('Synchroniser cette configuration IA vers TOUS les services ?\n\nCela écrasera les paramètres IA de tous les autres services.')) {
            return;
        }

        setIsSyncing(true);
        setSyncMessage(null);

        try {
            const response = await fetch('/api/admin/sync-ai-settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    aiEnabled: settings.enabled,
                    aiProvider: settings.provider,
                    aiEndpoint: settings.endpoint,
                    aiModel: settings.model,
                    aiTemperature: settings.temperature,
                    aiGroqApiKey: settings.groqApiKey,
                    aiGroqModel: settings.groqModel,
                    aiUseKeyPool: settings.useKeyPool,
                    aiEnableAnalysis: settings.enableAnalysis,
                    aiAnalysisTemperature: settings.analysisTemperature,
                    aiCustomAnalysisPrompt: settings.customAnalysisPrompt,
                })
            });

            const data = await response.json();

            if (response.ok) {
                setSyncMessage(`✅ ${data.message}`);
            } else {
                setSyncMessage(`❌ Erreur: ${data.error}`);
            }
        } catch (e) {
            setSyncMessage('❌ Erreur de connexion');
        } finally {
            setIsSyncing(false);
            setTimeout(() => setSyncMessage(null), 5000);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        await saveSettings(settings);
        setTimeout(() => setIsSaving(false), 500);
    };

    // Auto-test on load/provider change
    useEffect(() => {
        if (loaded) {
            testConnection();
        }
    }, [loaded, settings.provider, settings.endpoint, settings.groqApiKey]);

    return {
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
    };
}

// Get current AI settings (for use outside React components)
export function getAiSettings(): AiSettingsData {
    try {
        const stored = localStorage.getItem(AI_SETTINGS_KEY);
        if (stored) {
            return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
        }
    } catch (e) {
        console.error('Failed to get AI settings:', e);
    }
    return DEFAULT_SETTINGS;
}
