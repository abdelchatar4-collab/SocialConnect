/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU.
*/

export const dynamic = 'force-dynamic';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { detectProblematiquesFromNotes, handleApiError } from './user-api.helpers';
import { handleProblematiques, handleActions } from './userUpdateStorage';
import { buildUserUpdateData } from './userUpdateMapper';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const user = await prisma.user.findUnique({ where: { id: params.id }, include: { adresse: true, problematiques: true, actions: true, gestionnaire: true } });
    if (!user) return NextResponse.json({ error: '404' }, { status: 404 });
    if (!user.problematiques?.length) user.problematiques = detectProblematiquesFromNotes(user.id, user.notesGenerales || user.remarques || "");
    if (user.logementDetails && typeof user.logementDetails === 'string') try { user.logementDetails = JSON.parse(user.logementDetails); } catch { user.logementDetails = ''; }
    return NextResponse.json(user);
  } catch (e) { return handleApiError(e); }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await getServerSession(authOptions))) return NextResponse.json({ error: '401' }, { status: 401 });
  try { return NextResponse.json(await prisma.user.update({ where: { id: params.id }, data: { rgpdAttestationGeneratedAt: new Date() }, select: { id: true, nom: true, prenom: true, rgpdAttestationGeneratedAt: true } })); }
  catch (e) { return handleApiError(e); }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: '401' }, { status: 401 });
  try {
    const body = await req.json();
    await handleProblematiques(params.id, body.problematiques);
    await handleActions(params.id, body.actions);
    return NextResponse.json(await prisma.user.update({ where: { id: params.id }, data: buildUserUpdateData(body, session), include: { adresse: true, problematiques: true, actions: true } }));
  } catch (e) { return handleApiError(e); }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const s = await getServerSession(authOptions);
  if (!s) return NextResponse.json({ error: '401' }, { status: 401 });
  const role = (s.user as any)?.role, id = params.id;
  try {
    const u = await prisma.user.findUnique({ where: { id } });
    if (!u) return NextResponse.json({ error: '404' }, { status: 404 });
    if (role !== 'ADMIN' && (!u.nom || !u.prenom || !u.dateNaissance || !(await prisma.user.findFirst({ where: { nom: u.nom, prenom: u.prenom, dateNaissance: u.dateNaissance, id: { not: id } } })))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ message: 'OK' });
  } catch (e) { return handleApiError(e); }
}
