/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.
*/

import { NextResponse } from 'next/server';
import { getGlobalClient } from '@/lib/prisma-clients';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function POST() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as any).role !== 'SUPER_ADMIN') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });

        const prisma = getGlobalClient();
        const users = await prisma.user.findMany({ select: { id: true, nom: true, prenom: true, dateOuverture: true, createdAt: true } });

        const invalidDateUsers = users.filter((u: any) => !u.dateOuverture || isNaN(new Date(u.dateOuverture).getTime()));

        if (invalidDateUsers.length === 0) return NextResponse.json({ success: true, message: 'Aucun dossier invalide' });

        const fixedUsers: any[] = [];
        for (const user of invalidDateUsers) {
            try {
                await prisma.user.update({ where: { id: user.id }, data: { dateOuverture: user.createdAt } });
                fixedUsers.push({ id: user.id, nom: user.nom, prenom: user.prenom, newDate: user.createdAt.toISOString().split('T')[0] });
            } catch (error: any) {
                console.error(`Erreur pour ${user.id}:`, error.message);
            }
        }

        return NextResponse.json({ success: true, message: `${fixedUsers.length} dossiers corrigés`, total: users.length, fixed: fixedUsers.length });
    } catch (error) {
        return NextResponse.json({ error: 'Erreur lors de la correction' }, { status: 500 });
    }
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

        const prisma = getGlobalClient();
        const users = await prisma.user.findMany({ select: { id: true, nom: true, prenom: true, dateOuverture: true, createdAt: true } });

        const invalidDateUsers = users.filter((u: any) => !u.dateOuverture || isNaN(new Date(u.dateOuverture).getTime())).map((u: any) => ({
            id: u.id, nom: u.nom, prenom: u.prenom, currentDate: u.dateOuverture, proposedDate: u.createdAt.toISOString().split('T')[0]
        }));

        return NextResponse.json({ success: true, total: users.length, invalidCount: invalidDateUsers.length, invalidUsers: invalidDateUsers });
    } catch (error) {
        return NextResponse.json({ error: 'Erreur lors de la vérification' }, { status: 500 });
    }
}
