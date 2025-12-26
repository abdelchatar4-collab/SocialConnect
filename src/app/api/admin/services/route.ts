import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { getGlobalClient } from '@/lib/prisma-clients';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as any).role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
        }

        const prisma = getGlobalClient();
        const services = await prisma.service.findMany({
            select: { id: true, name: true, slug: true },
            orderBy: { name: 'asc' }
        });

        return NextResponse.json(services);
    } catch (error) {
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
