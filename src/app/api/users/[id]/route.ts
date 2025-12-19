/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

export const dynamic = 'force-dynamic';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Prisma } from '@prisma/client'; // Correction: remplacer @/generated/prisma par @prisma/client

// Définir une interface pour le corps de la requête attendu
// (Adaptez cette interface pour qu'elle corresponde exactement aux données envoyées par votre formulaire)
// Dans l'interface UpdateUserRequestBody, ajouter :
interface UpdateUserRequestBody {
  nom?: string;
  prenom?: string;
  dateNaissance?: string | null;
  genre?: string;
  telephone?: string;
  email?: string;
  dateOuverture?: string | null;
  dateCloture?: string | null;
  etat?: string;
  antenne?: string;
  statutSejour?: string;
  gestionnaire?: string;
  nationalite?: string;
  trancheAge?: string;
  remarques?: string;
  secteur?: string;
  langue?: string;
  situationProfessionnelle?: string;
  revenus?: string;
  premierContact?: string;
  notesGenerales?: string;
  problematiquesDetails?: string;
  informationImportante?: string;
  donneesConfidentielles?: string; // AJOUTER CETTE LIGNE
  partenaire?: string;  // Ajouter cette ligne manquante
  hasPrevExp?: boolean;
  prevExpDateReception?: string | null;
  prevExpDateRequete?: string | null;
  prevExpDateVad?: string | null;
  prevExpDateAudience?: string | null;
  prevExpDateSignification?: string | null;
  prevExpDateJugement?: string | null;
  prevExpDateExpulsion?: string | null;
  prevExpDossierOuvert?: string; // Nouveau champ
  prevExpDecision?: string;
  prevExpCommentaire?: string;
  prevExpDemandeCpas?: string;
  prevExpNegociationProprio?: string;
  prevExpSolutionRelogement?: string;
  prevExpMaintienLogement?: string;
  prevExpTypeFamille?: string;
  prevExpTypeRevenu?: string;
  prevExpEtatLogement?: string;
  prevExpNombreChambre?: string;
  prevExpAideJuridique?: string;
  prevExpMotifRequete?: string;
  logementDetails?: {
    typeLogement?: string;
    proprietaire?: string;
    bailEnregistre?: string;
    dateContrat?: string | null;
    dateEntree?: string | null;
    dureeContrat?: string;
    loyer?: string;
    charges?: string;
    garantieLocative?: string;
    statutGarantie?: string;
    hasLitige?: boolean;
    typeLitige?: string;
    dateLitige?: string | null;
    preavisPour?: string;
    descriptionLitige?: string;
    actionsPrises?: string;
    datePreavis?: string | null;
    dureePreavis?: string;
    dateSortie?: string | null;
    motifSortie?: string;
    destinationSortie?: string;
    commentaire?: string;
  } | null;
  adresse?: {
    rue?: string;
    numero?: string;
    boite?: string;
    codePostal?: string;
    ville?: string;
    pays?: string;
  } | null;
  // Utiliser des types plus précis si disponibles (ex: importés de Prisma ou types/user.ts)
  problematiques?: Array<{ id?: string; type: string; description?: string | null; dateSignalement: string }>;
  actions?: Array<{ id?: string; date: string; type: string; partenaire?: string | null; description?: string | null }>;
}

// Type for action input in filter callbacks
type ActionInput = { id?: string; date: string; type: string; partenaire?: string | null; description?: string | null };

// Helper function (si nécessaire)
function parseDateString(dateString: string | null | undefined): Date | null {
  if (!dateString) return null;
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date; // Return null if the date is invalid
}

