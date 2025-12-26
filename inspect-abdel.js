const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = 'abdelchatar4@gmail.com';
    const gest = await prisma.gestionnaire.findUnique({
        where: { email },
        include: {
            soldeConges: { where: { annee: 2026 } },
            prestations: { where: { date: { gte: new Date('2026-01-01') } } }
        }
    });

    console.log('--- DONNEES ABDEL ---');
    console.log(JSON.stringify(gest, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
