/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Types et constantes pour le client AI
*/

export interface AiResponse {
    content: string;
    error?: string;
}

/**
 * Options for completion calls - allows overriding default settings
 */
export interface CompletionOptions {
    temperature?: number;
    maxTokens?: number;
}

export type AiProvider = 'ollama' | 'groq';

export interface AiSettings {
    provider: AiProvider;
    endpoint: string;
    model: string;
    temperature: number;
    enabled: boolean;
    groqApiKey?: string;
    groqModel?: string;
    useKeyPool?: boolean;
    customAnalysisPrompt?: string;
    analysisTemperature?: number;
    enableAnalysis?: boolean;
}

// Storage key (must match AiSettings.tsx)
export const AI_SETTINGS_KEY = 'ai_settings';

// Defaults
export const OLLAMA_DEFAULT_ENDPOINT = 'http://192.168.2.147:11434';
export const DEFAULT_MODEL = 'ministral-3:3b';
export const DEFAULT_TEMPERATURE = 0.7;

// Available Groq models
export const GROQ_MODELS = [
    { value: 'llama3-8b-8192', label: 'Llama 3 8B (Rapide)', tokens: '8k' },
    { value: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B (Qualité)', tokens: '128k' },
    { value: 'llama-3.1-70b-versatile', label: 'Llama 3.1 70B (Qualité)', tokens: '128k' },
    { value: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B (Équilibré)', tokens: '32k' },
    { value: 'gemma2-9b-it', label: 'Gemma 2 9B', tokens: '8k' },
];

/**
 * Get settings from localStorage
 */
export function getStoredSettings(): AiSettings {
    if (typeof window === 'undefined') {
        return {
            provider: 'ollama',
            endpoint: OLLAMA_DEFAULT_ENDPOINT,
            model: DEFAULT_MODEL,
            temperature: DEFAULT_TEMPERATURE,
            enabled: false,
        };
    }

    try {
        const stored = localStorage.getItem(AI_SETTINGS_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            return {
                provider: parsed.provider || 'ollama',
                endpoint: parsed.endpoint || OLLAMA_DEFAULT_ENDPOINT,
                model: parsed.model || DEFAULT_MODEL,
                temperature: parsed.temperature ?? DEFAULT_TEMPERATURE,
                enabled: parsed.enabled ?? false,
                groqApiKey: parsed.groqApiKey,
                groqModel: parsed.groqModel,
                useKeyPool: parsed.useKeyPool,
                customAnalysisPrompt: parsed.customAnalysisPrompt,
                analysisTemperature: parsed.analysisTemperature,
                enableAnalysis: parsed.enableAnalysis,
            };
        }
    } catch {
        console.warn('[AI] Failed to parse stored settings');
    }

    return {
        provider: 'ollama',
        endpoint: OLLAMA_DEFAULT_ENDPOINT,
        model: DEFAULT_MODEL,
        temperature: DEFAULT_TEMPERATURE,
        enabled: false,
    };
}
