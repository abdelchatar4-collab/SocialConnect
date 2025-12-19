/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateEtat() {
  try {
    const result = await prisma.user.updateMany({
      where: {
        etat: 'En cours'
      },
      data: {
        etat: 'Actif'
      }
    });

    console.log(`✅ ${result.count} dossiers mis à jour de "En cours" vers "Actif"`);
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateEtat();
