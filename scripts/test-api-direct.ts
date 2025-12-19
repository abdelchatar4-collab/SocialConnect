/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

// Supprimer cette ligne :
// 
async function testAPI() {
  console.log('🔍 Test direct de l\'API partenaires...');

  try {
    // Test sur différents ports possibles
    const ports = [3000, 3001, 3004, 3005];

    for (const port of ports) {
      console.log(`\n📡 Test sur le port ${port}...`);

      try {
        const response = await fetch(`http://localhost:${port}/api/partenaires`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log(`✅ Succès sur le port ${port}:`, data);
          break;
        } else {
          const errorText = await response.text();
          console.log(`❌ Erreur ${response.status}: ${errorText}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
        console.log(`❌ Connexion échouée sur le port ${port}:`, errorMessage);
      }
    }
  } catch (error) {
    console.error('❌ Erreur générale:', error instanceof Error ? error.message : 'Erreur inconnue');
  }
}

testAPI();