// --- Fonction GET ---
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = context.params;
  console.log(`[DEBUG] Début GET /api/users/${id}`);

  try {
    const user = await prisma.user.findUnique({
      where: { id: id },
      include: {
        adresse: true,
        problematiques: true,
        actions: true,
        gestionnaire: true,
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: `Utilisateur non trouvé` },
        { status: 404 }
      );
    }

    // --- Ajout automatique de problématiques si aucune n'est présente (copie logique /api/users) ---
    function normalize(str: string) {
      return str
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .replace(/[’']/g, "'");
    }
    const keywords = [
      { type: "Fiscalité", mots: ["fiscal", "impot", "impôt", "tax", "revenu", "déclaration", "declaration"] },
      { type: "Santé Mentale (dont addiction)", mots: ["santé mentale", "psychologique", "psychiatr", "addict", "drogue", "alcool", "toxicoman", "dépression", "anxiété", "bipolaire", "schizophrén", "suicide"] },
      { type: "CPAS", mots: ["cpas", "ris", "revenu d'intégration", "revenu integration", "aide sociale", "aide du cpas"] },
      { type: "Juridique", mots: ["juridique", "avocat", "justice", "tribunal", "plainte", "procès", "procédure", "droit", "litige", "contentieux"] },
      { type: "Suivi post pénitentiaire/IPPJ", mots: ["pénitentiaire", "penitentiaire", "prison", "ippj", "libération", "liberation", "sortie de prison", "conditionnelle", "surveillance", "bracelet"] },
      { type: "Demande d'hébergement (court et moyen terme)", mots: ["hébergement", "hebergement", "héberger", "heberger", "accueil", "abri", "refuge", "logement temporaire", "logement d'urgence", "urgence logement"] },
      { type: "Famille/couple", mots: ["famille", "couple", "conjoint", "conjointe", "parent", "enfant", "époux", "épouse", "divorce", "séparation", "garde", "violence conjugale", "conflit familial"] },
      { type: "Scolarité", mots: ["scolaire", "école", "ecole", "scolarité", "scolarite", "étude", "etude", "inscription scolaire", "décrochage", "redoublement", "orientation scolaire"] },
      { type: "ISP", mots: ["isp", "insertion socioprofessionnelle", "formation", "emploi", "stage", "job", "travail", "orientation professionnelle"] },
      { type: "Santé (physique; handicap; autonomie)", mots: ["santé physique", "handicap", "autonomie", "maladie", "soin", "médical", "medecin", "infirmier", "infirmière", "hospitalisation", "prothèse", "fauteuil", "dépendance physique"] },
      { type: "Endettement/Surendettement", mots: ["dette", "endettement", "surendettement", "facture", "impayé", "impayés", "huissier", "plan de paiement", "plan de redressement"] },
      { type: "Séjours", mots: ["séjour", "sejour", "titre de séjour", "titre de sejour", "carte de séjour", "carte de sejour", "régularisation", "regularisation", "demande d'asile", "asile", "sans-papiers", "sans papiers"] },
      { type: "Sans abrisme", mots: ["sans-abri", "sans abri", "sdf", "à la rue", "a la rue", "hébergement d'urgence", "hebergement d'urgence", "errance"] },
      { type: "Energie (eau;gaz;électricité)", mots: ["énergie", "energie", "eau", "gaz", "électricité", "electricite", "facture d'énergie", "facture d'energie", "coupure", "compteur", "fournisseur d'énergie", "fournisseur d'energie"] },
      { type: "Autre", mots: ["autre", "divers", "inclassable", "non classé", "non classe"] },
    ];
    if (!user.problematiques || user.problematiques.length === 0) {
      const notes = normalize(user.notesGenerales || user.remarques || "");
      user.problematiques = [];
      keywords.forEach(({ type, mots }) => {
        for (const mot of mots) {
          const regex = new RegExp(`\\b${mot}\\w*`, 'i');
          if (regex.test(notes)) {
            user.problematiques.push({
              id: `auto-${user.id}-${type}`,
              type,
              detail: null,
              userId: user.id,
              description: "Ajouté automatiquement depuis les notes",
              dateSignalement: null
            });
            break;
          }
        }
      });
    }
    // Parse logementDetails if it's a JSON string
    if (user.logementDetails && typeof user.logementDetails === 'string') {
      try {
        user.logementDetails = JSON.parse(user.logementDetails);
      } catch (error) {
        console.error('Error parsing logementDetails:', error);
        user.logementDetails = ''; // Changer {} en chaîne vide
      }
    }

    // LOG DEBUG pour vérifier la présence des actions
    console.log('[DEBUG] Utilisateur retourné (GET):', JSON.stringify(user, null, 2));
    return NextResponse.json(user);
  } catch (error: unknown) { // Add type annotation
    console.error(`[DEBUG] Erreur:`, error);

    // --- Gestion spécifique des erreurs Prisma dans le GET ---
    if (error instanceof PrismaClientKnownRequestError) { // Use the directly imported type
      console.error(`Prisma Error Code (GET): ${error.code}`);

      // Code P2025: Record to find was not found
      if (error.code === 'P2025') {
        return NextResponse.json({
          error: `Utilisateur non trouvé avec l'ID ${id}.`
        }, { status: 404 }); // 404 Not Found
      }

      // Log other known Prisma errors for debugging
      console.error(`Prisma Error Details (GET):`, error.message);
      return NextResponse.json({
        error: `Erreur Prisma lors de la récupération: ${error.message}`
      }, { status: 500 }); // Still 500 for other Prisma errors, but with more detail
    }

    // --- Gestion des erreurs génériques ---
    const errorMessage = error instanceof Error ? error.message : "Une erreur inconnue s'est produite";
    return NextResponse.json({
      error: `Erreur interne du serveur lors de la récupération: ${errorMessage}`
    }, { status: 500 });
  }
}

// --- Fonction PATCH (pour la mise à jour partielle, ex: attestation RGPD) ---
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = params;
  console.log(`[API PATCH /api/users/${id}] Received ID from params: ${id}`);

  try {
    // Mettre à jour le champ rgpdAttestationGeneratedAt avec la date actuelle
    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: {
        rgpdAttestationGeneratedAt: new Date(),
      },
      select: { // Sélectionner uniquement les champs nécessaires pour la réponse
        id: true,
        nom: true,
        prenom: true,
        rgpdAttestationGeneratedAt: true,
      },
    });

    console.log(`[API PATCH /api/users/${id}] User updated:`, updatedUser);
    return NextResponse.json(updatedUser, { status: 200 });

  } catch (error: unknown) {
    console.error(`[API PATCH /api/users/${id}] Error updating user for RGPD attestation:`, error);

    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json({
          error: `L'utilisateur avec l'ID ${id} n'a pas été trouvé.`
        }, { status: 404 });
      }
      return NextResponse.json({
        error: `Erreur Prisma lors de la mise à jour de l'attestation RGPD: ${error.message}`
      }, { status: 400 });
    }

    const errorMessage = error instanceof Error ? error.message : "Une erreur inconnue s'est produite";
    return NextResponse.json({
      error: `Erreur interne du serveur lors de la mise à jour de l'attestation RGPD: ${errorMessage}`
    }, { status: 500 });
  }
}

