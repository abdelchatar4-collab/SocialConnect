/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

// src/app/api/users/import/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import * as XLSX from 'xlsx';
import { Prisma } from '@prisma/client';
import { determineSecteur } from '@/utils/secteurUtils'; // Assurez-vous que ce chemin est correct
import { generateUserIdByAntenne } from '@/lib/idGenerator';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

interface ExcelRow {
  // Définissez ici les noms de colonnes EXACTS de votre fichier Excel
  // Ces noms doivent correspondre à ce que vous utilisez dans la section `excelData.map`
  Nom?: string;
  Prénom?: string; // Notez l'accent
  Téléphone?: string;
  Mail?: string; // Email de l'usager
  "Date d'ouverture de dossier"?: string | number | Date;
  "Lieu de vie / Adresse"?: string;
  "N°"?: string | number;
  Boîte?: string;
  "Code Postal"?: string | number;
  Ville?: string;
  "Premier contact"?: string;
  Genre?: string; // ex: "1(M)", "2(F)"
  Nationalité?: string;
  "Langue de l'entretien"?: string;
  "Date de naissance"?: string | number | Date;
  // Age?: number; // Probablement pas nécessaire si on a Date de naissance
  "Tranche d'âge"?: string;
  "Statut de séjour"?: string;
  Antenne?: string;
  "Gestionnaire du dossier"?: string; // PRÉNOM du gestionnaire
  "État du dossier"?: string;
  "Date de clôture"?: string | number | Date;
  "Notes Générales"?: string; // Ou le nom exact de votre colonne
  Remarques?: string; // Si vous avez une colonne séparée pour remarques
  // Pour les problématiques, supposons une colonne pour la description principale et une pour le type
  ProblematiquesPrincipales?: string; // EXEMPLE: Adaptez ce nom
  TypeProblematique?: string;      // EXEMPLE: Adaptez ce nom
  "Bilan Social"?: string; // Ajouté
  "Données Confidentielles"?: string; // Ajouté
  "Information Importante"?: string; // Ajouté
  "Notes Importantes"?: string; // Alias pour Information Importante
  // Ajoutez d'autres champs Excel ici si nécessaire (logementDetails, hasPrevExp, etc.)
  [key: string]: unknown;
}

interface MappedUserData {
  nom: string;
  prenom: string;
  dateNaissance: Date | null;
  genre: string;
  telephone: string | null;
  email: string | null;
  rueExcel: string | null;
  numeroExcel: string | null;
  boiteExcel: string | null;
  codePostalExcel: string | null;
  villeExcel: string | null;
  gestionnairePrenomExcel: string;
  dateOuverture: Date;
  dateCloture: Date | null;
  etat: string;
  antenne: string;
  statutSejour: string;
  nationalite: string;
  trancheAge: string;
  remarques: string | null;
  secteurExcel: string | null; // Si vous avez un secteur dans l'Excel, sinon il sera calculé
  langue: string | null;
  premierContact: string;
  logementDetails: string | null; // Ajouté
  notesGenerales: string | null;  // Ajouté
  hasPrevExp: boolean;            // Ajouté
  prevExpDateReception: Date | null; // Ajouté
  prevExpDateRequete: Date | null; // Ajouté
  prevExpDateVad: Date | null; // Ajouté
  prevExpDecision: string | null; // Ajouté
  prevExpCommentaire: string | null; // Ajouté
  rgpdAttestationGeneratedAt: Date | null; // Ajouté
  problematiquesTexte: string | null;
  problemeType: string | null;
  donneesConfidentielles: string | null; // Ajouté
  informationImportante: string | null; // Ajouté
}

