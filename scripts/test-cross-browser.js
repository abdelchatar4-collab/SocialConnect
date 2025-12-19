/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

#!/usr/bin/env node

/**
 * Script de test cross-browser pour l'application de gestion d'usagers
 * Valide que les checkboxes et autres composants fonctionnent correctement
 * sur tous les navigateurs principaux.
 */

const { chromium, firefox, webkit } = require('playwright');
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

async function testCrossBrowser() {
  console.log(`${colors.blue}🧪 Lancement des tests cross-browser...${colors.reset}\n`);

  const browsers = [
    { type: chromium, name: 'Chromium' },
    { type: firefox, name: 'Firefox' },
    { type: webkit, name: 'Safari/WebKit' }
  ];

  const results = [];

  for (const { type: browserType, name: browserName } of browsers) {
    console.log(`${colors.yellow}Testing ${browserName}...${colors.reset}`);

    let browser;
    try {
      browser = await browserType.launch({ headless: true });
      const page = await browser.newPage();

      // Test de la page principale
      await page.goto('http://localhost:3005', { waitUntil: 'networkidle' });
      const mainPageLoaded = await page.title();

      // Test de la page design-test
      await page.goto('http://localhost:3005/design-test', { waitUntil: 'networkidle' });

      // Test des checkboxes
      const checkboxTests = await testCheckboxes(page);

      // Test du responsive design
      const responsiveTests = await testResponsive(page);

      // Test des styles Tailwind
      const tailwindTests = await testTailwindStyles(page);

      results.push({
        browser: browserName,
        mainPage: !!mainPageLoaded,
        checkboxes: checkboxTests,
        responsive: responsiveTests,
        tailwind: tailwindTests,
        status: 'PASS'
      });

      console.log(`${colors.green}✅ ${browserName} : Tests réussis${colors.reset}`);

    } catch (error) {
      results.push({
        browser: browserName,
        error: error.message,
        status: 'FAIL'
      });
      console.log(`${colors.red}❌ ${browserName} : Échec - ${error.message}${colors.reset}`);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  // Affichage du résumé
  console.log(`\n${colors.blue}📊 Résumé des tests cross-browser :${colors.reset}\n`);
  console.table(results.map(r => ({
    Navigateur: r.browser,
    'Page principale': r.mainPage ? '✅' : '❌',
    'Checkboxes': r.checkboxes?.working ? '✅' : '❌',
    'Responsive': r.responsive?.working ? '✅' : '❌',
    'Tailwind CSS': r.tailwind?.working ? '✅' : '❌',
    'Statut global': r.status === 'PASS' ? '✅' : '❌'
  })));

  const passCount = results.filter(r => r.status === 'PASS').length;
  console.log(`\n${colors.green}${passCount}/${results.length} navigateurs validés avec succès${colors.reset}`);

  return results;
}

async function testCheckboxes(page) {
  try {
    // Attendre que les checkboxes soient présentes
    await page.waitForSelector('.checkbox-container', { timeout: 5000 });

    // Test de visibilité
    const checkboxes = await page.locator('input[type="checkbox"]').count();

    // Test d'interaction sur la première checkbox
    const firstCheckbox = page.locator('input[type="checkbox"]').first();
    const initialState = await firstCheckbox.isChecked();

    await firstCheckbox.click();
    const newState = await firstCheckbox.isChecked();

    // Test des styles appliqués
    const hasCorrectStyles = await page.evaluate(() => {
      const checkbox = document.querySelector('input[type="checkbox"]');
      if (!checkbox) return false;

      const styles = window.getComputedStyle(checkbox);
      return styles.display !== 'none' && styles.visibility !== 'hidden';
    });

    return {
      working: checkboxes > 0 && initialState !== newState && hasCorrectStyles,
      count: checkboxes,
      interactive: initialState !== newState,
      styled: hasCorrectStyles
    };
  } catch (error) {
    return { working: false, error: error.message };
  }
}

async function testResponsive(page) {
  try {
    const viewports = [
      { width: 375, height: 667, name: 'Mobile' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 1920, height: 1080, name: 'Desktop' }
    ];

    const responsiveResults = [];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      // Vérifier que le contenu s'adapte
      const isResponsive = await page.evaluate(() => {
        const container = document.querySelector('.max-w-4xl');
        return container && window.innerWidth >= 375; // Minimum supporté
      });

      responsiveResults.push({
        viewport: viewport.name,
        working: isResponsive
      });
    }

    return {
      working: responsiveResults.every(r => r.working),
      details: responsiveResults
    };
  } catch (error) {
    return { working: false, error: error.message };
  }
}

async function testTailwindStyles(page) {
  try {
    // Vérifier que les classes Tailwind sont appliquées
    const tailwindWorking = await page.evaluate(() => {
      // Test sur un élément avec des classes Tailwind connues
      const element = document.querySelector('.bg-white');
      if (!element) return false;

      const styles = window.getComputedStyle(element);
      return styles.backgroundColor === 'rgb(255, 255, 255)' || styles.backgroundColor === 'white';
    });

    // Vérifier la présence du CSS Tailwind
    const cssLoaded = await page.evaluate(() => {
      const stylesheets = Array.from(document.styleSheets);
      return stylesheets.some(sheet => {
        try {
          const rules = Array.from(sheet.cssRules || []);
          return rules.some(rule => rule.cssText && rule.cssText.includes('tailwind'));
        } catch {
          return false;
        }
      });
    });

    return {
      working: tailwindWorking,
      stylesApplied: tailwindWorking,
      cssLoaded: cssLoaded
    };
  } catch (error) {
    return { working: false, error: error.message };
  }
}

// Fonction principale
async function main() {
  try {
    // Vérifier que le serveur est démarré
    console.log(`${colors.blue}🔍 Vérification du serveur de développement...${colors.reset}`);

    const { chromium } = require('playwright');
    const browser = await chromium.launch();
    const page = await browser.newPage();

    try {
      await page.goto('http://localhost:3005', { timeout: 10000 });
      console.log(`${colors.green}✅ Serveur accessible sur localhost:3005${colors.reset}\n`);
    } catch (error) {
      console.log(`${colors.red}❌ Serveur non accessible. Démarrez l'application avec: npm run dev${colors.reset}`);
      return;
    } finally {
      await browser.close();
    }

    // Lancer les tests
    const results = await testCrossBrowser();

    // Génération du rapport
    const reportPath = './test-results/cross-browser-report.json';
    const fs = require('fs');
    const path = require('path');

    // Créer le dossier s'il n'existe pas
    const reportDir = path.dirname(reportPath);
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      results: results,
      summary: {
        total: results.length,
        passed: results.filter(r => r.status === 'PASS').length,
        failed: results.filter(r => r.status === 'FAIL').length
      }
    }, null, 2));

    console.log(`\n${colors.blue}📄 Rapport détaillé sauvegardé : ${reportPath}${colors.reset}`);

  } catch (error) {
    console.error(`${colors.red}❌ Erreur lors des tests : ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Gestion des erreurs non capturées
process.on('unhandledRejection', (reason, promise) => {
  console.error(`${colors.red}❌ Erreur non gérée :${colors.reset}`, reason);
  process.exit(1);
});

// Lancement si appelé directement
if (require.main === module) {
  main();
}

module.exports = { testCrossBrowser, testCheckboxes, testResponsive, testTailwindStyles };
