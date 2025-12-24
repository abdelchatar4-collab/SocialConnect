const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        const gestionnaires = await prisma.gestionnaire.findMany();
        console.log('--- GESTIONNAIRES ---');
        console.log(JSON.stringify(gestionnaires, null, 2));
        console.log('Total:', gestionnaires.length);
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
