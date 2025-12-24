import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("🔍 Recherche des gestionnaires perdus (Louise, Pascal, Souaad)...");

    const targetNames = ['Louise', 'Pascal', 'Souaad', 'Souad']; // Adding variant for Souaad just in case

    const users = await prisma.gestionnaire.findMany({
        where: {
            prenom: { in: targetNames }
        }
    });

    console.log(`Trouvé ${users.length} gestionnaires correspondants.`);
    users.forEach(u => console.log(`- ${u.prenom} ${u.nom || ''} (Service actuel: ${u.serviceId})`));

    // Get Mediation Service ID
    // We explicitly set it to 'mediation' in previous steps, but let's confirm via slug just to be robust
    const mediationService = await prisma.service.findFirst({
        where: { slug: 'mediation-locale' }
    });

    if (!mediationService) {
        console.error("❌ Service Médiation introuvable !");
        return;
    }

    const targetServiceId = mediationService.id;
    console.log(`🎯 Cible : ${mediationService.name} (ID: ${targetServiceId})`);

    // Update them
    if (users.length > 0) {
        const result = await prisma.gestionnaire.updateMany({
            where: {
                id: { in: users.map(u => u.id) }
            },
            data: {
                serviceId: targetServiceId
            }
        });
        console.log(`✅ ${result.count} gestionnaires migrés vers Médiation.`);
    } else {
        console.log("⚠️ Aucun gestionnaire trouvé à migrer. Vérifiez les prénoms.");
    }
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
