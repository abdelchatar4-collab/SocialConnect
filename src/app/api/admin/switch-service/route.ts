import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { getGlobalClient } from '@/lib/prisma-clients';

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || (session.user as any).role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Droits insuffisants' }, { status: 403 });
        }

        const body = await request.json();
        const { targetServiceId } = body;

        if (!targetServiceId) {
            return NextResponse.json({ error: 'Service ID manquant' }, { status: 400 });
        }

        const prisma = getGlobalClient();
        const service = await prisma.service.findUnique({ where: { id: targetServiceId } });

        if (!service) return NextResponse.json({ error: 'Service introuvable' }, { status: 404 });

        await prisma.gestionnaire.update({
            where: { email: session.user.email! },
            data: { lastActiveServiceId: targetServiceId }
        });

        return NextResponse.json({
            success: true,
            message: `Contexte basculé vers ${service.name}`,
            serviceId: service.id
        });
    } catch (error) {
        return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
    }
}
