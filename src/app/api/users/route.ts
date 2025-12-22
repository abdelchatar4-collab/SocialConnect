/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

// Un fichier route.ts correctement formaté pour Next.js 14:

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { generateUserIdByAntenne } from '@/lib/idGenerator';
import { extractActionsFromNotes, deduplicateActions } from '@/utils/actionUtils';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

// Définir une interface pour le corps de la requête attendu lors de la création
// Dans l'interface CreateUserRequestBody, ajouter :
interface CreateUserRequestBody {
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
  afficherDonneesConfidentielles?: boolean;
  donneesConfidentielles?: string;
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
    // pays?: string; // Si vous avez 'pays'
  } | null;
  problematiques?: Array<{ type: string; description?: string | null }>;
  // actions?: Array<{ date: string; type: string; partenaire?: string | null; description?: string | null }>;
}

// Fonction utilitaire pour parser les dates (identique à celle dans votre API PUT)
function parseDateString(dateString: string | null | undefined): Date | null {
  if (!dateString || dateString.trim() === "") return null;
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
}

export async function GET(
  request: NextRequest
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Récupérer le paramètre 'annee' de l'URL
    const { searchParams } = new URL(request.url);
    const anneeParam = searchParams.get('annee');

    const whereClause: Prisma.UserWhereInput = {};

    // Si une année est spécifiée, filtrer par cette année
    if (anneeParam) {
      const annee = parseInt(anneeParam, 10);
      if (!isNaN(annee)) {
        whereClause.annee = annee;
      }
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      include: {
        adresse: true,
        problematiques: true,
        actions: true,  // ✅ Gardez seulement ceci
        gestionnaire: true,
        // actionsSuivi: true,  // ❌ Supprimez cette ligne
      }
    });


    // Fonction utilitaire pour normaliser les chaînes (minuscules, sans accents)
    function normalize(str: string) {
      return str
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .replace(/[’']/g, "'");
    }

    // Ajout automatique de problématiques à partir des notes/remarques/notesGenerales si aucune problématique n'est présente
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
    for (const user of users) {
      if (!user.problematiques || user.problematiques.length === 0) {
        const notes = normalize(user.notesGenerales || user.remarques || "");
        user.problematiques = [];
        keywords.forEach(({ type, mots }) => {
          for (const mot of mots) {
            // Utilise une regex pour matcher le mot-clé même s'il est entouré de caractères spéciaux ou d'espaces
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
              break; // On n'ajoute qu'une fois par type
            }
          }
        });
      }
    }


    return NextResponse.json(users);
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Erreur inconnue' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) { // Utiliser NextRequest
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await request.json() as CreateUserRequestBody & { annee?: number; dossierPrecedentId?: string }; // Ajout des types pour l'année

    // Dans la fonction POST, ajouter dans dataToCreate :
    const dataToCreate: Prisma.UserCreateInput = {
      id: generateUserIdByAntenne(body.antenne), // Ajouter cette ligne
      annee: body.annee || 2025, // Par défaut 2025 si non spécifié
      dossierPrecedent: body.dossierPrecedentId ? { connect: { id: body.dossierPrecedentId } } : undefined,
      createdBy: session.user?.name || session.user?.email || null, // Audit: qui a créé le dossier
      nom: body.nom || '',
      prenom: body.prenom || '',
      dateNaissance: parseDateString(body.dateNaissance),
      genre: body.genre,
      telephone: body.telephone,
      email: body.email,
      dateOuverture: parseDateString(body.dateOuverture) || new Date(), // Mettre une date par défaut si pertinent
      dateCloture: parseDateString(body.dateCloture),
      etat: body.etat,
      antenne: body.antenne,
      statutSejour: body.statutSejour,
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
      afficherDonneesConfidentielles: body.afficherDonneesConfidentielles || false,
      donneesConfidentielles: body.donneesConfidentielles,
      hasPrevExp: body.hasPrevExp === true, // S'assurer que c'est un booléen
      prevExpDateReception: parseDateString(body.prevExpDateReception),
      prevExpDateRequete: parseDateString(body.prevExpDateRequete),
      prevExpDateVad: parseDateString(body.prevExpDateVad),
      prevExpDateAudience: parseDateString(body.prevExpDateAudience),
      prevExpDateSignification: parseDateString(body.prevExpDateSignification),
      prevExpDateJugement: parseDateString(body.prevExpDateJugement),
      prevExpDateExpulsion: parseDateString(body.prevExpDateExpulsion),
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

      // Gestion de logementDetails (champ JSON String ou Json)
      // Si votre champ Prisma 'logementDetails' est de type String et stocke du JSON:
      logementDetails: body.logementDetails ? JSON.stringify(body.logementDetails) : null,
      // Si votre champ Prisma 'logementDetails' est de type Json:
      // logementDetails: body.logementDetails || Prisma.JsonNull,

      // Gestion de l'adresse (relation one-to-one)
      adresse: body.adresse ? {
        create: {
          rue: body.adresse.rue || '',
          numero: body.adresse.numero || '',
          boite: body.adresse.boite || '',
          codePostal: body.adresse.codePostal || '',
          ville: body.adresse.ville || '',
          // pays: body.adresse.pays || '', // Si vous avez 'pays'
        }
      } : undefined, // Ne pas créer d'adresse si non fournie

      // Gestion des problématiques (relation one-to-many)
      problematiques: body.problematiques && body.problematiques.length > 0 ? {
        create: body.problematiques.map(p => ({
          type: p.type,
          description: p.description,
        }))
      } : undefined, // Ne pas créer de problématiques si non fournies

      // actions: ... (similaire si vous les créez en même temps)
    };

    // Créer une copie de dataToCreate sans le champ gestionnaire
    const { gestionnaire, ...dataToCreateWithoutGestionnaire } = dataToCreate;

    // Première approche - Création avec Prisma
    const newUser = await prisma.user.create({
      data: {
        ...dataToCreateWithoutGestionnaire,
        ...(body.gestionnaire ? {
          gestionnaire: {
            connect: { id: body.gestionnaire.toString() }
          }
        } : {})
      } as Prisma.UserCreateInput,
      include: {
        adresse: true,
        problematiques: true,
        actions: true,
      },
    });

    return NextResponse.json(newUser, { status: 201 });

  } catch (error: unknown) {
    console.error("[API POST /api/users] Erreur de création:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Gérer les erreurs connues de Prisma (ex: contrainte d'unicité)
      if (error.code === 'P2002') {
        const target = (error.meta?.target as string[])?.join(', ');
        return NextResponse.json({ error: `La valeur fournie pour le champ '${target || 'unique'}' existe déjà.` }, { status: 409 }); // Conflit
      }
      return NextResponse.json({ error: `Erreur de base de données: ${error.message}` }, { status: 400 }); // Mauvaise requête
    }
    // Gérer d'autres types d'erreurs (ex: erreur de parsing JSON si le corps est malformé)
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Corps de la requête JSON malformé." }, { status: 400 });
    }
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: "Erreur interne du serveur: " + errorMessage }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Accès non autorisé.' }, { status: 401 });
  }

  const userRole = (session.user as { role?: string } | undefined)?.role;

  try {
    const { ids } = await request.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'La liste d\'IDs est invalide ou vide.' }, { status: 400 });
    }

    if (userRole === 'ADMIN') {
      // Les admins peuvent supprimer n'importe qui
      const { count } = await prisma.user.deleteMany({
        where: {
          id: { in: ids },
        },
      });
      return NextResponse.json({ message: `${count} utilisateur(s) supprimé(s) avec succès.` }, { status: 200 });
    } else {
      // Les autres utilisateurs ne peuvent supprimer que les doublons
      const usersToDelete = await prisma.user.findMany({
        where: {
          id: { in: ids },
        },
      });

      const deletableIds: string[] = [];
      const nonDeletableIds: string[] = [];

      for (const user of usersToDelete) {
        if (!user.nom || !user.prenom || !user.dateNaissance) {
          nonDeletableIds.push(user.id);
          continue;
        }

        const duplicates = await prisma.user.findMany({
          where: {
            nom: user.nom,
            prenom: user.prenom,
            dateNaissance: user.dateNaissance,
            id: { not: user.id },
          },
        });

        if (duplicates.length > 0) {
          deletableIds.push(user.id);
        } else {
          nonDeletableIds.push(user.id);
        }
      }

      if (deletableIds.length > 0) {
        const { count } = await prisma.user.deleteMany({
          where: {
            id: { in: deletableIds },
          },
        });

        let message = `${count} doublon(s) supprimé(s) avec succès.`;
        if (nonDeletableIds.length > 0) {
          message += ` ${nonDeletableIds.length} utilisateur(s) n'ont pas pu être supprimés car ce ne sont pas des doublons.`;
        }
        return NextResponse.json({ message }, { status: 200 });

      } else {
        return NextResponse.json({ error: 'Aucun des utilisateurs sélectionnés n\'est un doublon. Suppression non autorisée.' }, { status: 403 });
      }
    }
  } catch (error: unknown) {
    console.error("Erreur lors de la suppression en masse de l'utilisateur:", error);
    const prismaError = error as { code?: string };
    if (prismaError.code === 'P2025') {
      return NextResponse.json({ error: "Un ou plusieurs utilisateurs à supprimer n'existent pas." }, { status: 404 });
    }
    return NextResponse.json({ error: "Erreur lors de la suppression des utilisateurs." }, { status: 500 });
  }
}
