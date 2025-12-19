/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { NextRequest, NextResponse } from 'next/server';

/**
 * API Proxy for Ollama
 * This route proxies requests from the browser to Ollama running in Docker.
 * The server-side code can reach Ollama via Docker network.
 */

// Ollama endpoint - accessible from the Docker network
const OLLAMA_ENDPOINT = process.env.OLLAMA_ENDPOINT || 'http://ollama:11434';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, ...params } = body;

        let ollamaUrl: string;
        let ollamaBody: any;

        switch (action) {
            case 'generate':
                ollamaUrl = `${OLLAMA_ENDPOINT}/api/generate`;
                ollamaBody = {
                    model: params.model || 'qwen2.5:3b',
                    prompt: params.prompt,
                    system: params.system,
                    stream: false,
                    options: {
                        temperature: params.temperature ?? 0.7,
                        num_predict: params.maxTokens ?? 8192,
                    },
                };
                break;

            case 'chat':
                ollamaUrl = `${OLLAMA_ENDPOINT}/api/chat`;
                ollamaBody = {
                    model: params.model || 'qwen2.5:3b',
                    messages: params.messages,
                    stream: false,
                    options: {
                        temperature: params.temperature ?? 0.7,
                        num_predict: params.maxTokens ?? 8192,
                    },
                };
                break;

            case 'tags':
                // List available models
                const tagsResponse = await fetch(`${OLLAMA_ENDPOINT}/api/tags`);
                if (!tagsResponse.ok) {
                    throw new Error(`Ollama returned ${tagsResponse.status}`);
                }
                const tagsData = await tagsResponse.json();
                return NextResponse.json(tagsData);

            case 'ping':
                // Health check
                const pingResponse = await fetch(`${OLLAMA_ENDPOINT}/api/tags`, {
                    signal: AbortSignal.timeout(5000),
                });
                return NextResponse.json({
                    available: pingResponse.ok,
                    endpoint: OLLAMA_ENDPOINT
                });

            default:
                return NextResponse.json(
                    { error: 'Invalid action. Use: generate, chat, tags, or ping' },
                    { status: 400 }
                );
        }

        // Make the request to Ollama
        const response = await fetch(ollamaUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ollamaBody),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[Ollama Proxy] Error:', errorText);
            return NextResponse.json(
                { error: `Ollama error: ${response.status}`, details: errorText },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error: any) {
        console.error('[Ollama Proxy] Error:', error);
        return NextResponse.json(
            { error: error.message || 'Ollama proxy error' },
            { status: 500 }
        );
    }
}

// GET for health check
export async function GET() {
    try {
        const response = await fetch(`${OLLAMA_ENDPOINT}/api/tags`, {
            signal: AbortSignal.timeout(5000),
        });

        if (response.ok) {
            const data = await response.json();
            return NextResponse.json({
                status: 'ok',
                endpoint: OLLAMA_ENDPOINT,
                models: data.models?.map((m: any) => m.name) || []
            });
        }

        return NextResponse.json({
            status: 'error',
            endpoint: OLLAMA_ENDPOINT,
            message: `Ollama returned ${response.status}`
        }, { status: 503 });

    } catch (error: any) {
        return NextResponse.json({
            status: 'error',
            endpoint: OLLAMA_ENDPOINT,
            message: error.message
        }, { status: 503 });
    }
}
