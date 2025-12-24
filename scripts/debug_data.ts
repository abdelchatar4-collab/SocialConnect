
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('--- GESTIONNAIRES ---');
    const gestionnaires = await prisma.gestionnaire.findMany();
    gestionnaires.forEach(g => {
        console.log(`ID: ${g.id} | Name: ${g.prenom} ${g.nom} | Role: ${g.role} | Service: ${g.serviceId}`);
    });

    console.log('\n--- SETTINGS ---');
    const settings = await prisma.settings.findMany();
    settings.forEach(s => {
        console.log(`ID: ${s.id} | ServiceID: ${s.serviceId} | Enabled: ${s.enableBirthdays} | DataLen: ${s.colleagueBirthdays ? s.colleagueBirthdays.length : 'NULL'}`);
        if (s.colleagueBirthdays) {
            console.log(`Preview: ${s.colleagueBirthdays.substring(0, 100)}`);
        }
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
