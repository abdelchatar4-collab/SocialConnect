/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

/**
 * Check for duplicate users by nom + prenom
 * Returns potential duplicates for user confirmation before creation
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { nom, prenom } = body;

        console.log('[check-duplicate] Checking for:', { nom, prenom });

        if (!nom || !prenom) {
            return NextResponse.json(
                { hasDuplicate: false, duplicates: [] },
                { status: 200 }
            );
        }

        // Search for users with same nom AND prenom using raw SQL for case-insensitive match
        const nomLower = nom.toLowerCase();
        const prenomLower = prenom.toLowerCase();

        // Use Prisma's native query without case-sensitivity workaround
        // MySQL with utf8 collation is case-insensitive by default
        const allUsers = await prisma.user.findMany({
            where: {
                AND: [
                    { nom: { contains: nom } },
                    { prenom: { contains: prenom } }
                ]
            },
            select: {
                id: true,
                nom: true,
                prenom: true,
                dateNaissance: true,
                antenne: true,
                gestionnaire: {
                    select: {
                        prenom: true,
                        nom: true
                    }
                }
            },
            take: 50 // Increase limit to catch more potential matches
        });

        console.log('[check-duplicate] Found users:', allUsers.length);

        // Filter for exact matches (case-insensitive)
        const duplicates = allUsers.filter(u =>
            u.nom?.toLowerCase() === nomLower &&
            u.prenom?.toLowerCase() === prenomLower
        );

        console.log('[check-duplicate] Exact matches:', duplicates.length);

        // Format duplicates for display
        const formattedDuplicates = duplicates.map(u => ({
            id: u.id,
            nom: u.nom,
            prenom: u.prenom,
            dateNaissance: u.dateNaissance,
            antenne: u.antenne,
            gestionnaire: u.gestionnaire
                ? `${u.gestionnaire.prenom} ${u.gestionnaire.nom || ''}`.trim()
                : null
        }));

        return NextResponse.json({
            hasDuplicate: formattedDuplicates.length > 0,
            duplicates: formattedDuplicates
        });

    } catch (error) {
        console.error('[API POST /api/users/check-duplicate] Error:', error);
        // Return no duplicates on error to not block user creation
        return NextResponse.json(
            { hasDuplicate: false, duplicates: [], error: 'Check failed' },
            { status: 200 }
        );
    }
}
