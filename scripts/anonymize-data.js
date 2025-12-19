/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/


const fs = require('fs');
const path = require('path');

function anonymizeData() {
  console.log("Début de l'anonymisation...");

  const inputPath = path.join(__dirname, '..', 'usagers-complets.json');
  const outputPath = path.join(__dirname, '..', 'usagers-anonymises.json');

  try {
    if (!fs.existsSync(inputPath)) {
      console.error(`Le fichier d'entrée n'a pas été trouvé : ${inputPath}`);
      return;
    }

    const rawData = fs.readFileSync(inputPath, 'utf8');
    const users = JSON.parse(rawData);

    console.log(`${users.length} usagers à anonymiser.`);

    const anonymizedUsers = users.map((user, index) => {
      const userId = index + 1;

      // Anonymize User data
      user.nom = `Nom_${userId}`;
      user.prenom = `Prenom_${userId}`;
      user.dateNaissance = new Date('1970-01-01T00:00:00.000Z').toISOString();
      user.telephone = `+320000000${userId}`.slice(0, 12);
      user.email = `usager_${userId}@example.com`;
      user.remarques = null;
      user.notesGenerales = null;
      user.donneesConfidentielles = null;
      user.informationImportante = null;
      user.prevExpCommentaire = null;
      user.partenaire = `Partenaire_${userId}`

      // Anonymize related Adresse
      if (user.adresse) {
        user.adresse.rue = `Rue Anonyme ${userId}`;
        user.adresse.numero = `${userId}`;
        user.adresse.boite = `B${userId}`;
      }

      // Anonymize related Gestionnaire
      if (user.gestionnaire) {
        const gestId = user.gestionnaire.id.slice(0, 8);
        user.gestionnaire.nom = `Gestionnaire_Nom_${gestId}`;
        user.gestionnaire.prenom = `Prenom`;
        user.gestionnaire.email = `gestionnaire_${gestId}@example.com`;
      }
      
      // Anonymize related documents
      if (user.documents) {
          user.documents.forEach(doc => {
              doc.nom = `Document Anonymisé ${doc.id.slice(0,4)}`;
              doc.contenu = "Contenu du document anonymisé.";
          });
      }

      return user;
    });

    fs.writeFileSync(outputPath, JSON.stringify(anonymizedUsers, null, 2), 'utf8');
    console.log(`Anonymisation terminée. Fichier sauvegardé ici : ${outputPath}`);

  } catch (error) {
    console.error("Une erreur est survenue lors de l'anonymisation :", error);
  }
}

anonymizeData();
