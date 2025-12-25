/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - AI Settings Constants and Types
*/

import { DEFAULT_GROQ_MODEL } from '@/lib/ai-client';

export const AI_SETTINGS_KEY = 'ai_settings';
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
