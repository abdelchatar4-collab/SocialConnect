#!/bin/bash
# Script pour l'export hebdomadaire des prestations
# À exécuter chaque lundi à 6h00 via crontab
#
# Installation dans crontab:
#   crontab -e
#   0 6 * * 1 /path/to/scripts/weekly-export.sh
#
# Ou pour tester manuellement:
#   ./scripts/weekly-export.sh

# Configuration
APP_URL="${APP_URL:-http://localhost:3000}"
CRON_SECRET="${CRON_SECRET:-}"

echo "[$(date)] Starting weekly prestation export..."

# Appel de l'API
if [ -n "$CRON_SECRET" ]; then
    RESPONSE=$(curl -s -X POST "$APP_URL/api/cron/weekly-export" \
        -H "Authorization: Bearer $CRON_SECRET" \
        -H "Content-Type: application/json")
else
    RESPONSE=$(curl -s -X POST "$APP_URL/api/cron/weekly-export" \
        -H "Content-Type: application/json")
fi

echo "[$(date)] API Response: $RESPONSE"

# Vérification du succès
if echo "$RESPONSE" | grep -q '"success":true'; then
    echo "[$(date)] ✅ Export completed successfully!"
    exit 0
else
    echo "[$(date)] ❌ Export failed!"
    exit 1
fi
