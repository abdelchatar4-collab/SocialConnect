#!/bin/bash
# Pre-commit hook: BLOQUE si un fichier .ts/.tsx dépasse 300 lignes
#
# INSTALLATION:
#   chmod +x scripts/pre-commit-check.sh
#   cp scripts/pre-commit-check.sh .git/hooks/pre-commit
#
# OU pour tester manuellement:
#   ./scripts/pre-commit-check.sh

# ⛔ LIMITE STRICTE : 300 LIGNES MAXIMUM
MAX_LINES=300
VIOLATIONS=()

echo ""
echo "🔍 Vérification limite de $MAX_LINES lignes par fichier..."
echo ""

# Parcourir tous les fichiers .ts et .tsx dans src/
for file in $(find src -name "*.ts" -o -name "*.tsx" 2>/dev/null | grep -v node_modules | grep -v ".test." | grep -v "__tests__"); do
    if [ -f "$file" ]; then
        lines=$(wc -l < "$file" | tr -d ' ')
        if [ "$lines" -gt "$MAX_LINES" ]; then
            VIOLATIONS+=("$file ($lines lignes)")
        fi
    fi
done

if [ ${#VIOLATIONS[@]} -gt 0 ]; then
    echo ""
    echo "╔══════════════════════════════════════════════════════════════════╗"
    echo "║ ⛔ COMMIT BLOQUÉ - ${#VIOLATIONS[@]} fichier(s) > $MAX_LINES lignes               ║"
    echo "╚══════════════════════════════════════════════════════════════════╝"
    echo ""
    for v in "${VIOLATIONS[@]}"; do
        echo "   ❌ $v"
    done
    echo ""
    echo "┌─────────────────────────────────────────────────────────────────┐"
    echo "│ 👉 REFACTORISER avant de commiter:                              │"
    echo "│    - Extraire en sous-composants                               │"
    echo "│    - Séparer hooks/types/utils                                 │"
    echo "│    - Diviser la logique en fichiers spécialisés                │"
    echo "└─────────────────────────────────────────────────────────────────┘"
    echo ""
    exit 1
else
    echo "✅ Tous les fichiers respectent la limite de $MAX_LINES lignes."
    echo ""
    exit 0
fi
