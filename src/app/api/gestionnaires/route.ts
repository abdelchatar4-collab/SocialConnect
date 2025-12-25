import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userRole = (session as any).user.role;
  const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';

  try {
    if (!isAdmin) {
      // Return self as a list of 1
      const gestionnaireId = (session as any).user.gestionnaire?.id;
      if (!gestionnaireId) return NextResponse.json([], { status: 200 });

      const self = await prisma.gestionnaire.findUnique({
        where: { id: gestionnaireId },
        select: {
          id: true,
          nom: true,
          prenom: true,
          email: true,
          role: true,
          couleurMedaillon: true,
          isActive: true,
          isGestionnaireDossier: true,
          serviceId: true
        }
      });
      return NextResponse.json(self ? [self] : []);
    }

    const gestionnaires = await prisma.gestionnaire.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        role: true,
        couleurMedaillon: true,
        isActive: true,
        isGestionnaireDossier: true,
        serviceId: true
      },
      orderBy: {
        nom: 'asc'
      }
    });

    return NextResponse.json(gestionnaires);
  } catch (error) {
    console.error('Error fetching gestionnaires:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
