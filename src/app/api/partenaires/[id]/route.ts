/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.
*/

import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/prisma-clients';
import { getDynamicServiceId } from '@/lib/auth-utils';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const serviceId = await getDynamicServiceId(session);
  const prisma = getServiceClient(serviceId);
  const { id } = params;

  try {
    const existingOption = await prisma.dropdownOption.findUnique({ where: { id } });
    if (!existingOption) return NextResponse.json({ error: 'Partenaire non trouvé' }, { status: 404 });

    const usersCount = await prisma.user.count({ where: { partenaire: { contains: id } } });
    if (usersCount > 0) {
      return NextResponse.json({ error: `Ce partenaire ne peut pas être supprimé car il est utilisé par ${usersCount} utilisateur(s)` }, { status: 409 });
    }

    await prisma.dropdownOption.delete({ where: { id } });
    return NextResponse.json({ message: 'Partenaire supprimé avec succès' });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
