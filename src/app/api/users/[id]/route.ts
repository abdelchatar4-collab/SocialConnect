/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU.
*/

export const dynamic = 'force-dynamic';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/prisma-clients';
import { getDynamicServiceId } from '@/lib/auth-utils';
import { detectProblematiquesFromNotes, handleApiError } from './user-api.helpers';
import { handleProblematiques, handleActions } from './userUpdateStorage';
import { buildUserUpdateData } from './userUpdateMapper';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Multi-tenant isolation
  const serviceId = await getDynamicServiceId(session);
  const servicePrisma = getServiceClient(serviceId);

  try {
    const user = await servicePrisma.user.findUnique({ where: { id: params.id }, include: { adresse: true, problematiques: true, actions: true, gestionnaire: true } });
    if (!user) return NextResponse.json({ error: '404' }, { status: 404 });
    if (!user.problematiques?.length) user.problematiques = detectProblematiquesFromNotes(user.id, user.notesGenerales || user.remarques || "");
    if (user.logementDetails && typeof user.logementDetails === 'string') try { user.logementDetails = JSON.parse(user.logementDetails); } catch { user.logementDetails = ''; }
    return NextResponse.json(user);
  } catch (e) { return handleApiError(e); }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: '401' }, { status: 401 });

  // Multi-tenant isolation
  const serviceId = await getDynamicServiceId(session);
  const servicePrisma = getServiceClient(serviceId);

  try { return NextResponse.json(await servicePrisma.user.update({ where: { id: params.id }, data: { rgpdAttestationGeneratedAt: new Date() }, select: { id: true, nom: true, prenom: true, rgpdAttestationGeneratedAt: true } })); }
  catch (e) { return handleApiError(e); }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: '401' }, { status: 401 });

  // Multi-tenant isolation
  const serviceId = await getDynamicServiceId(session);
  const servicePrisma = getServiceClient(serviceId);

  try {
    const body = await req.json();
    await handleProblematiques(servicePrisma, params.id, body.problematiques);
    await handleActions(servicePrisma, params.id, body.actions);
    return NextResponse.json(await servicePrisma.user.update({ where: { id: params.id }, data: buildUserUpdateData(body, session), include: { adresse: true, problematiques: true, actions: true } }));
  } catch (e) { return handleApiError(e); }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: '401' }, { status: 401 });

  const userRole = (session.user as any)?.role;
  const serviceId = await getDynamicServiceId(session);
  const prisma = getServiceClient(serviceId);
  const id = params.id;

  try {
    const userToDelete = await prisma.user.findUnique({ where: { id } });
    if (!userToDelete) return NextResponse.json({ error: '404' }, { status: 404 });

    // For non-admin roles, check if it's a duplicate
    if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
      if (!userToDelete.nom || !userToDelete.prenom) {
        return NextResponse.json({ error: 'Forbidden: Missing name data' }, { status: 403 });
      }

      const targetNom = userToDelete.nom.toLowerCase();
      const targetPrenom = userToDelete.prenom.toLowerCase();
      const targetDate = userToDelete.dateNaissance ? new Date(userToDelete.dateNaissance).toISOString().split('T')[0] : null;

      const duplicates = await prisma.user.findMany({
        where: {
          AND: [
            { nom: { contains: userToDelete.nom } },
            { prenom: { contains: userToDelete.prenom } }
          ],
          id: { not: id }
        }
      });

      const isDuplicateFound = duplicates.some((u: any) => {
        const uNom = u.nom?.toLowerCase() || '';
        const uPrenom = u.prenom?.toLowerCase() || '';
        const uDate = u.dateNaissance ? new Date(u.dateNaissance).toISOString().split('T')[0] : null;

        const namesMatch = uNom === targetNom && uPrenom === targetPrenom;
        if (targetDate && uDate) return namesMatch && uDate === targetDate;
        return namesMatch;
      });

      if (!isDuplicateFound) return NextResponse.json({ error: 'Forbidden: Not a duplicate' }, { status: 403 });
    }

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ message: 'OK' });
  } catch (e) { return handleApiError(e); }
}
