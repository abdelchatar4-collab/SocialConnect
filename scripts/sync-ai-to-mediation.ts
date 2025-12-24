import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔄 Syncing AI settings from default to mediation...\n');

    // Get default settings
    const defaultSettings = await prisma.settings.findFirst({
        where: { serviceId: 'default' }
    });

    if (!defaultSettings) {
        console.log('❌ No default settings found');
        return;
    }

    console.log('Source (default):');
    console.log('  aiEnabled:', defaultSettings.aiEnabled);
    console.log('  aiProvider:', defaultSettings.aiProvider);
    console.log('  aiGroqApiKey:', defaultSettings.aiGroqApiKey ? '***PRESENT***' : 'NULL');
    console.log('  aiGroqModel:', defaultSettings.aiGroqModel);

    // Find mediation settings
    const mediationSettings = await prisma.settings.findFirst({
        where: { serviceId: 'mediation' }
    });

    if (!mediationSettings) {
        console.log('\n❌ No mediation settings found');
        return;
    }

    // Copy AI settings
    await prisma.settings.update({
        where: { id: mediationSettings.id },
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

    console.log('\n✅ AI Settings copied to mediation!');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
