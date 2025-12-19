/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkProblematiquesActions() {
  try {
    console.log('🔍 Vérification des problématiques et actions...');

    // Vérifier les problématiques
    const problematiques = await prisma.dropdownOption.findMany({
      where: { type:'problematique' }
    });
    console.log(`🔧 Problématiques trouvées : ${problematiques.length}`);

    if (problematiques.length > 0) {
      console.log('📋 Liste des problématiques :');
      problematiques.forEach((p, index) => {
        console.log(`  ${index + 1}. ${p.label} (type: ${p.type})`);
      });
    } else {
      console.log('❌ Aucune problématique trouvée avec le type "problematique"');
    }

    // Vérifier les actions
    const actions = await prisma.dropdownOption.findMany({
      where: { type:'action' }
    });
    console.log(`\n⚡ Actions trouvées : ${actions.length}`);

    if (actions.length > 0) {
      console.log('📋 Liste des actions :');
      actions.forEach((a, index) => {
        console.log(`  ${index + 1}. ${a.label} (type: ${a.type})`);
      });
    } else {
      console.log('❌ Aucune action trouvée avec le type "action"');
    }

    // Vérifier les types avec 's'
    const problematiquesPlural = await prisma.dropdownOption.findMany({
      where: { type:'problematiques' }
    });
    const actionsPlural = await prisma.dropdownOption.findMany({
      where: { type:'actions' }
    });

    console.log(`\n📊 Options avec 's' - Problématiques: ${problematiquesPlural.length}, Actions: ${actionsPlural.length}`);

    // Vérifier tous les types disponibles
    const uniqueTypes = await prisma.dropdownOption.groupBy({
      by: ['type'],
      _count: { type: true }
    });

    console.log('\n📈 Tous les types disponibles :');
    uniqueTypes.forEach(type => {
      console.log(`  - ${type.type}: ${type._count.type} options`);
    });

  } catch (error) {
    console.error('❌ Erreur lors de la vérification :', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProblematiquesActions();
