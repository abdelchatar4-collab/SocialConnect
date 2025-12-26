# filepath: Dockerfile

# --- Build Stages ---

# Utiliser Node.js 20 basé sur Debian comme base pour tous les stages
# Utiliser --platform pour une meilleure compatibilité cross-architecture (AMD64 pour Unraid)
FROM --platform=${TARGETPLATFORM:-linux/amd64} node:20 AS base
# Définir le répertoire de travail
WORKDIR /app

# 2. Dependencies Stage: Installer les dépendances
FROM base AS deps
# Copier package.json et le fichier de lock (npm ou pnpm ou yarn)
COPY package.json package-lock.json* ./
# Installer toutes les dépendances (y compris devDependencies pour Prisma CLI et build)
RUN npm ci

# 3. Builder Stage: Générer Prisma et construire l'application Next.js
FROM base AS builder

# Définir le répertoire de travail
WORKDIR /app

# Copier les dépendances installées depuis l'étape 'deps'
COPY --from=deps /app/node_modules ./node_modules
# Copier le dossier prisma (contenant le schéma)
COPY prisma ./prisma
# Copier le reste du code source de l'application
# Copier les fichiers source
COPY . .

# Générer Prisma
RUN npx prisma generate

# Créer les dossiers nécessaires et définir les permissions
RUN mkdir -p /app/.next/cache && \
    mkdir -p /app/.next/static && \
    chmod -R 755 /app/.next

# Build de l'application
RUN npm run build

# --- Runner Stage ---

# 4. Runner Stage: Configurer l'image finale pour l'exécution
# Utiliser une image Node.js légère pour l'exécution
FROM --platform=${TARGETPLATFORM:-linux/amd64} node:20 AS runner

# Définir le répertoire de travail
WORKDIR /app

# Définir l'environnement sur production
ENV NODE_ENV=production

# --- AJOUT : Installation de Python et des bibliothèques nécessaires ---
# Passer à l'utilisateur root pour installer les paquets système
USER root

# SÉPARER LES COMMANDES POUR LE DÉBOGAGE
RUN apt-get update
RUN apt-get install -y python3 python3-pip
RUN pip3 install --no-cache-dir --break-system-packages openpyxl python-dateutil # AJOUT DE --break-system-packages
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Créer le répertoire temporaire pour les exports Excel et donner les droits à l'utilisateur node
RUN mkdir -p /app/temp && chown node:node /app/temp
# --- FIN DE L'AJOUT ---

# Utiliser l'utilisateur 'node' intégré pour des raisons de sécurité
USER node

# Copier les artefacts nécessaires depuis l'étape 'builder'
# Copier le fichier de configuration Next.js (peut être requis par le serveur standalone)
COPY --from=builder --chown=node:node /app/next.config.js ./
# Copier le dossier public
COPY --from=builder --chown=node:node /app/public ./public
# Copier la sortie standalone (serveur optimisé et node_modules nécessaires)
# NOTE: Cette commande copie le *contenu* de .next/standalone dans /app
COPY --from=builder --chown=node:node /app/.next/standalone ./
# Copier les assets statiques
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
# Copier le dossier prisma (le schéma peut être utile)
COPY --from=builder --chown=node:node /app/prisma ./prisma
# --- AJOUT : Copier le dossier src/lib (contenant authOptions.ts) ---
COPY --from=builder --chown=node:node /app/src/lib ./src/lib
# --- FIN DE L'AJOUT ---
# --- AJOUT : Copier le script Python d'exportation ---
COPY --from=builder --chown=node:node /app/src/export_users_excel.py ./src/export_users_excel.py
# --- FIN DE L'AJOUT ---

# --- Suppression des lignes liées à docker-entrypoint.sh ---
# Les lignes suivantes sont supprimées car il n'y a pas de script docker-entrypoint.sh personnalisé
# COPY --from=builder --chown=node:node /app/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
# RUN chmod +x /usr/local/bin/docker-entrypoint.sh
# RUN apt-get update && apt-get install -y dos2unix
# RUN dos2unix /usr/local/bin/docker-entrypoint.sh
# ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"] # Ancienne ligne ENTRYPOINT supprimée/commentée

# Rendre la variable PORT configurable (par défaut 3000)
ENV PORT=3000
EXPOSE ${PORT}

# Écouter sur toutes les interfaces réseau, pas seulement localhost
ENV HOSTNAME="0.0.0.0"

# Définir les variables d'environnement pour la base de données
ENV DATABASE_URL=""
ENV DB_USER=""
ENV DB_PASSWORD=""
ENV DB_HOST=""
ENV DB_PORT="3306"
ENV DB_NAME=""
ENV DB_PROVIDER="mysql"

# Variables d'environnement pour l'authentification
ENV GOOGLE_CLIENT_ID=""
ENV GOOGLE_CLIENT_SECRET=""
ENV NEXTAUTH_URL="http://localhost:3000"
ENV NEXTAUTH_SECRET=""

# --- Définition de l'ENTRYPOINT pour lancer le serveur ---
# Supprimer/Commenter l'ancienne instruction CMD
# CMD ["node", "server.js"]

# Définir l'ENTRYPOINT pour lancer directement le serveur standalone
ENTRYPOINT ["node", "server.js"]

# --- FIN DU RUNNER STAGE ---
# Copier explicitement le serveur et les dépendances
COPY --from=builder --chown=node:node /app/.next/standalone/server.js ./server.js
COPY --from=builder --chown=node:node /app/.next/standalone/package.json ./package.json
COPY --from=builder --chown=node:node /app/.next/standalone/src ./src
COPY --from=builder --chown=node:node /app/.next/standalone/public ./public
