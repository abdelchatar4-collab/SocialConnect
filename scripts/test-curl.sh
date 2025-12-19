#!/bin/bash

# Copyright (C) 2025 ABDEL KADER CHATAR
# SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.
#
# Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.


echo "🔍 Test de l'API partenaires avec curl..."

for port in 3000 3001 3004 3005; do
  echo ""
  echo "📡 Test sur le port $port..."

  response=$(curl -s -w "HTTPSTATUS:%{http_code}" "http://localhost:$port/api/partenaires" 2>/dev/null)

  if [ $? -eq 0 ]; then
    http_code=$(echo $response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    body=$(echo $response | sed -e 's/HTTPSTATUS:.*//g')

    echo "Status: $http_code"

    if [ "$http_code" = "200" ]; then
      echo "✅ Succès sur le port $port"
      echo "Réponse: $body"
      echo "Nombre d'éléments: $(echo $body | jq '. | length' 2>/dev/null || echo 'N/A')"
      break
    else
      echo "❌ Erreur $http_code: $body"
    fi
  else
    echo "❌ Connexion échouée sur le port $port"
  fi
done
