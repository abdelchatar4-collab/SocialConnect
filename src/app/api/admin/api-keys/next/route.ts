/*
Copyright (C) 2025 ABDEL KADER CHATAR
*/

import { NextRequest, NextResponse } from 'next/server';
import { getGlobalClient } from '@/lib/prisma-clients';

export async function GET(request: NextRequest) {
    const prisma = getGlobalClient();
    try {
        const provider = new URL(request.url).searchParams.get('provider') || 'groq';
        const key = await prisma.apiKey.findFirst({
            where: { provider, isActive: true, isRateLimited: false },
            orderBy: { lastUsedAt: 'asc' }
        });
        if (!key) return NextResponse.json({ error: 'No available keys' }, { status: 404 });

        await prisma.apiKey.update({
            where: { id: key.id },
            data: { lastUsedAt: new Date(), requestsToday: { increment: 1 } }
        });
        return NextResponse.json({ key: key.key, id: key.id });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to get key' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const prisma = getGlobalClient();
    try {
        const { id, retryAfterSeconds = 60 } = await request.json();
        if (!id) return NextResponse.json({ error: 'Missing key ID' }, { status: 400 });

        const expiryTime = new Date();
        expiryTime.setSeconds(expiryTime.getSeconds() + retryAfterSeconds);

        await prisma.apiKey.update({ where: { id }, data: { isRateLimited: true, rateLimitedUntil: expiryTime } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update key' }, { status: 500 });
    }
}
