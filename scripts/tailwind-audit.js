/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

#!/usr/bin/env node

/**
 * Script d'audit pour détecter les problèmes Tailwind CSS potentiels
 * Usage: node scripts/tailwind-audit.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class TailwindAuditor {
  constructor() {
    this.issues = [];
    this.srcPath = path.join(process.cwd(), 'src');
  }

  // Couleurs pour la console
  colors = {
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    green: '\x1b[32m',
    blue: '\x1b[34m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
  };

  log(message, color = 'reset') {
    console.log(`${this.colors[color]}${message}${this.colors.reset}`);
  }

  // Recherche récursive de fichiers
  findFiles(dir, extensions = ['.tsx', '.ts', '.jsx', '.js']) {
    let files = [];

    try {
      const items = fs.readdirSync(dir);

      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          files = files.concat(this.findFiles(fullPath, extensions));
        } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.warn(`Erreur lecture dossier ${dir}:`, error.message);
    }

    return files;
  }

  // Vérifie les classes Tailwind problématiques
  checkProblematicClasses(content, filePath) {
    const problematicPatterns = [
      {
        pattern: /className\s*=\s*["`']([^"`']*(?:text-gray-[34]00|text-gray-300)[^"`']*)["`']/g,
        issue: 'Classes de texte gris trop claires',
        severity: 'warning'
      },
      {
        pattern: /className\s*=\s*["`']([^"`']*(?:bg-gray-[12]00)[^"`']*)["`']/g,
        issue: 'Arrière-plans gris trop clairs',
        severity: 'warning'
      },
      {
        pattern: /className\s*=\s*["`']([^"`']*(?:\$\{[^}]*\})[^"`']*)["`']/g,
        issue: 'Classes dynamiques potentiellement purgées',
        severity: 'error'
      },
      {
        pattern: /@apply\s+([^;]+);/g,
        issue: 'Utilisation de @apply (peut causer des erreurs)',
        severity: 'warning'
      },
      {
        pattern: /input\[type="checkbox"\][^{]*\{[^}]*\}/g,
        issue: 'Styles checkbox natifs (utiliser le composant Checkbox)',
        severity: 'info'
      }
    ];

    problematicPatterns.forEach(({ pattern, issue, severity }) => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        this.issues.push({
          file: filePath,
          line: content.substring(0, match.index).split('\n').length,
          issue,
          severity,
          code: match[0],
          suggestion: this.getSuggestion(issue)
        });
      }
    });
  }

  // Vérifie les imports manqués de composants UI
  checkMissingUIImports(content, filePath) {
    if (content.includes('type="checkbox"') && !content.includes('import') && !content.includes('Checkbox')) {
      this.issues.push({
        file: filePath,
        line: null,
        issue: 'Utilisation de checkbox natif sans import du composant Checkbox',
        severity: 'info',
        code: 'input[type="checkbox"]',
        suggestion: 'Utiliser le composant Checkbox personnalisé: import { Checkbox } from "@/components/ui"'
      });
    }

    if (content.includes('className') && content.includes('btn') && !content.includes('useButtonClasses')) {
      this.issues.push({
        file: filePath,
        line: null,
        issue: 'Styles de bouton ad-hoc détectés',
        severity: 'info',
        code: 'className="...btn..."',
        suggestion: 'Utiliser useButtonClasses hook pour des styles cohérents'
      });
    }
  }

  // Suggestions d'amélioration
  getSuggestion(issue) {
    const suggestions = {
      'Classes de texte gris trop claires': 'Utiliser text-gray-700 ou text-gray-800 pour un meilleur contraste',
      'Arrière-plans gris trop clairs': 'Utiliser bg-gray-300 ou plus foncé pour la visibilité',
      'Classes dynamiques potentiellement purgées': 'Ajouter les classes à la safelist dans tailwind.config.js',
      'Utilisation de @apply (peut causer des erreurs)': 'Remplacer par du CSS natif ou des classes Tailwind directes',
      'Styles checkbox natifs (utiliser le composant Checkbox)': 'Remplacer par <Checkbox /> du système de design'
    };

    return suggestions[issue] || 'Vérifier la documentation Tailwind';
  }

  // Vérifie la configuration Tailwind
  checkTailwindConfig() {
    const configPath = path.join(process.cwd(), 'tailwind.config.js');

    try {
      const configContent = fs.readFileSync(configPath, 'utf8');

      // Vérifie la présence d'une safelist
      if (!configContent.includes('safelist')) {
        this.issues.push({
          file: configPath,
          line: null,
          issue: 'Aucune safelist configurée',
          severity: 'warning',
          code: 'tailwind.config.js',
          suggestion: 'Ajouter une safelist pour protéger les classes dynamiques'
        });
      }

      // Vérifie les chemins de contenu
      if (!configContent.includes('./src/features/') || !configContent.includes('./src/hooks/')) {
        this.issues.push({
          file: configPath,
          line: null,
          issue: 'Chemins de contenu incomplets',
          severity: 'warning',
          code: 'content: [...]',
          suggestion: 'Ajouter tous les dossiers contenant des composants'
        });
      }
    } catch (error) {
      this.issues.push({
        file: configPath,
        line: null,
        issue: 'Impossible de lire tailwind.config.js',
        severity: 'error',
        code: error.message,
        suggestion: 'Vérifier que le fichier existe et est lisible'
      });
    }
  }

  // Vérifie globals.css
  checkGlobalCSS() {
    const cssPath = path.join(process.cwd(), 'src/app/globals.css');

    try {
      const cssContent = fs.readFileSync(cssPath, 'utf8');

      // Vérifie les erreurs @apply
      const applyMatches = cssContent.match(/@apply\s+[^;]+;/g);
      if (applyMatches) {
        applyMatches.forEach(match => {
          this.issues.push({
            file: cssPath,
            line: cssContent.substring(0, cssContent.indexOf(match)).split('\n').length,
            issue: 'Utilisation de @apply détectée',
            severity: 'warning',
            code: match,
            suggestion: 'Remplacer par du CSS natif pour éviter les erreurs'
          });
        });
      }

      // Vérifie les couleurs hardcodées
      const colorMatches = cssContent.match(/#[0-9a-fA-F]{3,6}/g);
      if (colorMatches && colorMatches.length > 5) {
        this.issues.push({
          file: cssPath,
          line: null,
          issue: 'Nombreuses couleurs hardcodées détectées',
          severity: 'info',
          code: `${colorMatches.length} couleurs trouvées`,
          suggestion: 'Utiliser les design tokens pour la cohérence'
        });
      }
    } catch (error) {
      this.issues.push({
        file: cssPath,
        line: null,
        issue: 'Impossible de lire globals.css',
        severity: 'error',
        code: error.message,
        suggestion: 'Vérifier que le fichier existe'
      });
    }
  }

  // Lance l'audit complet
  async runAudit() {
    this.log('🔍 Audit Tailwind CSS en cours...', 'blue');
    this.log('='.repeat(50), 'blue');

    // Réinitialise les issues
    this.issues = [];

    // Vérifie la configuration
    this.checkTailwindConfig();
    this.checkGlobalCSS();

    // Trouve et analyse tous les fichiers de composants
    const files = this.findFiles(this.srcPath);
    this.log(`📁 Analyse de ${files.length} fichiers...`, 'blue');

    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        this.checkProblematicClasses(content, file);
        this.checkMissingUIImports(content, file);
      } catch (error) {
        this.issues.push({
          file,
          line: null,
          issue: 'Erreur de lecture du fichier',
          severity: 'error',
          code: error.message,
          suggestion: 'Vérifier les permissions du fichier'
        });
      }
    }

    // Affiche les résultats
    this.displayResults();
  }

  // Affiche les résultats de l'audit
  displayResults() {
    this.log('\n📊 Résultats de l\'audit', 'bold');
    this.log('='.repeat(50), 'blue');

    if (this.issues.length === 0) {
      this.log('✅ Aucun problème détecté ! Votre configuration Tailwind est optimisée.', 'green');
      return;
    }

    // Groupe par sévérité
    const grouped = this.issues.reduce((acc, issue) => {
      acc[issue.severity] = acc[issue.severity] || [];
      acc[issue.severity].push(issue);
      return acc;
    }, {});

    // Affiche par ordre de priorité
    ['error', 'warning', 'info'].forEach(severity => {
      if (grouped[severity]) {
        const icon = {
          error: '🚨',
          warning: '⚠️',
          info: 'ℹ️'
        }[severity];

        const color = {
          error: 'red',
          warning: 'yellow',
          info: 'blue'
        }[severity];

        this.log(`\n${icon} ${severity.toUpperCase()} (${grouped[severity].length})`, color);
        this.log('-'.repeat(30), color);

        grouped[severity].forEach((issue, index) => {
          this.log(`${index + 1}. ${issue.issue}`, color);
          this.log(`   📄 Fichier: ${path.relative(process.cwd(), issue.file)}`, 'reset');
          if (issue.line) {
            this.log(`   📍 Ligne: ${issue.line}`, 'reset');
          }
          if (issue.code && issue.code.length < 100) {
            this.log(`   💻 Code: ${issue.code}`, 'reset');
          }
          this.log(`   💡 Suggestion: ${issue.suggestion}`, 'green');
          this.log('');
        });
      }
    });

    // Résumé
    this.log('📈 Résumé', 'bold');
    this.log('-'.repeat(20), 'blue');
    this.log(`🚨 Erreurs: ${grouped.error?.length || 0}`, 'red');
    this.log(`⚠️  Avertissements: ${grouped.warning?.length || 0}`, 'yellow');
    this.log(`ℹ️  Informations: ${grouped.info?.length || 0}`, 'blue');
    this.log(`📁 Fichiers analysés: ${this.findFiles(this.srcPath).length}`, 'reset');
  }
}

// Exécution du script
if (require.main === module) {
  const auditor = new TailwindAuditor();
  auditor.runAudit().catch(console.error);
}

module.exports = TailwindAuditor;
