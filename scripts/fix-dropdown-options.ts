/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixDropdownOptions() {
  console.log('🔧 Correction des options de menu déroulant...');

  // Supprimer les anciennes options d'état
  await prisma.dropdownOption.deleteMany({
    where: { type: 'etat' }
  });

  // Ajouter les bonnes options d'état
  const etatsCorrects = ['Actif', 'Clôturé', 'Suspendu'];

  for (const etat of etatsCorrects) {
    await prisma.dropdownOption.create({
      data: {
        type: 'etat',
        value: etat,
        label: etat
      }
    });
  }

  console.log('✅ Options d\'état corrigées');

  // Vérifier que toutes les autres catégories existent
  const categories = [
    { type: 'nationalite', options: ['Belge', 'Française', 'Autre'] },
    { type: 'partenaire', options: ['CPAS', 'Mutuelle', 'Hôpital', 'Autre'] },
    { type: 'antenne', options: ['Antenne Centre', 'Antenne Cureghem', 'Antenne Bizet', 'Antenne Ouest', 'PILDA'] }
  ];

  for (const category of categories) {
    const existing = await prisma.dropdownOption.findMany({
      where: { type: category.type }
    });

    if (existing.length === 0) {
      console.log(`➕ Ajout des options pour ${category.type}`);
      for (const option of category.options) {
        await prisma.dropdownOption.create({
          data: {
            type: category.type,
            value: option,
            label: option
          }
        });
      }
    }
  }

  console.log('🎉 Toutes les options ont été corrigées !');
}

fixDropdownOptions()
  .then(() => {
    console.log('✅ Script terminé avec succès');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
