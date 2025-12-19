#!/bin/bash

# Copyright (C) 2025 ABDEL KADER CHATAR
# SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.
#
# Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.


# Configuration
SERVER_IP="192.168.2.147"
SERVER_USER="root"
REMOTE_DIR="/mnt/user/appdata/app-gestion-usagers"
LOCAL_BUILD_DIR="$HOME/Desktop/build-final"
VERSION_FILE=".version"

# 1. Gestion de la version
if [ ! -f "$VERSION_FILE" ]; then
    echo "Fichier .version introuvable. Création avec la version par défaut : 30"
    echo "30" > "$VERSION_FILE"
fi

CURRENT_VER=$(cat "$VERSION_FILE")
NEXT_VER=$((CURRENT_VER + 1))

APP_NAME="gestion-usagers-app"
OLD_TAG="v${CURRENT_VER}"
NEW_TAG="v${NEXT_VER}"

echo "=================================================="
echo "🚀 DÉPLOIEMENT AUTOMATISÉ : $OLD_TAG -> $NEW_TAG"
echo "=================================================="

# 2. Build Docker Local
echo "🔨 Construction de l'image $APP_NAME-$NEW_TAG..."
docker build --platform linux/amd64 -t $APP_NAME-$NEW_TAG . || { echo "❌ Échec du build"; exit 1; }

# 3. Save Docker Image
echo "📦 Sauvegarde de l'image (cela peut prendre du temps)..."
mkdir -p "$LOCAL_BUILD_DIR"
docker save $APP_NAME-$NEW_TAG -o "$LOCAL_BUILD_DIR/$APP_NAME-$NEW_TAG.tar" || { echo "❌ Échec de la sauvegarde"; exit 1; }

# 4. Transfert SCP
echo "📤 Envoi vers le serveur $SERVER_IP..."
scp "$LOCAL_BUILD_DIR/$APP_NAME-$NEW_TAG.tar" $SERVER_USER@$SERVER_IP:$REMOTE_DIR/ || { echo "❌ Échec du transfert SCP"; exit 1; }

# 5. Mise à jour de la version locale
echo "$NEXT_VER" > "$VERSION_FILE"
echo "✅ Version locale mise à jour vers $NEXT_VER"

# 6. Exécution Remote (SSH)
echo "🔄 Connexion SSH pour mise à jour du conteneur..."

# On envoie un script "heredoc" via SSH
ssh $SERVER_USER@$SERVER_IP <<EOF
    cd $REMOTE_DIR

    echo "📥 Chargement de l'image Docker..."
    docker load -i $APP_NAME-$NEW_TAG.tar

    echo "🛑 Arrêt de l'ancien conteneur ($APP_NAME-$OLD_TAG)..."
    docker stop $APP_NAME-$OLD_TAG || true

    echo "Labeling previous version as OLD..."
    # On renomme l'ancien conteneur (ex: v30 -> v30-old)
    # Note: Si v30-old existe déjà, cette commande échouera (ce qui est une sécurité).
    docker rename $APP_NAME-$OLD_TAG $APP_NAME-$OLD_TAG-old || echo "⚠️ Attention: Impossible de renommer $APP_NAME-$OLD_TAG (Il n'existe pas ou la version .old existe déjà)"

    # Nettoyage optionnel (garder si vous voulez backuper)
    # docker rmi $APP_NAME-$OLD_TAG || true

    echo "🚀 Démarrage du nouveau conteneur ($APP_NAME-$NEW_TAG)..."
    docker run -d \
       --name $APP_NAME-$NEW_TAG \
       --network app-network \
       -p 3000:3000 \
       -v /mnt/user/appdata/gestion-usagers/documents:/app/public/rapports \
       -e NODE_ENV="production" \
       -e DB_USER="pasqweb" \
       -e DB_PASSWORD="@@@Yapasdemp8851@@@" \
       -e DB_HOST="mariadb" \
       -e DB_PORT="3306" \
       -e DB_NAME="gestion_usagers_db" \
       -e DB_PROVIDER="mysql" \
       -e DATABASE_URL="mysql://pasqweb:%40%40%40Yapasdemp8851%40%40%40@192.168.2.147:3306/gestion_usagers_db" \
       -e NEXTAUTH_URL="https://pasqweb.org" \
       -e NEXTAUTH_SECRET="zE9HbFZJDXKK/bhSZM4dv6aXtEcc+okwsx1AnqrA9Cw=" \
       -e GOOGLE_CLIENT_ID="20495390302-njtvdvb00bochncoc67eoet9niuer2la.apps.googleusercontent.com" \
       -e GOOGLE_CLIENT_SECRET="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" \
       -e CLOUDFLARE_ACCESS_DOMAIN="pasqweb-team.cloudflareaccess.com" \
       -e CLOUDFLARE_ACCESS_AUD="your-aud-value" \
       -e NEXT_PUBLIC_FORCE_LOCALSTORAGE="false" \
       --restart unless-stopped \
       $APP_NAME-$NEW_TAG

    echo "🧹 Nettoyage du fichier .tar..."
    rm $APP_NAME-$NEW_TAG.tar

    echo "✅ DÉPLOIEMENT TERMINÉ AVEC SUCCÈS sur le serveur !"
EOF

echo "🎉 Tout est terminé ! Application accessible sur https://pasqweb.org"