function parseExcelDate(excelDateValue: unknown): Date | null {
  if (excelDateValue === null || excelDateValue === undefined || excelDateValue === '') return null;
  if (excelDateValue instanceof Date) {
    if (!isNaN(excelDateValue.getTime())) {
      return new Date(Date.UTC(excelDateValue.getFullYear(), excelDateValue.getMonth(), excelDateValue.getDate()));
    }
  }
  if (typeof excelDateValue === 'number') {
    if (excelDateValue > 0 && excelDateValue < 2958466) {
      const excelEpoch = new Date(1899, 11, 30);
      const date = new Date(excelEpoch.getTime() + excelDateValue * 24 * 60 * 60 * 1000);
      return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    }
  }
  if (typeof excelDateValue === 'string') {
    const parsedDate = new Date(excelDateValue);
    if (!isNaN(parsedDate.getTime())) {
      return new Date(Date.UTC(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate()));
    }
    const parts = excelDateValue.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/); // Gère AA ou AAAA
    if (parts) {
      const d = parseInt(parts[1], 10);
      const m = parseInt(parts[2], 10) - 1;
      let y = parseInt(parts[3], 10);
      if (y < 100) { // Heuristique pour les années à 2 chiffres
        y += (y < 50 ? 2000 : 1900); // Suppose que les années < 50 sont 20xx, sinon 19xx
      }
      if (!isNaN(d) && !isNaN(m) && !isNaN(y)) {
        const dt = new Date(Date.UTC(y, m, d));
        if (!isNaN(dt.getTime())) return dt;
      }
    }
  }
  console.warn(`[IMPORT API] Impossible de parser la date: ${excelDateValue}, type: ${typeof excelDateValue}`);
  return null;
}

