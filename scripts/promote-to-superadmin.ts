/*
Script pour promouvoir un gestionnaire au rôle SUPER_ADMIN
Usage: npx ts-node scripts/promote-to-superadmin.ts "email@example.com"
*/

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function promoteToSuperAdmin(email: string) {
    if (!email) {
        console.error('❌ Veuillez fournir un email en argument');
        console.log('Usage: npx ts-node scripts/promote-to-superadmin.ts "email@example.com"');
        process.exit(1);
    }

    console.log(`🔍 Recherche du gestionnaire: ${email}`);

    const gestionnaire = await prisma.gestionnaire.findUnique({
        where: { email }
    });

    if (!gestionnaire) {
        console.error(`❌ Gestionnaire non trouvé avec l'email: ${email}`);
        process.exit(1);
    }

    console.log(`✅ Gestionnaire trouvé: ${gestionnaire.prenom} ${gestionnaire.nom}`);
    console.log(`   Rôle actuel: ${gestionnaire.role}`);

    if (gestionnaire.role === 'SUPER_ADMIN') {
        console.log('ℹ️ Ce gestionnaire est déjà SUPER_ADMIN');
        process.exit(0);
    }

    const updated = await prisma.gestionnaire.update({
        where: { email },
        data: { role: 'SUPER_ADMIN' }
    });

    console.log(`🎉 Gestionnaire promu avec succès!`);
    console.log(`   Nouveau rôle: ${updated.role}`);
    console.log(`\n💡 L'utilisateur doit se reconnecter pour que le changement prenne effet.`);
}

const email = process.argv[2];
promoteToSuperAdmin(email)
    .catch(console.error)
    .finally(() => prisma.$disconnect());
