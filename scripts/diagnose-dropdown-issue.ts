/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function diagnoseDropdownIssue() {
  console.log('🔍 Diagnostic des menus déroulants des partenaires...');

  try {
    // 1. Vérifier les options partenaires dans la DB
    const partenaires = await prisma.dropdownOption.findMany({
      where: { type: 'partenaire' },
      orderBy: { label: 'asc' }
    });

    console.log('\n📊 Options partenaires dans la base de données:');
    console.log(`Nombre total: ${partenaires.length}`);

    if (partenaires.length === 0) {
      console.log('❌ PROBLÈME: Aucune option partenaire trouvée dans la DB!');
      return;
    }

    console.log('\n📋 Liste des partenaires:');
    partenaires.forEach((p, index) => {
      console.log(`${index + 1}. ${p.label} (value: "${p.value}", id: ${p.id})`);
    });

    // 2. Tester l'API directement
    console.log('\n🌐 Test de l\'API /api/options/partenaire...');

    const response = await fetch('http://localhost:3000/api/options/partenaire');
    const apiData = await response.json();

    console.log('Status:', response.status);
    console.log('Données API:', JSON.stringify(apiData, null, 2));

    // 3. Vérifier le format des données
    if (Array.isArray(apiData)) {
      console.log(`\n✅ API retourne un tableau de ${apiData.length} éléments`);

      if (apiData.length > 0) {
        const firstItem = apiData[0];
        console.log('Premier élément:', firstItem);

        if (firstItem.value !== undefined && firstItem.label !== undefined) {
          console.log('✅ Format correct: { value, label }');
        } else {
          console.log('❌ PROBLÈME: Format incorrect, manque value ou label');
        }
      }
    } else {
      console.log('❌ PROBLÈME: L\'API ne retourne pas un tableau');
    }

  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error);
  } finally {
    await prisma.$disconnect();
  }
}

diagnoseDropdownIssue();
