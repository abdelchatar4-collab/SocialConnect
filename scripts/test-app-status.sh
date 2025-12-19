#!/bin/bash

# Copyright (C) 2025 ABDEL KADER CHATAR
# SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.
#
# Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.


# Script de test de l'état de l'application
echo "🔍 Test de l'état de l'application Tailwind..."
echo ""

# Vérifier les fichiers critiques
echo "📁 Fichiers critiques :"
if [ -f "src/app/globals.css" ]; then
    SIZE=$(wc -c < "src/app/globals.css")
    echo "✅ globals.css ($SIZE bytes)"
    if [ $SIZE -lt 1000 ]; then
        echo "   ⚠️  Fichier trop petit, possible problème"
    fi
else
    echo "❌ globals.css manquant"
fi

if [ -f "tailwind.config.js" ]; then
    echo "✅ tailwind.config.js"
else
    echo "❌ tailwind.config.js manquant"
fi

if [ -f "src/components/ui/checkbox.tsx" ]; then
    echo "✅ Composant Checkbox personnalisé"
else
    echo "❌ Composant Checkbox manquant"
fi

if [ -f "src/styles/design-tokens.ts" ]; then
    echo "✅ Design tokens"
else
    echo "❌ Design tokens manquants"
fi

if [ -f "src/hooks/useStyleClasses.ts" ]; then
    echo "✅ Hooks utilitaires"
else
    echo "❌ Hooks utilitaires manquants"
fi

echo ""
echo "🎯 Vérifications Tailwind :"

# Vérifier les directives Tailwind
if grep -q "@tailwind base" src/app/globals.css 2>/dev/null; then
    echo "✅ Directives Tailwind présentes"
else
    echo "❌ Directives Tailwind manquantes"
fi

# Vérifier la safelist
if grep -q "safelist" tailwind.config.js 2>/dev/null; then
    echo "✅ Safelist configurée"
else
    echo "❌ Safelist non configurée"
fi

# Vérifier le plugin forms
if grep -q "@tailwindcss/forms" tailwind.config.js 2>/dev/null; then
    echo "✅ Plugin forms installé"
else
    echo "❌ Plugin forms manquant"
fi

echo ""
echo "🚀 Statut final :"

# Compter les problèmes
PROBLEMS=0

[ ! -f "src/app/globals.css" ] && ((PROBLEMS++))
[ ! -f "tailwind.config.js" ] && ((PROBLEMS++))
[ ! -f "src/components/ui/checkbox.tsx" ] && ((PROBLEMS++))

if [ $PROBLEMS -eq 0 ]; then
    echo "✅ Tous les fichiers critiques sont présents"
    echo "💡 L'application devrait fonctionner correctement"
    echo ""
    echo "🌐 Accès application :"
    echo "   - Démarrer : npm run dev"
    echo "   - URL : http://localhost:3000 (ou port suivant)"
else
    echo "⚠️  $PROBLEMS problème(s) détecté(s)"
    echo "📖 Consultez le guide : docs/GUIDE_RESOLUTION_PROBLEMES.md"
fi

echo ""
