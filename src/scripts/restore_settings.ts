import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const SERVICE_ID = 'default';

    console.log(`🔧 Restauration des paramètres pour le service: ${SERVICE_ID}`);

    // Données de configuration standards pour le PASQ
    const settingsData = {
        serviceName: "LE PÔLE ACCUEIL SOCIAL DES QUARTIERS",
        headerSubtitle: "PORTAIL DE GESTION",
        primaryColor: "#1e3a8a", // Bleu standard
        logoUrl: "/logo-accueil-social.png", // Logo commune
        showCommunalLogo: true,
        enableBirthdays: false,
        activeHolidayTheme: "NONE",
        // JSON strings for arrays
        requiredFields: "[]",
        colleagueBirthdays: "[]",
        availableYears: "[2024, 2025, 2026]"
    };

    // Check if settings exist
    const existingSettings = await prisma.settings.findFirst({
        where: { serviceId: SERVICE_ID }
    });

    if (existingSettings) {
        await prisma.settings.update({
            where: { id: existingSettings.id },
            data: settingsData
        });
        console.log("✅ Paramètres mis à jour.");
    } else {
        await prisma.settings.create({
            data: {
                serviceId: SERVICE_ID,
                ...settingsData
            }
        });
        console.log("✅ Paramètres créés.");
    }
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
