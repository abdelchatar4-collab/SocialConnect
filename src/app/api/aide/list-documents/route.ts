/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const documentsDir = path.join(process.cwd(), 'public', 'documents_aide');

  try {
    // Vérifier si le répertoire existe
    if (!fs.existsSync(documentsDir)) {
      return NextResponse.json({ error: 'Le répertoire de documents n\'existe pas.' }, { status: 404 });
    }

    // Lire le contenu du répertoire
    const files = fs.readdirSync(documentsDir);

    // Filtrer pour ne garder que les fichiers (exclure les répertoires)
    const fileList = files.filter(file => {
      const filePath = path.join(documentsDir, file);
      return fs.statSync(filePath).isFile();
    });

    return NextResponse.json(fileList, { status: 200 });

  } catch (error: unknown) {
    console.error('Erreur lors de la lecture du répertoire de documents:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur lors de la lecture des documents.' }, { status: 500 });
  }
}
