import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { v4 as uuidv4 } from 'uuid';

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

    // Filter by the current user's serviceId for multi-tenant isolation
    const currentServiceId = (session as any).user.serviceId;

    const gestionnaires = await prisma.gestionnaire.findMany({
      where: {
        isActive: true,
        ...(currentServiceId ? { serviceId: currentServiceId } : {})
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

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userRole = (session as any).user.role;
  const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';

  if (!isAdmin) {
    return NextResponse.json({ error: 'Accès non autorisé. Rôle ADMIN requis.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { email, prenom, nom, role, couleurMedaillon, isGestionnaireDossier } = body;

    // Validation
    if (!prenom) {
      return NextResponse.json({ error: 'Le prénom est obligatoire.' }, { status: 400 });
    }

    // Get the current user's serviceId for multi-tenant isolation
    const currentServiceId = (session as any).user.serviceId || 'default';

    // Check if email already exists in the same service
    if (email) {
      const existingByEmail = await prisma.gestionnaire.findFirst({
        where: { email, serviceId: currentServiceId }
      });
      if (existingByEmail) {
        return NextResponse.json({ error: 'Un gestionnaire avec cet email existe déjà.' }, { status: 409 });
      }
    }

    // Create the gestionnaire
    const newGestionnaire = await prisma.gestionnaire.create({
      data: {
        id: uuidv4(),
        email: email || null,
        prenom,
        nom: nom || null,
        role: role?.toUpperCase() || 'USER',
        couleurMedaillon: couleurMedaillon || null,
        isActive: true,
        isGestionnaireDossier: isGestionnaireDossier ?? false,
        serviceId: currentServiceId,
      }
    });

    console.log(`[API] Gestionnaire créé: ${newGestionnaire.id} (${newGestionnaire.prenom} ${newGestionnaire.nom}) pour service ${currentServiceId}`);

    return NextResponse.json(newGestionnaire, { status: 201 });
  } catch (error) {
    console.error('Error creating gestionnaire:', error);
    const prismaError = error as { code?: string; meta?: { target?: string[] } };
    if (prismaError.code === 'P2002' && prismaError.meta?.target?.includes('email')) {
      return NextResponse.json({ error: 'Un gestionnaire avec cet email existe déjà.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Erreur serveur lors de la création du gestionnaire.' }, { status: 500 });
  }
}

