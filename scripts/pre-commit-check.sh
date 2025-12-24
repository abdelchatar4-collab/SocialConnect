#!/bin/bash
# Pre-commit hook: Vérifie qu'aucun fichier .ts/.tsx ne dépasse 400 lignes
#
# INSTALLATION:
#   chmod +x scripts/pre-commit-check.sh
#   cp scripts/pre-commit-check.sh .git/hooks/pre-commit
#
# OU pour tester manuellement:
#   ./scripts/pre-commit-check.sh

MAX_LINES=500
VIOLATIONS=()

echo "🔍 Vérification des fichiers TypeScript (max $MAX_LINES lignes)..."

# Parcourir tous les fichiers .ts et .tsx dans src/
for file in $(find src -name "*.ts" -o -name "*.tsx" 2>/dev/null); do
    if [ -f "$file" ]; then
        lines=$(wc -l < "$file" | tr -d ' ')
        if [ "$lines" -gt "$MAX_LINES" ]; then
            VIOLATIONS+=("$file ($lines lignes)")
        fi
    fi
done

if [ ${#VIOLATIONS[@]} -gt 0 ]; then
    echo ""
    echo "❌ VIOLATION - ${#VIOLATIONS[@]} fichier(s) dépassant $MAX_LINES lignes:"
    echo ""
    for v in "${VIOLATIONS[@]}"; do
        echo "   ⚠️  $v"
    done
    echo ""
    echo "👉 Ces fichiers doivent être refactorisés."
    echo ""
    exit 1
else
    echo "✅ Tous les fichiers respectent la limite de $MAX_LINES lignes."
    exit 0
fi
