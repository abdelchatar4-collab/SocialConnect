/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre.

=============================================================================
MULTI-TENANT SECURITY UTILITIES
=============================================================================
Ce module fournit des fonctions utilitaires pour garantir l'isolation
multi-tenant dans toutes les routes API.

RÈGLES OBLIGATOIRES POUR TOUTE NOUVELLE API :
1. TOUJOURS utiliser getAuthenticatedSession() pour obtenir la session
2. TOUJOURS utiliser requireServiceId() pour obtenir le serviceId
3. TOUJOURS filtrer les requêtes DB par serviceId
4. TOUJOURS vérifier l'appartenance au service avant UPDATE/DELETE
=============================================================================
*/

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { NextResponse } from 'next/server';

export interface AuthenticatedSession {
    user: {
        id: string;
        email: string;
        name?: string;
        role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
        serviceId: string;
        gestionnaire?: {
            id: string;
            prenom: string;
            nom?: string;
        };
    };
}

/**
 * Récupère la session authentifiée ou retourne une erreur 401
 * TOUJOURS utiliser cette fonction au début de chaque route API
 */
export async function getAuthenticatedSession(): Promise<{
    session: AuthenticatedSession | null;
    error?: NextResponse;
}> {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return {
            session: null,
            error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        };
    }

    return { session: session as unknown as AuthenticatedSession };
}

/**
 * Récupère le serviceId de la session
 * Retourne 'default' si non défini (fallback de sécurité)
 */
export function getServiceId(session: AuthenticatedSession): string {
    return (session.user as any).serviceId || 'default';
}

/**
 * Vérifie que l'utilisateur est admin
 */
export function isAdmin(session: AuthenticatedSession): boolean {
    const role = session.user.role;
    return role === 'ADMIN' || role === 'SUPER_ADMIN';
}

/**
 * Vérifie que l'utilisateur est super admin
 */
export function isSuperAdmin(session: AuthenticatedSession): boolean {
    return session.user.role === 'SUPER_ADMIN';
}

/**
 * Retourne une erreur 403 si l'utilisateur n'est pas admin
 */
export function requireAdmin(session: AuthenticatedSession): NextResponse | null {
    if (!isAdmin(session)) {
        return NextResponse.json(
            { error: 'Forbidden - Admin access required' },
            { status: 403 }
        );
    }
    return null;
}

/**
 * Vérifie qu'une ressource appartient au même service que l'utilisateur
 * @param resourceServiceId - serviceId de la ressource à vérifier
 * @param userServiceId - serviceId de l'utilisateur connecté
 * @returns NextResponse d'erreur si non autorisé, null sinon
 */
export function verifyServiceOwnership(
    resourceServiceId: string | null | undefined,
    userServiceId: string
): NextResponse | null {
    if (resourceServiceId && resourceServiceId !== userServiceId) {
        return NextResponse.json(
            { error: 'Access denied - Resource belongs to another service' },
            { status: 403 }
        );
    }
    return null;
}

/**
 * Helper complet pour les routes API standard
 * Retourne session, serviceId, et isAdmin en un seul appel
 */
export async function initApiRoute(): Promise<{
    session: AuthenticatedSession;
    serviceId: string;
    isAdmin: boolean;
    error?: NextResponse;
}> {
    const { session, error } = await getAuthenticatedSession();

    if (error || !session) {
        return {
            session: null as any,
            serviceId: '',
            isAdmin: false,
            error: error || NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        };
    }

    return {
        session,
        serviceId: getServiceId(session),
        isAdmin: isAdmin(session)
    };
}

/*
=============================================================================
EXEMPLES D'UTILISATION
=============================================================================

// Exemple 1 : Route GET simple avec filtrage multi-tenant
export async function GET(request: Request) {
  const { session, serviceId, error } = await initApiRoute();
  if (error) return error;

  const items = await prisma.myModel.findMany({
    where: { serviceId } // TOUJOURS filtrer par serviceId !
  });

  return NextResponse.json(items);
}

// Exemple 2 : Route DELETE avec vérification d'appartenance
export async function DELETE(request: Request) {
  const { session, serviceId, isAdmin, error } = await initApiRoute();
  if (error) return error;

  const id = getIdFromRequest(request);

  const item = await prisma.myModel.findUnique({ where: { id } });
  if (!item) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Vérifier l'appartenance au service
  const ownershipError = verifyServiceOwnership(item.serviceId, serviceId);
  if (ownershipError) return ownershipError;

  await prisma.myModel.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
=============================================================================
*/
