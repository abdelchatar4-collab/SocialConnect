/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

async function testAPIEndpoints() {
  console.log('🌐 Test des endpoints API...');

  const baseUrl = 'http://localhost:3000'; // Ajustez selon votre port

  try {
    // Test 1: Récupérer les catégories
    console.log('\n1. Test /api/options/categories');
    const categoriesResponse = await fetch(`${baseUrl}/api/options/categories`);
    const categories = await categoriesResponse.json();
    console.log(`   ✅ ${categories.length} catégories trouvées`);

    // Test 2: Tester quelques catégories spécifiques
    const testCategories = ['etat', 'antenne', 'problematiques'];

    for (const category of testCategories) {
      console.log(`\n2. Test /api/options/${category}`);
      const response = await fetch(`${baseUrl}/api/options/${category}`);

      if (response.ok) {
        const options = await response.json();
        console.log(`   ✅ ${category}: ${options.length} options`);
        if (options.length > 0) {
          console.log(`   📝 Exemple: ${options[0].label}`);
        }
      } else {
        console.log(`   ❌ ${category}: Erreur ${response.status}`);
      }
    }

    console.log('\n✅ Tests API terminés!');

  } catch (error) {
    console.error('❌ Erreur lors des tests API:', error);
  }
}

// Exécuter seulement si le serveur est démarré
if (process.env.NODE_ENV !== 'production') {
  testAPIEndpoints();
}
