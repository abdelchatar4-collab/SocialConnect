/*
Copyright (C) 2025 ABDEL KADER CHATAR
*/

import { NextRequest, NextResponse } from 'next/server';
import { getGlobalClient } from '@/lib/prisma-clients';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const prisma = getGlobalClient();
    try {
        const defaultSettings = await prisma.settings.findFirst({ where: { serviceId: 'default' } });
        if (!defaultSettings) return NextResponse.json({ error: 'No default settings found' }, { status: 404 });

        const otherSettings = await prisma.settings.findMany({ where: { serviceId: { not: 'default' } } });

        let updated = 0;
        for (const s of otherSettings) {
            await prisma.settings.update({
                where: { id: s.id },
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

        return NextResponse.json({ success: true, message: `AI settings synced to ${updated} service(s)`, updated });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