// --- Fonction PUT ---
export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = context.params;
  console.log(`[API PUT /api/users/${id}] Received ID from params: ${id}`);

  // Helper to check for valid UUID (v4)
  function isValidUUID(uuid: string) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
  }

  try {
    // AJOUT : Vérifier d'abord que l'utilisateur existe
    const existingUser = await prisma.user.findUnique({
      where: { id: id }
    });

    if (!existingUser) {
      console.log(`[API PUT /api/users/${id}] User not found`);
      return NextResponse.json({
        error: `L'utilisateur avec l'ID ${id} n'a pas été trouvé.`
      }, { status: 404 });
    }

    console.log(`[API PUT /api/users/${id}] User found, proceeding with update`);

    const body = await request.json() as UpdateUserRequestBody;
    console.log(`[API PUT /api/users/${id}] Received body:`, JSON.stringify(body, null, 2));

    // Log the received body before processing
    console.log("[API PUT] Received Request Body:", JSON.stringify(body, null, 2));

    // 1. Récupérer les IDs existants en base
    const existingProblematiqueIds = (await prisma.problematique.findMany({
      where: { userId: id },
      select: { id: true }
    })).map(p => p.id);

    // 2. Séparer les problématiques à update, create, delete
    const toUpdate = body.problematiques?.filter(p => p.id && existingProblematiqueIds.includes(p.id)) || [];
    // FIX: Treat items with IDs that don't exist in DB as new items (e.g. temporary frontend IDs starting with 'ai-')
    const toCreate = body.problematiques?.filter(p => !p.id || (p.id && !existingProblematiqueIds.includes(p.id))) || [];
    const toDelete = existingProblematiqueIds.filter(
      existingId => !(body.problematiques || []).some(p => p.id === existingId)
    );

    // 3. Appliquer les updates
    for (const p of toUpdate) {
      await prisma.problematique.update({
        where: { id: p.id },
        data: {
          type: p.type,
          description: p.description,
          dateSignalement: p.dateSignalement ? new Date(p.dateSignalement) : new Date(),
        } as Prisma.ProblematiqueUpdateInput
      });
    }

    // 4. Appliquer les créations
    for (const p of toCreate) {
      await prisma.problematique.create({
        data: {
          type: p.type,
          description: p.description,
          dateSignalement: p.dateSignalement ? new Date(p.dateSignalement) : new Date(),
          userId: id,
        } as Prisma.ProblematiqueUncheckedCreateInput
      });
    }

    // 5. Appliquer les suppressions
    for (const deleteId of toDelete) {
      await prisma.problematique.delete({ where: { id: deleteId } });
    }

    // --- GESTION DES ACTIONS (CRUD) ---
    // 1. Récupérer les IDs existants en base
    const existingActionIds = (await prisma.actionSuivi.findMany({
      where: { userId: id },
      select: { id: true }
    })).map((a: { id: string }) => a.id);

    // 2. Séparer les actions à update, create, delete
    const toUpdateActions = body.actions?.filter((a: ActionInput) => a.id && isValidUUID(a.id) && existingActionIds.includes(a.id)) || [];
    const toCreateActions = body.actions?.filter((a: ActionInput) => !a.id || !isValidUUID(a.id)) || [];
    const toDeleteActions = existingActionIds.filter(
      (existingId: string) => !(body.actions || []).some((a: ActionInput) => a.id === existingId)
    );

    // 3. Appliquer les updates
    for (const a of toUpdateActions) {
      await prisma.actionSuivi.update({
        where: { id: a.id },
        data: {
          date: a.date ? new Date(a.date) : new Date(),
          type: a.type,
          partenaire: a.partenaire,
          description: a.description,
        }
      });
    }

    // 4. Appliquer les créations
    for (const a of toCreateActions) {
      // Remove id field
      const { id: _ignore, ...actionData } = a;
      await prisma.actionSuivi.create({
        data: {
          date: a.date ? new Date(a.date) : new Date(),
          type: a.type,
          partenaire: a.partenaire,
          description: a.description,
          userId: id,
        }
      });
    }

    // 5. Appliquer les suppressions
    for (const deleteId of toDeleteActions) {
      await prisma.actionSuivi.delete({ where: { id: deleteId } });
    }

    // Dans dataToUpdate, ajouter :
    const dataToUpdate: Prisma.UserUpdateInput = {
      // --- Champ d'audit ---
      updatedBy: session.user?.name || session.user?.email || null, // Audit: qui a modifié le dossier
      // --- Champs simples ---
      // Utiliser l'accès optionnel (?) au cas où des champs seraient manquants dans le body
      nom: body.nom,
      prenom: body.prenom,
      dateNaissance: parseDateString(body.dateNaissance) ?? undefined,
      genre: body.genre,
      telephone: body.telephone,
      email: body.email,
      dateOuverture: parseDateString(body.dateOuverture) ?? undefined,
      dateCloture: parseDateString(body.dateCloture) ?? undefined,
      etat: body.etat,
      antenne: body.antenne,
      statutSejour: body.statutSejour,
      gestionnaire: body.gestionnaire ? {
        connect: { id: body.gestionnaire }
      } : {
        disconnect: true
      },
      nationalite: body.nationalite,
      trancheAge: body.trancheAge,
      remarques: body.remarques,
      secteur: body.secteur,
      langue: body.langue,
      situationProfessionnelle: body.situationProfessionnelle,
      revenus: body.revenus,
      premierContact: body.premierContact,
      notesGenerales: body.notesGenerales,
      problematiquesDetails: body.problematiquesDetails,
      informationImportante: body.informationImportante,
      donneesConfidentielles: body.donneesConfidentielles, // AJOUTER CETTE LIGNE
      partenaire: body.partenaire,  // Ajouter cette ligne
      hasPrevExp: body.hasPrevExp,
      prevExpDateReception: parseDateString(body.prevExpDateReception) ?? undefined,
      prevExpDateRequete: parseDateString(body.prevExpDateRequete) ?? undefined,
      prevExpDateVad: parseDateString(body.prevExpDateVad) ?? undefined,
      prevExpDateAudience: parseDateString(body.prevExpDateAudience) ?? undefined,
      prevExpDateSignification: parseDateString(body.prevExpDateSignification) ?? undefined,
      prevExpDateJugement: parseDateString(body.prevExpDateJugement) ?? undefined,
      prevExpDateExpulsion: parseDateString(body.prevExpDateExpulsion) ?? undefined,
      prevExpDossierOuvert: body.prevExpDossierOuvert,
      prevExpDecision: body.prevExpDecision,
      prevExpCommentaire: body.prevExpCommentaire,
      prevExpDemandeCpas: body.prevExpDemandeCpas,
      prevExpNegociationProprio: body.prevExpNegociationProprio,
      prevExpSolutionRelogement: body.prevExpSolutionRelogement,
      prevExpMaintienLogement: body.prevExpMaintienLogement,
      prevExpTypeFamille: body.prevExpTypeFamille,
      prevExpTypeRevenu: body.prevExpTypeRevenu,
      prevExpEtatLogement: body.prevExpEtatLogement,
      prevExpNombreChambre: body.prevExpNombreChambre,
      prevExpAideJuridique: body.prevExpAideJuridique,
      prevExpMotifRequete: body.prevExpMotifRequete,
      logementDetails: body.logementDetails ? JSON.stringify(body.logementDetails) : null,
      adresse: body.adresse ? {
        upsert: {
          create: {
            rue: body.adresse.rue || '',
            numero: body.adresse.numero || '',
            boite: body.adresse.boite || '',
            codePostal: body.adresse.codePostal || '',
            ville: body.adresse.ville || '',
            // Removed 'pays' as it's not in the Adresse type
          },
          update: {
            rue: body.adresse.rue || '',
            numero: body.adresse.numero || '',
            boite: body.adresse.boite || '',
            codePostal: body.adresse.codePostal || '',
            ville: body.adresse.ville || '',
            // Removed 'pays' as it's not in the Adresse type
          }
        }
      } : undefined,
      // NE PAS inclure "problematiques" ici
    };

    console.log(`[API PUT /api/users/${id}] Data for Prisma update:`, JSON.stringify(dataToUpdate, null, 2));

    // Ajouter des logs pour diagnostiquer le problème de logementDetails
    if (dataToUpdate.logementDetails) {
      const logementDetailsString = JSON.stringify(dataToUpdate.logementDetails);
      console.log(`[API PUT /api/users/${id}] logementDetails string value:`, logementDetailsString);
      console.log(`[API PUT /api/users/${id}] logementDetails string length:`, logementDetailsString.length);
    } else {
      console.log(`[API PUT /api/users/${id}] logementDetails is null or undefined.`);
    }

    // Extraire le gestionnaire et créer un nouvel objet sans ce champ
    const { gestionnaire, ...dataWithoutGestionnaire } = dataToUpdate;

    // Voici la version corrigée qui utilisera l'ID correctement
    let finalUpdateData: Prisma.UserUpdateInput = {
      ...dataWithoutGestionnaire,
      gestionnaire // Garder la définition originale de dataToUpdate
    };

    // SUPPRIMER ces lignes (427-438) :
    // if (gestionnaire) {
    //   finalUpdateData.gestionnaire = {
    //     connect: { id: gestionnaire.toString() }
    //   };
    // } else {
    //   finalUpdateData.gestionnaire = {
    //     disconnect: true
    //   };
    // }

    // Ajouter les logs ICI (après la définition complète de finalUpdateData)
    console.log('🔍 [API] notesGenerales reçues:', body.notesGenerales);
    console.log('🔍 [API] notesGenerales dans dataToUpdate:', dataToUpdate.notesGenerales);
    console.log('🔍 [API] Données finales envoyées à Prisma:', finalUpdateData);
    console.log('🔍 [API] notesGenerales dans les données finales:', finalUpdateData.notesGenerales);

    // Vérification de debug
    console.log(`[API PUT /api/users/${id}] Final update data:`, JSON.stringify(finalUpdateData, null, 2));

    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: finalUpdateData,
      include: { adresse: true, problematiques: true, actions: true },
    });

    // --- Log serveur avant réponse (optionnel) ---
    console.log(JSON.stringify(updatedUser, null, 2));

    return NextResponse.json(updatedUser);

  } catch (error: unknown) { // Add type annotation
    console.error(`[API PUT /api/users/${id}] Error updating user:`, error);

    // --- Gestion spécifique des erreurs Prisma ---
    if (error instanceof PrismaClientKnownRequestError) { // Use the directly imported type
      // Erreur connue de Prisma (ex: contrainte unique violée, enregistrement non trouvé)
      console.error(`Prisma Error Code: ${error.code}`);

      // Code P2002: Violation de contrainte unique (ex: email déjà pris)
      if (error.code === 'P2002') {
        // Tenter d'identifier le champ en cause
        const target = (error.meta?.target as string[])?.join(', ');
        return NextResponse.json({
          error: `La valeur fournie pour '${target || 'un champ unique'}' existe déjà.`
        }, { status: 409 }); // 409 Conflict
      }

      // Code P2025: Enregistrement à mettre à jour non trouvé
      if (error.code === 'P2025') {
        return NextResponse.json({
          error: `L'utilisateur avec l'ID ${id} n'a pas été trouvé.`
        }, { status: 404 }); // 404 Not Found
      }

      // Autres erreurs Prisma connues
      return NextResponse.json({
        error: `Erreur Prisma: ${error.message}`
      }, { status: 400 }); // 400 Bad Request pour d'autres erreurs Prisma
    }

    // --- Gestion des erreurs génériques ---
    const errorMessage = error instanceof Error ? error.message : "Une erreur inconnue s'est produite";
    return NextResponse.json({
      error: `Erreur interne du serveur: ${errorMessage}`
    }, { status: 500 });
  }
}

