
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const email = 'admin@dev.local';
    console.log(`Checking for user: ${email}`);

    let user = await prisma.gestionnaire.findUnique({
        where: { email }
    });

    if (!user) {
        console.log('User not found. Seeding dev admin...');
        user = await prisma.gestionnaire.create({
            data: {
                email,
                prenom: 'Admin',
                nom: 'Développement',
                role: 'SUPER_ADMIN',
                serviceId: 'default',
                isActive: true,
                horaireHabituel: JSON.stringify({
                    name: "Horaire standard",
                    start: "09:00",
                    end: "17:00",
                    pause: 30,
                    standardDuration: 450
                })
            }
        });
        console.log('User created:', user);
    } else {
        console.log('User already exists:', user);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
