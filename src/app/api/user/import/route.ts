/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Assurez-vous que ce chemin est correct
import { Prisma } from '@prisma/client'; // Importer les types Prisma nécessaires
import { determineSecteur } from '@/utils/secteurUtils'; // Importer determineSecteur

// Helper function to sanitize string fields
const sanitizeStringField = (value: unknown): string | null => {
  if (typeof value === 'string') {
    const trimmedValue = value.trim();
    if (trimmedValue.toLowerCase() === 'undefined' || trimmedValue.toLowerCase() === 'null' || trimmedValue === '') {
      return null; // Store as null if it's "undefined", "null" (string) or empty
    }
    return trimmedValue; // Return the trimmed, valid string
  }
  if (value === null || value === undefined) {
    return null; // Store as null if it's already null or undefined
  }
  return null;
};

interface ProblematiqueImportData {
  type: string; // Après filtrage, type ne sera pas null
  detail: string | null;
  description: string; // Après filtrage, description ne sera pas null
  userId: string;
}

interface ActionSuiviImportData {
  date: Date;
  type: string; // Après filtrage, type ne sera pas null
  partenaire: string | null;
  description: string; // Après filtrage, description ne sera pas null
  userId: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let usersToImport;
    let targetYear = new Date().getFullYear();

    // Support both direct array (legacy) and { users, annee } object
    if (Array.isArray(body)) {
      usersToImport = body;
    } else {
      usersToImport = body.users;
      if (body.annee) {
        targetYear = parseInt(String(body.annee), 10);
      }
    }

    if (!Array.isArray(usersToImport) || usersToImport.length === 0) {
      return NextResponse.json({ error: 'Invalid or empty data array provided' }, { status: 400 });
    }

    // AJOUT: Charger tous les gestionnaires une seule fois
    const allGestionnaires = await prisma.gestionnaire.findMany({
      select: { id: true, nom: true, prenom: true }
    });

    const findGestionnaireId = (nameOrIdFromExcel: unknown): string | null => {
      if (typeof nameOrIdFromExcel !== 'string' || !nameOrIdFromExcel.trim()) {
        return null;
      }
      const trimmedNameOrId = nameOrIdFromExcel.trim();
      const lowerTrimmedNameOrId = trimmedNameOrId.toLowerCase();

      // --- DÉBUT LOGS POUR AMINE (vous pouvez les garder ou les enlever après correction) ---
      if (lowerTrimmedNameOrId.includes('amine')) {
        console.log(`Input Excel (original): "${nameOrIdFromExcel}"`);
        console.log(`Input Excel (trimmed & lower): "${lowerTrimmedNameOrId}"`);

        const amineInDb = allGestionnaires.find(g =>
          (g.prenom && g.prenom.toLowerCase().includes('amine')) ||
          (g.nom && g.nom.toLowerCase().includes('amine'))
        );

        if (amineInDb) {
          console.log(`DB Record for Amine (or similar): ID=${amineInDb.id}, Prenom="${amineInDb.prenom}", Nom="${amineInDb.nom}"`);
          console.log(`   DB Prenom (trimmed & lower): "${amineInDb.prenom ? amineInDb.prenom.trim().toLowerCase() : 'null'}"`); // AJOUT DE .trim()
          console.log(`   DB Nom (trimmed & lower): "${amineInDb.nom ? amineInDb.nom.trim().toLowerCase() : 'null'}"`); // AJOUT DE .trim()

          if (amineInDb.prenom) {
            const prenomMatch = amineInDb.prenom.trim().toLowerCase() === lowerTrimmedNameOrId; // AJOUT DE .trim()
            console.log(`   COMPARISON: (DB Prenom "${amineInDb.prenom.trim().toLowerCase()}") === (Excel Input "${lowerTrimmedNameOrId}")  Result: ${prenomMatch}`);
          }
          if (amineInDb.nom) {
            const nomMatch = amineInDb.nom.trim().toLowerCase() === lowerTrimmedNameOrId; // AJOUT DE .trim()
            console.log(`   COMPARISON: (DB Nom "${amineInDb.nom.trim().toLowerCase()}") === (Excel Input "${lowerTrimmedNameOrId}")  Result: ${nomMatch}`);
          }
        } else {
          console.log(`"Amine" (as prenom or nom) NOT found in allGestionnaires list during this check.`);
        }
      }
      // --- FIN LOGS POUR AMINE ---

      if (allGestionnaires.some(g => g.id === trimmedNameOrId)) {
        return trimmedNameOrId;
      }

      const foundByName = allGestionnaires.find(g => {
        // Appliquer .trim() aux champs de la base avant toLowerCase() et comparaison
        const dbPrenomLower = g.prenom ? g.prenom.trim().toLowerCase() : null;
        const dbNomLower = g.nom ? g.nom.trim().toLowerCase() : null;

        return (dbNomLower && dbPrenomLower && `${dbPrenomLower} ${dbNomLower}` === lowerTrimmedNameOrId) ||
          (dbNomLower && dbPrenomLower && `${dbNomLower} ${dbPrenomLower}` === lowerTrimmedNameOrId) ||
          (dbNomLower && dbNomLower === lowerTrimmedNameOrId) ||
          (dbPrenomLower && dbPrenomLower === lowerTrimmedNameOrId);
      });

      if (lowerTrimmedNameOrId.includes('amine')) {
        console.log(`Final Result for "${trimmedNameOrId}": ${foundByName ? foundByName.id : 'NOT FOUND (null)'}`);
      }

      return foundByName ? foundByName.id : null;
    };

