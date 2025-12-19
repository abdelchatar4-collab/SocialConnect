/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { PrismaClient } from '@prisma/client';
import { defaultOptions } from '../src/services/optionsService';

const prisma = new PrismaClient();

interface LocalStorageOption {
  id: string;
  name: string;
  options: string[];
  description?: string;
  isSystem?: boolean;
}

async function migrateDropdownOptions() {
  console.log('🚀 Début de la migration des options de menu déroulant...');

  try {
    // 1. Vérifier les données existantes dans la base
    const existingCategories = await prisma.dropdownOption.groupBy({
      by: ['type'],
      _count: { type: true }
    });

    console.log('📊 Catégories existantes dans la base:', existingCategories);

    // 2. Migrer chaque catégorie d'options par défaut
    for (const optionSet of defaultOptions) {
      console.log(`\n📝 Migration de la catégorie: ${optionSet.name} (${optionSet.id})`);

      // Vérifier si la catégorie existe déjà
      const existingOptions = await prisma.dropdownOption.findMany({
        where: { type:optionSet.id }
      });

      if (existingOptions.length > 0) {
        console.log(`   ⚠️  Catégorie ${optionSet.id} existe déjà avec ${existingOptions.length} options`);

        // Vérifier s'il y a des options manquantes
        const existingValues = existingOptions.map(opt => opt.label);
        const missingOptions = optionSet.options.filter((opt: string) => !existingValues.includes(opt));

        if (missingOptions.length > 0) {
          console.log(`   ➕ Ajout de ${missingOptions.length} options manquantes:`, missingOptions);

          for (const option of missingOptions) {
            await prisma.dropdownOption.create({
              data: {
                type: optionSet.id,
                value: option.toLowerCase().replace(/\s+/g, '_'),
                label: option
              }
            });
          }
        } else {
          console.log(`   ✅ Toutes les options sont déjà présentes`);
        }
      } else {
        console.log(`   🆕 Création de la catégorie ${optionSet.id} avec ${optionSet.options.length} options`);

        // Créer toutes les options pour cette catégorie
        for (const option of optionSet.options) {
          await prisma.dropdownOption.create({
            data: {
              type: optionSet.id,
              value: option.toLowerCase().replace(/\s+/g, '_'),
              label: option
            }
          });
        }
      }
    }

    // 3. Vérification finale
    console.log('\n🔍 Vérification finale...');
    const finalCount = await prisma.dropdownOption.groupBy({
      by: ['type'],
      _count: { type: true }
    });

    console.log('📊 État final des catégories:', finalCount);

    console.log('\n✅ Migration terminée avec succès!');
    console.log('\n⚠️  IMPORTANT: Après validation, vous pourrez supprimer les références au localStorage.');

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter la migration
if (require.main === module) {
  migrateDropdownOptions()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

export { migrateDropdownOptions };
