/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/


const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function exportFullUserData() {
  console.log("Début de l'exportation des données complètes des usagers...");
  try {
    const users = await prisma.user.findMany({
      include: {
        documents: true,
        adresse: true,
        actions: true,
        problematiques: true,
        gestionnaire: true,
        geographicalSector: true,
        street: true,
      },
    });

    console.log(`Trouvé ${users.length} usagers.`);

    const outputPath = path.join(__dirname, '..', 'usagers-complets.json');
    const jsonData = JSON.stringify(users, null, 2);

    fs.writeFileSync(outputPath, jsonData, 'utf8');

    console.log(`Exportation terminée. Les données ont été sauvegardées dans : ${outputPath}`);
  } catch (error) {
    console.error("Une erreur est survenue lors de l'exportation :", error);
  } finally {
    await prisma.$disconnect();
    console.log('Déconnexion de la base de données.');
  }
}

exportFullUserData();