function parseGenre(genreValue: string | undefined | null): string {
  if (!genreValue) return "Non spécifié";
  const g = String(genreValue).toLowerCase().trim();
  if (g.includes('1') || g.startsWith('m') || g.includes('homme')) return "Homme";
  if (g.includes('2') || g.startsWith('f') || g.includes('femme')) return "Femme";
  if (g.startsWith('a') || g.includes('autre')) return "Autre";
  return "Non spécifié";
}

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const safeString = (value: unknown): string | null => (value !== null && value !== undefined && String(value).trim() !== '') ? String(value).trim() : null;
  const safeStringOrDefault = (value: unknown, defaultValue: string): string => {
    const str = String(value || '').trim();
    return str === '' ? defaultValue : str;
  };
  const safeBoolean = (value: unknown, defaultValue: boolean = false): boolean => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      const lowerVal = value.toLowerCase().trim();
      if (['vrai', 'true', 'oui', '1', 'yes'].includes(lowerVal)) return true;
      if (['faux', 'false', 'non', '0', 'no'].includes(lowerVal)) return false;
    }
    if (typeof value === 'number') return value === 1;
    return defaultValue;
  };

  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log("[IMPORT API] Démarrage de l'importation");
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'Aucun fichier fourni ou format invalide' }, { status: 400 });
    }

    const fileBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(fileBuffer, { type: 'buffer', cellDates: true });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const excelData = XLSX.utils.sheet_to_json<ExcelRow>(worksheet, { defval: null, rawNumbers: false });

    console.log(`[IMPORT API] Données Excel lues: ${excelData.length} lignes`);
    if (excelData.length === 0) return NextResponse.json({ error: 'Fichier Excel vide' }, { status: 400 });

    // ===================================================================================
    // ADAPTEZ LES NOMS DE COLONNES (row["..."]) CI-DESSOUS
    // POUR CORRESPONDRE EXACTEMENT À VOTRE FICHIER EXCEL
    // ===================================================================================
    const mappedUserDataList: MappedUserData[] = excelData.map((row, index) => {
      return {
        nom: safeStringOrDefault(row["Nom"], `SansNom_${index}`),
        prenom: safeStringOrDefault(row["Prénom"], `SansPrenom_${index}`),
        dateNaissance: parseExcelDate(row["Date de naissance"]),
        genre: parseGenre(row["Genre"]),
        telephone: safeString(row["Téléphone"]),
        email: safeString(row["Mail"]),
        rueExcel: safeString(row["Lieu de vie / Adresse"]),
        numeroExcel: safeString(row["N°"]),
        boiteExcel: safeString(row["Boîte"]),
        codePostalExcel: safeString(row["Code Postal"]) || "1070",
        villeExcel: safeString(row.Ville) || "Anderlecht", // Assurez-vous que "Ville" est le bon nom de colonne
        dateOuverture: parseExcelDate(row["Date d'ouverture de dossier"]) || new Date(),
        dateCloture: parseExcelDate(row["Date de clôture"]), // Assurez-vous que "Date de clôture" est le bon nom
        etat: safeStringOrDefault(row["État du dossier"], "Actif"),
        antenne: safeStringOrDefault(row.Antenne, "Non spécifié"),
        statutSejour: safeStringOrDefault(row["Statut de séjour"], "Non spécifié"),
        gestionnairePrenomExcel: safeStringOrDefault(row["Gestionnaire du dossier"], "Non assigné"),
        nationalite: safeStringOrDefault(row.Nationalité, "Non spécifiée"),
        trancheAge: safeStringOrDefault(row["Tranche d'âge"], "Non spécifié"),
        remarques: safeString(row["Bilan Social"]) || safeString(row.Remarques), // "Bilan Social" est prioritaire
        secteurExcel: safeString(row.Secteur), // Si vous avez une colonne Secteur
        langue: safeString(row["Langue de l'entretien"]),
        premierContact: safeStringOrDefault(row["Premier contact"], "Import"),
        logementDetails: null, // À implémenter si vous avez une colonne pour ça
        notesGenerales: safeString(row["Notes Générales"]),
        hasPrevExp: false, // À implémenter si vous avez une colonne pour ça
        prevExpDateReception: null, prevExpDateRequete: null, prevExpDateVad: null,
        prevExpDecision: null, prevExpCommentaire: null,
        problematiquesTexte: safeString(row.ProblematiquesPrincipales), // Adaptez "ProblematiquesPrincipales"
        problemeType: safeString(row.TypeProblematique),         // Adaptez "TypeProblematique"
        rgpdAttestationGeneratedAt: null,
        donneesConfidentielles: safeString(row["Données Confidentielles"]), // Ajouté
        informationImportante: safeString(row["Information Importante"]) || safeString(row["Notes Importantes"]), // Ajouté
      };
    });

    const importResults = { successCount: 0, errorCount: 0, errors: [] as string[] };

    await prisma.$transaction(async (tx) => {
      for (const mappedData of mappedUserDataList) {
        try {
          if (!mappedData.nom && !mappedData.prenom) {
            importResults.errors.push(`Ligne ignorée: Nom et Prénom manquants. Données: ${JSON.stringify(mappedData)}`);
            importResults.errorCount++;
            continue;
          }

          let adresseId: string | undefined = undefined;
          if (mappedData.rueExcel || mappedData.numeroExcel) {
            const createdAdresse = await tx.adresse.create({
              data: {
                rue: mappedData.rueExcel,
                numero: mappedData.numeroExcel,
                boite: mappedData.boiteExcel,
                codePostal: mappedData.codePostalExcel,
                ville: mappedData.villeExcel,
                pays: "Belgique",
              },
            });
            adresseId = createdAdresse.id;
          }

          let gestionnaireId: string | undefined = undefined;
          const prenomGestionnaire = mappedData.gestionnairePrenomExcel;
          if (prenomGestionnaire && prenomGestionnaire.toLowerCase() !== "non assigné" && prenomGestionnaire.trim() !== "") {
            const gestionnaire = await tx.gestionnaire.findFirst({
              where: { prenom: { equals: prenomGestionnaire.trim() } },
            });
            if (gestionnaire) {
              gestionnaireId = gestionnaire.id;
            } else {
              console.warn(`[IMPORT API] Gestionnaire prénom "${prenomGestionnaire}" non trouvé pour ${mappedData.nom}.`);
              importResults.errors.push(`Pour ${mappedData.nom} ${mappedData.prenom}: Gestionnaire prénom "${prenomGestionnaire}" non trouvé.`);
            }
          }

          const secteurCalcule = determineSecteur(adresseId && mappedData.rueExcel ? {
            rue: mappedData.rueExcel || undefined,
            numero: mappedData.numeroExcel || undefined,
            codePostal: mappedData.codePostalExcel || undefined,
            ville: mappedData.villeExcel || undefined
          } : null);

          // Modifié pour utiliser la syntaxe connect et supprimer les Id directs
          const finalUserCreateData: Prisma.UserCreateInput = {
            // ID généré basé sur l'antenne
            id: generateUserIdByAntenne(mappedData.antenne !== 'Non spécifié' ? mappedData.antenne : null),
            // Année d'exercice - utilise l'année en cours par défaut
            annee: new Date().getFullYear(),
            // Champs scalaires
            nom: mappedData.nom,
            prenom: mappedData.prenom,
            dateNaissance: mappedData.dateNaissance,
            genre: mappedData.genre,
            telephone: mappedData.telephone,
            email: mappedData.email,
            dateOuverture: mappedData.dateOuverture,
            dateCloture: mappedData.dateCloture,
            etat: mappedData.etat,
            antenne: mappedData.antenne,
            statutSejour: mappedData.statutSejour,
            nationalite: mappedData.nationalite,
            trancheAge: mappedData.trancheAge,
            remarques: mappedData.remarques,
            secteur: secteurCalcule || mappedData.secteurExcel || "Non spécifié",
            langue: mappedData.langue,
            premierContact: mappedData.premierContact,
            logementDetails: mappedData.logementDetails,
            notesGenerales: mappedData.notesGenerales,
            hasPrevExp: mappedData.hasPrevExp,
            prevExpDateReception: mappedData.prevExpDateReception,
            prevExpDateRequete: mappedData.prevExpDateRequete,
            prevExpDateVad: mappedData.prevExpDateVad,
            prevExpDecision: mappedData.prevExpDecision,
            prevExpCommentaire: mappedData.prevExpCommentaire,
            rgpdAttestationGeneratedAt: mappedData.rgpdAttestationGeneratedAt,
            donneesConfidentielles: mappedData.donneesConfidentielles, // Ajouté
            informationImportante: mappedData.informationImportante, // Ajouté
            // PAS de adresseId ou gestionnaireId directement ici

            // Gestion des relations avec connect
            ...(adresseId && {
              adresse: {
                connect: { id: adresseId }
              }
            }),
            ...(gestionnaireId && {
              gestionnaire: {
                connect: { id: gestionnaireId }
              }
            }),
          };

          // Ajout des lignes de console.log avant l'appel à tx.user.create
          console.log(JSON.stringify(finalUserCreateData, null, 2));

          const createdUser = await tx.user.create({ data: finalUserCreateData });
          importResults.successCount++;

          if (mappedData.problematiquesTexte && createdUser.id) {
            await tx.problematique.create({
              data: {
                type: mappedData.problemeType || "Général",
                description: mappedData.problematiquesTexte,
                userId: createdUser.id,
              },
            });
          }
        } catch (rowError: unknown) {
          const errorKey = `${mappedData.nom || 'SansNom'} ${mappedData.prenom || 'SansPrenom'}`;
          const errorMessage = `Ligne pour ${errorKey}: ${rowError instanceof Error ? rowError.message : String(rowError)}`;
          console.error(`[IMPORT API] Erreur DB: ${errorMessage}`, (rowError as { code?: string }).code ? `(Code: ${(rowError as { code?: string }).code})` : '', rowError instanceof Error && rowError.stack ? `\nStack: ${rowError.stack}` : '');
          importResults.errors.push(errorMessage);
          importResults.errorCount++;
        }
      }
    });

    console.log(`[IMPORT API] Terminé. Importés: ${importResults.successCount}, Échecs: ${importResults.errorCount}`);
    return NextResponse.json({
      message: "Importation terminée.",
      imported: importResults.successCount,
      failed: importResults.errorCount,
      errors: importResults.errors.length > 0 ? importResults.errors : undefined,
    }, { status: 200 });

  } catch (error) {
    console.error("[IMPORT API] Erreur inattendue:", error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
