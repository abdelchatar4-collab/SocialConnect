/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

// Script pour ajouter des gestionnaires admin à la base de données
// Usage: npx ts-node scripts/add-admin.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔧 Ajout de gestionnaires admin...\n');

    // REMPLACEZ CES EMAILS PAR VOS PROPRES EMAILS GOOGLE
    const adminsToAdd = [
        {
            email: 'VOTRE_EMAIL_1@gmail.com',  // ⚠️ REMPLACER
            prenom: 'Prénom1',                  // ⚠️ REMPLACER
            nom: 'Nom1',                        // ⚠️ REMPLACER (optionnel)
            role: 'ADMIN'
        },
        {
            email: 'VOTRE_EMAIL_2@gmail.com',  // ⚠️ REMPLACER
            prenom: 'Prénom2',                  // ⚠️ REMPLACER
            nom: 'Nom2',                        // ⚠️ REMPLACER (optionnel)
            role: 'ADMIN'
        }
    ];

    for (const admin of adminsToAdd) {
        try {
            // Vérifier si l'email existe déjà
            const existing = await prisma.gestionnaire.findUnique({
                where: { email: admin.email }
            });

            if (existing) {
                console.log(`✅ Email déjà présent: ${admin.email} (${existing.role})`);

                // Mettre à jour le rôle si nécessaire
                if (existing.role !== admin.role) {
                    await prisma.gestionnaire.update({
                        where: { email: admin.email },
                        data: { role: admin.role }
                    });
                    console.log(`   ↳ Rôle mis à jour: ${existing.role} → ${admin.role}`);
                }
            } else {
                // Créer le nouveau gestionnaire
                const created = await prisma.gestionnaire.create({
                    data: {
                        email: admin.email,
                        prenom: admin.prenom,
                        nom: admin.nom || '',
                        role: admin.role
                    }
                });
                console.log(`✅ Gestionnaire créé: ${created.email} (${created.role})`);
            }
        } catch (error) {
            console.error(`❌ Erreur pour ${admin.email}:`, error);
        }
    }

    console.log('\n✨ Terminé !');
}

main()
    .catch((e) => {
        console.error('❌ Erreur fatale:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
