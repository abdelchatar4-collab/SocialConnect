/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const statutsSejour = [
  'Belge',
  'Citoyen UE',
  'Titre de séjour valable',
  'Procédure en cours',
  'Sans-papiers',
  'Séjour limité (Carte A)',
  'Séjour illimité (Carte B)',
  'Etablissement (CARTE K)',
  'Résident de longue durée UE (CARTE L)',
  'Enregistrement art. 8 DIR 2004/38/CE (CARTE EU)',
  'Séjour permanent art.19 DIR 2004/38/CE (CARTE EU +)',
  'Membre famille UE ART. 10 DIR 2004/38/CE (CARTE F)',
  'Autre'
];

const etats = [
  'Nouveau',
  'En attente',
  'Résolu',
  'Fermé',
  'Suspendu',
  'Autre'
];

async function addMissingOptions() {
  console.log('🚀 Ajout des options manquantes...');

  // Fonction helper pour créer ou mettre à jour une option
  async function createOrUpdateOption(type: string, value: string, label: string) {
    const existing = await prisma.dropdownOption.findFirst({
      where: { type:type,
        value: value
      }
    });

    if (!existing) {
      await prisma.dropdownOption.create({
        data: {
          type: type,
          value: value,
          label: label
        }
      });
    }
  }

  // Initialiser les statuts de séjour
  for (const statut of statutsSejour) {
    await createOrUpdateOption('statutSejour', statut, statut);
  }
  console.log('✅ Statuts de séjour initialisés');

  // Initialiser les états
  for (const etat of etats) {
    await createOrUpdateOption('etat', etat, etat);
  }
  console.log('✅ États du dossier initialisés');

  console.log('🎉 Options manquantes ajoutées avec succès!');
}

addMissingOptions()
  .then(() => {
    console.log('✅ Script terminé avec succès');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur lors de l\'ajout:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
