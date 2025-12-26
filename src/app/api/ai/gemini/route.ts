/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Gemini Proxy API
*/

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { getServiceClient } from '@/lib/prisma-clients';
import { getDynamicServiceId } from '@/lib/auth-utils';

const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { action, prompt, systemPrompt, model, temperature, maxTokens, apiKey: bodyApiKey } = body;

        // Fetch settings from Database as fallback
        const serviceId = await getDynamicServiceId(session);
        const prisma = getServiceClient(serviceId);
        const settings = await prisma.settings.findFirst();

        const apiKey = bodyApiKey || (settings as any)?.aiGeminiApiKey || process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return NextResponse.json({ error: 'Clé API Gemini non configurée' }, { status: 400 });
        }

        // Handle list models action
        if (action === 'models') {
            console.log(`[Gemini Proxy] Listing models for test (Key provided: ${!!apiKey})`);
            const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${apiKey}`);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('[Gemini Proxy] Models listing failed:', errorData);
                return NextResponse.json({
                    error: errorData.error?.message || `Gemini Error: ${response.status}`,
                    status: 'error'
                }, { status: response.status });
            }
            const data = await response.json();

            // We want exactly these categories, with better matching to avoid Flash/Pro confusion
            const targets = [
                { id: 'gemini-3-flash', label: 'Gemini 3.0 Flash' },
                { id: 'gemini-3-pro', label: 'Gemini 3.0 Pro' },
                { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
                { id: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
                { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' }
            ];

            const filteredModels = [];
            const seenTargetIds = new Set();
            const seenModelNames = new Set();

            // Match each target specifically
            for (const target of targets) {
                const bestMatch = (data.models || [])
                    .filter((m: any) => {
                        const name = m.name.replace('models/', '');
                        return m.supportedGenerationMethods.includes('generateContent') &&
                            (name === target.id || name.startsWith(`${target.id}-`) || name.startsWith(`${target.id}_`));
                    })
                    .sort((a: any, b: any) => a.name.length - b.name.length)[0]; // Pick the base version

                if (bestMatch) {
                    const modelName = bestMatch.name.replace('models/', '');
                    if (!seenModelNames.has(modelName)) {
                        filteredModels.push({
                            name: modelName,
                            displayName: target.label
                        });
                        seenModelNames.add(modelName);
                    }
                }
            }

            // Fallback for experimental models (like 2.0-exp) if not caught by targets
            if (filteredModels.length < 2) {
                const extras = (data.models || [])
                    .filter((m: any) => m.supportedGenerationMethods.includes('generateContent') && !m.name.includes('vision') && !m.name.includes('embedding'))
                    .slice(0, 5);

                for (const m of extras) {
                    const name = m.name.replace('models/', '');
                    if (!seenModelNames.has(name)) {
                        filteredModels.push({ name, displayName: m.displayName });
                        seenModelNames.add(name);
                    }
                }
            }

            console.log(`[Gemini Proxy] Returning ${filteredModels.length} unique models`);

            return NextResponse.json({
                status: 'success',
                models: filteredModels,
                count: filteredModels.length
            });
        }

        const modelId = model || (settings as any)?.aiGeminiModel || 'gemini-3-flash-preview';
        const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;

        console.log(`[Gemini Proxy] Calling ${modelId}`);

        const response = await fetch(`${GEMINI_API_ENDPOINT}/${modelId}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: fullPrompt }] }],
                generationConfig: {
                    temperature: temperature ?? settings?.aiTemperature ?? 0.7,
                    maxOutputTokens: maxTokens ?? 4096,
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('[Gemini Proxy] API Error:', errorData);

            if (response.status === 429) {
                return NextResponse.json({
                    error: "Quota API Gemini dépassé. Veuillez vérifier votre abonnement sur Google AI Studio."
                }, { status: 429 });
            }

            return NextResponse.json({
                error: errorData.error?.message || `Gemini Error: ${response.status}`
            }, { status: response.status });
        }

        const data = await response.json();
        const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!textContent) {
            return NextResponse.json({ error: 'Réponse vide de Gemini' }, { status: 500 });
        }

        return NextResponse.json({ content: textContent });

    } catch (error: any) {
        console.error('[Gemini Proxy] Global Error:', error);
        return NextResponse.json({
            error: error.message || 'Erreur lors de la communication avec Gemini'
        }, { status: 500 });
    }
}
