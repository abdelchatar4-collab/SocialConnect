import { getServiceClient } from '../src/lib/prisma-clients';
import { prisma } from '../src/lib/prisma';

async function verifyIsolation() {
    console.log('🛡️  VERIFICATION DU CLOISONNEMENT DES DONNÉES 🛡️\n');

    // 1. Contexte PASQ (Service par défaut)
    console.log('--- TEST 1 : Accès via Service DEFAULT (PASQ) ---');
    const pasqClient = getServiceClient('default');
    const pasqUsers = await pasqClient.user.count();
    console.log(`✅ Utilisateurs visibles pour PASQ : ${pasqUsers}`);

    // 2. Contexte Jeunesse (Nouveau service vide)
    console.log('\n--- TEST 2 : Accès via Service JEUNESSE ---');
    const jeunesseClient = getServiceClient('jeunesse');
    const jeunesseUsers = await jeunesseClient.user.count();
    console.log(`🔒 Utilisateurs visibles pour Pôle Jeunesse : ${jeunesseUsers}`);

    // 3. Vérification
    if (pasqUsers > 0 && jeunesseUsers === 0) {
        console.log('\n✨ SUCCÈS : Le cloisonnement fonctionne parfaitement !');
        console.log('Le PASQ voit ses dossiers. La Jeunesse ne voit RIEN (0 dossier).');
    } else {
        console.error('\n❌ ÉCHEC : Problème de cloisonnement détecté.');
    }
}

verifyIsolation()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
