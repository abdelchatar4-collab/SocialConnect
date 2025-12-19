/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';
import path from 'path';

interface Fix {
  pattern: RegExp;
  replacement: string;
  description: string;
}

const commonFixes: Fix[] = [
  // Correction des variables error de type unknown
  {
    pattern: /console\.error\(error\)/g,
    replacement: 'console.error(error instanceof Error ? error.message : "Erreur inconnue")',
    description: 'Correction des variables error de type unknown'
  },

  // Correction des champs category -> type dans DropdownOption
  {
    pattern: /by:\s*\[\s*['"]category['"]\s*\]/g,
    replacement: 'by: ["type"]',
    description: 'Correction du champ category vers type dans groupBy'
  },

  {
    pattern: /where:\s*{\s*type: /g,
    replacement: 'where: { type:',
    description: 'Correction du champ category vers type dans where'
  },

  {
    pattern: /type: \s*([^,}]+)/g,
    replacement: 'type: $1',
    description: 'Correction générale category vers type'
  },

  // Suppression des imports node-fetch
  {
    pattern: /import\s+.*from\s+['"]node-fetch['"];?\n?/g,
    replacement: '',
    description: 'Suppression des imports node-fetch obsolètes'
  },

  // Correction des champs inexistants dans DropdownOption
  {
    pattern: /,\s*(isActive|order|isSystem|createdBy):\s*[^,}]+/g,
    replacement: '',
    description: 'Suppression des champs inexistants dans DropdownOption'
  },

  // Correction des orderBy avec des champs inexistants
  {
    pattern: /orderBy:\s*{\s*(order|isActive):\s*['"]\w+['"]\s*}/g,
    replacement: '',
    description: 'Suppression des orderBy avec champs inexistants'
  }
];

function applyFixes(content: string, filePath: string): { content: string; appliedFixes: string[] } {
  let modifiedContent = content;
  const appliedFixes: string[] = [];

  for (const fix of commonFixes) {
    if (fix.pattern.test(modifiedContent)) {
      modifiedContent = modifiedContent.replace(fix.pattern, fix.replacement);
      appliedFixes.push(`${fix.description} dans ${path.basename(filePath)}`);
    }
  }

  return { content: modifiedContent, appliedFixes };
}

function fixPrismaVariableDeclaration(content: string): string {
  // Correction spécifique pour les déclarations de variables prisma
  const prismaPattern = /let\s+prisma:\s*PrismaClient;/g;
  return content.replace(prismaPattern, 'let prisma: PrismaClient | undefined;');
}

function cleanupEmptyLines(content: string): string {
  // Nettoie les lignes vides multiples
  return content.replace(/\n\s*\n\s*\n/g, '\n\n');
}

async function fixTypeScriptErrors() {
  console.log('🔧 Début de la correction automatique des erreurs TypeScript...');

  const patterns = [
    'src/**/*.ts',
    'src/**/*.tsx',
    'scripts/**/*.ts'
  ];

  let totalFiles = 0;
  let totalFixes = 0;

  for (const pattern of patterns) {
    const files = glob.sync(pattern);

    for (const filePath of files) {
      try {
        const content = readFileSync(filePath, 'utf-8');
        let modifiedContent = content;

        // Appliquer les corrections communes
        const { content: fixedContent, appliedFixes } = applyFixes(modifiedContent, filePath);
        modifiedContent = fixedContent;

        // Corrections spécifiques
        modifiedContent = fixPrismaVariableDeclaration(modifiedContent);
        modifiedContent = cleanupEmptyLines(modifiedContent);

        // Ajouter ces nouvelles règles de correction :
        const fixes = [
          // Correction pour les propriétés manquantes dans UpdateUserRequestBody
          {
            pattern: /interface UpdateUserRequestBody[\s\S]*?informationImportante\?:\s*string;(?!\s*partenaire)/,
            replacement: (match: string) => match.replace(
              /(informationImportante\?:\s*string;)/,
              '$1\n  partenaire?: string;'
            ),
            description: 'Ajouter la propriété partenaire manquante dans UpdateUserRequestBody'
          },

          // Correction pour les propriétés dupliquées
          {
            pattern: /(type:\s*'[^']+(?:\s*\|\s*'[^']+)*';)\s*type:\s*string;/g,
            replacement: '$1',
            description: 'Supprimer les propriétés type dupliquées'
          }
        ];

        modifiedContent = fixPrismaVariableDeclaration(modifiedContent);
        modifiedContent = cleanupEmptyLines(modifiedContent);

        // Écrire le fichier seulement s'il y a eu des modifications
        if (modifiedContent !== content) {
          writeFileSync(filePath, modifiedContent, 'utf-8');
          totalFiles++;
          totalFixes += appliedFixes.length;

          console.log(`✅ ${filePath}:`);
          appliedFixes.forEach(fix => console.log(`   - ${fix}`));
        }
      } catch (error) {
        console.error(`❌ Erreur lors du traitement de ${filePath}:`,
          error instanceof Error ? error.message : 'Erreur inconnue');
      }
    }
  }

  console.log(`\n📊 Résumé:`);
  console.log(`   - ${totalFiles} fichiers modifiés`);
  console.log(`   - ${totalFixes} corrections appliquées`);
  console.log('\n🎉 Correction automatique terminée!');
}

if (require.main === module) {
  fixTypeScriptErrors().catch(console.error);
}

export { fixTypeScriptErrors };
