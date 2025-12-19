/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { NextRequest, NextResponse } from 'next/server';
import { readFile, stat } from 'fs/promises';
import { readdirSync } from 'fs';
import path from 'path';
import { existsSync } from 'fs';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  console.log(`[API GET /api/rapports/[filename]] Requested file: ${params.filename}`);

  try {
    const filename = decodeURIComponent(params.filename);
    const rapportsDir = path.join(process.cwd(), 'public', 'rapports');
    let filePath = path.join(rapportsDir, filename);

    console.log(`[API GET /api/rapports/[filename]] Looking for file at: ${filePath}`);

    // Vérifier si le fichier existe (sensible à la casse)
    if (!existsSync(filePath)) {
      // Si non trouvé, essayer de trouver un fichier du dossier avec le même nom (insensible à la casse)
      const files = readdirSync(rapportsDir);
      const found = files.find((f: string) => f.toLowerCase() === filename.toLowerCase());
      if (found) {
        filePath = path.join(rapportsDir, found);
        console.log(`[API GET /api/rapports/[filename]] Fichier trouvé insensible à la casse: ${filePath}`);
      } else {
        console.log(`[API GET /api/rapports/[filename]] File not found: ${filePath}`);
        return NextResponse.json(
          { error: 'Fichier non trouvé' },
          { status: 404 }
        );
      }
    }

    // Obtenir les informations du fichier
    const stats = await stat(filePath);
    if (!stats.isFile()) {
      console.log(`[API GET /api/rapports/[filename]] Not a file: ${filePath}`);
      return NextResponse.json(
        { error: 'Ressource non valide' },
        { status: 400 }
      );
    }

    // Lire le fichier
    const fileBuffer = await readFile(filePath);

    // Déterminer le type MIME en fonction de l'extension
    const getMimeType = (filename: string): string => {
      const ext = filename.toLowerCase().split('.').pop();
      switch (ext) {
        case 'pdf':
          return 'application/pdf';
        case 'xlsx':
          return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        case 'xls':
          return 'application/vnd.ms-excel';
        case 'docx':
          return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        case 'doc':
          return 'application/msword';
        case 'txt':
          return 'text/plain';
        case 'csv':
          return 'text/csv';
        case 'png':
          return 'image/png';
        case 'jpg':
        case 'jpeg':
          return 'image/jpeg';
        case 'gif':
          return 'image/gif';
        case 'svg':
          return 'image/svg+xml';
        case 'zip':
          return 'application/zip';
        case 'rar':
          return 'application/x-rar-compressed';
        case '7z':
          return 'application/x-7z-compressed';
        case 'mp4':
          return 'video/mp4';
        case 'avi':
          return 'video/x-msvideo';
        case 'mov':
          return 'video/quicktime';
        default:
          return 'application/octet-stream';
      }
    };

    const mimeType = getMimeType(filename);

    console.log(`[API GET /api/rapports/[filename]] Serving file: ${filename}, type: ${mimeType}, size: ${fileBuffer.length}`);

    // Créer la réponse avec les bons headers
    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Length': fileBuffer.length.toString(),
        'Content-Disposition': `inline; filename="${filename}"`,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });

  } catch (error: unknown) {
    console.error('[API GET /api/rapports/[filename]] Error serving file:', error);
    const errorMessage = error instanceof Error ? error.message : "Une erreur inconnue s'est produite";

    return NextResponse.json(
      { error: `Erreur lors de la lecture du fichier: ${errorMessage}` },
      { status: 500 }
    );
  }
}
