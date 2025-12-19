/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

// GET - Retrieve settings
export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Get the first (and only) settings record
        let settings = await prisma.settings.findFirst();

        // If no settings exist, create default settings
        if (!settings) {
            settings = await prisma.settings.create({
                data: {
                    serviceName: "LE PÔLE ACCUEIL SOCIAL DES QUARTIERS",
                    primaryColor: "#1e3a8a",
                    headerSubtitle: "PORTAIL DE GESTION",
                    showCommunalLogo: true,
                    requiredFields: [],
                    enableBirthdays: false,
                    colleagueBirthdays: [],
                    activeHolidayTheme: "NONE"
                }
            });
        }

        return NextResponse.json(settings);
    } catch (error: unknown) {
        console.error('[API GET /api/settings] Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorStack = error instanceof Error ? error.stack : undefined;
        return NextResponse.json({
            error: errorMessage,
            details: errorStack
        }, { status: 500 });
    }
}

// PUT - Update settings (Admin only)
export async function PUT(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as { role?: string })?.role;
    if (userRole !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { serviceName, logoUrl, primaryColor, headerSubtitle, showCommunalLogo, requiredFields, enableBirthdays, colleagueBirthdays, activeHolidayTheme } = body;

        // Get existing settings
        let settings = await prisma.settings.findFirst();

        console.log('[API PUT /api/settings] Received body:', JSON.stringify(body, null, 2));

        if (!settings) {
            console.log('[API PUT /api/settings] Creating new settings');
            // Create if doesn't exist
            settings = await prisma.settings.create({
                data: {
                    serviceName: serviceName || "LE PÔLE ACCUEIL SOCIAL DES QUARTIERS",
                    logoUrl: logoUrl || null,
                    primaryColor: primaryColor || "#1e3a8a",
                    headerSubtitle: headerSubtitle || "PORTAIL DE GESTION",
                    showCommunalLogo: showCommunalLogo !== undefined ? showCommunalLogo : true,
                    requiredFields: requiredFields || [],
                    enableBirthdays: enableBirthdays !== undefined ? enableBirthdays : false,
                    colleagueBirthdays: colleagueBirthdays || [],
                    activeHolidayTheme: activeHolidayTheme || "NONE"
                }
            });
        } else {
            console.log('[API PUT /api/settings] Updating existing settings ID:', settings.id);
            // Update existing settings
            try {
                settings = await prisma.settings.update({
                    where: { id: settings.id },
                    data: {
                        ...(serviceName !== undefined && { serviceName }),
                        ...(logoUrl !== undefined && { logoUrl }),
                        ...(primaryColor !== undefined && { primaryColor }),
                        ...(headerSubtitle !== undefined && { headerSubtitle }),
                        ...(showCommunalLogo !== undefined && { showCommunalLogo }),
                        ...(requiredFields !== undefined && { requiredFields }),
                        ...(enableBirthdays !== undefined && { enableBirthdays }),
                        ...(colleagueBirthdays !== undefined && { colleagueBirthdays }),
                        ...(activeHolidayTheme !== undefined && { activeHolidayTheme })
                    }
                });
                console.log('[API PUT /api/settings] Update successful');
            } catch (prismaError: unknown) {
                console.error('[API PUT /api/settings] Prisma Update Error:', prismaError);
                throw new Error(`Prisma Update Failed: ${prismaError instanceof Error ? prismaError.message : 'Unknown error'}`);
            }
        }

        return NextResponse.json(settings);
    } catch (error: unknown) {
        console.error('[API PUT /api/settings] Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorStack = error instanceof Error ? error.stack : undefined;
        return NextResponse.json({
            error: errorMessage,
            details: errorStack
        }, { status: 500 });
    }
}
