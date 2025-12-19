#!/bin/bash

# Copyright (C) 2025 ABDEL KADER CHATAR
# SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.
#
# Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.


echo "🔍 Vérification des variables d'environnement..."
echo ""

if [ -f ".env" ]; then
  echo "✅ Fichier .env trouvé"
  echo "📋 Variables DATABASE_URL:"
  grep "DATABASE_URL" .env || echo "❌ DATABASE_URL non trouvée"
else
  echo "❌ Fichier .env non trouvé"
fi

echo ""
echo "📋 Variables d'environnement Node.js:"
echo "DATABASE_URL: ${DATABASE_URL:-'Non définie'}"
echo "NODE_ENV: ${NODE_ENV:-'Non définie'}"

echo ""
echo "🔍 Test de connexion à la base de données..."
npx prisma db pull --preview-feature 2>&1 | head -10
