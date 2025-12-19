/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanUnknownOptions() {
  try {
    console.log('🧹 Nettoyage des options "unknown"...');

    // Supprimer toutes les options avec type "unknown"
    const deleted = await prisma.dropdownOption.deleteMany({
      where: { type:'unknown' }
    });

    console.log(`✅ ${deleted.count} options "unknown" supprimées`);

    // Vérifier le résultat
    const remaining = await prisma.dropdownOption.findMany({
      where: { type:'unknown' }
    });

    console.log(`📊 Options "unknown" restantes : ${remaining.length}`);

    // Afficher le nouveau total
    const total = await prisma.dropdownOption.count();
    console.log(`📈 Total d'options après nettoyage : ${total}`);

  } catch (error) {
    console.error('❌ Erreur lors du nettoyage :', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanUnknownOptions();