// --- Fonction DELETE ---
// --- Fonction DELETE ---
export async function DELETE(
  req: NextRequest, // req est nécessaire pour getServerSession avec les App Routers
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Accès non autorisé.' }, { status: 401 });
  }

  const userRole = (session.user as { role?: string } | undefined)?.role;
  const userId = params.id;

  try {
    const userToDelete = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userToDelete) {
      return NextResponse.json({ error: "L'utilisateur à supprimer n'existe pas." }, { status: 404 });
    }

    // ADMINs can delete anyone
    if (userRole !== 'ADMIN') {
      // For non-admins, check if it's a duplicate
      if (!userToDelete.nom || !userToDelete.prenom || !userToDelete.dateNaissance) {
        return NextResponse.json({ error: 'Impossible de vérifier si l\'utilisateur est un doublon (données manquantes).' }, { status: 400 });
      }

      const duplicates = await prisma.user.findMany({
        where: {
          nom: userToDelete.nom,
          prenom: userToDelete.prenom,
          dateNaissance: userToDelete.dateNaissance,
          id: { not: userId },
        },
      });

      if (duplicates.length === 0) {
        return NextResponse.json({ error: 'Accès non autorisé. Seuls les doublons peuvent être supprimés par les utilisateurs.' }, { status: 403 });
      }
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ message: 'Utilisateur supprimé avec succès' }, { status: 200 });
  } catch (error) {
    console.error(`Erreur lors de la suppression de l'utilisateur ${userId}:`, error);
    if ((error as { code?: string }).code === 'P2025') {
      return NextResponse.json({ error: "L'utilisateur à supprimer n'existe pas." }, { status: 404 });
    }
    return NextResponse.json({ error: "Erreur lors de la suppression de l'utilisateur." }, { status: 500 });
  }
}

// Créer une fonction utilitaire pour la gestion d'erreurs
function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error);

  if (error instanceof PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return NextResponse.json(
          { error: 'Cette valeur existe déjà' },
          { status: 409 }
        );
      case 'P2025':
        return NextResponse.json(
          { error: 'Ressource non trouvée' },
          { status: 404 }
        );
      default:
        return NextResponse.json(
          { error: `Erreur de base de données: ${error.message}` },
          { status: 400 }
        );
    }
  }

  const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
  return NextResponse.json(
    { error: `Erreur interne: ${errorMessage}` },
    { status: 500 }
  );
}
