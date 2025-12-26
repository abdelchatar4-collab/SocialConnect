const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const soldes = await prisma.soldeConge.findMany({
        include: { gestionnaire: true }
    });
    console.log('--- SOLDES ---');
    soldes.forEach(s => {
        console.log(`ID: ${s.id}, Annee: ${s.annee}, Gest: ${s.gestionnaire.email}, ServiceGest: ${s.gestionnaire.serviceId}, HeuresSupp: ${s.heuresSupplementaires}`);
    });

    const gest = await prisma.gestionnaire.findMany();
    console.log('\n--- GESTIONNAIRES ---');
    gest.forEach(g => {
        console.log(`Email: ${g.email}, Role: ${g.role}, Service: ${g.serviceId}, ActiveCtx: ${g.lastActiveServiceId}`);
    });
}

main().catch(console.error).finally(() => prisma.$disconnect());
