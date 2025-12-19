/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function promoteToAdmin() {
  console.log('🔧 Promotion d\'un utilisateur en administrateur...');

  try {
    // Remplacez par votre adresse email
    const EMAIL_TO_PROMOTE = 'achatar@anderlecht.brussels'; // ⚠️ MODIFIEZ CETTE LIGNE

    // Vérifier si l'utilisateur existe
    const gestionnaire = await prisma.gestionnaire.findUnique({
      where: { email: EMAIL_TO_PROMOTE }
    });

    if (!gestionnaire) {
      console.log(`❌ Aucun gestionnaire trouvé avec l'email: ${EMAIL_TO_PROMOTE}`);
      console.log('📋 Gestionnaires existants:');

      const allGestionnaires = await prisma.gestionnaire.findMany({
        select: { email: true, prenom: true, nom: true, role: true }
      });

      allGestionnaires.forEach(g => {
        console.log(`  - ${g.email} (${g.prenom} ${g.nom || ''}) - Rôle: ${g.role}`);
      });

      return;
    }

    // Vérifier le rôle actuel
    console.log(`👤 Gestionnaire trouvé: ${gestionnaire.prenom} ${gestionnaire.nom || ''} (${gestionnaire.email})`);
    console.log(`📊 Rôle actuel: ${gestionnaire.role}`);

    if (gestionnaire.role === 'ADMIN') {
      console.log('✅ Cet utilisateur est déjà administrateur!');
      return;
    }

    // Promouvoir en admin
    const updatedGestionnaire = await prisma.gestionnaire.update({
      where: { email: EMAIL_TO_PROMOTE },
      data: { role: 'ADMIN' }
    });

    console.log(`🎉 Succès! ${updatedGestionnaire.prenom} ${updatedGestionnaire.nom || ''} est maintenant ADMIN`);
    console.log('🔄 Vous pouvez maintenant vous reconnecter à l\'application pour accéder aux paramètres.');

  } catch (error) {
    console.error('❌ Erreur lors de la promotion:', error);
  } finally {
    await prisma.$disconnect();
  }
}

promoteToAdmin();
