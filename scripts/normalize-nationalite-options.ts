/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function normalizeNationaliteOptions() {
  console.log('🔧 Normalisation des options "nationalite" (value === label) ...');

  const options = await prisma.dropdownOption.findMany({
    where: { type: 'nationalite' },
  });

  console.log(`📦 Options chargées: ${options.length}`);

  let updatedOptions = 0;
  let deletedDuplicates = 0;
  let updatedUsers = 0;

  for (const opt of options) {
    const desiredValue = opt.label; // règle: value doit être exactement égal au label
    const oldValue = opt.value;

    // Rien à faire si déjà normalisé
    if (oldValue === desiredValue) continue;

    // Mettre à jour les usagers qui pointent l'ancienne valeur (slug) vers la nouvelle valeur (label)
    const userUpdate = await prisma.user.updateMany({
      where: { nationalite: oldValue },
      data: { nationalite: desiredValue },
    });
    if (userUpdate.count > 0) {
      updatedUsers += userUpdate.count;
      console.log(`👤 Usagers migrés: ${userUpdate.count} (${oldValue} -> ${desiredValue})`);
    }

    // Vérifier si une option avec la valeur cible existe déjà
    const existing = await prisma.dropdownOption.findFirst({
      where: { type: 'nationalite', value: desiredValue },
    });

    if (existing) {
      // Une option canonique existe déjà -> supprimer l'option en double
      await prisma.dropdownOption.delete({
        where: { id: opt.id },
      });
      deletedDuplicates++;
      console.log(`🗑️  Doublon supprimé: ${opt.id} (value="${oldValue}") -> gardé "${desiredValue}"`);
    } else {
      // Mettre à jour l’option pour aligner value sur label
      await prisma.dropdownOption.update({
        where: { id: opt.id },
        data: {
          value: desiredValue,
          // on conserve le label tel quel
          label: opt.label,
        },
      });
      updatedOptions++;
      console.log(`✅ Option mise à jour: "${oldValue}" -> "${desiredValue}"`);
    }
  }

  // Petit contrôle final
  const finalOptions = await prisma.dropdownOption.findMany({
    where: { type: 'nationalite' },
  });
  const notNormalized = finalOptions.filter(o => o.value !== o.label);

  console.log('🎉 Normalisation terminée.');
  console.log(`   - Options mises à jour: ${updatedOptions}`);
  console.log(`   - Options doublons supprimées: ${deletedDuplicates}`);
  console.log(`   - Usagers migrés: ${updatedUsers}`);
  if (notNormalized.length > 0) {
    console.warn(`   - ATTENTION: ${notNormalized.length} option(s) non normalisée(s) trouvée(s).`);
    notNormalized.forEach(o => console.warn(`     • ${o.id}: value="${o.value}" label="${o.label}"`));
  } else {
    console.log('   - Toutes les options "nationalite" sont bien normalisées (value === label).');
  }
}

normalizeNationaliteOptions()
  .then(() => {
    console.log('✅ Script terminé avec succès');
  })
  .catch((error) => {
    console.error('❌ Erreur:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
