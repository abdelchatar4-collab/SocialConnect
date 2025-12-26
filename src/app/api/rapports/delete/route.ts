/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { NextRequest, NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import path from 'path';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { getDynamicServiceId } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function DELETE(request: NextRequest) {
  console.log('[API DELETE /api/rapports/delete] Received delete request');

  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { filename } = body;

    if (!filename) {
      return NextResponse.json({ error: 'Filename not provided.' }, { status: 400 });
    }

    const serviceId = await getDynamicServiceId(session);

    // Define the path to the file in the uploads/rapports/serviceId directory
    const filePath = path.join(process.cwd(), 'uploads', 'rapports', serviceId, filename);

    // Check if the file exists before attempting to delete
    try {
      await unlink(filePath);
      console.log(`[API DELETE /api/rapports/delete] Successfully deleted file: ${filename}`);
      return NextResponse.json({ message: `File "${filename}" deleted successfully.` });
    } catch (error: unknown) {
      const fsError = error as { code?: string };
      if (fsError.code === 'ENOENT') {
        return NextResponse.json({ error: `File not found: ${filename}` }, { status: 404 });
      }
      throw error; // Re-throw other errors
    }

  } catch (error: unknown) {
    console.error('[API DELETE /api/rapports/delete] Error deleting file:', error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: `Error deleting file: ${errorMessage}` }, { status: 500 });
  }
}
