/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Groq Client Logic
*/

import { AiSettings, AiResponse, CompletionOptions, GROQ_API_ENDPOINT } from './ai-types';

export async function completeWithGroq(
    settings: AiSettings,
    prompt: string,
    systemPrompt?: string,
    options?: CompletionOptions,
    abortController?: AbortController | null
): Promise<AiResponse> {
    const { getNextAvailableKey, markKeyAsUsed, markKeyAsRateLimited, hasAvailableKeys } = await import('../groq-key-pool');

    let apiKey = (settings.useKeyPool && hasAvailableKeys()) ? getNextAvailableKey() : settings.groqApiKey;
    if (!apiKey) return { content: '', error: 'Aucune clé API Groq disponible' };

    try {
        const messages = [];
        if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
        messages.push({ role: 'user', content: prompt });

        const resp = await fetch(GROQ_API_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
            body: JSON.stringify({
                model: settings.groqModel,
                messages: messages,
                temperature: options?.temperature ?? settings.temperature,
                max_tokens: options?.maxTokens ?? 8192,
            }),
            signal: abortController?.signal,
        });

        if (resp.status === 429) {
            const retryAfter = parseInt(resp.headers.get('retry-after') || '60', 10);
            if (settings.useKeyPool) {
                markKeyAsRateLimited(apiKey, retryAfter);
                return completeWithGroq(settings, prompt, systemPrompt, options, abortController);
            }
            return { content: '', error: `Limite atteinte. Réessayez dans ${retryAfter}s` };
        }

        if (!resp.ok) {
            const errorData = await resp.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `Groq Error: ${resp.status}`);
        }

        if (settings.useKeyPool) markKeyAsUsed(apiKey);
        const data = await resp.json();
        return { content: data.choices[0]?.message?.content || '' };

    } catch (error: any) {
        if (error.name === 'AbortError') return { content: '', error: 'Requête annulée' };
        return { content: '', error: error.message || 'Groq error' };
    }
}
