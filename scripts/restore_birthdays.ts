
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    // 1. Find the record with data (ignoring empty arrays "[]")
    // We check for length > 2 because `[]` has length 2.
    const allSettings = await prisma.settings.findMany();
    const source = allSettings.find(s => s.colleagueBirthdays && s.colleagueBirthdays.length > 10);

    if (!source) {
        console.log('No source data found (no settings with significant colleagueBirthdays).');
        return;
    }

    console.log(`Found source data in Settings ID: ${source.id} (Service: ${source.serviceId})`);
    console.log(`Data length: ${source.colleagueBirthdays.length}`);

    // 2. Update 'default' service settings
    // We ensure we update the one being used.
    const targetServiceId = 'default';

    const target = await prisma.settings.findFirst({
        where: { serviceId: targetServiceId }
    });

    if (target) {
        await prisma.settings.update({
            where: { id: target.id },
            data: {
                colleagueBirthdays: source.colleagueBirthdays,
                enableBirthdays: true // Ensure it is enabled
            }
        });
        console.log(`Restored data to Settings ID ${target.id} (Service: ${targetServiceId})`);
    } else {
        console.log(`Target settings for service ${targetServiceId} not found. Creating it?`);
        // It should exist if user visited the page.
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
