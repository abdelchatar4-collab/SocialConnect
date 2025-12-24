import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Seeding Default Service...');

    // 1. Créer le Service par défaut (Pôle Inclusion / Vie Précaire)
    // Utilise l'ID 'default' pour matcher avec la valeur par défaut des colonnes serviceId
    const defaultService = await prisma.service.upsert({
        where: { id: 'default' },
        update: {
            name: 'Pôle Accueil Social Des Quartiers (PASQ)',
            slug: 'pasq',
            cluster: 'Pôle PASQ',
        },
        create: {
            id: 'default',
            name: 'Pôle Accueil Social Des Quartiers (PASQ)',
            slug: 'pasq',
            cluster: 'Pôle PASQ',
            description: 'Service principal par défaut.',
        },
    })

    console.log('✅ Service "default" created:', defaultService);

    // 2. Créer les autres services de la structure (pour le futur)
    const services = [
        { id: 'vie-precaire', name: 'Cellule Vie Précaire', slug: 'vie-precaire', cluster: 'Pôle Inclusion' },
        { id: 'assuetudes', name: 'Cellule Assuétudes', slug: 'assuetudes', cluster: 'Pôle Inclusion' },
        { id: 'cripa', name: 'Cellule CRIPA (Primo-Arrivants)', slug: 'cripa', cluster: 'Pôle Inclusion' },
        { id: 'jeunesse', name: 'Pôle Jeunesse', slug: 'jeunesse', cluster: 'Pôle Jeunesse' },
        { id: 'scolaire', name: 'Antenne Scolaire', slug: 'scolaire', cluster: 'Axe Accrochage Scolaire' },
        { id: 'mediation', name: 'Médiation Locale', slug: 'mediation', cluster: 'Pôle PASQ' },
    ];

    for (const s of services) {
        await prisma.service.upsert({
            where: { slug: s.slug },
            update: {},
            create: s,
        });
        console.log(`✅ Service "${s.name}" ensured.`);
    }

    console.log('🚀 Seeding complete.');
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
