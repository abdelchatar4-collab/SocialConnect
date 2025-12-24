import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("🧹 Nettoyage des doublons...");

    // IDs identified in previous step
    const toDeleteIds = [
        '127cf9a0-6748-4714-9e65-89910e13eefe', // Sedia
        '4aaa6c99-7c32-492b-a597-aa354d7f3017'  // Louise & Pascal
    ];

    const result = await prisma.gestionnaire.deleteMany({
        where: {
            id: { in: toDeleteIds }
        }
    });

    console.log(`✅ ${result.count} gestionnaires supprimés.`);
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
