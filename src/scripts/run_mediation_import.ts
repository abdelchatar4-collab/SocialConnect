import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
    const SERVICE_ID = 'mediation';
    const SERVICE_NAME = 'Médiation Locale';
    const JSON_FILE = path.join(process.cwd(), 'public', 'import_mediation_ready.json');

    console.log(`🚀 Démarrage de l'import pour le service : ${SERVICE_NAME} (${SERVICE_ID})`);

    // 0. Assurer que le SERVICE existe (Relation FK)
    // User et Gestionnaire dépendent de Service
    const service = await prisma.service.upsert({
        where: { id: SERVICE_ID },
        update: {},
        create: {
            id: SERVICE_ID,
            slug: 'mediation-locale',
            name: SERVICE_NAME,
            isActive: true
        }
    });
    console.log(`✅ Service entity assuré : ${service.name} (${service.id})`);

    // 1. Initialiser les Settings pour ce service
    const existingSettings = await prisma.settings.findFirst({
        where: { serviceId: SERVICE_ID }
    });

    if (!existingSettings) {
        console.log(`⚙️ Création des paramètres par défaut pour ${SERVICE_NAME}...`);
        await prisma.settings.create({
            data: {
                serviceId: SERVICE_ID,
                serviceName: SERVICE_NAME,
                primaryColor: "#059669", // Un vert émeraude
                headerSubtitle: "SERVICE DE MÉDIATION",
                requiredFields: JSON.stringify([]),
                colleagueBirthdays: JSON.stringify([]),
                availableYears: JSON.stringify([2024, 2025]),
                enabledModules: JSON.stringify({
                    housingAnalysis: false,
                    statsDashboard: true,
                    exportData: true,
                    documents: true
                })
            }
        });
    } else {
        console.log(`⚙️ Paramètres existants trouvés pour ${SERVICE_NAME}.`);
    }

    // 2. Pré-création des Gestionnaires (Seed)
    // Cache pour les gestionnaires créés/trouvés
    const gestionnaireCache: Record<string, string> = {};
    const OFFICIAL_MANAGERS = ['Louise', 'Pascal', 'Souaad'];

    console.log(`👥 Vérification des gestionnaires officiels : ${OFFICIAL_MANAGERS.join(', ')}...`);

    for (const name of OFFICIAL_MANAGERS) {
        const existing = await prisma.gestionnaire.findFirst({
            where: {
                serviceId: SERVICE_ID,
                prenom: name
            }
        });

        if (existing) {
            gestionnaireCache[name] = existing.id;
            console.log(`   ✅ ${name} existe déjà.`);
        } else {
            console.log(`   ✨ Création de ${name}...`);
            const created = await prisma.gestionnaire.create({
                data: {
                    prenom: name,
                    nom: "",
                    service: { connect: { id: SERVICE_ID } }
                }
            });
            gestionnaireCache[name] = created.id;
        }
    }

    // 3. Lire le JSON
    if (!fs.existsSync(JSON_FILE)) {
        console.error(`❌ Fichier introuvable : ${JSON_FILE}`);
        process.exit(1);
    }

    const rawData = fs.readFileSync(JSON_FILE, 'utf-8');
    const users = JSON.parse(rawData);
    console.log(`📂 Fichier JSON chargé : ${users.length} utilisateurs à importer.`);

    // 4. Importer les utilisateurs
    let successCount = 0;
    let errorCount = 0;

    for (const userData of users) {
        try {
            // a. Gestion du Gestionnaire
            let gestionnaireId = null;
            if (userData.gestionnaire) {
                const gestName = userData.gestionnaire.trim();

                if (gestionnaireCache[gestName]) {
                    gestionnaireId = gestionnaireCache[gestName];
                } else {
                    // Chercher si existe déjà pour ce service (hors liste officielle)
                    const existingGest = await prisma.gestionnaire.findFirst({
                        where: {
                            serviceId: SERVICE_ID,
                            OR: [
                                { prenom: gestName },
                                { nom: gestName }
                            ]
                        }
                    });

                    if (existingGest) {
                        gestionnaireId = existingGest.id;
                        gestionnaireCache[gestName] = existingGest.id;
                    } else {
                        // Créer le gestionnaire (fallback)
                        console.log(`👤 Création du gestionnaire supplémentaire : ${gestName}`);
                        const newGest = await prisma.gestionnaire.create({
                            data: {
                                prenom: gestName,
                                nom: "",
                                service: { connect: { id: SERVICE_ID } }
                            }
                        });
                        gestionnaireId = newGest.id;
                        gestionnaireCache[gestName] = newGest.id;
                    }
                }
            }

            // b. Gestion de l'Adresse
            let adresseId = null;
            if (userData.adresse && userData.adresse.rue) {
                const newAddr = await prisma.adresse.create({
                    data: {
                        rue: userData.adresse.rue,
                        numero: userData.adresse.numero,
                        codePostal: userData.adresse.codePostal,
                        ville: userData.adresse.ville
                    }
                });
                adresseId = newAddr.id;
            }

            // c. Création de l'User
            await prisma.user.create({
                data: {
                    id: randomUUID(),
                    service: { connect: { id: SERVICE_ID } },
                    nom: userData.nom || "Inconnu",
                    prenom: userData.prenom || "Inconnu",
                    // Dates
                    dateOuverture: userData.dateOuverture ? new Date(userData.dateOuverture) : new Date(),
                    dateCloture: userData.dateCloture ? new Date(userData.dateCloture) : null,
                    // Contact
                    telephone: userData.telephone,
                    email: userData.email,
                    // Infos
                    genre: userData.genre,
                    trancheAge: userData.trancheAge,
                    secteur: userData.secteur,
                    remarques: userData.remarques,
                    annee: 2025,

                    // Relations
                    ...(adresseId && { adresse: { connect: { id: adresseId } } }),
                    ...(gestionnaireId && { gestionnaire: { connect: { id: gestionnaireId } } })
                }
            });

            process.stdout.write('.'); // Feedback visuel
            successCount++;

        } catch (e) {
            console.error(`\n❌ Erreur sur ${userData.nom} ${userData.prenom}:`, e);
            errorCount++;
        }
    }

    console.log(`\n\n✅ IMPORT TERMINÉ !`);
    console.log(`Succès : ${successCount}`);
    console.log(`Erreurs : ${errorCount}`);
    console.log(`Service ID : ${SERVICE_ID}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
