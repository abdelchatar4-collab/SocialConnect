/*
Copyright (C) 2025 AC
SocialConnect - Partner Verification API
Verifies partner information using Gemini AI with web search
*/

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { verifyPartnerWithGemini } from '@/lib/ai/gemini-client';
import { getServiceClient } from '@/lib/prisma-clients';
import { getDynamicServiceId } from '@/lib/auth-utils';

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { partnerName, currentData } = body;

        if (!partnerName) {
            return NextResponse.json({ error: 'Nom du partenaire requis' }, { status: 400 });
        }

        // Fetch settings from Database
        const serviceId = await getDynamicServiceId(session);
        const prisma = getServiceClient(serviceId);
        const settings = await prisma.settings.findFirst();

        // Global AI Toggle Check
        if (settings && !settings.aiEnabled) {
            return NextResponse.json({
                error: "L'intelligence artificielle est désactivée dans les paramètres de l'application."
            }, { status: 403 });
        }

        // Gemini Specific Check
        if (settings && (settings as any).aiGeminiEnabled === false) {
            return NextResponse.json({
                error: "Le module Gemini est désactivé. Cette fonctionnalité nécessite Gemini."
            }, { status: 403 });
        }

        console.log('[Partner Verify] Verifying with DB Settings:', partnerName);

        const { result, error } = await verifyPartnerWithGemini(
            partnerName,
            currentData || {},
            {
                apiKey: (settings as any)?.aiGeminiApiKey || undefined,
                model: (settings as any)?.aiGeminiModel || undefined
            }
        );

        if (error) {
            return NextResponse.json({ error }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            verification: result
        });

    } catch (error: any) {
        console.error('[Partner Verify] Error:', error);
        return NextResponse.json({
            error: error.message || 'Erreur lors de la vérification'
        }, { status: 500 });
    }
}
