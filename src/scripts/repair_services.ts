import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function upsertSettings(serviceId: string, name: string, subtitle: string, color: string, slug: string) {
    // 1. Update Service Name & Slug
    await prisma.service.upsert({
        where: { id: serviceId },
        update: {
            name: name,
            slug: slug,
            isActive: true
        },
        create: {
            id: serviceId,
            name: name,
            slug: slug,
            isActive: true
        }
    });
    console.log(`✅ Service ${serviceId} corrigé -> ${name}`);

    // 2. Upsert Settings
    const settingsData = {
        serviceName: name,
        headerSubtitle: subtitle,
        primaryColor: color,
        logoUrl: "/logo-accueil-social.png",
        showCommunalLogo: true,
        requiredFields: "[]",
        colleagueBirthdays: "[]",
        availableYears: "[2024, 2025, 2026]"
    };

    const existingSettings = await prisma.settings.findFirst({ where: { serviceId: serviceId } });

    if (existingSettings) {
        await prisma.settings.update({
            where: { id: existingSettings.id },
            data: settingsData
        });
    } else {
        await prisma.settings.create({
            data: {
                serviceId: serviceId,
                ...settingsData
            }
        });
    }
    console.log(`   🎨 Paramètres appliqués pour ${name} (${color})`);
}

async function main() {
    console.log("🚑 Démarrage de la réparation des Services...");

    // 1. REPAIR 'default' -> PASQ (Blue)
    // CRITIQUE : Cela avait été écrasé par Jeunesse
    await upsertSettings(
        'default',
        'LE PÔLE ACCUEIL SOCIAL DES QUARTIERS',
        'PORTAIL DE GESTION',
        '#1e3a8a', // Bleu
        'pasq-default'
    );

    // 2. REPAIR 'jeunesse' -> Pôle Jeunesse (Orange)
    await upsertSettings(
        'jeunesse',
        'PÔLE JEUNESSE',
        'ACTION SOCIALE',
        '#ea580c', // Orange
        'pole-jeunesse'
    );

    // 3. CONFIRM 'mediation' -> Médiation (Vert)
    await upsertSettings(
        'mediation',
        'MÉDIATION LOCALE',
        'GESTION DES CONFLITS',
        '#059669', // Vert
        'mediation-locale'
    );

    // 4. CONFIRM 'assuetudes'
    await upsertSettings(
        'assuetudes',
        'CELLULE ASSUÉTUDES',
        'ACCOMPAGNEMENT SOCIAL',
        '#7c3aed', // Violet
        'cellule-assuetudes'
    );

    console.log("✅ Réparation terminée. Les identités sont rétablies.");
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
