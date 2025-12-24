import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function upsertSettings(serviceId: string, name: string, subtitle: string, color: string, slug: string) {
    // 1. Update Service Name
    // We try to find the service by slug OR id to be safe, but here we assume we might need to find them first
    // Actually, let's look them up by slug first if we can, or just update if we have the ID.
    // Since IDs might be random UUIDs (except 'default'), we'll search by Slug-ish or Name-ish.

    let service = null;

    // Attempt to find service
    if (serviceId === 'default') {
        service = await prisma.service.findUnique({ where: { id: 'default' } });
    } else {
        // Find by fuzzy name or slug
        service = await prisma.service.findFirst({
            where: {
                OR: [
                    { id: serviceId }, // In case it's a real ID
                    { slug: slug },
                    { name: { contains: name.split(' ')[0] } } // Fuzzy match first word
                ]
            }
        });
    }

    if (!service) {
        console.log(`⚠️ Service non trouvé pour : ${name} (${slug}) - Création...`);
        // Create if missing (should not happen for existing imports but good for safety)
        service = await prisma.service.create({
            data: {
                name: name,
                slug: slug,
                isActive: true
            }
        });
    } else {
        // Update Name
        await prisma.service.update({
            where: { id: service.id },
            data: { name: name, slug: slug }
        });
        console.log(`✅ Service renommé : ${name}`);
    }

    // 2. Upsert Settings
    const settingsData = {
        serviceName: name.toUpperCase(),
        headerSubtitle: subtitle,
        primaryColor: color,
        logoUrl: "/logo-accueil-social.png", // Use same logo for now? Or generic?
        showCommunalLogo: true,
        requiredFields: "[]",
        colleagueBirthdays: "[]",
        availableYears: "[2024, 2025, 2026]"
    };

    const existingSettings = await prisma.settings.findFirst({ where: { serviceId: service.id } });

    if (existingSettings) {
        await prisma.settings.update({
            where: { id: existingSettings.id },
            data: settingsData
        });
        console.log(`   🎨 Paramètres mis à jour pour ${name}`);
    } else {
        await prisma.settings.create({
            data: {
                serviceId: service.id,
                ...settingsData
            }
        });
        console.log(`   🎨 Paramètres créés pour ${name}`);
    }
}

async function main() {
    // 1. PASQ (Default) - Bleu
    // Just ensuring name is correct
    // await upsertSettings('default', 'Pôle Accueil Social des Quartiers', 'PORTAIL DE GESTION', '#1e3a8a', 'pasq-default');

    // 2. Médiation Locale - Vert
    // We verify what the ID/Slug is. The previous import script used 'mediation-locale' slug probably?
    // Let's search by slug 'mediation-locale' or name containing 'Médiation'
    let mediationService = await prisma.service.findFirst({ where: { slug: 'mediation-locale' } });
    if (!mediationService) {
        // Fallback search
        mediationService = await prisma.service.findFirst({ where: { name: { contains: 'Médiation' } } });
    }
    if (mediationService) {
        await upsertSettings(mediationService.id, 'MÉDIATION LOCALE', 'GESTION DES CONFLITS', '#059669', 'mediation-locale');
    } else {
        console.error("❌ Impossible de trouver le service Médiation Locale !");
    }


    // 3. Cellule Assuétudes - Violet/Indigo?
    // Search for "Service Assuétudes" to rename it
    let assuetudes = await prisma.service.findFirst({
        where: {
            OR: [{ name: { contains: 'Assuétude' } }, { slug: 'cellule-assuetudes' }]
        }
    });
    if (assuetudes) {
        await upsertSettings(assuetudes.id, 'CELLULE ASSUÉTUDES', 'ACCOMPAGNEMENT SOCIAL', '#7c3aed', 'cellule-assuetudes');
    } else {
        // Maybe create it? User asked for it.
        await upsertSettings('create-assuetudes', 'CELLULE ASSUÉTUDES', 'ACCOMPAGNEMENT SOCIAL', '#7c3aed', 'cellule-assuetudes');
    }

    // 4. Pôle Jeunesse - Orange?
    // Search for "Service Jeunesse"
    let jeunesse = await prisma.service.findFirst({
        where: {
            OR: [{ name: { contains: 'Jeunesse' } }, { slug: 'pole-jeunesse' }]
        }
    });
    if (jeunesse) {
        await upsertSettings(jeunesse.id, 'PÔLE JEUNESSE', 'ACTION SOCIALE', '#ea580c', 'pole-jeunesse');
    } else {
        await upsertSettings('create-jeunesse', 'PÔLE JEUNESSE', 'ACTION SOCIALE', '#ea580c', 'pole-jeunesse');
    }

}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
