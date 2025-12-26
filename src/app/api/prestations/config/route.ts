/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.
*/

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { getServiceClient } from '@/lib/prisma-clients';
import { getDynamicServiceId } from '@/lib/auth-utils';
import { authOptions } from '@/lib/authOptions';

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const serviceId = await getDynamicServiceId(session);
    const prisma = getServiceClient(serviceId);

    try {
        const currentUser = await prisma.gestionnaire.findUnique({
            where: { email: session.user.email as string },
            select: { horaireHabituel: true }
        });
        if (!currentUser) return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
        return NextResponse.json(currentUser.horaireHabituel || null);
    } catch (error) {
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const serviceId = await getDynamicServiceId(session);
    const prisma = getServiceClient(serviceId);

    try {
        const config = await request.json();
        const updatedUser = await prisma.gestionnaire.update({
            where: { email: session.user.email as string },
            data: { horaireHabituel: config }
        });
        return NextResponse.json(updatedUser.horaireHabituel);
    } catch (error: any) {
        return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
    }
}
