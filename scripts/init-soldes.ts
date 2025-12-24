
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const TARGET_EMAIL = 'achatar@anderlecht.brussels';
    const ANNEE = 2026;

    console.log('🚀 Démarrage de l\'initialisation des quotas 2026...');

    // 1. Récupérer tous les gestionnaires actifs
    const gestionnaires = await prisma.gestionnaire.findMany({
        where: { isActive: true }
    });

    console.log(`📋 ${gestionnaires.length} gestionnaires trouvés.`);

    // 2. Définir les quotas communs (minutes)
    const COMMON_QUOTAS = {
        consultationMedicale: 240,  // 04h00
        forceMajeure: 2250,        // 37h30
        congesReglementaires: 900, // 15h00
        creditHeures: 4500         // 75h00 (Max récup)
    };

    // 3. Définir les quotas spécifiques (Abdel Kader Chatar)
    const SPECIFIC_QUOTAS = {
        vacancesAnnuelles: 13050, // 217h30
        heuresSupplementaires: 815 // 13h35
    };

    for (const g of gestionnaires) {
        const isTarget = g.email === TARGET_EMAIL || (g.prenom === 'Abdel Kader' && g.nom === 'CHATAR');

        const quotasToApply = {
            ...COMMON_QUOTAS,
            vacancesAnnuelles: isTarget ? SPECIFIC_QUOTAS.vacancesAnnuelles : 0, // 0 par défaut pour les autres
            heuresSupplementaires: isTarget ? SPECIFIC_QUOTAS.heuresSupplementaires : 0
        };

        if (isTarget) {
            console.log(`👤 Application des quotas SPÉCIFIQUES pour : ${g.prenom} ${g.nom}`);
        } else {
            console.log(`👥 Application des quotas COMMUNS pour : ${g.prenom} ${g.nom}`);
        }

        await prisma.soldeConge.upsert({
            where: {
                gestionnaireId_annee: {
                    gestionnaireId: g.id,
                    annee: ANNEE
                }
            },
            update: quotasToApply,
            create: {
                gestionnaireId: g.id,
                annee: ANNEE,
                ...quotasToApply
            }
        });
    }

    console.log('✅ Terminé ! Tous les quotas ont été injectés.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
