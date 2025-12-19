#!/bin/bash

# Copyright (C) 2025 ABDEL KADER CHATAR
# SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.
#
# Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.


# Script de nettoyage des console.log de débogage
echo "🧹 Nettoyage des console.log de débogage..."

# Sauvegarde Git
git add -A
git commit -m "Sauvegarde avant nettoyage des console.log" || echo "Rien à sauvegarder"

# Fonction pour nettoyer les console.log de débogage
clean_console_logs() {
    local file="$1"

    # Supprimer les console.log contenant des mots de débogage
    sed -i '' '/console\.log.*\(Debug\|TODO\|FIXME\|Test\|debug\|test\)/d' "$file"

    # Supprimer les console.log commentés
    sed -i '' '/\/\/ console\.log/d' "$file"

    # Supprimer les blocs de console.log de débogage multi-lignes
    sed -i '' '/console\.log.*===.*===/d' "$file"
    sed -i '' '/console\.log.*---.*---/d' "$file"
    sed -i '' '/console\.log.*!!!.*!!!/d' "$file"
}

# Nettoyer les fichiers TypeScript et JavaScript
find src -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | while read file; do
    if [[ -f "$file" ]]; then
        echo "Nettoyage: $file"
        clean_console_logs "$file"
    fi
done

# Supprimer les TODO simples dans les composants
find src/components -name "*.tsx" -exec sed -i '' '/\/\/ TODO:/d' {} \;

echo "✅ Nettoyage terminé !"
echo "📊 Vérification des console.log restants:"
grep -r "console\.log" src/ | wc -l