/**
 * Script d'import complet pour Médiation Locale
 * Lit le fichier Excel et insère directement en base avec le bon gestionnaire
 */

import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

interface UserData {
    nom: string;
    prenom: string;
    genre?: string;
    trancheAge?: string;
    telephone?: string;
    email?: string;
    secteur?: string;
    titulaire?: string;
    dateOuverture?: Date;
    dateCloture?: Date;
    rue?: string;
    numero?: string;
    remarques?: string;
}

async function importMediationFromExcel() {
    console.log('🚀 Import Médiation Locale\n');

    // 1. Charger les gestionnaires existants
    const gestionnaires = await prisma.gestionnaire.findMany({
        where: { serviceId: 'mediation' },
        select: { id: true, prenom: true, nom: true }
    });

    console.log('👤 Gestionnaires disponibles:');
    gestionnaires.forEach(g => console.log(`   - ${g.prenom} ${g.nom || ''}`));

    // Créer le mapping (case-insensitive, avec alias)
    const gestMapping: Record<string, string> = {};
    gestionnaires.forEach(g => {
        gestMapping[g.prenom.toLowerCase()] = g.id;
        if (g.nom) gestMapping[g.nom.toLowerCase()] = g.id;
    });
    // Alias connus
    gestMapping['sedia'] = gestMapping['souaad'] || gestMapping['sedia'];

    console.log('\n📄 Lecture du fichier Excel...');

    // 2. Lire le fichier Excel
    const filePath = path.join(process.cwd(), 'public', 'Listing Médiation locale 2025.xlsx');
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

    // Headers à la ligne 1 (index 1)
    const headers = data[1] as string[];
    console.log(`   ${data.length - 2} lignes à traiter\n`);

    // 3. Traiter chaque ligne
    let created = 0;
    let skipped = 0;
    let errors = 0;

    for (let i = 2; i < data.length; i++) {
        const row = data[i];
        if (!row || row.length === 0) continue;

        // Colonnes (basées sur l'analyse précédente):
        // 0: N° de dossier, 1: Nom, 2: Prénom, 3: Genre, 4: Tranche d'âge
        // 5: Adresse, 6: N°, 7: Secteur, 8: Téléphone, 9: Email
        // 10: Titulaire, 11: Date réception, 12: Date ouverture, 13: Délai, 14: Date clôture
        // 15: Type conflit, 16: Autre type, 17: Envoyeur, 18: Autres, 19: Partenaire
        // 20: Autres, 21: Type médiation, 22: Orientation, 23: Autres, 24: Statut, 25: Issue

        const nom = row[1]?.toString().trim();
        const prenom = row[2]?.toString().trim();

        if (!nom && !prenom) {
            skipped++;
            continue;
        }

        try {
            // Trouver le gestionnaire
            const titulaireRaw = row[10]?.toString().toLowerCase().trim() || '';
            let gestionnaireId: string | null = null;

            if (titulaireRaw.includes('louise') && titulaireRaw.includes('pascal')) {
                gestionnaireId = gestMapping['louise'] || null;
            } else if (gestMapping[titulaireRaw]) {
                gestionnaireId = gestMapping[titulaireRaw];
            }

            // Parser les dates
            const parseExcelDate = (value: any): Date | null => {
                if (!value) return null;
                if (typeof value === 'number') {
                    // Excel date serial number
                    return new Date((value - 25569) * 86400 * 1000);
                }
                if (typeof value === 'string') {
                    const parsed = new Date(value);
                    return isNaN(parsed.getTime()) ? null : parsed;
                }
                if (value instanceof Date) return value;
                return null;
            };

            const dateOuverture = parseExcelDate(row[12]) || parseExcelDate(row[11]) || new Date();
            const dateCloture = parseExcelDate(row[14]);

            // Créer l'adresse si présente
            let adresseId: string | null = null;
            const rue = row[5]?.toString().trim();
            if (rue) {
                const adresse = await prisma.adresse.create({
                    data: {
                        id: uuidv4(),
                        rue: rue,
                        numero: row[6]?.toString() || null,
                        ville: 'Anderlecht',
                        codePostal: '1070'
                    }
                });
                adresseId = adresse.id;
            }

            // Construire les remarques
            const remarques: string[] = [];
            if (row[15]) remarques.push(`Conflit: ${row[15]}`);
            if (row[24]) remarques.push(`Statut: ${row[24]}`);
            if (row[25]) remarques.push(`Issue: ${row[25]}`);
            if (row[21]) remarques.push(`Type médiation: ${row[21]}`);

            // Créer l'usager
            await prisma.user.create({
                data: {
                    id: uuidv4(),
                    nom: nom || 'Inconnu',
                    prenom: prenom || 'Inconnu',
                    genre: row[3]?.toString() || null,
                    trancheAge: row[4]?.toString() || null,
                    telephone: row[8]?.toString() || null,
                    email: row[9]?.toString() || null,
                    secteur: row[7]?.toString() || null,
                    adresseId: adresseId,
                    gestionnaireId: gestionnaireId,
                    dateOuverture: dateOuverture,
                    dateCloture: dateCloture,
                    etat: dateCloture ? 'Clôturé' : 'Actif',
                    annee: 2025,
                    serviceId: 'mediation',
                    remarques: remarques.length > 0 ? remarques.join(' | ') : null,
                    mediationType: row[21]?.toString() || null,
                    mediationStatut: row[24]?.toString() || null,
                }
            });

            created++;
            if (created % 50 === 0) {
                console.log(`   ✅ ${created} usagers créés...`);
            }
        } catch (error) {
            console.error(`   ❌ Erreur ligne ${i + 1}: ${error}`);
            errors++;
        }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 RÉSULTAT IMPORT:');
    console.log(`   ✅ Créés: ${created}`);
    console.log(`   ⏭️ Ignorés (vides): ${skipped}`);
    console.log(`   ❌ Erreurs: ${errors}`);

    // Vérification finale
    const finalCount = await prisma.user.count({ where: { serviceId: 'mediation' } });
    const withGest = await prisma.user.count({
        where: { serviceId: 'mediation', gestionnaireId: { not: null } }
    });

    console.log('\n📈 ÉTAT FINAL:');
    console.log(`   Total usagers Médiation: ${finalCount}`);
    console.log(`   Avec gestionnaire: ${withGest}`);
    console.log(`   Sans gestionnaire: ${finalCount - withGest}`);

    await prisma.$disconnect();
}

importMediationFromExcel().catch(console.error);
