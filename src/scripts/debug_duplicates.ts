import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("🔍 Recherche des doublons...");

    const users = await prisma.gestionnaire.findMany({
        where: {
            OR: [
                { prenom: { contains: 'Souaad' } },
                { prenom: { contains: 'Souad' } },
                { prenom: { contains: 'Sedia' } },
                { nom: { contains: 'Sedia' } }, // au cas où
                { prenom: { contains: 'Pascal' } },
                { prenom: { contains: 'Louise' } }
            ]
        }
    });

    users.forEach(u => {
        console.log(`ID: ${u.id} | Prénom: ${u.prenom} | Nom: ${u.nom || '-'} | Service: ${u.serviceId} | Email: ${u.email || '-'}`);
    });
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
