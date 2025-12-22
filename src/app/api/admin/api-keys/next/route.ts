/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre.
*/

/**
 * Internal API endpoint for fetching raw API keys for AI client usage.
 * This endpoint returns unmasked keys and is intended for server-side use only.
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Get the next available key for use
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const provider = searchParams.get('provider') || 'groq';

        // Find an active, non-rate-limited key
        const key = await prisma.apiKey.findFirst({
            where: {
                provider,
                isActive: true,
                isRateLimited: false,
            },
            orderBy: {
                lastUsedAt: 'asc', // Least recently used first
            },
        });

        if (!key) {
            return NextResponse.json({ error: 'No available keys' }, { status: 404 });
        }

        // Update last used timestamp
        await prisma.apiKey.update({
            where: { id: key.id },
            data: {
                lastUsedAt: new Date(),
                requestsToday: { increment: 1 },
            },
        });

        return NextResponse.json({ key: key.key, id: key.id });
    } catch (error) {
        console.error('[API GET /api/admin/api-keys/next] Error:', error);
        return NextResponse.json({ error: 'Failed to get key' }, { status: 500 });
    }
}

// POST - Mark a key as rate limited
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, retryAfterSeconds = 60 } = body;

        if (!id) {
            return NextResponse.json({ error: 'Missing key ID' }, { status: 400 });
        }

        const expiryTime = new Date();
        expiryTime.setSeconds(expiryTime.getSeconds() + retryAfterSeconds);

        await prisma.apiKey.update({
            where: { id },
            data: {
                isRateLimited: true,
                rateLimitedUntil: expiryTime,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[API POST /api/admin/api-keys/next] Error:', error);
        return NextResponse.json({ error: 'Failed to update key' }, { status: 500 });
    }
}
