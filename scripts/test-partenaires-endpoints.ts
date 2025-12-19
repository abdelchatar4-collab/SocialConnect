/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

async function testPartenairesEndpoints() {
  console.log('🔍 Diagnostic des endpoints partenaires...');

  const baseUrl = 'http://localhost:3004'; // Port corrigé

  try {
    // Test 1: Endpoint /api/partenaires
    console.log('\n1. Test /api/partenaires');
    const partenaireResponse = await fetch(`${baseUrl}/api/partenaires`);
    console.log(`   Status: ${partenaireResponse.status}`);

    if (partenaireResponse.ok) {
      const partenaires = await partenaireResponse.json();
      console.log(`   ✅ ${partenaires.length} partenaires trouvés`);
      if (partenaires.length > 0) {
        console.log(`   📝 Premier partenaire: ${JSON.stringify(partenaires[0], null, 2)}`);
      } else {
        console.log('   ⚠️ Liste vide!');
      }
    } else {
      const errorText = await partenaireResponse.text();
      console.log(`   ❌ Erreur: ${errorText}`);
    }

    // Test 2: Endpoint /api/options/partenaire
    console.log('\n2. Test /api/options/partenaire');
    const optionsResponse = await fetch(`${baseUrl}/api/options/partenaire`);
    console.log(`   Status: ${optionsResponse.status}`);

    if (optionsResponse.ok) {
      const options = await optionsResponse.json();
      console.log(`   ✅ ${options.length} options trouvées`);
      if (options.length > 0) {
        console.log(`   📝 Première option: ${JSON.stringify(options[0], null, 2)}`);
      } else {
        console.log('   ⚠️ Liste vide!');
      }
    } else {
      const errorText = await optionsResponse.text();
      console.log(`   ❌ Erreur: ${errorText}`);
    }

    // Test 3: Vérification directe de la base de données
    console.log('\n3. Test direct base de données');
    const dbResponse = await fetch(`${baseUrl}/api/debug/partenaires`);
    if (dbResponse.ok) {
      const dbData = await dbResponse.json();
      console.log(`   📊 Données DB: ${JSON.stringify(dbData, null, 2)}`);
    }

    // Test 4: Tentative d'ajout d'un partenaire de test
    console.log('\n4. Test ajout partenaire');
    const addResponse = await fetch(`${baseUrl}/api/partenaires`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: 'Test Partenaire ' + Date.now() })
    });
    console.log(`   Status ajout: ${addResponse.status}`);

    if (addResponse.ok) {
      const newPartenaire = await addResponse.json();
      console.log(`   ✅ Partenaire ajouté: ${JSON.stringify(newPartenaire, null, 2)}`);
    } else {
      const errorText = await addResponse.text();
      console.log(`   ❌ Erreur ajout: ${errorText}`);
    }

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
  }
}

testPartenairesEndpoints();
