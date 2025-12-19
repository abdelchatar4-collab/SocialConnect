/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { NextResponse } from 'next/server';
import { readdir, stat } from 'fs/promises';
import path from 'path';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

export const dynamic = 'force-dynamic';

export async function GET() {
  console.log('[API GET /api/rapports] Received request to list reports');

  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reportsDir = path.join(process.cwd(), 'public', 'rapports');
    const filenames = await readdir(reportsDir);

    console.log('[API GET /api/rapports] Found files:', filenames);

    // Filter out any hidden files (e.g., .DS_Store)
    const filteredFilenames = filenames.filter(filename => !filename.startsWith('.'));

    // Get detailed information for each file
    const filesWithInfo = await Promise.all(
      filteredFilenames.map(async (filename) => {
        try {
          const filePath = path.join(reportsDir, filename);
          const stats = await stat(filePath);

          return {
            name: filename,
            size: stats.size,
            lastModified: stats.mtime.toISOString(),
            isFile: stats.isFile()
          };
        } catch (error) {
          // If we can't get stats for a file, just return the name
          console.warn(`[API GET /api/rapports] Could not get stats for ${filename}:`, error);
          return {
            name: filename,
            size: 0,
            lastModified: new Date().toISOString(),
            isFile: true
          };
        }
      })
    );

    // Filter to only include actual files
    const files = filesWithInfo.filter(file => file.isFile);

    return NextResponse.json(files);

  } catch (error: unknown) {
    console.error('[API GET /api/rapports] Error listing reports:', error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";

    // If the directory doesn't exist, return an empty array instead of an error
    const fsError = error as { code?: string };
    if (fsError.code === 'ENOENT') {
      console.log('[API GET /api/rapports] Reports directory not found, returning empty array.');
      return NextResponse.json([]);
    }

    return NextResponse.json({ error: `Error listing reports: ${errorMessage}` }, { status: 500 });
  }
}
