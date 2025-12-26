/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Gemini Completion Client
*/

import { AiSettings, AiResponse, CompletionOptions, GEMINI_API_ENDPOINT } from './ai-types';

export async function completeWithGemini(
    settings: AiSettings,
    prompt: string,
    systemPrompt?: string,
    options?: CompletionOptions,
    abortController?: AbortController | null
): Promise<AiResponse> {
    try {
        const resp = await fetch('/api/ai/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt,
                systemPrompt,
                model: settings.geminiModel,
                temperature: options?.temperature ?? settings.temperature,
                maxTokens: options?.maxTokens ?? 4096,
            }),
            signal: abortController?.signal,
        });

        if (!resp.ok) {
            const errorData = await resp.json().catch(() => ({}));

            if (resp.status === 429) {
                return {
                    content: '',
                    error: "Quota API Gemini dépassé. Veuillez vérifier votre abonnement sur Google AI Studio."
                };
            }

            throw new Error(errorData.error || `Gemini Proxy Error: ${resp.status}`);
        }

        const data = await resp.json();
        return { content: data.content || '' };

    } catch (error: any) {
        if (error.name === 'AbortError') return { content: '', error: 'Requête annulée' };
        console.error('[Gemini Client] Proxy Error:', error);
        return { content: '', error: error.message || 'Gemini error' };
    }
}
