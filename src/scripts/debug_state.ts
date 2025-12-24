import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'achatar@anderlecht.brussels';

    console.log("--- USER ---");
    const user = await prisma.gestionnaire.findUnique({
        where: { email },
        select: {
            email: true,
            role: true,
            serviceId: true,
            lastActiveServiceId: true
        }
    });
    console.log(user);

    console.log("\n--- SERVICES ---");
    const services = await prisma.service.findMany({
        select: { id: true, name: true, slug: true }
    });
    console.table(services);
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
