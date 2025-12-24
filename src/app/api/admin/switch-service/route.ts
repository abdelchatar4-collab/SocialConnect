import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        // Sécurité : Seuls les SUPER_ADMIN peuvent changer de contexte
        // Ou implémenter une logique plus fine (ex: Admin de Cluster)
        if (session?.user?.role !== 'SUPER_ADMIN') {
            // Optionnel : permettre aussi si le user "possède" le service via une table de droits
            return NextResponse.json({ error: 'Droits insuffisants' }, { status: 403 });
        }

        const body = await request.json();
        const { targetServiceId } = body;

        if (!targetServiceId) {
            return NextResponse.json({ error: 'Service ID manquant' }, { status: 400 });
        }

        // Vérifier que le service existe
        const service = await prisma.service.findUnique({
            where: { id: targetServiceId }
        });

        if (!service) {
            return NextResponse.json({ error: 'Service introuvable' }, { status: 404 });
        }

        // Mettre à jour le gestionnaire
        // On suppose que l'email est unique pour le login
        await prisma.gestionnaire.update({
            where: { email: session.user.email! },
            data: {
                lastActiveServiceId: targetServiceId
            }
        });

        return NextResponse.json({
            success: true,
            message: `Contexte basculé vers ${service.name}`,
            serviceId: service.id
        });

    } catch (error) {
        console.error('Erreur switch-service:', error);
        return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
    }
}
