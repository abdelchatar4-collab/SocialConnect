/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.
*/

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { getAllGestionnaires } from './importUtils';
import { importSingleUser } from './importCore';

export async function POST(request: Request) {
  try {
    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Multi-tenant isolation: use serviceId from session, NOT from body
    const serviceId = (session.user as any)?.serviceId || 'default';

    const body = await request.json();
    const usersToImport = Array.isArray(body) ? body : body.users;
    const targetYear = body.annee ? parseInt(String(body.annee), 10) : new Date().getFullYear();

    if (!Array.isArray(usersToImport) || !usersToImport.length) return NextResponse.json({ error: 'Data empty' }, { status: 400 });

    const allGest = await getAllGestionnaires();
    let importedCount = 0;
    const errors: any[] = [];
    const batchSize = 10;

    for (let i = 0; i < usersToImport.length; i += batchSize) {
      const batch = usersToImport.slice(i, i + batchSize);
      await Promise.all(batch.map(async (userData) => {
        try {
          if (!userData.nom || !userData.prenom) throw new Error('Champs obligatoires manquants');
          await importSingleUser(userData, targetYear, allGest, serviceId);
          importedCount++;
        } catch (err: any) {
          errors.push({ data: userData, reason: err.message });
        }
      }));
    }

    return NextResponse.json({ importedCount, errors });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Error', details: error.message }, { status: 500 });
  }
}
