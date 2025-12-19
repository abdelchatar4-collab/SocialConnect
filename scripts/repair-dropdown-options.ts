/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Données de référence complètes
const REFERENCE_DATA = {
  etat: ['Actif', 'Clôturé', 'Suspendu'],
  antenne: ['Antenne Centre', 'Antenne Cureghem', 'Antenne Bizet', 'Antenne Ouest', 'PILDA'],
  partenaire: ['CPAS', 'Mutuelle', 'Hôpital', 'Association', 'Autre'],
  nationalite: ['Belge', 'Française', 'Allemande', 'Italienne', 'Espagnole', 'Autre UE', 'Hors UE'],
  langue: ['Français', 'Néerlandais', 'Anglais', 'Arabe', 'Espagnol', 'Autre'],
  statutSejour: ['Belge', 'Citoyen UE', 'Titre de séjour valable', 'Procédure en cours', 'Sans-papiers'],
  typeLogement: ['Propriétaire', 'Locataire', 'Hébergé', 'Sans domicile', 'Autre'],
  situationFamiliale: ['Célibataire', 'Marié(e)', 'Divorcé(e)', 'Veuf/Veuve', 'Cohabitant(e)']
};

async function repairDropdownOptions() {
  console.log('🔧 === RÉPARATION DES OPTIONS DE MENU DÉROULANT ===\n');

  for (const [type, options] of Object.entries(REFERENCE_DATA)) {
    console.log(`🔄 Traitement de la catégorie: ${type}`);

    // Vérifier l'état actuel
    const existing = await prisma.dropdownOption.findMany({
      where: { type }
    });

    console.log(`  📊 Options existantes: ${existing.length}`);

    // Si pas d'options ou options incomplètes, recréer
    if (existing.length === 0 || existing.length < options.length) {
      console.log(`  🗑️  Suppression des options existantes...`);
      await prisma.dropdownOption.deleteMany({
        where: { type }
      });

      console.log(`  ➕ Création de ${options.length} nouvelles options...`);
      for (const option of options) {
        await prisma.dropdownOption.create({
          data: {
            type,
            value: option,
            label: option
          }
        });
      }
      console.log(`  ✅ Catégorie ${type} réparée`);
    } else {
      console.log(`  ✅ Catégorie ${type} déjà correcte`);
    }
  }

  // Nettoyage des doublons
  console.log('\n🧹 Nettoyage des doublons...');
  const allOptions = await prisma.dropdownOption.findMany();
  const seen = new Set();
  const duplicates = [];

  for (const option of allOptions) {
    const key = `${option.type}-${option.value}`;
    if (seen.has(key)) {
      duplicates.push(option.id);
    } else {
      seen.add(key);
    }
  }

  if (duplicates.length > 0) {
    await prisma.dropdownOption.deleteMany({
      where: { id: { in: duplicates } }
    });
    console.log(`🗑️  ${duplicates.length} doublons supprimés`);
  }

  console.log('\n🎉 Réparation terminée avec succès !');
}

repairDropdownOptions()
  .then(() => {
    console.log('\n✅ Script de réparation terminé');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erreur:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
