/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Multi-tenant isolation
    const serviceId = (session.user as any)?.serviceId || 'default';

    // Verify the option belongs to the same service
    const existingOption = await prisma.dropdownOption.findUnique({
      where: { id },
      select: { serviceId: true }
    });

    if (!existingOption) {
      return NextResponse.json({ error: 'Partenaire non trouvé' }, { status: 404 });
    }

    if (existingOption.serviceId !== serviceId) {
      return NextResponse.json({ error: 'Accès non autorisé à ce partenaire' }, { status: 403 });
    }

    // Vérifier si le partenaire est utilisé par des utilisateurs
    const usersCount = await prisma.user.count({
      where: { partenaire: { contains: id } }
    });

    if (usersCount > 0) {
      return NextResponse.json({
        error: `Ce partenaire ne peut pas être supprimé car il est utilisé par ${usersCount} utilisateur(s)`
      }, { status: 409 });
    }

    await prisma.dropdownOption.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Partenaire supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du partenaire:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

