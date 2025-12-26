/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import {
    AiSettings, AiResponse, AiProvider, CompletionOptions,
    AI_SETTINGS_KEY, OLLAMA_DEFAULT_ENDPOINT, DEFAULT_MODEL, DEFAULT_TEMPERATURE, DEFAULT_GROQ_MODEL
} from './ai/ai-types';
import { completeWithOllama } from './ai/ollama-client';
import { completeWithGroq } from './ai/groq-client';
import { completeWithGemini } from './ai/gemini-completion-client';

export type { AiResponse, CompletionOptions, AiProvider, AiSettings };
export { OLLAMA_DEFAULT_ENDPOINT, DEFAULT_MODEL, DEFAULT_TEMPERATURE, GROQ_MODELS, DEFAULT_GROQ_MODEL } from './ai/ai-types';

function getStoredSettings(): AiSettings {
    const defaults: AiSettings = {
        provider: 'ollama', endpoint: OLLAMA_DEFAULT_ENDPOINT, model: DEFAULT_MODEL,
        temperature: DEFAULT_TEMPERATURE, enabled: true, groqApiKey: '',
        groqModel: DEFAULT_GROQ_MODEL, useKeyPool: false, enableAnalysis: true,
        geminiApiKey: '', geminiModel: '',
        ollamaEnabled: true, groqEnabled: true, geminiEnabled: true
    };
    if (typeof window === 'undefined') return defaults;
    try {
        const serviceId = (JSON.parse(localStorage.getItem('nextauth.message') || '{}')?.user as any)?.serviceId || 'default';
        const scopedKey = `${AI_SETTINGS_KEY}-${serviceId}`;
        const stored = localStorage.getItem(scopedKey);
        return stored ? { ...defaults, ...JSON.parse(stored) } : defaults;
    } catch { return defaults; }
}

export class LocalAiClient {
    private settings: AiSettings;
    private abortController: AbortController | null = null;

    constructor() {
        this.settings = getStoredSettings();
    }

    private updateSettingsProps() { this.settings = getStoredSettings(); }

    private shouldUseProxy(): boolean {
        if (typeof window === 'undefined') return false;
        if (this.settings.endpoint.includes('://ollama:')) return true;
        const isPageHttps = window.location.protocol === 'https:';
        const isEndpointHttp = this.settings.endpoint.startsWith('http:') && !this.settings.endpoint.includes('localhost') && !this.settings.endpoint.includes('127.0.0.1');
        if (isPageHttps && isEndpointHttp) return true;
        const isLocal = this.settings.endpoint.includes('localhost') || this.settings.endpoint.includes('127.0.0.1') || this.settings.endpoint.match(/192\.168\.\d+\.\d+/);
        const isDifferentOrigin = !window.location.hostname.match(/^(localhost|127\.0\.0\.1|192\.168\.)/);
        return !!(isLocal && isDifferentOrigin);
    }

    refreshSettings() { this.updateSettingsProps(); }
    abort() { this.abortController?.abort(); this.abortController = null; }
    isProcessing() { return !!this.abortController; }

    async checkAvailability(): Promise<boolean> {
        this.updateSettingsProps();
        if (this.settings.provider === 'groq') return !!this.settings.groqApiKey && this.settings.groqApiKey.length > 5;
        if (this.settings.provider === 'gemini') return !!this.settings.geminiApiKey && this.settings.geminiApiKey.length > 5;

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);
            const endpoint = this.shouldUseProxy() ? '/api/ai/ollama' : `${this.settings.endpoint}/api/tags`;
            const resp = await fetch(endpoint, { method: 'GET', signal: controller.signal });
            clearTimeout(timeoutId);
            return resp.ok;
        } catch {
            return false;
        }
    }

    async complete(prompt: string, systemPrompt?: string, options?: CompletionOptions): Promise<AiResponse> {
        this.updateSettingsProps();
        if (!this.settings.enabled) return { content: '', error: 'AI disabled' };

        // Check individual provider toggle
        const provider = this.settings.provider;
        if (provider === 'ollama' && this.settings.ollamaEnabled === false) return { content: '', error: 'Ollama est désactivé' };
        if (provider === 'groq' && this.settings.groqEnabled === false) return { content: '', error: 'Groq est désactivé' };
        if (provider === 'gemini' && this.settings.geminiEnabled === false) return { content: '', error: 'Gemini est désactivé' };

        this.abortController = new AbortController();
        const res = this.settings.provider === 'groq'
            ? await completeWithGroq(this.settings, prompt, systemPrompt, options, this.abortController)
            : this.settings.provider === 'gemini'
                ? await completeWithGemini(this.settings, prompt, systemPrompt, options, this.abortController)
                : await completeWithOllama(this.settings, prompt, systemPrompt, options, this.abortController, this.shouldUseProxy());
        this.abortController = null;
        return res;
    }

    async completeLocal(prompt: string, systemPrompt?: string): Promise<AiResponse> {
        this.updateSettingsProps();
        if (!this.settings.enabled) return { content: '', error: 'AI disabled' };
        this.abortController = new AbortController();
        const res = await completeWithOllama(this.settings, prompt, systemPrompt, {}, this.abortController, this.shouldUseProxy());
        this.abortController = null;
        return res;
    }

    // Getters for properties used by components
    get provider() { return this.settings.provider; }
    get model() { return this.settings.model; }
    get enabled() { return this.settings.enabled; }
    get groqModel() { return this.settings.groqModel || DEFAULT_GROQ_MODEL; }

    isAnalysisEnabled() { return this.settings.enableAnalysis !== false; }
    getCustomAnalysisPrompt() { return this.settings.customAnalysisPrompt; }
    getAnalysisTemperature() { return this.settings.analysisTemperature || 0.4; }
}

export const aiClient = new LocalAiClient();
