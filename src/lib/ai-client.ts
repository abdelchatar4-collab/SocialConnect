/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

/**
 * AI Client Abstraction Layer
 *
 * This module handles communication with AI models.
 * Supports multiple providers:
 * - Ollama (local)
 * - Groq (cloud, fast, free tier)
 *
 * Settings are loaded from localStorage for persistence across page refreshes.
 */

export interface AiResponse {
    content: string;
    error?: string;
}

/**
 * Options for completion calls - allows overriding default settings
 */
export interface CompletionOptions {
    temperature?: number;    // Override default temperature (0 for precise, higher for creative)
    maxTokens?: number;      // Override default max tokens
}

export type AiProvider = 'ollama' | 'groq';

export interface AiSettings {
    provider: AiProvider;
    endpoint: string;      // Ollama endpoint
    model: string;
    temperature: number;
    enabled: boolean;
    groqApiKey?: string;   // Groq API key (single key mode)
    groqModel?: string;    // Groq model (llama-3.1-8b-instant, mixtral-8x7b-32768, etc.)
    useKeyPool?: boolean;  // Use key pool instead of single key
    customAnalysisPrompt?: string; // Custom system prompt for analysis
    analysisTemperature?: number;  // Custom temperature for analysis
    enableAnalysis?: boolean;      // Enable/Disable AI analysis (tags detection)
}

// Storage key (must match AiSettings.tsx)
const AI_SETTINGS_KEY = 'ai_settings';

// Defaults
export const OLLAMA_DEFAULT_ENDPOINT = 'http://192.168.2.147:11434';
export const DEFAULT_MODEL = 'ministral-3:3b';
export const DEFAULT_TEMPERATURE = 0.7;
export const GROQ_API_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
export const DEFAULT_GROQ_MODEL = 'llama-3.1-8b-instant';

