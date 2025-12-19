#!/bin/bash

# Copyright (C) 2025 ABDEL KADER CHATAR
# SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.
#
# Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.


echo "🔄 Arrêt des processus sur les ports 3000-3005..."

# Tuer tous les processus sur les ports 3000 à 3005
for port in {3000..3005}; do
  echo "Vérification du port $port..."
  PID=$(lsof -ti:$port)
  if [ ! -z "$PID" ]; then
    echo "Arrêt du processus $PID sur le port $port"
    kill -9 $PID
  else
    echo "Aucun processus trouvé sur le port $port"
  fi
done

echo "✅ Tous les ports ont été libérés"
echo "🚀 Démarrage du serveur sur le port 3000..."

# Démarrer le serveur sur le port 3000
export PORT=3000
npm run dev
