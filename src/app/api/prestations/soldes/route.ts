/*
Copyright (C) 2025 ABDEL KADER CHATAR
*/

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.gestionnaire) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const annee = parseInt(searchParams.get('annee') || '2026');
    const gestionnaireId = searchParams.get('gestionnaireId') || session.user.gestionnaire.id;

    // Sécurité : Un user lambda ne peut voir que ses propres soldes
    if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'SUPER_ADMIN' && gestionnaireId !== (session?.user as any)?.gestionnaire?.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        // 1. Récupérer le solde théorique (quotas)
        let solde = await prisma.soldeConge.findUnique({
            where: {
                gestionnaireId_annee: {
                    gestionnaireId,
                    annee
                }
            }
        });

        // Si pas de solde existant, on renvoie des zéros (ou on le crée à la volée, mais ici renvoyons 0)
        if (!solde) {
            solde = {
                id: 'virtual',
                gestionnaireId,
                annee,
                vacancesAnnuelles: 0,
                consultationMedicale: 0,
                forceMajeure: 0,
                congesReglementaires: 0,
                creditHeures: 0,
                heuresSupplementaires: 0,
                updatedAt: new Date()
            } as any;
        }

        // 2. Calculer le consommé (réel) basé sur les prestations validées de l'année
        const debutAnnee = new Date(`${annee}-01-01T00:00:00.000Z`);
        const finAnnee = new Date(`${annee}-12-31T23:59:59.999Z`);

        const prestations = await prisma.prestation.findMany({
            where: {
                gestionnaireId,
                date: {
                    gte: debutAnnee,
                    lte: finAnnee
                }
            },
            select: {
                motif: true,
                dureeNet: true
            }
        });

        // Initialiser les compteurs de consommation
        const consomme = {
            vacancesAnnuelles: 0,
            consultationMedicale: 0,
            forceMajeure: 0,
            congesReglementaires: 0,
            creditHeures: 0, // Crédit Heures
            maladie: 0 // Informatif, pas de quota généralement
        };

        prestations.forEach(p => {
            // Mapping motifs -> compteurs
            if (p.motif === 'Congé VA') consomme.vacancesAnnuelles += p.dureeNet;
            else if (p.motif === 'Consultation médicale') consomme.consultationMedicale += p.dureeNet;
            else if (p.motif === 'Force majeure') consomme.forceMajeure += p.dureeNet;
            else if (p.motif.includes('règlementaire')) consomme.congesReglementaires += p.dureeNet; // "Congé réglementaire" (à vérifier motif exact)
            else if (p.motif === 'Congé CH') consomme.creditHeures += p.dureeNet;
            else if (p.motif === 'Maladie' || p.motif === 'Maladie (certificat)') consomme.maladie += p.dureeNet;
        });

        return NextResponse.json({
            quotas: solde,
            consomme,
            restant: {
                vacancesAnnuelles: (solde?.vacancesAnnuelles || 0) - consomme.vacancesAnnuelles,
                consultationMedicale: (solde?.consultationMedicale || 0) - consomme.consultationMedicale,
                forceMajeure: (solde?.forceMajeure || 0) - consomme.forceMajeure,
                congesReglementaires: (solde?.congesReglementaires || 0) - consomme.congesReglementaires,
                creditHeures: (solde?.creditHeures || 0) - consomme.creditHeures,
            }
        });

    } catch (error) {
        console.error("Error fetching soldes:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { gestionnaireId, annee, vacancesAnnuelles, consultationMedicale, forceMajeure, congesReglementaires, creditHeures, heuresSupplementaires } = body;

        // Security Check: Only ADMIN or SELF can update
        const userRole = (session as any).user.role;
        const currentGestionnaireId = (session as any).user.gestionnaire?.id;
        const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';

        if (!isAdmin) {
            return NextResponse.json({ error: 'Unauthorized: Only Admins can update quotas' }, { status: 403 });
        }

        const solde = await prisma.soldeConge.upsert({
            where: {
                gestionnaireId_annee: {
                    gestionnaireId,
                    annee
                }
            },
            update: {
                vacancesAnnuelles,
                consultationMedicale,
                forceMajeure,
                congesReglementaires,
                creditHeures,
                heuresSupplementaires
            },
            create: {
                gestionnaireId,
                annee,
                vacancesAnnuelles,
                consultationMedicale,
                forceMajeure,
                congesReglementaires,
                creditHeures,
                heuresSupplementaires
            }
        });

        return NextResponse.json(solde);

    } catch (error) {
        console.error("Error updating soldes:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