    let importedCount = 0;
    const errors: { data: Record<string, unknown>, reason: string, existingUserId?: string, userId?: string }[] = [];
    const batchSize = 10;
    const userBatches = [];

    for (let i = 0; i < usersToImport.length; i += batchSize) {
      userBatches.push(usersToImport.slice(i, i + batchSize));
    }

    await Promise.all(userBatches.map(async (batch) => {
      for (const userData of batch) {
        try {
          // Vérification minimale des données
          if (!userData.nom || !userData.prenom) {
            errors.push({ data: userData, reason: 'Missing required fields (nom or prenom)' });
            continue;
          }

          // --- Gérer les doublons d'email ---
          let emailToUse: string | null = null;
          if (userData.email && typeof userData.email === 'string') {
            const trimmedEmail = userData.email.trim();
            if (trimmedEmail !== '' && trimmedEmail.toLowerCase() !== 'undefined') {
              emailToUse = trimmedEmail;
            }
          }

          console.log(`[Import Debug] User: ${userData.nom} ${userData.prenom}, Email to use for check: ${emailToUse}`);

          if (emailToUse) {
            const existingUser = await prisma.user.findFirst({
              where: { email: emailToUse },
            });
            if (existingUser) {
              console.warn(`Import API: Skipping user ${userData.nom} ${userData.prenom} due to duplicate email: ${emailToUse}`);
              errors.push({
                data: userData,
                reason: `Duplicate email: ${emailToUse}`,
                existingUserId: existingUser.id
              });
              continue;
            }
          }
          // --- Fin gestion doublons ---

          // Gérer l'adresse
          let createdAdresse = null;
          if (userData.adresse && (userData.adresse.rue || userData.adresse.numero || userData.adresse.boite || userData.adresse.codePostal || userData.adresse.ville || userData.adresse.pays)) {
            try {
              createdAdresse = await prisma.adresse.create({
                data: {
                  rue: userData.adresse.rue,
                  numero: userData.adresse.numero,
                  boite: userData.adresse.boite,
                  codePostal: userData.adresse.codePostal,
                  ville: userData.adresse.ville,
                  pays: userData.adresse.pays,
                }
              });
            } catch (adresseError: unknown) {
              console.error("Error creating adresse for user:", userData.nom, userData.prenom, adresseError);
              errors.push({ data: userData, reason: `Failed to create adresse: ${adresseError instanceof Error ? adresseError.message : String(adresseError)}` });
              continue;
            }
          }

          // MODIFICATION: Utiliser findGestionnaireId
          const gestionnaireIdToStore = findGestionnaireId(userData.gestionnaire);

          console.log("Import API: Processing user:", userData.nom, userData.prenom);
          console.log("Import API: Langue value before create:", userData.langue);

          // Déplacer les déclarations de variables sanitizées ici, AVANT l'objet data
          const sanitizedNom = sanitizeStringField(userData.nom) || 'N/A';
          const sanitizedPrenom = sanitizeStringField(userData.prenom) || 'N/A';
          const sanitizedGenre = sanitizeStringField(userData.genre);
          const sanitizedTelephone = sanitizeStringField(userData.telephone);

          const sanitizedEtat = sanitizeStringField(userData.etat);
          const etatToStore = sanitizedEtat === null ? undefined : sanitizedEtat;

          const sanitizedAntenne = sanitizeStringField(userData.antenne);
          const antenneToStore = sanitizedAntenne === null ? undefined : sanitizedAntenne; // Appliquer la même logique si antenne attend string | undefined

          const sanitizedStatutSejour = sanitizeStringField(userData.statutSejour);
          const statutSejourToStore = sanitizedStatutSejour === null ? undefined : sanitizedStatutSejour; // Appliquer la même logique

          const sanitizedNationalite = sanitizeStringField(userData.nationalite);
          const sanitizedTrancheAge = sanitizeStringField(userData.trancheAge);
          const sanitizedRemarques = sanitizeStringField(userData.remarques);
          const sanitizedLangue = sanitizeStringField(userData.langue);
          const sanitizedPremierContact = sanitizeStringField(userData.premierContact);
          const sanitizedNotesGenerales = sanitizeStringField(userData.notesGenerales);
          const sanitizedPrevExpDecision = sanitizeStringField(userData.prevExpDecision);
          const sanitizedPrevExpCommentaire = sanitizeStringField(userData.prevExpCommentaire);

          const createdUser = await prisma.user.create({
            data: {
              id: userData.id,
              annee: userData.annee || targetYear, // Utiliser l'année cible ou celle de l'usager
              nom: sanitizedNom,
              prenom: sanitizedPrenom,
              dateNaissance: userData.dateNaissance ? new Date(userData.dateNaissance) : null,
              genre: sanitizedGenre,
              telephone: sanitizedTelephone,
              email: emailToUse,
              // adresseId: createdAdresse ? createdAdresse.id : null,
              // gestionnaire: gestionnaireIdToStore,
              dateOuverture: userData.dateOuverture ? new Date(userData.dateOuverture) : new Date(),
              dateCloture: userData.dateCloture ? new Date(userData.dateCloture) : null,

              etat: etatToStore, // Utiliser la variable préparée

              antenne: antenneToStore, // Utiliser la variable préparée
              statutSejour: statutSejourToStore, // Utiliser la même logique
              nationalite: sanitizedNationalite,
              trancheAge: sanitizedTrancheAge,
              remarques: sanitizedRemarques,
              langue: sanitizedLangue,
              premierContact: sanitizedPremierContact,
              notesGenerales: sanitizedNotesGenerales,
              logementDetails: userData.logementDetails, // Ce champ est un JSON, pas besoin de sanitizeStringField
              hasPrevExp: userData.hasPrevExp, // Boolean
              prevExpDateReception: userData.prevExpDateReception ? new Date(userData.prevExpDateReception) : null,
              prevExpDateRequete: userData.prevExpDateRequete ? new Date(userData.prevExpDateRequete) : null,
              prevExpDateVad: userData.prevExpDateVad ? new Date(userData.prevExpDateVad) : null,
              prevExpDecision: sanitizedPrevExpDecision,
              prevExpCommentaire: sanitizedPrevExpCommentaire,

              // Relations utilisant connect :
              ...(createdAdresse && {
                adresse: {
                  connect: { id: createdAdresse.id }
                }
              }),
              ...(gestionnaireIdToStore && {
                gestionnaire: {
                  connect: { id: gestionnaireIdToStore }
                }
              }),
            },
          });

          // --- Déterminer et mettre à jour le secteur ---
          if (createdAdresse) {
            const determinedSecteur = determineSecteur(createdAdresse);
            if (determinedSecteur && determinedSecteur !== "Non spécifié") {
              try {
                await prisma.user.update({
                  where: { id: createdUser.id },
                  data: { secteur: determinedSecteur },
                });
                console.log(`Import API: User ${createdUser.nom} ${createdUser.prenom} updated with secteur: ${determinedSecteur}`);
              } catch (secteurUpdateError: unknown) {
                console.error("Error updating secteur for user", createdUser.id, secteurUpdateError);
                errors.push({ data: userData, userId: createdUser.id, reason: `Failed to update secteur: ${secteurUpdateError instanceof Error ? secteurUpdateError.message : String(secteurUpdateError)}` });
              }
            } else {
              console.log(`Import API: Secteur not determined for user ${createdUser.nom} ${createdUser.prenom} (determined: ${determinedSecteur})`);
            }
          } else {
            console.log(`Import API: No adresse to determine secteur for user ${createdUser.nom} ${createdUser.prenom}`);
          }
          // --- Fin détermination et mise à jour secteur ---

          // Gérer les problématiques en lot
          if (userData.problematiques && Array.isArray(userData.problematiques) && userData.problematiques.length > 0) {
            const mappedProblematiques = userData.problematiques.map((p: { type?: string; detail?: string; description?: string }) => ({
              type: sanitizeStringField(p.type), // Sanitize type
              detail: sanitizeStringField(p.detail),
              description: sanitizeStringField(p.description),
              userId: createdUser.id, // Ensure createdUser.id is available
            }));

            const problematiquesToCreate = mappedProblematiques.filter((p: { type: string | null; description: string | null }) => {
              // Only create if type is a non-null string AND description is a non-null string
              return p.type !== null && p.description !== null;
            });

            if (problematiquesToCreate.length > 0) {
              try {
                await prisma.problematique.createMany({
                  data: problematiquesToCreate.map((p: ProblematiqueImportData) => ({
                    ...p,
                    // type: p.type || 'Non spécifié' // p.type est déjà un string non null ici grâce au filtre
                    // Si votre modèle Prisma pour Problematique.type est juste String (non optionnel),
                    // et que p.type est garanti d'être un string par le filtre,
                    // alors ...p suffit, ou vous pouvez explicitement mettre p.type.
                    // Pour être sûr et correspondre à l'intention originale de la valeur par défaut :
                    type: p.type, // p.type est déjà string ici.
                    detail: p.detail,
                    description: p.description, // p.description est déjà string ici.
                    userId: p.userId,
                  })),
                  skipDuplicates: true,
                });
              } catch (pbError: unknown) {
                console.error("Error creating problematiques in batch for user", createdUser.id, pbError);
                errors.push({ userId: createdUser.id, data: problematiquesToCreate as unknown as Record<string, unknown>, reason: `Failed to create problematiques in batch: ${pbError instanceof Error ? pbError.message : String(pbError)}` });
              }
            }
          }

          // Gérer les actions de suivi en lot
          if (userData.actions && Array.isArray(userData.actions) && userData.actions.length > 0) {
            const mappedActions = userData.actions.map((a: { date?: string | Date; type?: string; partenaire?: string; description?: string }) => ({
              date: a.date ? new Date(a.date) : new Date(),
              type: sanitizeStringField(a.type), // Sanitize type
              partenaire: sanitizeStringField(a.partenaire),
              description: sanitizeStringField(a.description),
              userId: createdUser.id, // Ensure createdUser.id is available
            }));

            const actionsToCreate = mappedActions.filter((a: { type: string | null; description: string | null }) => {
              // Only create if type is a non-null string AND description is a non-null string
              return a.type !== null && a.description !== null;
            });

            if (actionsToCreate.length > 0) {
              try {
                await prisma.actionSuivi.createMany({
                  data: actionsToCreate.map((a: ActionSuiviImportData) => ({
                    ...a,
                    // type: a.type || 'Non spécifié' // a.type est déjà un string non null ici
                    // Mêmes remarques que pour les problématiques
                    date: a.date,
                    type: a.type, // a.type est déjà string ici.
                    partenaire: a.partenaire,
                    description: a.description, // a.description est déjà string ici.
                    userId: a.userId,
                  })),
                  skipDuplicates: true,
                });
              } catch (actionError: unknown) {
                console.error("Error creating actions in batch for user", createdUser.id, actionError);
                errors.push({ userId: createdUser.id, data: actionsToCreate as unknown as Record<string, unknown>, reason: `Failed to create actions in batch: ${actionError instanceof Error ? actionError.message : String(actionError)}` });
              }
            }
          }
          importedCount++;
        } catch (userError: unknown) {
          console.error("Error importing user:", userData.nom, userData.prenom, userError);
          let errorMessage = `Failed to create user: ${userError instanceof Error ? userError.message : String(userError)}`;
          if (userError instanceof Prisma.PrismaClientKnownRequestError) {
            errorMessage = `Prisma Error P${userError.code} on user ${userData.nom} ${userData.prenom}: ${userError.message}. Meta: ${JSON.stringify(userError.meta)}`;
            if (userError.code === 'P2002' && (userError.meta?.target as string[])?.includes('User_email_key')) {
              console.error(`Duplicate email error during create for ${userData.nom} ${userData.prenom}, should have been caught by pre-check.`);
            } else {
              errors.push({ data: userData, reason: errorMessage });
            }
          } else if (userError instanceof Error) {
            errors.push({ data: userData, reason: `Failed to create user (JS Error): ${userError.message}` });
          } else {
            errors.push({ data: userData, reason: `Failed to create user (Unknown Error): ${String(userError)}` });
          }
        }
      } // Fin de la boucle for (const userData of batch)
    })); // Fin de Promise.all(batch.map(...))

    return NextResponse.json({ importedCount, errors });

  } catch (error: unknown) {
    console.error("Import API error:", error);
    return NextResponse.json({ error: 'Internal Server Error', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