// Available Groq models
export const GROQ_MODELS = [
    { value: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B (Ultra-rapide)', tokens: '128k' },
    { value: 'llama-3.1-70b-versatile', label: 'Llama 3.1 70B (Qualité)', tokens: '128k' },
    { value: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B (Équilibré)', tokens: '32k' },
    { value: 'gemma2-9b-it', label: 'Gemma 2 9B', tokens: '8k' },
];

// Get settings from localStorage
function getStoredSettings(): AiSettings {
    const defaults: AiSettings = {
        provider: 'ollama',
        endpoint: OLLAMA_DEFAULT_ENDPOINT,
        model: DEFAULT_MODEL,
        temperature: DEFAULT_TEMPERATURE,
        enabled: true,
        groqApiKey: '',
        groqModel: DEFAULT_GROQ_MODEL,
        useKeyPool: false,
        enableAnalysis: true, // Default to true
    };

    if (typeof window === 'undefined') {
        return defaults; // SSR fallback
    }

    try {
        const stored = localStorage.getItem(AI_SETTINGS_KEY);
        if (stored) {
            return { ...defaults, ...JSON.parse(stored) };
        }
    } catch (e) {
        console.error('Failed to load AI settings:', e);
    }
    return defaults;
}

export class LocalAiClient {
    private settings: AiSettings;
    private abortController: AbortController | null = null;

    // Public properties (Restored)
    public model: string;
    public customEndpoint: string;
    public temperature: number;
    public enabled: boolean;
    public provider: AiProvider;
    public groqApiKey: string;
    public groqModel: string;
    public useKeyPool: boolean;
    public customAnalysisPrompt?: string;
    public analysisTemperature?: number;
    public enableAnalysis: boolean;

    constructor() {
        // Load from localStorage on creation
        const settings = getStoredSettings();
        this.settings = settings;

        this.customEndpoint = settings.endpoint;
        this.model = settings.model;
        this.temperature = settings.temperature;
        this.enabled = settings.enabled;
        this.provider = settings.provider;
        this.groqApiKey = settings.groqApiKey || '';
        this.groqModel = settings.groqModel || DEFAULT_GROQ_MODEL;
        this.useKeyPool = settings.useKeyPool || false;
        this.customAnalysisPrompt = settings.customAnalysisPrompt;
        this.analysisTemperature = settings.analysisTemperature;
        this.enableAnalysis = settings.enableAnalysis !== undefined ? settings.enableAnalysis : true;
    }

    /**
     * Determines if we should use the server-side proxy for Ollama.
     * Returns true when:
     * - Running in browser AND endpoint is a Docker-internal address (http://ollama:...)
     * - Or when endpoint contains 'localhost' but we're accessing from a different origin
     */
    private shouldUseProxy(): boolean {
        // Server-side rendering - no proxy needed
        if (typeof window === 'undefined') return false;

        // If endpoint is Docker-internal (like http://ollama:11434), use proxy
        if (this.customEndpoint.includes('://ollama:')) return true;

        // CRITICAL FIX: Mixed Content Detection
        // If we are on HTTPS and trying to access HTTP, we MUST use proxy
        // otherwise the browser triggers "Blocked loading mixed active content"
        const isPageHttps = window.location.protocol === 'https:';
        const isEndpointHttp = this.customEndpoint.startsWith('http:') && !this.customEndpoint.includes('localhost') && !this.customEndpoint.includes('127.0.0.1');

        if (isPageHttps && isEndpointHttp) {
            console.log('[AI] Mixed Content detected (HTTPS -> HTTP), enforcing proxy usage.');
            return true;
        }

        // If endpoint is localhost but we're on a different origin (e.g., pasqweb.org), use proxy
        const isLocalEndpoint = this.customEndpoint.includes('localhost') ||
            this.customEndpoint.includes('127.0.0.1') ||
            this.customEndpoint.match(/192\.168\.\d+\.\d+/);
        const isDifferentOrigin = !window.location.hostname.match(/^(localhost|127\.0\.0\.1|192\.168\.)/);

        if (isLocalEndpoint && isDifferentOrigin) return true;

        return false;
    }

    /**
     * Abort any ongoing AI request
     */
    abort() {
        if (this.abortController) {
            this.abortController.abort();
            this.abortController = null;
        }
    }

    /**
     * Check if a request is currently in progress
     */
    isProcessing(): boolean {
        return this.abortController !== null;
    }

    // Refresh settings from localStorage (call when settings might have changed)
    refreshSettings() {
        const settings = getStoredSettings();
        this.settings = settings;

        this.customEndpoint = settings.endpoint;
        this.model = settings.model;
        this.temperature = settings.temperature;
        this.enabled = settings.enabled;
        this.provider = settings.provider;
        this.groqApiKey = settings.groqApiKey || '';
        this.groqModel = settings.groqModel || DEFAULT_GROQ_MODEL;
        this.useKeyPool = settings.useKeyPool || false;

        // Update new properties
        this.customAnalysisPrompt = settings.customAnalysisPrompt;
        this.analysisTemperature = settings.analysisTemperature;
        this.enableAnalysis = settings.enableAnalysis !== undefined ? settings.enableAnalysis : true;
    }

    setModel(model: string) {
        this.model = model;
    }

    getModel() {
        return this.model;
    }

    setEndpoint(endpoint: string) {
        this.customEndpoint = endpoint;
    }

    getEndpoint() {
        return this.customEndpoint;
    }

    getCustomAnalysisPrompt() {
        return this.customAnalysisPrompt;
    }

    getAnalysisTemperature() {
        return this.analysisTemperature ?? 0;
    }

    isAnalysisEnabled() {
        return this.enableAnalysis;
    }

    /**
     * Checks if the AI is available (either Ollama or Groq).
     */
    async checkAvailability(): Promise<boolean> {
        this.refreshSettings();
        if (!this.enabled) {
            return false;
        }

        if (this.provider === 'groq') {
            // For Groq, just check if API key is present
            return !!this.groqApiKey && this.groqApiKey.length > 10;
        }

        // Ollama: check server availability
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);

            // Use proxy if needed
            const endpoint = this.shouldUseProxy()
                ? '/api/ai/ollama'
                : `${this.customEndpoint}/api/tags`;

            const response = await fetch(endpoint, {
                method: 'GET',
                signal: controller.signal,
            });

            clearTimeout(timeoutId);
            return response.ok;
        } catch (error) {
            console.warn('Local AI offline:', error);
            return false;
        }
    }

    /**
     * Sends a prompt to the AI (Ollama or Groq) and returns the generated text.
     * @param options Optional overrides for temperature/maxTokens
     */
    async complete(prompt: string, systemPrompt?: string, options?: CompletionOptions): Promise<AiResponse> {
        this.refreshSettings();

        if (!this.enabled) {
            return { content: '', error: 'AI is disabled in settings' };
        }

        if (this.provider === 'groq') {
            return this.completeWithGroq(prompt, systemPrompt, options);
        }

        return this.completeWithOllama(prompt, systemPrompt, options);
    }

    /**
     * Forces completion using Ollama (local) only.
     * Use this for privacy-sensitive operations where data should not leave the local network.
     * For example: Report generation with aggregated user data.
     */
    async completeLocal(prompt: string, systemPrompt?: string): Promise<AiResponse> {
        this.refreshSettings();

        if (!this.enabled) {
            return { content: '', error: 'AI is disabled in settings' };
        }

        // Always use Ollama regardless of provider setting
        return this.completeWithOllama(prompt, systemPrompt);
    }

    /**
     * Checks if local AI (Ollama) is specifically available.
     */
    async checkLocalAvailability(): Promise<boolean> {
        this.refreshSettings();
        if (!this.enabled) return false;

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);

            // Use proxy if needed
            const endpoint = this.shouldUseProxy()
                ? '/api/ai/ollama'
                : `${this.customEndpoint}/api/tags`;

            const response = await fetch(endpoint, {
                method: 'GET',
                signal: controller.signal,
            });

            clearTimeout(timeoutId);
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    /**
     * Complete using Groq API (OpenAI-compatible format)
     * Supports both single key mode and key pool mode with automatic rotation
     */
    private async completeWithGroq(prompt: string, systemPrompt?: string, options?: CompletionOptions): Promise<AiResponse> {
        // Import key pool functions dynamically to avoid circular deps
        const { getNextAvailableKey, markKeyAsUsed, markKeyAsRateLimited, hasAvailableKeys } = await import('./groq-key-pool');

        // Determine which key to use
        let apiKey: string | null = null;
        let usingPool = false;

        if (this.useKeyPool && hasAvailableKeys()) {
            apiKey = getNextAvailableKey();
            usingPool = true;
        } else if (this.groqApiKey) {
            apiKey = this.groqApiKey;
        }

        if (!apiKey) {
            return { content: '', error: 'Aucune clé API Groq disponible' };
        }

        try {
            // Create abort controller for this request
            this.abortController = new AbortController();

            const messages = [];
            if (systemPrompt) {
                messages.push({ role: 'system', content: systemPrompt });
            }
            messages.push({ role: 'user', content: prompt });

            const response = await fetch(GROQ_API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: this.groqModel,
                    messages: messages,
                    temperature: options?.temperature ?? this.temperature,
                    max_tokens: options?.maxTokens ?? 8192,
                }),
                signal: this.abortController.signal,
            });

            // Handle rate limiting
            if (response.status === 429) {
                const retryAfter = parseInt(response.headers.get('retry-after') || '60', 10);

                if (usingPool) {
                    // Mark this key as rate limited and try another
                    markKeyAsRateLimited(apiKey, retryAfter);
                    console.warn(`Groq key rate limited, switching to next key...`);

                    // Recursive retry with next key
                    return this.completeWithGroq(prompt, systemPrompt);
                } else {
                    return { content: '', error: `Limite de requêtes atteinte. Réessayez dans ${retryAfter}s` };
                }
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error?.message || `Groq Error: ${response.status}`);
            }

            // Mark key as used (for pool tracking)
            if (usingPool) {
                markKeyAsUsed(apiKey);
            }

            const data = await response.json();
            this.abortController = null; // Clear controller on success
            return { content: data.choices[0]?.message?.content || '' };

        } catch (error: any) {
            this.abortController = null; // Clear controller on error

            // Check if this was an abort
            if (error.name === 'AbortError') {
                return { content: '', error: 'Requête annulée' };
            }

            console.error('Groq completion failed:', error);
            return { content: '', error: error.message || 'Groq error' };
        }
    }

    /**
     * Complete using Ollama API
     * Automatically uses server-side proxy when needed (e.g., Docker network isolation)
     */
    private async completeWithOllama(prompt: string, systemPrompt?: string, options?: CompletionOptions): Promise<AiResponse> {
        try {
            // Create abort controller for this request
            this.abortController = new AbortController();

            const useProxy = this.shouldUseProxy();

            if (useProxy) {
                // Use server-side proxy
                console.log('[AI] Using server-side proxy for Ollama');
                const response = await fetch('/api/ai/ollama', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'generate',
                        model: this.model,
                        prompt: prompt,
                        system: systemPrompt,
                        temperature: options?.temperature ?? this.temperature,
                        maxTokens: options?.maxTokens ?? 8192,
                    }),
                    signal: this.abortController.signal,
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error || `Proxy Error: ${response.statusText}`);
                }

                const data = await response.json();
                this.abortController = null;
                return { content: data.response };
            }

            // Direct Ollama call
            const fullPrompt = systemPrompt
                ? `${systemPrompt}\n\nUser: ${prompt}\nAssistant:`
                : prompt;

            const body = {
                model: this.model,
                prompt: fullPrompt,
                stream: false,
                options: {
                    temperature: options?.temperature ?? this.temperature,
                }
            };

            const response = await fetch(`${this.customEndpoint}/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
                signal: this.abortController.signal,
            });

            if (!response.ok) {
                throw new Error(`AI Server Error: ${response.statusText}`);
            }

            const data = await response.json();
            this.abortController = null; // Clear controller on success
            return { content: data.response };

        } catch (error: any) {
            this.abortController = null; // Clear controller on error

            // Check if this was an abort
            if (error.name === 'AbortError') {
                return { content: '', error: 'Requête annulée' };
            }

            console.error('AI Completion failed:', error);
            return { content: '', error: error.message || 'Unknown error' };
        }
    }
}

// Singleton instance for the app
export const aiClient = new LocalAiClient();

