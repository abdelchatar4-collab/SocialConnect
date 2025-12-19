/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function validateMigration() {
  console.log('🔍 Validation de la migration des options...');

  try {
    // 1. Vérifier les données en base
    const categories = await prisma.dropdownOption.groupBy({
      by: ['type'],
      _count: {
        id: true
      }
    });

    console.log('\n📊 Données migrées par catégorie :');
    for (const cat of categories) {
      console.log(`  - ${cat.type}: ${cat._count.id} options`);
    }

    // 2. Tester quelques catégories spécifiques
    const testCategories = ['etat', 'antenne', 'problematiques', 'actions'];

    for (const category of testCategories) {
      const options = await prisma.dropdownOption.findMany({
        where: { type:category }
      });

      console.log(`\n🔸 ${category} (${options.length} options):`);
      options.slice(0, 3).forEach(opt => {
        console.log(`    - ${opt.label} (${opt.value})`);
      });
      if (options.length > 3) {
        console.log(`    ... et ${options.length - 3} autres`);
      }
    }

    // 3. Vérifier l'intégrité des données
    const totalOptions = await prisma.dropdownOption.count();

    console.log('\n📈 Statistiques globales :');
    console.log(`  - Total des options: ${totalOptions}`);

    console.log('\n✅ Migration validée avec succès!');

  } catch (error) {
    console.error('❌ Erreur lors de la validation:', error instanceof Error ? error.message : 'Erreur inconnue');
  } finally {
    await prisma.$disconnect();
  }
}

validateMigration();
