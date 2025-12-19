/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function POST() {
    try {
        // Vérifier l'authentification
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        console.log('[FIX-DATES] Recherche des dossiers avec dates invalides...');

        // Récupérer tous les utilisateurs
        const users = await prisma.user.findMany({
            select: {
                id: true,
                nom: true,
                prenom: true,
                dateOuverture: true,
                createdAt: true,
            },
        });

        const invalidDateUsers: { id: string; nom: string; prenom: string; dateOuverture: Date | null; createdAt: Date }[] = [];

        for (const user of users) {
            // Vérifier si dateOuverture est null ou invalide
            if (!user.dateOuverture) {
                invalidDateUsers.push(user);
            } else {
                const date = new Date(user.dateOuverture);
                if (isNaN(date.getTime())) {
                    invalidDateUsers.push(user);
                }
            }
        }

        console.log(`[FIX-DATES] Total: ${users.length}, Invalides: ${invalidDateUsers.length}`);

        if (invalidDateUsers.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'Aucun dossier avec date invalide trouvé',
                total: users.length,
                fixed: 0,
                details: [],
            });
        }

        // Corriger les dates
        const fixedUsers: { id: string; nom: string; prenom: string; newDate: string }[] = [];

        for (const user of invalidDateUsers) {
            try {
                await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        dateOuverture: user.createdAt,
                    },
                });
                fixedUsers.push({
                    id: user.id,
                    nom: user.nom,
                    prenom: user.prenom,
                    newDate: user.createdAt.toISOString().split('T')[0],
                });
            } catch (error) {
                console.error(`[FIX-DATES] Erreur pour ${user.nom} ${user.prenom}:`, error);
            }
        }

        console.log(`[FIX-DATES] Corrigés: ${fixedUsers.length}/${invalidDateUsers.length}`);

        return NextResponse.json({
            success: true,
            message: `${fixedUsers.length} dossier(s) corrigé(s)`,
            total: users.length,
            found: invalidDateUsers.length,
            fixed: fixedUsers.length,
            details: fixedUsers,
        });

    } catch (error) {
        console.error('[FIX-DATES] Erreur:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la correction des dates' },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        // Vérifier l'authentification
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        // Mode prévisualisation - ne fait que lister les dossiers à corriger
        const users = await prisma.user.findMany({
            select: {
                id: true,
                nom: true,
                prenom: true,
                dateOuverture: true,
                createdAt: true,
            },
        });

        const invalidDateUsers: { id: string; nom: string; prenom: string; currentDate: string | null; proposedDate: string }[] = [];

        for (const user of users) {
            if (!user.dateOuverture) {
                invalidDateUsers.push({
                    id: user.id,
                    nom: user.nom,
                    prenom: user.prenom,
                    currentDate: null,
                    proposedDate: user.createdAt.toISOString().split('T')[0],
                });
            } else {
                const date = new Date(user.dateOuverture);
                if (isNaN(date.getTime())) {
                    invalidDateUsers.push({
                        id: user.id,
                        nom: user.nom,
                        prenom: user.prenom,
                        currentDate: String(user.dateOuverture),
                        proposedDate: user.createdAt.toISOString().split('T')[0],
                    });
                }
            }
        }

        return NextResponse.json({
            success: true,
            total: users.length,
            invalidCount: invalidDateUsers.length,
            invalidUsers: invalidDateUsers,
            instruction: 'Utilisez POST pour corriger ces dates',
        });

    } catch (error) {
        console.error('[FIX-DATES] Erreur:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la vérification' },
            { status: 500 }
        );
    }
}
