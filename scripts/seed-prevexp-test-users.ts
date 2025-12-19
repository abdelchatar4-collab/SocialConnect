/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding PrevExp test users...');

    const testUsers = [
        // SUCCÈS (3 dossiers - VERT)
        {
            nom: 'Dubois',
            prenom: 'Marie',
            genre: 'Femme',
            telephone: '0470123456',
            email: 'marie.dubois@test.be',
            etat: 'Actif',
            antenne: 'Bruxelles Centre',
            dateOuverture: new Date('2024-01-15'),
            hasPrevExp: true,
            prevExpDateReception: new Date('2024-02-01'),
            prevExpDateRequete: new Date('2024-02-15'),
            prevExpDateVad: new Date('2024-03-10'),
            prevExpDateAudience: new Date('2024-04-20'),
            prevExpDateJugement: new Date('2024-05-15'),
            prevExpSolutionRelogement: 'Maintien dans le logement',
            prevExpTypeFamille: 'Famille monoparentale',
            prevExpTypeRevenu: 'CPAS',
            prevExpEtatLogement: 'Bon état',
            prevExpNombreChambre: '2 chambres',
            prevExpDemandeCpas: 'Prise en charge des arriérés',
            prevExpNegociationProprio: 'Accord trouvé',
            prevExpAideJuridique: 'Oui',
            prevExpCommentaire: 'Négociation réussie avec le propriétaire.',
            logementDetails: {
                typeLogement: 'Appartement',
                hasLitige: true,
                typeLitige: 'Arriérés de loyer',
                dateLitige: new Date('2024-01-20'),
                preavisPour: 'Sans motif'
            }
        },
        {
            nom: 'Peeters',
            prenom: 'Jan',
            genre: 'Homme',
            telephone: '0471234567',
            email: 'jan.peeters@test.be',
            etat: 'Actif',
            antenne: 'Schaerbeek',
            dateOuverture: new Date('2024-02-10'),
            hasPrevExp: true,
            prevExpDateReception: new Date('2024-03-01'),
            prevExpDateRequete: new Date('2024-03-15'),
            prevExpDateVad: new Date('2024-04-05'),
            prevExpDateAudience: new Date('2024-05-10'),
            prevExpDateJugement: new Date('2024-06-01'),
            prevExpSolutionRelogement: 'Logement Bxl',
            prevExpTypeFamille: 'Personne seule',
            prevExpTypeRevenu: 'Chômage',
            prevExpEtatLogement: 'Trop petit',
            prevExpNombreChambre: '1 chambre',
            prevExpDemandeCpas: 'Logement de transit',
            prevExpAideJuridique: 'Oui',
            prevExpCommentaire: 'Relogement via AIS.',
            logementDetails: {
                typeLogement: 'Studio',
                hasLitige: true,
                typeLitige: 'Insalubrité',
                dateLitige: new Date('2024-02-15'),
                preavisPour: 'Travaux'
            }
        },
        {
            nom: 'Hassan',
            prenom: 'Fatima',
            genre: 'Femme',
            telephone: '0472345678',
            email: 'fatima.hassan@test.be',
            etat: 'Actif',
            antenne: 'Molenbeek',
            dateOuverture: new Date('2024-03-05'),
            hasPrevExp: true,
            prevExpDateReception: new Date('2024-03-20'),
            prevExpDateRequete: new Date('2024-04-01'),
            prevExpDateVad: new Date('2024-04-25'),
            prevExpDateAudience: new Date('2024-05-30'),
            prevExpDateJugement: new Date('2024-06-20'),
            prevExpSolutionRelogement: 'Logement privé',
            prevExpTypeFamille: 'Couple avec enfants',
            prevExpTypeRevenu: 'Salaire',
            prevExpEtatLogement: 'Bon état',
            prevExpNombreChambre: '3 chambres',
            prevExpDemandeCpas: 'Garantie locative',
            prevExpNegociationProprio: 'Accord trouvé',
            prevExpAideJuridique: 'Non',
            prevExpCommentaire: 'Famille relogée dans le secteur privé.',
            logementDetails: {
                typeLogement: 'Maison',
                hasLitige: true,
                typeLitige: 'Arriérés de loyer',
                dateLitige: new Date('2024-03-10'),
                preavisPour: 'Occupation personnelle'
            }
        },

        // ÉCHEC (3 dossiers - ROUGE)
        {
            nom: 'Vermeulen',
            prenom: 'Sophie',
            genre: 'Femme',
            telephone: '0473456789',
            email: 'sophie.vermeulen@test.be',
            etat: 'Actif',
            antenne: 'Anderlecht',
            dateOuverture: new Date('2024-01-20'),
            hasPrevExp: true,
            prevExpDateReception: new Date('2024-02-05'),
            prevExpDateRequete: new Date('2024-02-20'),
            prevExpDateVad: new Date('2024-03-15'),
            prevExpDateAudience: new Date('2024-04-25'),
            prevExpDateJugement: new Date('2024-05-20'),
            prevExpDateExpulsion: new Date('2025-01-15'), // FUTURE
            prevExpSolutionRelogement: 'Aucune solution trouvée',
            prevExpTypeFamille: 'Personne seule',
            prevExpTypeRevenu: 'Sans revenus',
            prevExpEtatLogement: 'Insalubre',
            prevExpNombreChambre: '1 chambre',
            prevExpDemandeCpas: 'Prise en charge des arriérés',
            prevExpNegociationProprio: 'Échec',
            prevExpAideJuridique: 'Oui',
            prevExpCommentaire: 'Situation très précaire, risque SDF.',
            logementDetails: {
                typeLogement: 'Studio',
                hasLitige: true,
                typeLitige: 'Nuisances',
                dateLitige: new Date('2024-01-25'),
                preavisPour: 'Sans motif'
            }
        },
        {
            nom: 'Diallo',
            prenom: 'Amadou',
            genre: 'Homme',
            telephone: '0474567890',
            email: 'amadou.diallo@test.be',
            etat: 'Actif',
            antenne: 'Ixelles',
            dateOuverture: new Date('2024-02-15'),
            hasPrevExp: true,
            prevExpDateReception: new Date('2024-03-05'),
            prevExpDateRequete: new Date('2024-03-20'),
            prevExpDateVad: new Date('2024-04-10'),
            prevExpDateAudience: new Date('2024-05-15'),
            prevExpDateJugement: new Date('2024-06-10'),
            prevExpDateExpulsion: new Date('2025-02-01'), // FUTURE
            prevExpSolutionRelogement: 'Aucune solution trouvée',
            prevExpTypeFamille: 'Personne seule',
            prevExpTypeRevenu: 'CPAS',
            prevExpEtatLogement: 'Trop petit',
            prevExpNombreChambre: 'Studio',
            prevExpDemandeCpas: 'Logement de transit',
            prevExpAideJuridique: 'Oui',
            prevExpCommentaire: 'En attente de place en maison d\'accueil.',
            logementDetails: {
                typeLogement: 'Chambre',
                hasLitige: true,
                typeLitige: 'Arriérés de loyer',
                dateLitige: new Date('2024-02-20'),
                preavisPour: 'Travaux'
            }
        },
        {
            nom: 'Janssens',
            prenom: 'Luc',
            genre: 'Homme',
            telephone: '0475678901',
            email: 'luc.janssens@test.be',
            etat: 'Actif',
            antenne: 'Etterbeek',
            dateOuverture: new Date('2024-03-10'),
            hasPrevExp: true,
            prevExpDateReception: new Date('2024-03-25'),
            prevExpDateRequete: new Date('2024-04-10'),
            prevExpDateVad: new Date('2024-05-05'),
            prevExpDateAudience: new Date('2024-06-15'),
            prevExpDateJugement: new Date('2024-07-10'),
            prevExpDateExpulsion: new Date('2025-03-01'), // FUTURE
            prevExpSolutionRelogement: 'Aucune solution trouvée',
            prevExpTypeFamille: 'Personne seule',
            prevExpTypeRevenu: 'Sans revenus',
            prevExpEtatLogement: 'Insalubre',
            prevExpNombreChambre: 'Studio',
            prevExpAideJuridique: 'Non',
            prevExpCommentaire: 'Refus de coopération.',
            logementDetails: {
                typeLogement: 'Studio',
                hasLitige: true,
                typeLitige: 'Insalubrité',
                dateLitige: new Date('2024-03-15'),
                preavisPour: 'Occupation personnelle'
            }
        },

        // VARIÉS (4 dossiers - ORANGE/NEUTRE)
        {
            nom: 'Martinez',
            prenom: 'Carlos',
            genre: 'Homme',
            telephone: '0476789012',
            email: 'carlos.martinez@test.be',
            etat: 'Actif',
            antenne: 'Saint-Gilles',
            dateOuverture: new Date('2024-01-25'),
            hasPrevExp: true,
            prevExpDateReception: new Date('2024-02-10'),
            prevExpDateRequete: new Date('2024-02-25'),
            prevExpDateVad: new Date('2024-03-20'),
            prevExpDateAudience: new Date('2024-04-30'),
            prevExpDateJugement: new Date('2024-05-25'),
            prevExpSolutionRelogement: 'Maison d\'accueil',
            prevExpTypeFamille: 'Personne seule',
            prevExpTypeRevenu: 'CPAS',
            prevExpEtatLogement: 'Bon état',
            prevExpNombreChambre: '1 chambre',
            prevExpDemandeCpas: 'Prise en charge des arriérés',
            prevExpAideJuridique: 'Oui',
            prevExpCommentaire: 'Hébergement temporaire en maison d\'accueil.',
            logementDetails: {
                typeLogement: 'Appartement',
                hasLitige: true,
                typeLitige: 'Arriérés de loyer',
                dateLitige: new Date('2024-01-30'),
                preavisPour: 'Sans motif'
            }
        },
        {
            nom: 'Nguyen',
            prenom: 'Linh',
            genre: 'Femme',
            telephone: '0477890123',
            email: 'linh.nguyen@test.be',
            etat: 'Actif',
            antenne: 'Forest',
            dateOuverture: new Date('2024-02-20'),
            hasPrevExp: true,
            prevExpDateReception: new Date('2024-03-10'),
            prevExpDateRequete: new Date('2024-03-25'),
            prevExpDateVad: new Date('2024-04-15'),
            prevExpDateAudience: new Date('2024-05-20'),
            prevExpDateJugement: new Date('2024-06-15'),
            prevExpSolutionRelogement: 'Logement de transit',
            prevExpTypeFamille: 'Famille monoparentale',
            prevExpTypeRevenu: 'Chômage',
            prevExpEtatLogement: 'Trop petit',
            prevExpNombreChambre: '2 chambres',
            prevExpDemandeCpas: 'Logement de transit',
            prevExpNegociationProprio: 'En cours',
            prevExpAideJuridique: 'Oui',
            prevExpCommentaire: 'En attente de logement social.',
            logementDetails: {
                typeLogement: 'Appartement',
                hasLitige: true,
                typeLitige: 'Insalubrité',
                dateLitige: new Date('2024-02-25'),
                preavisPour: 'Travaux'
            }
        },
        {
            nom: 'Cohen',
            prenom: 'David',
            genre: 'Homme',
            telephone: '0478901234',
            email: 'david.cohen@test.be',
            etat: 'Actif',
            antenne: 'Uccle',
            dateOuverture: new Date('2024-03-15'),
            hasPrevExp: true,
            prevExpDateReception: new Date('2024-04-01'),
            prevExpDateRequete: new Date('2024-04-15'),
            prevExpDateVad: new Date('2024-05-10'),
            prevExpDateAudience: new Date('2024-06-20'),
            prevExpSolutionRelogement: 'SAMU Social',
            prevExpTypeFamille: 'Personne seule',
            prevExpTypeRevenu: 'Sans revenus',
            prevExpEtatLogement: 'Insalubre',
            prevExpNombreChambre: 'Studio',
            prevExpAideJuridique: 'Non',
            prevExpCommentaire: 'Orientation vers le SAMU Social.',
            logementDetails: {
                typeLogement: 'Chambre',
                hasLitige: true,
                typeLitige: 'Nuisances',
                dateLitige: new Date('2024-03-20'),
                preavisPour: 'Occupation personnelle'
            }
        },
        {
            nom: 'Bakker',
            prenom: 'Emma',
            genre: 'Femme',
            telephone: '0479012345',
            email: 'emma.bakker@test.be',
            etat: 'Actif',
            antenne: 'Woluwe',
            dateOuverture: new Date('2024-04-01'),
            hasPrevExp: true,
            prevExpDateReception: new Date('2024-04-20'),
            prevExpDateRequete: new Date('2024-05-05'),
            prevExpDateVad: new Date('2024-05-25'),
            prevExpDateAudience: new Date('2024-07-01'),
            prevExpSolutionRelogement: 'Logement d\'urgence',
            prevExpTypeFamille: 'Couple avec enfants',
            prevExpTypeRevenu: 'CPAS',
            prevExpEtatLogement: 'Bon état',
            prevExpNombreChambre: '3 chambres',
            prevExpDemandeCpas: 'Garantie locative',
            prevExpNegociationProprio: 'En cours',
            prevExpAideJuridique: 'Oui',
            prevExpCommentaire: 'Famille en attente de solution pérenne.',
            logementDetails: {
                typeLogement: 'Maison',
                hasLitige: true,
                typeLitige: 'Arriérés de loyer',
                dateLitige: new Date('2024-04-05'),
                preavisPour: 'Sans motif'
            }
        }
    ];

    for (const userData of testUsers) {
        try {
            const { logementDetails, ...userDataWithoutLogement } = userData;

            const user = await prisma.user.create({
                data: {
                    id: randomUUID(), // Generate unique ID
                    ...userDataWithoutLogement,
                    logementDetails: JSON.stringify(logementDetails) // Serialize as JSON
                }
            });
            console.log(`✓ Created user: ${user.prenom} ${user.nom} (ID: ${user.id})`);
        } catch (error) {
            console.error(`✗ Error creating user ${userData.prenom} ${userData.nom}:`, error);
        }
    }

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
