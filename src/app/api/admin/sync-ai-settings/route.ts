/*
Copyright (C) 2025 ABDEL KADER CHATAR
*/

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

// POST - Sync AI settings from default to ALL services
export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as { role?: string })?.role;
    if (userRole !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Forbidden - SUPER_ADMIN only' }, { status: 403 });
    }

    try {
        // Get default settings
        const defaultSettings = await prisma.settings.findFirst({
            where: { serviceId: 'default' }
        });

        if (!defaultSettings) {
            return NextResponse.json({ error: 'No default settings found' }, { status: 404 });
        }

        // Get all other settings
        const otherSettings = await prisma.settings.findMany({
            where: { serviceId: { not: 'default' } }
        });

        let updated = 0;
        for (const settings of otherSettings) {
            await prisma.settings.update({
                where: { id: settings.id },
                data: {
                    aiEnabled: defaultSettings.aiEnabled,
                    aiProvider: defaultSettings.aiProvider,
                    aiEndpoint: defaultSettings.aiEndpoint,
                    aiModel: defaultSettings.aiModel,
                    aiTemperature: defaultSettings.aiTemperature,
                    aiGroqApiKey: defaultSettings.aiGroqApiKey,
                    aiGroqModel: defaultSettings.aiGroqModel,
                    aiUseKeyPool: defaultSettings.aiUseKeyPool,
                    aiEnableAnalysis: defaultSettings.aiEnableAnalysis,
                    aiAnalysisTemperature: defaultSettings.aiAnalysisTemperature,
                    aiCustomAnalysisPrompt: defaultSettings.aiCustomAnalysisPrompt
                }
            });
            updated++;
        }

        return NextResponse.json({
            success: true,
            message: `AI settings synced to ${updated} service(s)`,
            updated
        });
    } catch (error: unknown) {
        console.error('[API POST /api/admin/sync-ai-settings] Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
