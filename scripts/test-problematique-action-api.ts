/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testProblematiquesActionsAPI() {
  console.log('🔍 Test des endpoints pour problématiques et actions...');

  try {
    // Test direct de la base de données
    console.log('\n1. Test direct base de données:');
    const problematiques = await prisma.dropdownOption.findMany({
      where: { type:'problematique' },
      orderBy: { label: 'asc' } // Changer 'order' en 'label'
    });
    console.log(`   📊 Problématiques en DB: ${problematiques.length}`);
    problematiques.forEach(p => console.log(`      - ${p.label}`));

    const actions = await prisma.dropdownOption.findMany({
      where: { type:'action' },
      orderBy: { label: 'asc' } // Changer 'order' en 'label'
    });
    console.log(`   📊 Actions en DB: ${actions.length}`);
    actions.forEach(a => console.log(`      - ${a.label}`));

    // Test des endpoints API (si le serveur tourne)
    console.log('\n2. Test des endpoints API:');

    try {
      const baseUrl = 'http://localhost:3000';

      // Test problématiques
      const problematiquesResponse = await fetch(`${baseUrl}/api/options/problematique`);
      if (problematiquesResponse.ok) {
        const problematiquesAPI = await problematiquesResponse.json();
        console.log(`   ✅ API problématiques: ${problematiquesAPI.length} options`);
        problematiquesAPI.forEach((p: any) => console.log(`      - ${p.label}`));
      } else {
        console.log(`   ❌ API problématiques: Erreur ${problematiquesResponse.status}`);
        const errorText = await problematiquesResponse.text();
        console.log(`      Détail: ${errorText}`);
      }

      // Test actions
      const actionsResponse = await fetch(`${baseUrl}/api/options/action`);
      if (actionsResponse.ok) {
        const actionsAPI = await actionsResponse.json();
        console.log(`   ✅ API actions: ${actionsAPI.length} options`);
        actionsAPI.forEach((a: any) => console.log(`      - ${a.label}`));
      } else {
        console.log(`   ❌ API actions: Erreur ${actionsResponse.status}`);
        const errorText = await actionsResponse.text();
        console.log(`      Détail: ${errorText}`);
      }

    } catch (apiError) {
      console.log('   ⚠️  Serveur non accessible (normal si pas démarré)');
      console.log(`      Erreur: ${apiError}`);
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testProblematiquesActionsAPI();
