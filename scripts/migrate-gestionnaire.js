/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateGestionnaireData() {
  console.log('🔄 Migration des données gestionnaire...');
  
  try {
    // Récupérer tous les users avec l'ancien champ gestionnaire (si il existe encore)
    const users = await prisma.user.findMany({
      where: {
        gestionnaire: { not: null },
        gestionnaireId: null, // Seulement ceux qui n'ont pas encore été migrés
      },
      select: {
        id: true,
        gestionnaire: true,
      },
    });
    
    console.log(`📊 ${users.length} utilisateurs à migrer`);
    
    for (const user of users) {
      try {
        // Vérifier si le gestionnaire existe
        const gestionnaire = await prisma.gestionnaire.findUnique({
          where: { id: user.gestionnaire }
        });
        
        if (gestionnaire) {
          // Mettre à jour avec gestionnaireId
          await prisma.user.update({
            where: { id: user.id },
            data: { 
              gestionnaireId: user.gestionnaire,
              // Optionnel : supprimer l'ancien champ
              // gestionnaire: null 
            }
          });
          console.log(`✅ Migré user ${user.id} -> gestionnaire ${gestionnaire.prenom} ${gestionnaire.nom}`);
        } else {
          console.log(`⚠️  Gestionnaire ${user.gestionnaire} non trouvé pour user ${user.id}`);
        }
      } catch (error) {
        console.error(`❌ Erreur migration user ${user.id}:`, error);
      }
    }
    
    console.log('✅ Migration terminée');
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateGestionnaireData();