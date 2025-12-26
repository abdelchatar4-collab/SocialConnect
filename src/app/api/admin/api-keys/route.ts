/*
Copyright (C) 2025 ABDEL KADER CHATAR
*/

import { NextRequest, NextResponse } from 'next/server';
import { getGlobalClient } from '@/lib/prisma-clients';

function maskKey(key: string): string {
    if (key.length <= 12) return '****';
    return `${key.substring(0, 8)}...${key.substring(key.length - 4)}`;
}

export async function GET() {
    const prisma = getGlobalClient();
    try {
        const keys = await prisma.apiKey.findMany({ orderBy: { createdAt: 'desc' } });
        const maskedKeys = keys.map(k => ({ ...k, key: maskKey(k.key) }));
        return NextResponse.json(maskedKeys);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch API keys' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const prisma = getGlobalClient();
    try {
        const { key, label, provider = 'groq' } = await request.json();
        if (!key || key.length < 10) return NextResponse.json({ error: 'Invalid API key' }, { status: 400 });

        const existing = await prisma.apiKey.findFirst({ where: { key } });
        if (existing) return NextResponse.json({ error: 'This API key already exists' }, { status: 409 });

        const newKey = await prisma.apiKey.create({ data: { key, label: label || 'Sans nom', provider } });
        return NextResponse.json({ ...newKey, key: maskKey(newKey.key) });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to add API key' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    const prisma = getGlobalClient();
    try {
        const id = new URL(request.url).searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'Missing key ID' }, { status: 400 });
        await prisma.apiKey.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete API key' }, { status: 500 });
    }
}
