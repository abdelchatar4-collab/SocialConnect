/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mapping: source (singulier) -> cible (pluriel)
const MAPPINGS: Array<{ from: 'action' | 'problematique'; to: 'actions' | 'problematiques' }> = [
  { from: 'action', to: 'actions' },
  { from: 'problematique', to: 'problematiques' },
];

async function consolidateCategories() {
  const APPLY = process.argv.includes('--apply');
  console.log(`🔧 Consolidation des catégories d'options (dry-run=${!APPLY})`);
  const report: string[] = [];

  for (const { from, to } of MAPPINGS) {
    console.log(`\n=== ${from} -> ${to} ===`);

    const [sourceOptions, targetOptions] = await Promise.all([
      prisma.dropdownOption.findMany({ where: { type: from } }),
      prisma.dropdownOption.findMany({ where: { type: to } }),
    ]);

    const targetValues = new Set(targetOptions.map(o => o.value));
    const toCreate = sourceOptions.filter(o => !targetValues.has(o.value));
    const toSkip = sourceOptions.filter(o => targetValues.has(o.value));

    console.log(`📦 Source (${from}): ${sourceOptions.length} | 📦 Cible (${to}): ${targetOptions.length}`);
    console.log(`➕ À créer dans "${to}": ${toCreate.length}`);
    console.log(`⏩ Déjà présents dans "${to}" (skip): ${toSkip.length}`);
    console.log(`🗑️  À supprimer de "${from}": ${sourceOptions.length}`);

    report.push(
      `Catégorie ${from} -> ${to}: source=${sourceOptions.length}, create=${toCreate.length}, skip=${toSkip.length}, delete=${sourceOptions.length}`
    );

    if (!APPLY) continue;

    await prisma.$transaction(async (tx) => {
      // Créer les manquants dans la catégorie cible
      for (const opt of toCreate) {
        await tx.dropdownOption.create({
          data: { type: to, value: opt.value, label: opt.label },
        });
      }

      // Supprimer toutes les options de la catégorie source
      // (qu'elles aient été migrées ou en doublon avec la cible)
      for (const opt of sourceOptions) {
        await tx.dropdownOption.delete({ where: { id: opt.id } });
      }
    });

    console.log(`✅ Consolidation ${from} -> ${to} appliquée`);
  }

  console.log('\n=== Rapport ===');
  report.forEach(line => console.log('• ' + line));
}

consolidateCategories()
  .then(async () => {
    console.log('\n🎉 Terminé.');
  })
  .catch(async (err) => {
    console.error('❌ Erreur:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
