/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/prisma-clients'; // ✅ Middleware import
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

// GET - Retrieve settings
export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 🔒 Multi-Tenant - Get Settings for THIS Service
    const serviceId = (session.user as any).serviceId || 'default';
    const prisma = getServiceClient(serviceId);

    try {
        // Get the first (and only) settings record FOR THIS SERVICE
        let settings = await prisma.settings.findFirst();

        // If no settings exist for this service, create default settings
        if (!settings) {
            // Note: Middleware will automatically inject serviceId: serviceId
            settings = await prisma.settings.create({
                data: {
                    serviceName: "Mon Nouveau Service (À Configurer)", // Generic default
                    primaryColor: "#1e3a8a",
                    headerSubtitle: "PORTAIL DE GESTION",
                    showCommunalLogo: true,
                    requiredFields: JSON.stringify([]),
                    enableBirthdays: false,
                    colleagueBirthdays: JSON.stringify([]),
                    activeHolidayTheme: "NONE",
                    availableYears: JSON.stringify([new Date().getFullYear(), new Date().getFullYear() + 1]),
                    enabledModules: JSON.stringify({
                        housingAnalysis: true,
                        statsDashboard: true,
                        exportData: true,
                        documents: true
                    }),
                    absenceNotificationEmail: null,
                    sharepointUrl: null,
                    sharepointUrlAdmin: null
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

    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as { role?: string })?.role;
    if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // 🔒 Multi-Tenant - Update Settings for THIS Service
    const serviceId = (session.user as any).serviceId || 'default';
    const prisma = getServiceClient(serviceId);

    try {
        const body = await request.json();
        const {
            serviceName, logoUrl, primaryColor, headerSubtitle, showCommunalLogo,
            requiredFields, enableBirthdays, colleagueBirthdays, activeHolidayTheme, availableYears,
            // AI Settings
            aiEnabled, aiProvider, aiEndpoint, aiModel, aiTemperature,
            aiGroqApiKey, aiGroqModel, aiUseKeyPool, aiEnableAnalysis, aiAnalysisTemperature, aiCustomAnalysisPrompt,
            // Feature Toggles (Modules)
            enabledModules,
            // Column Visibility Settings
            visibleColumns,
            // Form Section Visibility Settings
            visibleFormSections,
            // Document Settings
            docRetentionPeriod, docServiceAddress, docServiceCity, docServicePhone,
            docFooterText, docRgpdTitle, docRgpdSections, docUserProfileSections, docAntenneAddresses
        } = body;

        // Get existing settings
        let settings = await prisma.settings.findFirst();

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
                    activeHolidayTheme: activeHolidayTheme || "NONE",
                    availableYears: availableYears || JSON.stringify([new Date().getFullYear(), new Date().getFullYear() + 1]),
                    enabledModules: enabledModules || JSON.stringify({
                        housingAnalysis: true,
                        statsDashboard: true,
                        exportData: true,
                        documents: true
                    }),
                    // AI Settings with defaults
                    aiEnabled: aiEnabled ?? true,
                    aiProvider: aiProvider || "ollama",
                    aiEndpoint: aiEndpoint || "http://192.168.2.147:11434",
                    aiModel: aiModel || "qwen2.5:3b",
                    aiTemperature: aiTemperature ?? 0.7,
                    aiGroqApiKey: aiGroqApiKey || null,
                    aiGroqModel: aiGroqModel || "llama-3.1-8b-instant",
                    aiUseKeyPool: aiUseKeyPool ?? false,
                    aiEnableAnalysis: aiEnableAnalysis ?? true,
                    aiAnalysisTemperature: aiAnalysisTemperature ?? 0,
                    aiCustomAnalysisPrompt: aiCustomAnalysisPrompt || null,
                    visibleColumns: visibleColumns || null,
                    visibleFormSections: visibleFormSections || null
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
                        ...(activeHolidayTheme !== undefined && { activeHolidayTheme }),
                        ...(availableYears !== undefined && { availableYears }),
                        ...(enabledModules !== undefined && { enabledModules }),
                        // AI Settings
                        ...(aiEnabled !== undefined && { aiEnabled }),
                        ...(aiProvider !== undefined && { aiProvider }),
                        ...(aiEndpoint !== undefined && { aiEndpoint }),
                        ...(aiModel !== undefined && { aiModel }),
                        ...(aiTemperature !== undefined && { aiTemperature }),
                        ...(aiGroqApiKey !== undefined && { aiGroqApiKey }),
                        ...(aiGroqModel !== undefined && { aiGroqModel }),
                        ...(aiUseKeyPool !== undefined && { aiUseKeyPool }),
                        ...(aiEnableAnalysis !== undefined && { aiEnableAnalysis }),
                        ...(aiAnalysisTemperature !== undefined && { aiAnalysisTemperature }),
                        ...(aiCustomAnalysisPrompt !== undefined && { aiCustomAnalysisPrompt }),
                        ...(visibleColumns !== undefined && { visibleColumns }),
                        ...(visibleFormSections !== undefined && { visibleFormSections }),
                        // Document Settings
                        ...(docRetentionPeriod !== undefined && { docRetentionPeriod }),
                        ...(docServiceAddress !== undefined && { docServiceAddress }),
                        ...(docServiceCity !== undefined && { docServiceCity }),
                        ...(docServicePhone !== undefined && { docServicePhone }),
                        ...(docFooterText !== undefined && { docFooterText }),
                        ...(docRgpdTitle !== undefined && { docRgpdTitle }),
                        ...(docRgpdSections !== undefined && { docRgpdSections }),
                        ...(docUserProfileSections !== undefined && { docUserProfileSections }),
                        ...(docAntenneAddresses !== undefined && { docAntenneAddresses }),
                        ...(body.absenceNotificationEmail !== undefined && { absenceNotificationEmail: body.absenceNotificationEmail }),
                        ...(body.sharepointUrl !== undefined && { sharepointUrl: body.sharepointUrl }),
                        ...(body.sharepointUrlAdmin !== undefined && { sharepointUrlAdmin: body.sharepointUrlAdmin })
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
