/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { NextRequest, NextResponse } from 'next/server';
import { createReadStream, existsSync, statSync } from 'fs';
import { join } from 'path';
import archiver from 'archiver';
import { Readable } from 'stream';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { files, exportType } = await request.json();

    if (!files || !Array.isArray(files) || files.length === 0) {
      return NextResponse.json(
        { error: 'Aucun fichier sélectionné' },
        { status: 400 }
      );
    }

    const rapportsDir = join(process.cwd(), 'public', 'rapports');

    // Vérifier que le dossier rapports existe
    if (!existsSync(rapportsDir)) {
      return NextResponse.json(
        { error: 'Dossier rapports introuvable' },
        { status: 404 }
      );
    }

    if (exportType === 'individual') {
      // Export individuel - retourner la liste des fichiers avec leurs URLs
      const fileUrls = files.map(filename => ({
        name: filename,
        url: `/api/rapports/${encodeURIComponent(filename)}`
      }));

      return NextResponse.json({
        success: true,
        type: 'individual',
        files: fileUrls
      });
    } else {
      // Export ZIP - créer un fichier ZIP contenant tous les fichiers
      const archive = archiver('zip', {
        zlib: { level: 9 } // Compression maximale
      });

      // Créer un stream readable pour la réponse
      const streamData: Buffer[] = [];

      archive.on('data', (chunk) => {
        streamData.push(chunk);
      });

      archive.on('error', (err) => {
        console.error('Erreur lors de la création de l\'archive:', err);
        throw err;
      });

      // Ajouter les fichiers à l'archive
      let validFiles = 0;
      for (const filename of files) {
        const filePath = join(rapportsDir, filename);

        if (existsSync(filePath)) {
          try {
            const stats = statSync(filePath);
            if (stats.isFile()) {
              archive.file(filePath, { name: filename });
              validFiles++;
            }
          } catch (error) {
            console.error(`Erreur lors de l'ajout du fichier ${filename}:`, error);
          }
        }
      }

      if (validFiles === 0) {
        return NextResponse.json(
          { error: 'Aucun fichier valide trouvé' },
          { status: 404 }
        );
      }

      // Finaliser l'archive
      await archive.finalize();

      // Attendre que tous les chunks soient collectés
      await new Promise((resolve) => {
        archive.on('end', resolve);
      });

      // Créer le buffer final
      const zipBuffer = Buffer.concat(streamData);

      // Générer un nom de fichier unique
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const zipFilename = `export-documents-${timestamp}.zip`;

      // Retourner le fichier ZIP
      return new NextResponse(zipBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/zip',
          'Content-Disposition': `attachment; filename="${zipFilename}"`,
          'Content-Length': zipBuffer.length.toString(),
        },
      });
    }
  } catch (error) {
    console.error('Erreur lors de l\'export en lot:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'export des fichiers' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Méthode non autorisée' },
    { status: 405 }
  );
}
