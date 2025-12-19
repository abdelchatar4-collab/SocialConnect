/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

#!/usr/bin/env node

/**
 * Script de diagnostic pour analyser les problèmes d'affichage Tailwind
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Diagnostic des problèmes d\'affichage Tailwind\n');

// Fonction pour vérifier si un fichier existe
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

// Fonction pour lire un fichier
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    return null;
  }
}

// Vérifications des fichiers critiques
console.log('📁 Vérification des fichiers critiques:');

const criticalFiles = [
  'src/app/globals.css',
  'tailwind.config.js',
  'src/app/layout.tsx',
  'src/components/ui/index.ts',
  'src/components/ui/checkbox.tsx',
  'src/styles/design-tokens.ts',
  'src/hooks/useStyleClasses.ts'
];

criticalFiles.forEach(file => {
  const exists = fileExists(file);
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);

  if (!exists) {
    console.log(`     ⚠️  Fichier manquant: ${file}`);
  }
});

console.log('\n📋 Analyse des importations CSS:');

// Vérifier globals.css
const globalsCss = readFile('src/app/globals.css');
if (globalsCss) {
  const hasTailwindDirectives = globalsCss.includes('@tailwind base') &&
                                globalsCss.includes('@tailwind components') &&
                                globalsCss.includes('@tailwind utilities');
  console.log(`  ${hasTailwindDirectives ? '✅' : '❌'} Directives Tailwind présentes`);

  const hasInterFont = globalsCss.includes('Inter');
  console.log(`  ${hasInterFont ? '✅' : '❌'} Police Inter importée`);

  const hasCustomStyles = globalsCss.includes('@layer base') && globalsCss.includes('@layer components');
  console.log(`  ${hasCustomStyles ? '✅' : '❌'} Styles personnalisés présents`);

  const fileSize = Buffer.byteLength(globalsCss, 'utf8');
  console.log(`  📏 Taille du fichier globals.css: ${fileSize} bytes`);

  if (fileSize < 100) {
    console.log(`     ⚠️  Le fichier globals.css semble trop petit (${fileSize} bytes)`);
  }
} else {
  console.log('  ❌ Impossible de lire globals.css');
}

console.log('\n⚙️  Analyse de la configuration Tailwind:');

// Vérifier tailwind.config.js
const tailwindConfig = readFile('tailwind.config.js');
if (tailwindConfig) {
  const hasContentPaths = tailwindConfig.includes('./src/') && tailwindConfig.includes('**/*.{js,ts,jsx,tsx}');
  console.log(`  ${hasContentPaths ? '✅' : '❌'} Chemins de contenu configurés`);

  const hasSafelist = tailwindConfig.includes('safelist');
  console.log(`  ${hasSafelist ? '✅' : '❌'} Safelist configurée`);

  const hasCustomColors = tailwindConfig.includes('primary:') && tailwindConfig.includes('colors:');
  console.log(`  ${hasCustomColors ? '✅' : '❌'} Couleurs personnalisées`);

  const hasFormsPlugin = tailwindConfig.includes('@tailwindcss/forms');
  console.log(`  ${hasFormsPlugin ? '✅' : '❌'} Plugin forms installé`);
} else {
  console.log('  ❌ Impossible de lire tailwind.config.js');
}

console.log('\n🎨 Analyse des composants UI:');

// Vérifier le composant Checkbox
const checkboxComponent = readFile('src/components/ui/checkbox.tsx');
if (checkboxComponent) {
  const hasProperImports = checkboxComponent.includes('React') && checkboxComponent.includes('CheckIcon');
  console.log(`  ${hasProperImports ? '✅' : '❌'} Imports du composant Checkbox`);

  const hasForwardRef = checkboxComponent.includes('forwardRef');
  console.log(`  ${hasForwardRef ? '✅' : '❌'} ForwardRef utilisé`);

  const hasAccessibility = checkboxComponent.includes('aria-') || checkboxComponent.includes('role=');
  console.log(`  ${hasAccessibility ? '✅' : '❌'} Propriétés d\'accessibilité`);
} else {
  console.log('  ❌ Composant Checkbox non trouvé');
}

// Vérifier les exports UI
const uiIndex = readFile('src/components/ui/index.ts');
if (uiIndex) {
  const exportsCheckbox = uiIndex.includes('Checkbox');
  console.log(`  ${exportsCheckbox ? '✅' : '❌'} Export du composant Checkbox`);
} else {
  console.log('  ❌ Fichier d\'export UI non trouvé');
}

console.log('\n🎯 Recommandations:');

// Recommandations basées sur l'analyse
const recommendations = [];

if (!fileExists('src/app/globals.css')) {
  recommendations.push('- Créer le fichier globals.css avec les directives Tailwind');
}

if (globalsCss && Buffer.byteLength(globalsCss, 'utf8') < 100) {
  recommendations.push('- Le fichier globals.css semble vide ou corrompu, le restaurer');
}

if (!fileExists('src/components/ui/checkbox.tsx')) {
  recommendations.push('- Créer le composant Checkbox personnalisé');
}

if (recommendations.length === 0) {
  console.log('  ✅ Tous les fichiers critiques sont présents et configurés correctement');
  console.log('  💡 Si vous rencontrez toujours des problèmes d\'affichage:');
  console.log('     - Vérifiez la console du navigateur pour des erreurs CSS');
  console.log('     - Redémarrez le serveur de développement');
  console.log('     - Vérifiez que les classes Tailwind sont bien appliquées dans l\'inspecteur');
} else {
  recommendations.forEach(rec => console.log(`  ⚠️  ${rec}`));
}

console.log('\n🏁 Diagnostic terminé\n');
