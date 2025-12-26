/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { getDynamicServiceId } from '@/lib/auth-utils';
import { mkdir } from 'fs/promises';

export const dynamic = 'force-dynamic';
// Configuration pour supporter les gros fichiers
export const runtime = 'nodejs';
// Augmente la limite de taille de requête (250MB)
export const maxDuration = 30; // 30 secondes max pour l'upload

// Ajoute cette fonction utilitaire en haut du fichier
function sanitizeFileName(filename: string): string {
  return filename
    .normalize('NFD') // décompose les accents
    .replace(/[\u0300-\u036f]/g, '') // enlève les accents
    .replace(/[''\"]/g, '-') // remplace apostrophes typographiques et simples
    .replace(/[^a-zA-Z0-9._-]/g, '-') // remplace tout le reste par un tiret
    .replace(/-+/g, '-') // évite les tirets multiples
    .replace(/^-+|-+$/g, ''); // supprime tirets en début/fin
}

export async function POST(request: NextRequest) {
  console.log('[API POST /api/rapports/upload] Received upload request');

  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    // Validation de la taille du fichier avec limites variables
    const getMaxSize = (filename: string) => {
      const ext = filename.toLowerCase().split('.').pop();
      switch (ext) {
        case 'pdf':
          return 50 * 1024 * 1024; // 50MB pour les PDFs (rapports, guides)
        case 'xlsx':
        case 'xls':
          return 25 * 1024 * 1024; // 25MB pour Excel (exports volumineux)
        case 'zip':
        case 'rar':
        case '7z':
          return 100 * 1024 * 1024; // 100MB pour les archives
        case 'mp4':
        case 'avi':
        case 'mov':
          return 200 * 1024 * 1024; // 200MB pour les vidéos
        default:
          return 10 * 1024 * 1024; // 10MB par défaut
      }
    };

    const maxSize = getMaxSize(file.name);
    if (file.size > maxSize) {
      console.log(`[API POST /api/rapports/upload] File too large: ${file.size} bytes (max: ${maxSize})`);
      return NextResponse.json({
        error: `Le fichier est trop volumineux. Taille maximale autorisée pour ce type : ${(maxSize / 1024 / 1024).toFixed(0)}MB. Taille du fichier : ${(file.size / 1024 / 1024).toFixed(2)}MB`
      }, { status: 413 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    // Utilise la fonction de sanitation pour le nom du fichier
    const filename = sanitizeFileName(file.name);

    // Write the file to the filesystem
    const serviceId = await getDynamicServiceId(session);
    const uploadDir = path.join(process.cwd(), 'uploads', 'rapports', serviceId);

    // S'assurer que le dossier du service existe
    try { await mkdir(uploadDir, { recursive: true }); } catch (e) { }

    const filePath = path.join(uploadDir, filename);

    // Write the file to the filesystem
    await writeFile(filePath, buffer);

    console.log(`[API POST /api/rapports/upload] Successfully uploaded file: ${filename}`);

    return NextResponse.json({ message: 'File uploaded successfully', filename });

  } catch (error: unknown) {
    console.error('[API POST /api/rapports/upload] Error uploading file:', error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: `Error uploading file: ${errorMessage}` }, { status: 500 });
  }
}
