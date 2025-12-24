#!/usr/bin/env node
/**
 * Health Check Script
 * Vérifie les problèmes courants avant déploiement/validation
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const SRC_DIR = path.join(ROOT_DIR, 'src');

const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m',
};

let hasErrors = false;
let hasWarnings = false;

function log(type, message) {
    const prefix = {
        error: `${colors.red}❌ ERREUR${colors.reset}`,
        warning: `${colors.yellow}⚠️  ATTENTION${colors.reset}`,
        success: `${colors.green}✅ OK${colors.reset}`,
        info: `${colors.blue}ℹ️  INFO${colors.reset}`,
    };
    console.log(`${prefix[type]}: ${message}`);
    if (type === 'error') hasErrors = true;
    if (type === 'warning') hasWarnings = true;
}

function section(title) {
    console.log(`\n${colors.blue}━━━ ${title} ━━━${colors.reset}\n`);
}

// 1. Vérifier les années codées en dur (hors copyrights)
function checkHardcodedYears() {
    section('Vérification des années codées en dur');

    const currentYear = new Date().getFullYear();
    const yearsToCheck = [2024, 2025, 2026, 2027];

    try {
        const result = execSync(
            `grep -rn --include="*.ts" --include="*.tsx" -E "\\b(202[4-7])\\b" ${SRC_DIR} 2>/dev/null || true`,
            { encoding: 'utf8' }
        );

        const lines = result.split('\n').filter(Boolean);
        const problemLines = lines.filter(line => {
            // Ignorer les copyrights
            if (line.includes('Copyright')) return false;
            // Ignorer les commentaires purs
            if (/^\s*\/\//.test(line.split(':').slice(2).join(':'))) return false;
            // Ignorer les dates de Noël/Nouvel An dans overlay
            if (line.includes('HolidayOverlay')) return false;
            // Ignorer les codes d'erreur Prisma (P2025)
            if (line.includes("'P2025'") || line.includes('"P2025"')) return false;
            return true;
        });

        if (problemLines.length > 0) {
            log('warning', `${problemLines.length} occurrence(s) d'années potentiellement codées en dur:`);
            problemLines.slice(0, 5).forEach(line => {
                console.log(`   ${colors.yellow}→${colors.reset} ${line.substring(0, 120)}`);
            });
            if (problemLines.length > 5) console.log(`   ... et ${problemLines.length - 5} autres`);
        } else {
            log('success', 'Aucune année codée en dur détectée');
        }
    } catch (e) {
        log('error', `Erreur lors de la vérification: ${e.message}`);
    }
}

// 2. Vérifier la cohérence des types JSON dans les settings
function checkJSONParsing() {
    section('Vérification du parsing JSON dans AdminContext');

    const adminContextPath = path.join(SRC_DIR, 'contexts/AdminContext.tsx');

    try {
        const content = fs.readFileSync(adminContextPath, 'utf8');

        // Vérifier que les champs JSON sont parsés correctement
        const jsonFields = ['requiredFields', 'colleagueBirthdays', 'availableYears'];

        jsonFields.forEach(field => {
            const hasJsonParse = content.includes(`JSON.parse(settings.${field})`) ||
                (content.includes(`typeof settings.${field} === 'string'`) &&
                    content.includes(`JSON.parse`));

            if (hasJsonParse) {
                log('success', `${field}: parsing JSON correctement géré`);
            } else if (content.includes(`settings.${field}`)) {
                log('warning', `${field}: vérifier si le parsing JSON est nécessaire`);
            }
        });
    } catch (e) {
        log('error', `Impossible de lire AdminContext.tsx: ${e.message}`);
    }
}

// 3. Vérifier les settings en base de données
async function checkDatabaseSettings() {
    section('Vérification des settings en base de données');

    try {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();

        const settings = await prisma.settings.findFirst();

        if (!settings) {
            log('warning', 'Aucun settings trouvé en base de données');
            await prisma.$disconnect();
            return;
        }

        // Vérifier requiredFields
        if (settings.requiredFields) {
            const parsed = typeof settings.requiredFields === 'string'
                ? JSON.parse(settings.requiredFields)
                : settings.requiredFields;
            log('info', `requiredFields: ${JSON.stringify(parsed)}`);
        } else {
            log('warning', 'requiredFields est vide');
        }

        // Vérifier availableYears
        if (settings.availableYears) {
            const parsed = typeof settings.availableYears === 'string'
                ? JSON.parse(settings.availableYears)
                : settings.availableYears;
            const currentYear = new Date().getFullYear();
            if (!parsed.includes(currentYear)) {
                log('warning', `L'année courante (${currentYear}) n'est pas dans availableYears: ${JSON.stringify(parsed)}`);
            } else {
                log('success', `availableYears contient l'année courante: ${JSON.stringify(parsed)}`);
            }
        }

        await prisma.$disconnect();
    } catch (e) {
        log('warning', `Impossible de vérifier la base de données: ${e.message}`);
    }
}

// 4. Vérifier la compilation TypeScript
function checkTypeScript() {
    section('Vérification TypeScript');

    try {
        execSync('npx tsc --noEmit 2>&1', {
            encoding: 'utf8',
            cwd: ROOT_DIR,
            stdio: 'pipe'
        });
        log('success', 'Compilation TypeScript réussie');
    } catch (e) {
        const output = e.stdout || e.message;
        const errorCount = (output.match(/error TS/g) || []).length;
        if (errorCount > 0) {
            log('error', `${errorCount} erreur(s) TypeScript détectée(s)`);
            const errors = output.split('\n').filter(l => l.includes('error TS')).slice(0, 3);
            errors.forEach(err => console.log(`   ${colors.red}→${colors.reset} ${err.substring(0, 100)}`));
        } else {
            log('warning', 'Problème lors de la vérification TypeScript');
        }
    }
}

// 5. Vérifier les imports manquants
function checkImports() {
    section('Vérification des imports critiques');

    const criticalImports = [
        { file: 'contexts/AdminContext.tsx', imports: ['useAdmin', 'AdminProvider'] },
        { file: 'features/users/hooks/useUserFormLogic.ts', imports: ['useAdmin'] },
    ];

    criticalImports.forEach(({ file, imports }) => {
        const filePath = path.join(SRC_DIR, file);
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const missing = imports.filter(imp => !content.includes(imp));
            if (missing.length > 0) {
                log('warning', `${file}: imports potentiellement manquants: ${missing.join(', ')}`);
            }
        } catch (e) {
            // Fichier n'existe pas, ignorer
        }
    });

    log('success', 'Imports critiques vérifiés');
}

// Main
async function main() {
    console.log(`\n${colors.blue}╔════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.blue}║     HEALTH CHECK - SocialConnect       ║${colors.reset}`);
    console.log(`${colors.blue}╚════════════════════════════════════════╝${colors.reset}`);

    checkHardcodedYears();
    checkJSONParsing();
    await checkDatabaseSettings();
    checkTypeScript();
    checkImports();

    console.log('\n');
    if (hasErrors) {
        console.log(`${colors.red}━━━ ÉCHEC: Des erreurs ont été détectées ━━━${colors.reset}\n`);
        process.exit(1);
    } else if (hasWarnings) {
        console.log(`${colors.yellow}━━━ ATTENTION: Des avertissements ont été trouvés ━━━${colors.reset}\n`);
        process.exit(0);
    } else {
        console.log(`${colors.green}━━━ SUCCÈS: Toutes les vérifications sont passées ━━━${colors.reset}\n`);
        process.exit(0);
    }
}

main().catch(e => {
    console.error('Erreur fatale:', e);
    process.exit(1);
});
