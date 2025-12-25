/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Ollama Client Logic
*/

import { AiSettings, AiResponse, CompletionOptions } from './ai-types';

export async function completeWithOllama(
    settings: AiSettings,
    prompt: string,
    systemPrompt?: string,
    options?: CompletionOptions,
    abortController?: AbortController | null,
    shouldUseProxy?: boolean
): Promise<AiResponse> {
    try {
        if (shouldUseProxy) {
            const response = await fetch('/api/ai/ollama', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'generate',
                    model: settings.model,
                    prompt: prompt,
                    system: systemPrompt,
                    temperature: options?.temperature ?? settings.temperature,
                    maxTokens: options?.maxTokens ?? 8192,
                }),
                signal: abortController?.signal,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Proxy Error: ${response.statusText}`);
            }

            const data = await response.json();
            return { content: data.response };
        }

        const fullPrompt = systemPrompt ? `${systemPrompt}\n\nUser: ${prompt}\nAssistant:` : prompt;
        const body = {
            model: settings.model,
            prompt: fullPrompt,
            stream: false,
            options: { temperature: options?.temperature ?? settings.temperature }
        };

        const response = await fetch(`${settings.endpoint}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            signal: abortController?.signal,
        });

        if (!response.ok) throw new Error(`AI Server Error: ${response.statusText}`);
        const data = await response.json();
        return { content: data.response };

    } catch (error: any) {
        if (error.name === 'AbortError') return { content: '', error: 'Requête annulée' };
        return { content: '', error: error.message || 'Unknown error' };
    }
}
