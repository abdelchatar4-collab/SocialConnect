const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = 'achatar@anderlecht.brussels';
    const user = await prisma.gestionnaire.findUnique({ where: { email } });
    if (!user) { console.log('User not found'); return; }

    const prestations = await prisma.prestation.findMany({
        where: { gestionnaireId: user.id }
    });

    console.log(`Prestations pour ${email}:`);
    prestations.forEach(p => {
        console.log(`ID: ${p.id}, Date: ${p.date}, Service: ${p.serviceId}, Motif: ${p.motif}`);
    });

    const solde = await prisma.soldeConge.findMany({
        where: { gestionnaireId: user.id }
    });
    console.log(`\nSoldes pour ${email}:`);
    solde.forEach(s => {
        console.log(`Annee: ${s.annee}, HeuresSupp: ${s.heuresSupplementaires}`);
    });
}

main().catch(console.error).finally(() => prisma.$disconnect());
