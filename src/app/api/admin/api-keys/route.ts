/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

/**
 * API Keys Management Endpoints
 *
 * Handles CRUD operations for API keys (Groq, etc.)
 * Keys are stored in the database for persistence across sessions.
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Mask API key for security (show only first 8 and last 4 chars)
function maskKey(key: string): string {
    if (key.length <= 12) return '****';
    return `${key.substring(0, 8)}...${key.substring(key.length - 4)}`;
}

// GET - List all API keys (masked)
export async function GET() {
    try {
        const keys = await prisma.apiKey.findMany({
            orderBy: { createdAt: 'desc' },
        });

        // Mask the keys for security
        const maskedKeys = keys.map(k => ({
            ...k,
            key: maskKey(k.key),
        }));

        return NextResponse.json(maskedKeys);
    } catch (error) {
        console.error('[API GET /api/admin/api-keys] Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch API keys' },
            { status: 500 }
        );
    }
}

// POST - Add a new API key
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { key, label, provider = 'groq' } = body;

        if (!key || key.length < 10) {
            return NextResponse.json(
                { error: 'Invalid API key' },
                { status: 400 }
            );
        }

        // Check for duplicates
        const existing = await prisma.apiKey.findFirst({
            where: { key },
        });

        if (existing) {
            return NextResponse.json(
                { error: 'This API key already exists' },
                { status: 409 }
            );
        }

        const newKey = await prisma.apiKey.create({
            data: {
                key,
                label: label || 'Sans nom',
                provider,
            },
        });

        return NextResponse.json({
            ...newKey,
            key: maskKey(newKey.key),
        });
    } catch (error) {
        console.error('[API POST /api/admin/api-keys] Error:', error);
        return NextResponse.json(
            { error: 'Failed to add API key' },
            { status: 500 }
        );
    }
}

// DELETE - Remove an API key by ID
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'Missing key ID' },
                { status: 400 }
            );
        }

        await prisma.apiKey.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[API DELETE /api/admin/api-keys] Error:', error);
        return NextResponse.json(
            { error: 'Failed to delete API key' },
            { status: 500 }
        );
    }
}
