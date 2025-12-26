/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.
*/

import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/prisma-clients';
import * as XLSX from 'xlsx';
import { determineSecteur } from '@/utils/secteurUtils';
import { generateUserIdByAntenne } from '@/lib/idGenerator';
import { getServerSession } from 'next-auth/next';
import { getDynamicServiceId } from '@/lib/auth-utils';
import { authOptions } from '@/lib/authOptions';
import { parseExcelDate, parseGenre, safeStr, safeStrDef } from './importHelper';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const serviceId = await getDynamicServiceId(session);
    const prisma = getServiceClient(serviceId);

    const fd = await req.formData();
    const f = fd.get('file');
    if (!f || !(f instanceof File)) return NextResponse.json({ error: 'Invalid file' }, { status: 400 });

    const wb = XLSX.read(await f.arrayBuffer(), { type: 'buffer', cellDates: true });
    const data = XLSX.utils.sheet_to_json<any>(wb.Sheets[wb.SheetNames[0]], { defval: null });

    const results = { imported: 0, failed: 0, errors: [] as string[] };

    // Note: getServiceClient extension provides an isolated prisma instance.
    // We use it directly. Transaction is managed by the isolated client.
    await prisma.$transaction(async (tx) => {
      for (const [i, row] of data.entries()) {
        try {
          const nom = safeStrDef(row["Nom"], `SansNom_${i}`), prenom = safeStrDef(row["Prénom"], `SansPrenom_${i}`);
          if (!nom && !prenom) continue;

          let adrId: string | undefined;
          if (row["Lieu de vie / Adresse"] || row["N°"]) {
            const adr = await tx.adresse.create({
              data: { rue: safeStr(row["Lieu de vie / Adresse"]), numero: safeStr(row["N°"]), boite: safeStr(row["Boîte"]), codePostal: safeStr(row["Code Postal"]) || "1070", ville: safeStr(row.Ville) || "Anderlecht", pays: "Belgique" }
            });
            adrId = adr.id;
          }

          let gestId: string | undefined;
          const pg = safeStr(row["Gestionnaire du dossier"]);
          if (pg && pg.toLowerCase() !== "non assigné") {
            // tx is also isolated by getServiceClient because it inherits the extension
            const g = await tx.gestionnaire.findFirst({ where: { prenom: { equals: pg } } });
            if (g) gestId = g.id;
          }

          const sec = determineSecteur(adrId ? { rue: safeStr(row["Lieu de vie / Adresse"]) || undefined, numero: safeStr(row["N°"]) || undefined, codePostal: safeStr(row["Code Postal"]) || undefined, ville: safeStr(row.Ville) || undefined } : null);

          const user = await tx.user.create({
            data: {
              id: generateUserIdByAntenne(safeStr(row.Antenne) !== 'Non spécifié' ? safeStr(row.Antenne) : null),
              annee: new Date().getFullYear(), nom, prenom, dateNaissance: parseExcelDate(row["Date de naissance"]), genre: parseGenre(row["Genre"]),
              telephone: safeStr(row["Téléphone"]), email: safeStr(row["Mail"]), dateOuverture: parseExcelDate(row["Date d'ouverture de dossier"]) || new Date(),
              dateCloture: parseExcelDate(row["Date de clôture"]), etat: safeStrDef(row["État du dossier"], "Actif"), antenne: safeStrDef(row.Antenne, "Non spécifié"),
              statutSejour: safeStrDef(row["Statut de séjour"], "Non spécifié"), nationalite: safeStrDef(row.Nationalité, "Non spécifiée"), trancheAge: safeStrDef(row["Tranche d'âge"], "Non spécifié"),
              remarques: safeStr(row["Bilan Social"]) || safeStr(row.Remarques), secteur: sec || safeStr(row.Secteur) || "Non spécifié", langue: safeStr(row["Langue de l'entretien"]),
              premierContact: safeStrDef(row["Premier contact"], "Import"), notesGenerales: safeStr(row["Notes Générales"]), donneesConfidentielles: safeStr(row["Données Confidentielles"]),
              informationImportante: safeStr(row["Information Importante"]) || safeStr(row["Notes Importantes"]),
              ...(adrId && { adresse: { connect: { id: adrId } } }), ...(gestId && { gestionnaire: { connect: { id: gestId } } }),
            }
          });

          if (row.ProblematiquesPrincipales) await tx.problematique.create({ data: { type: safeStrDef(row.TypeProblematique, "Général"), description: String(row.ProblematiquesPrincipales), userId: user.id } });
          results.imported++;
        } catch (err: any) {
          results.errors.push(`${row.Nom || 'SansNom'} : ${err.message}`); results.failed++;
        }
      }
    });

    return NextResponse.json({ message: "Import terminé", ...results });
  } catch (err: any) {
    return NextResponse.json({ error: 'Server Error', details: err.message }, { status: 500 });
  }
}
