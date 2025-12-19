/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import { format } from 'date-fns';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

const execAsync = promisify(exec);

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Fetch user data from the database
    const usersFromDb = await prisma.user.findMany({ // Renommé pour clarté
      include: {
        adresse: true,
        problematiques: true,
        actions: true,
      },
    });

    if (!usersFromDb || usersFromDb.length === 0) {
      return NextResponse.json({ error: 'Aucun utilisateur à exporter' }, { status: 404 });
    }

    // 2. Fetch all gestionnaires to map IDs to names
    const allGestionnaires = await prisma.gestionnaire.findMany({
      select: { id: true, nom: true, prenom: true },
    });

    // 3. Create a map for easy lookup of gestionnaire names
    const gestionnaireMap = new Map<string, string>();
    allGestionnaires.forEach(g => {
      // Vous voulez le prénom. Si le prénom peut être null, prévoyez un fallback.
      const prenom = g.prenom || '';
      // Si vous voulez "Prénom Nom": const fullName = `${g.prenom || ''} ${g.nom || ''}`.trim();
      gestionnaireMap.set(g.id, prenom);
    });

    // 4. Transform users data to replace gestionnaire ID with prenom
    const usersWithGestionnairePrenoms = usersFromDb.map(user => {
      // Utiliser la propriété correcte selon votre schéma Prisma
      const { gestionnaireId, ...restOfUser } = user as typeof user & { gestionnaireId?: string | null };
      let gestionnaireDisplay = 'N/A'; // Valeur par défaut

      if (gestionnaireId && gestionnaireMap.has(gestionnaireId)) {
        gestionnaireDisplay = gestionnaireMap.get(gestionnaireId) || 'N/A';
      } else if (gestionnaireId) {
        // Cas où l'ID existe mais n'est pas dans la map (gestionnaire supprimé, etc.)
        gestionnaireDisplay = `ID: ${gestionnaireId} (non trouvé)`;
      }

      return {
        ...restOfUser, // Garde tous les autres champs de l'utilisateur
        gestionnaire: gestionnaireDisplay, // Remplace l'ID par le prénom (ou la valeur de fallback)
      };
    });

    // Helper function to recursively clean strings within an object or array
    function cleanStringsInObject<T>(obj: T): T {
      // Handle Date objects - convert to ISO string
      if (obj instanceof Date) {
        return obj.toISOString() as T;
      }

      if (typeof obj === 'string') {
        let cleanedString = obj.replace(/\r/g, '');
        cleanedString = cleanedString.replace(/\n/g, ' ');
        cleanedString = cleanedString.replace(/\t/g, ' ');
        return cleanedString as T;
      }
      if (Array.isArray(obj)) {
        return obj.map(cleanStringsInObject) as T;
      }
      if (typeof obj === 'object' && obj !== null) {
        const newObj: Record<string, unknown> = {};
        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            newObj[key] = cleanStringsInObject((obj as Record<string, unknown>)[key]);
          }
        }
        return newObj as T;
      }
      return obj;
    }

    // 5. Clean the transformed user data (qui contient maintenant les prénoms des gestionnaires)
    const cleanedUsers = usersWithGestionnairePrenoms.map(user => cleanStringsInObject(user));

    // DEBUG: Log pour vérifier les dates avant l'export
    if (cleanedUsers.length > 0) {
      console.log('[API Export] Premier utilisateur - dateNaissance:', cleanedUsers[0].dateNaissance);
      console.log('[API Export] Premier utilisateur - nom:', cleanedUsers[0].nom);
      console.log('[API Export] Type de dateNaissance:', typeof cleanedUsers[0].dateNaissance);
    }
    console.log('[API Export] Nombre total d\'utilisateurs:', cleanedUsers.length);

    // 6. Write the cleaned user data to a temporary JSON file
    const tempDir = path.join(process.cwd(), 'temp');
    await fs.mkdir(tempDir, { recursive: true });
    const tempJsonFileName = `users_export_${Date.now()}.json`;
    const tempJsonFilePath = path.join(tempDir, tempJsonFileName);
    await fs.writeFile(tempJsonFilePath, JSON.stringify(cleanedUsers));

    // Define the path to the Python script and the output Excel file
    const pythonScriptPath = path.join(process.cwd(), 'src', 'export_users_excel.py');

    const currentDate = format(new Date(), 'yyyy-MM-dd');
    const outputFileName = `Export_Usagers_${currentDate}_${Date.now()}.xlsx`;
    const outputFilePath = path.join(tempDir, outputFileName);

    // Execute the Python script, passing the JSON file path and output Excel path as arguments
    const command = `python3 "${pythonScriptPath}" "${tempJsonFilePath}" "${outputFilePath}"`;
    console.log(`[API Export] Exécution de la commande: ${command}`);

    try {
      const { stdout, stderr } = await execAsync(command);
      if (stderr) {
        console.error(`[API Export] Erreur du script Python (stderr): ${stderr}`);
      }
      if (stdout) {
        console.log(`[API Export] Sortie du script Python (stdout): ${stdout}`);
      }
    } catch (executionError: unknown) {
      console.error('[API Export] Échec de l\'exécution de la commande Python:', executionError);
      // Clean up the temporary JSON file even if Python script fails
      try {
        await fs.unlink(tempJsonFilePath);
      } catch (unlinkError) {
        console.error(`[API Export] Erreur lors de la suppression du fichier JSON temporaire ${tempJsonFilePath}:`, unlinkError);
      }
      const execError = executionError as { message?: string; stderr?: string; stdout?: string };
      return NextResponse.json({
        error: 'Échec de l\'exécution du script Python.',
        details: execError.message,
        stderr: execError.stderr,
        stdout: execError.stdout
      }, { status: 500 });
    } finally {
      // Clean up the temporary JSON file after successful execution
      try {
        await fs.unlink(tempJsonFilePath);
      } catch (unlinkError) {
        console.error(`[API Export] Erreur lors de la suppression du fichier JSON temporaire ${tempJsonFilePath}:`, unlinkError);
      }
    }

    // 7. Verify that the Excel file was created
    try {
      await fs.access(outputFilePath);
      console.log(`[API Export] Fichier Excel généré avec succès: ${outputFilePath}`);
    } catch (fileAccessError) {
      console.error(`[API Export] Le fichier Excel n'a pas été trouvé après l'exécution du script: ${outputFilePath}`, fileAccessError);
      return NextResponse.json({ error: 'Le script Python n\'a pas généré le fichier Excel attendu.' }, { status: 500 });
    }

    // 8. Read the generated Excel file and return it as a response
    const fileContent = await fs.readFile(outputFilePath);

    // 9. Clean up the temporary Excel file
    try {
      await fs.unlink(outputFilePath);
    } catch (unlinkError) {
      console.error(`[API Export] Erreur lors de la suppression du fichier Excel temporaire ${outputFilePath}:`, unlinkError);
    }

    return new NextResponse(new Uint8Array(fileContent), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${outputFileName}"`,
      },
    });

  } catch (error: unknown) {
    console.error('[API Export] Erreur générale lors de l\'exportation Excel:', error);
    return NextResponse.json({ error: 'Erreur lors de l\'exportation Excel', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
