/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - AI Types and Constants
*/

export interface AiResponse {
    content: string;
    error?: string;
}

export interface CompletionOptions {
    temperature?: number;
    maxTokens?: number;
}

export type AiProvider = 'ollama' | 'groq' | 'gemini';

export interface AiSettings {
    provider: AiProvider;
    endpoint: string;
    model: string;
    temperature: number;
    enabled: boolean;
    groqEnabled?: boolean;
    geminiEnabled?: boolean;
    ollamaEnabled?: boolean;
    groqApiKey?: string;
    groqModel?: string;
    useKeyPool?: boolean;
    geminiApiKey?: string;
    geminiModel?: string;
    customAnalysisPrompt?: string;
    analysisTemperature?: number;
    enableAnalysis?: boolean;
}

export const AI_SETTINGS_KEY = 'ai_settings';
export const OLLAMA_DEFAULT_ENDPOINT = 'http://192.168.2.147:11434';
export const DEFAULT_MODEL = 'ministral-3:3b';
export const DEFAULT_TEMPERATURE = 0.7;
export const GROQ_API_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
export const DEFAULT_GROQ_MODEL = 'llama-3.1-8b-instant';
export const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';
export const DEFAULT_GEMINI_MODEL = 'gemini-3-flash-preview';

export const GROQ_MODELS = [
    { value: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B (Ultra-rapide)', tokens: '128k' },
    { value: 'llama-3.1-70b-versatile', label: 'Llama 3.1 70B (Qualité)', tokens: '128k' },
    { value: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B (Équilibré)', tokens: '32k' },
    { value: 'gemma2-9b-it', label: 'Gemma 2 9B', tokens: '8k' },
];

export const GEMINI_MODELS = [
    { value: 'gemini-3-flash-preview', label: 'Gemini 3.0 Flash (Ultime Rapide)', tokens: '1M' },
    { value: 'gemini-3-pro-preview', label: 'Gemini 3.0 Pro (Thinking)', tokens: '1M' },
    { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash (Standard)', tokens: '1M' },
    { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro (Qualité)', tokens: '2M' },
];

