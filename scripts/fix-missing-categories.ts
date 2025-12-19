/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixMissingCategories() {
  console.log('🔧 Correction des catégories manquantes...');

  // 1. Corriger 'revenu' en 'revenus'
  const updateRevenu = await prisma.dropdownOption.updateMany({
    where: { type: 'revenu' },
    data: { type: 'revenus' }
  });
  console.log(`✅ ${updateRevenu.count} options 'revenu' renommées en 'revenus'`);

  // 2. Ajouter les options 'premierContact' si elles n'existent pas
  const premierContactOptions = [
    'Téléphone',
    'Email',
    'Courrier',
    'Visite',
    'Autre'
  ];

  for (const option of premierContactOptions) {
    await prisma.dropdownOption.upsert({
      where: {
        type_value: {
          type: 'premierContact',
          value: option
        }
      },
      update: {},
      create: {
        type: 'premierContact',
        value: option,
        label: option
      }
    });
  }
  console.log(`✅ Options 'premierContact' ajoutées`);

  console.log('🎉 Correction terminée!');
}

fixMissingCategories()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
